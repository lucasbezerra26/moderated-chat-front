import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createWebSocketService } from '@/services/websocketService'
import { useAuthStore } from '@/stores/authStore'
import type { WebSocketPayload } from '@/interfaces/websocket'

export function useChatWebSocket(roomId: string) {
  const authStore = useAuthStore()
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
  const ws = createWebSocketService(`${wsUrl}/ws/chat/${roomId}/`)

  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)
  const retryCount = ref(0)

  const setupListeners = () => {
    ws.on('connect', () => {
      isConnected.value = true
      connectionError.value = null
      console.log('[useChatWebSocket] Conectado à sala:', roomId)
    })

    ws.on('disconnect', () => {
      isConnected.value = false
      console.log('[useChatWebSocket] Desconectado da sala:', roomId)
    })

    ws.on('error', (payload: WebSocketPayload) => {
      if (payload.type === 'error') {
        connectionError.value = payload.error || 'Erro desconhecido'
        console.error('[useChatWebSocket] Erro:', payload.error)
      }
    })
  }

  const connect = async () => {
    if (!authStore.isAuthenticated) {
      console.error('[useChatWebSocket] Tentativa de conectar sem autenticação')
      return
    }

    setupListeners()
    await ws.connect()
  }

  const disconnect = () => {
    ws.close()
    isConnected.value = false
  }

  const sendMessage = (message: string) => {
    if (!isConnected.value) {
      console.warn('[useChatWebSocket] Tentativa de enviar mensagem sem conexão')
      connectionError.value = 'Não conectado ao servidor'
      return
    }

    ws.send({
      type: 'chat_message',
      message,
    })
  }

  const on = ws.on.bind(ws)
  const off = ws.off.bind(ws)

  watch(
    () => authStore.isAuthenticated,
    (authenticated) => {
      if (!authenticated && isConnected.value) {
        console.log('[useChatWebSocket] Logout detectado, fechando WebSocket')
        disconnect()
      }
    }
  )

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    connectionError,
    retryCount,
    sendMessage,
    connect,
    disconnect,
    on,
    off,
  }
}

