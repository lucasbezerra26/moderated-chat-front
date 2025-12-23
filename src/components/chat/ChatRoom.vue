<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import ChatMessage from './ChatMessage.vue'
import { type Room, type RoomDetail, chatService } from '@/services/chatService'
import { useChatWebSocket } from '@/composables/useChatWebSocket'
import type { WSChatMessage, WSMessageRejected, WebSocketPayload } from '@/interfaces/websocket'
import Popover from 'primevue/popover'

const props = defineProps<{ room: Room }>()

const authStore = useAuthStore()
const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const messages = ref<WSChatMessage[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const rejectedMessage = ref<WSMessageRejected | null>(null)
const showRejectedModal = ref(false)
const roomDetail = ref<RoomDetail | null>(null)

const { isConnected, connectionError, sendMessage: wsSendMessage, on, off } = useChatWebSocket(props.room.id)

const isAdmin = computed(() => {
  if (!roomDetail.value || !authStore.user) return false
  return roomDetail.value.participants.some(
    (p) => p.user.id === authStore.user!.id && p.role === 'ADMIN'
  )
})

const participantsPopover = ref()
const toggleParticipants = (event: Event) => {
  participantsPopover.value.toggle(event)
}
const addOrUpdateMessage = (newMessage: WSChatMessage) => {
  const index = messages.value.findIndex((m) => m.id === newMessage.id)
  if (index !== -1) {
    messages.value[index] = { ...messages.value[index], ...newMessage }
  } else {
    messages.value.push(newMessage)
  }
  messages.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

onMounted(() => {
  on('chat_message', (payload: WebSocketPayload) => {
    if (payload.type === 'chat_message') {
      addOrUpdateMessage(payload.message)
    }
  })

  on('message_queued', (payload: WebSocketPayload) => {
    if (payload.type === 'message_queued') {
      const message = { ...payload.message }
      if (!message.author && authStore.user) {
        message.author = {
          id: authStore.user.id,
          name: authStore.user.name,
          email: authStore.user.email,
        }
      }
      addOrUpdateMessage(message)
    }
  })

  on('message_rejected', (payload: WebSocketPayload) => {
    if (payload.type === 'message_rejected') {
      rejectedMessage.value = payload.message
      const index = messages.value.findIndex((m) => m.id === payload.message.id)
      if (index !== -1) {
        messages.value[index] = {
          ...messages.value[index],
          status: 'REJECTED',
        }
      }
      showRejectedModal.value = true
    }
  })

  loadInitialMessages()
  loadRoomDetail()
})

const handleSend = () => {
  const content = messageInput.value.trim()
  if (!content || !isConnected.value) return
  wsSendMessage(content)
  messageInput.value = ''
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 100)
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

const loadInitialMessages = async () => {
  isLoading.value = true
  try {
    const response = await chatService.getRoomMessages(props.room.id)
    messages.value = response.results || []
    messages.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  } finally {
    isLoading.value = false
  }
}

const loadRoomDetail = async () => {
  roomDetail.value = await chatService.getRoomDetail(props.room.id)
}


watch(
  () => props.room.id,
  () => {
    loadRoomDetail()
  }
)
</script>

<template>
  <div class="flex flex-col h-full bg-white rounded-lg shadow-sm">
    <div class="flex items-center gap-3 p-4 border-b border-gray-200">
      <Avatar
        :label="room.name.charAt(0).toUpperCase()"
        size="large"
        shape="circle"
        :class="room.is_private ? 'bg-purple-500' : 'bg-blue-500'"
        class="text-white"
      />
      <div class="flex-1">
        <h2 class="font-semibold text-gray-900 flex items-center gap-2">
          {{ room.name }}
          <i v-if="room.is_private" class="pi pi-lock text-purple-600 text-sm"></i>
          <span v-if="isAdmin" class="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Admin</span>
        </h2>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="flex items-center gap-1 text-sm"
          :class="isConnected ? 'text-green-600' : 'text-red-500'"
        >
          <i :class="isConnected ? 'pi pi-circle-fill' : 'pi pi-circle'" class="text-xs"></i>
          {{ isConnected ? 'Conectado' : 'Desconectado' }}
        </span>
      </div>
      <Button
        type="button"
        icon="pi pi-users"
        class="p-button-rounded p-button-text text-blue-600"
        @click="toggleParticipants"
        v-tooltip.bottom="'Ver participantes'"
      />

      <Popover ref="participantsPopover">
        <div class="flex flex-col gap-2 p-3 min-w-[280px]">
          <span class="font-medium text-sm text-gray-700 mb-1 px-2">Participantes</span>
          <div v-if="roomDetail" class="flex flex-col gap-1">
            <div
              v-for="participant in roomDetail.participants"
              :key="participant.user.id"
              class="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded transition-colors"
            >
              <Avatar
                :label="participant.user.name.charAt(0).toUpperCase()"
                size="normal"
                shape="circle"
                class="bg-blue-500 text-white"
              />
              <div class="flex-1">
                <div class="font-semibold text-sm text-gray-800">{{ participant.user.name }}</div>
                <div class="text-xs text-gray-500">{{ participant.user.email }}</div>
              </div>
              <span
                v-if="participant.role === 'ADMIN'"
                class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium"
              >
                Admin
              </span>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500 py-2 px-2">
            Carregando participantes...
          </div>
        </div>
      </Popover>
    </div>

    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4"
    >
      <div v-if="isLoading" class="flex justify-center py-8">
        <ProgressSpinner style="width: 40px; height: 40px" />
      </div>
      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
        <i class="pi pi-comments text-4xl mb-2"></i>
        <p>Nenhuma mensagem ainda</p>
        <p class="text-sm">Seja o primeiro a enviar uma mensagem!</p>
      </div>
      <template v-else>
        <div v-if="isLoadingMore" class="flex justify-center py-2">
          <ProgressSpinner style="width: 24px; height: 24px" />
        </div>
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />
      </template>
    </div>

    <div class="border-t border-gray-200 p-4">
      <div v-if="connectionError" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ connectionError }}</span>
      </div>
      <div class="flex gap-2">
        <InputText
          v-model="messageInput"
          placeholder="Digite sua mensagem..."
          class="flex-1"
          @keydown="handleKeydown"
          :disabled="!isConnected"
        />
        <Button
          icon="pi pi-send"
          @click="handleSend"
          :disabled="!isConnected || !messageInput.trim()"
        />
      </div>
      <p class="text-xs text-gray-400 mt-2">
        <i class="pi pi-info-circle"></i>
        As mensagens são moderadas antes de serem entregues
      </p>
    </div>
  </div>

  <Dialog
    v-model:visible="showRejectedModal"
    modal
    header="Mensagem Rejeitada"
    :style="{ width: '400px' }"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
  >
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-3 text-red-600">
        <i class="pi pi-exclamation-triangle text-2xl"></i>
        <span class="font-semibold">Sua mensagem não pôde ser enviada.</span>
      </div>

      <div v-if="rejectedMessage" class="bg-gray-50 p-3 rounded border border-gray-200">
        <p class="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wider">Conteúdo:</p>
        <p class="text-gray-700 italic">"{{ rejectedMessage.content }}"</p>
      </div>

      <div v-if="rejectedMessage" class="flex flex-col gap-1">
        <p class="text-sm font-medium text-gray-900">Motivo da rejeição:</p>
        <p class="text-sm text-gray-600 bg-red-50 p-2 rounded border border-red-100">
          {{ rejectedMessage.reason }}
        </p>
      </div>
    </div>

    <template #footer>
      <Button label="Entendi" icon="pi pi-check" @click="showRejectedModal = false" autofocus />
    </template>
  </Dialog>
</template>

