<script setup lang="ts">
import { computed } from 'vue'
import Avatar from 'primevue/avatar'
import type { Room } from '@/services/chatService'

const props = defineProps<{
  room: Room
  isActive?: boolean
}>()

const emit = defineEmits<{
  select: [room: Room]
}>()

const formattedDate = computed(() => {
  const date = new Date(props.room.created_at)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Ontem'
  } else if (days < 7) {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' })
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
})

const roomInitials = computed(() => {
  return props.room.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
})
</script>

<template>
  <div
    class="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors rounded-lg"
    :class="{ 'bg-blue-50': isActive }"
    @click="emit('select', room)"
  >
    <div class="relative">
      <Avatar
        :label="roomInitials"
        size="large"
        shape="circle"
        :class="room.is_private ? 'bg-purple-500' : 'bg-blue-500'"
        class="text-white"
      />
      <i
        v-if="room.is_private"
        class="pi pi-lock absolute -bottom-1 -right-1 text-xs bg-white rounded-full p-1 text-purple-600"
      ></i>
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <span class="font-medium text-gray-900 truncate">{{ room.name }}</span>
        <span class="text-xs text-gray-500">{{ formattedDate }}</span>
      </div>
      <p class="text-sm text-gray-500 truncate">
        {{ room.is_private ? 'Sala privada' : 'Sala pública' }}
      </p>
    </div>
  </div>
</template>

