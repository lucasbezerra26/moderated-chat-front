<script setup lang="ts">
import { computed } from 'vue'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import type { Message } from '@/services/chatService'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{
  message: Message
}>()

const authStore = useAuthStore()

const isOwnMessage = computed(() => {
  return props.message.author.id === authStore.user?.id
})

const formattedTime = computed(() => {
  const date = new Date(props.message.created_at)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
})

const authorInitials = computed(() => {
  const name = props.message.author.name
  if (name) {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }
  return props.message.author.email.charAt(0).toUpperCase()
})

const statusConfig = computed(() => {
  const configs = {
    PENDING: { severity: 'warn' as const, label: 'Pendente', icon: 'pi pi-clock' },
    APPROVED: { severity: 'success' as const, label: 'Aprovada', icon: 'pi pi-check' },
    REJECTED: { severity: 'danger' as const, label: 'Rejeitada', icon: 'pi pi-times' },
  }
  return configs[props.message.status]
})
</script>

<template>
  <div
    class="flex gap-3 mb-4"
    :class="{ 'flex-row-reverse': isOwnMessage }"
  >
    <Avatar
      :label="authorInitials"
      shape="circle"
      :class="isOwnMessage ? 'bg-blue-500' : 'bg-gray-400'"
      class="text-white flex-shrink-0"
    />

    <div
      class="max-w-[70%] rounded-lg p-3"
      :class="{
        'bg-blue-500 text-white': isOwnMessage,
        'bg-gray-100 text-gray-900': !isOwnMessage,
        'opacity-60': message.status === 'PENDING',
        'line-through opacity-50': message.status === 'REJECTED',
      }"
    >
      <div
        v-if="!isOwnMessage"
        class="text-xs font-medium mb-1"
        :class="isOwnMessage ? 'text-blue-100' : 'text-gray-600'"
      >
        {{ message.author.name }}
      </div>

      <p class="text-sm whitespace-pre-wrap break-words">{{ message.content }}</p>

      <div class="flex items-center justify-end gap-2 mt-1">
        <span
          class="text-xs"
          :class="isOwnMessage ? 'text-blue-100' : 'text-gray-400'"
        >
          {{ formattedTime }}
        </span>

        <Tag
          v-if="message.status !== 'APPROVED'"
          :severity="statusConfig.severity"
          :value="statusConfig.label"
          class="text-xs py-0 px-1"
        >
          <i :class="statusConfig.icon" class="text-xs mr-1"></i>
          {{ statusConfig.label }}
        </Tag>
      </div>
    </div>
  </div>
</template>

