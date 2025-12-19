<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import RoomListItem from '@/components/chat/RoomListItem.vue'
import ChatRoom from '@/components/chat/ChatRoom.vue'
import CreateRoomModal from '@/components/chat/CreateRoomModal.vue'
import { chatService, type Room } from '@/services/chatService'

const rooms = ref<Room[]>([])
const selectedRoom = ref<Room | null>(null)
const searchQuery = ref('')
const isLoading = ref(false)
const showCreateModal = ref(false)
const chatRoomRef = ref<InstanceType<typeof ChatRoom> | null>(null)

const filteredRooms = computed(() => {
  if (!searchQuery.value) return rooms.value
  const query = searchQuery.value.toLowerCase()
  return rooms.value.filter((room) => room.name.toLowerCase().includes(query))
})

const loadRooms = async () => {
  isLoading.value = true
  try {
    const response = await chatService.getRooms()
    rooms.value = response.results || []
  } finally {
    isLoading.value = false
  }
}

const handleRoomSelect = (room: Room) => {
  selectedRoom.value = room
}

const handleRoomCreated = () => {
  loadRooms()
}

const handleSendMessage = (content: string) => {
  console.log('Enviar mensagem via WebSocket:', content)
}

onMounted(() => {
  loadRooms()
})
</script>

<template>
  <div class="flex h-[calc(100vh-80px)] bg-gray-50">
    <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-bold text-gray-900">Conversas</h1>
          <Button
            icon="pi pi-plus"
            rounded
            text
            @click="showCreateModal = true"
            v-tooltip.bottom="'Nova sala'"
          />
        </div>
        <div class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <InputText
            v-model="searchQuery"
            placeholder="Buscar conversas..."
            class="w-full pl-10"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="isLoading" class="flex justify-center py-8">
          <ProgressSpinner style="width: 40px; height: 40px" />
        </div>

        <div v-else-if="filteredRooms.length === 0" class="text-center py-8 px-4 text-gray-500">
          <i class="pi pi-inbox text-4xl mb-2"></i>
          <p v-if="searchQuery">Nenhuma sala encontrada</p>
          <p v-else>Nenhuma sala disponível</p>
          <Button
            label="Criar Sala"
            icon="pi pi-plus"
            size="small"
            class="mt-4"
            @click="showCreateModal = true"
          />
        </div>

        <div v-else class="p-2">
          <RoomListItem
            v-for="room in filteredRooms"
            :key="room.id"
            :room="room"
            :is-active="selectedRoom?.id === room.id"
            @select="handleRoomSelect"
          />
        </div>
      </div>
    </div>

    <div class="flex-1 flex">
      <div v-if="!selectedRoom" class="flex-1 flex flex-col items-center justify-center text-gray-400">
        <i class="pi pi-comments text-6xl mb-4"></i>
        <h2 class="text-xl font-medium text-gray-600">Selecione uma conversa</h2>
        <p class="text-gray-400">Escolha uma sala para começar a conversar</p>
      </div>

      <div v-else class="flex-1">
        <ChatRoom
          ref="chatRoomRef"
          :room="selectedRoom"
          :key="selectedRoom.id"
          @send-message="handleSendMessage"
        />
      </div>
    </div>

    <CreateRoomModal
      v-model:visible="showCreateModal"
      @created="handleRoomCreated"
    />
  </div>
</template>

