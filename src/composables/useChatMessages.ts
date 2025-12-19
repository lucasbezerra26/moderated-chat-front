import { ref, nextTick } from 'vue'
import { chatService, type Message } from '@/services/chatService'

export function useChatMessages(roomId: string) {
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const nextCursor = ref<string | null>(null)
  const hasMore = ref(true)

  async function loadInitial() {
    isLoading.value = true
    try {
      const response = await chatService.getRoomMessages(roomId)
      messages.value = response.results?.reverse() || []
      nextCursor.value = response.next || null
      hasMore.value = !!response.next
    } finally {
      isLoading.value = false
    }
  }

  async function loadMoreMessages(container?: HTMLElement | null) {
    if (!nextCursor.value || isLoadingMore.value) return
    isLoadingMore.value = true
    const oldScrollHeight = container ? container.scrollHeight : 0
    try {
      const cursorParam = new URL(nextCursor.value).searchParams.get('cursor')
      const response = await chatService.getRoomMessages(roomId, cursorParam || undefined)
      const newMessages = response.results?.reverse() || []
      messages.value = [...newMessages, ...messages.value]
      nextCursor.value = response.next || null
      hasMore.value = !!response.next
      if (container) {
        nextTick(() => {
          container.scrollTop = container.scrollHeight - oldScrollHeight
        })
      }
    } finally {
      isLoadingMore.value = false
    }
  }

  function addMessage(message: Message) {
    const exists = messages.value.some((m) => m.id === message.id)
    if (!exists) messages.value.push(message)
  }

  function updateMessage(message: Message) {
    const idx = messages.value.findIndex((m) => m.id === message.id)
    if (idx !== -1) messages.value[idx] = message
  }

  return {
    messages,
    isLoading,
    isLoadingMore,
    nextCursor,
    hasMore,
    loadInitial,
    loadMoreMessages,
    addMessage,
    updateMessage,
  }
}

