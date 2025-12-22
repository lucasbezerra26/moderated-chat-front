<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import ProgressSpinner from 'primevue/progressspinner'
import ChatMessage from './ChatMessage.vue'
import { type Room } from '@/services/chatService'
import { createWebSocketService } from '@/services/websocketService'
import { chatService } from '@/services/chatService'
import type { WSChatMessage, WSMessageRejected, WebSocketPayload } from '@/interfaces/websocket'

const props = defineProps<{ room: Room }>()

const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const isConnected = ref(false)
const messages = ref<WSChatMessage[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const rejectedMessage = ref<WSMessageRejected | null>(null)

// Instancia o WebSocketService
const wsUrl = `ws://${window.location.host}/ws/chat/${props.room.id}/`
const ws = createWebSocketService(wsUrl)

ws.on('connect', () => {
  isConnected.value = true
})
ws.on('disconnect', () => {
  isConnected.value = false
})
ws.on('chat_message', (payload: WebSocketPayload) => {
  if (payload.type === 'chat_message') {
    messages.value.push(payload.message)
    messages.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }
})
ws.on('message_rejected', (payload: WebSocketPayload) => {
  if (payload.type === 'message_rejected') {
    rejectedMessage.value = payload.message
    window.alert(`Sua mensagem foi rejeitada: ${payload.message.reason}`)
  }
})

const handleSend = () => {
  const content = messageInput.value.trim()
  if (!content) return
  ws.send({ type: 'chat_message', message: content })
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

onMounted(() => {
  loadInitialMessages()
  ws.connect()
})

onUnmounted(() => {
  ws.close()
})

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
</template>

