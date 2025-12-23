import { useAuthStore } from '@/stores/authStore'
import type { WebSocketPayload, WebSocketEventType } from '@/interfaces/websocket'

export type WebSocketListener = (payload: WebSocketPayload) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private listeners: Partial<Record<WebSocketEventType, WebSocketListener[]>> = {}
  private reconnectTimeout: number = 3000
  private url: string
  private isConnected = false
  private reconnecting = false
  private retryCount = 0
  private maxRetries = 5
  private intentionallyClosed = false

  constructor(url: string) {
    this.url = url
  }

  async connect() {
    const authStore = useAuthStore()

    const isTokenValid = authStore.checkTokenValidity()

    if (!isTokenValid) {
      console.log('[WebSocket] Token inválido ou próximo de expirar, renovando...')
      try {
        const refreshed = await authStore.refreshToken()
        if (!refreshed) {
          this.emit('error', {
            type: 'error',
            error: 'Falha ao renovar token para WebSocket'
          })
          return
        }
        console.log('[WebSocket] Token renovado com sucesso')
      } catch (e) {
        console.error('[WebSocket] Erro ao renovar token:', e)
        this.emit('error', {
          type: 'error',
          error: 'Falha ao renovar token para WebSocket'
        })
        return
      }
    }

    const token = authStore.accessToken || ''

    if (!token) {
      console.error('[WebSocket] Tentativa de conectar sem token')
      this.emit('error', {
        type: 'error',
        error: 'Token de autenticação não disponível'
      })
      return
    }

    console.log('[WebSocket] Conectando ao servidor...')
    this.intentionallyClosed = false
    this.ws = new WebSocket(`${this.url}?token=${token}`)

    this.ws.onopen = () => {
      this.isConnected = true
      this.reconnecting = false
      this.retryCount = 0
      console.log('[WebSocket] Conexão estabelecida')
      this.emit('connect', { type: 'connect' })
    }

    this.ws.onclose = (event) => {
      this.isConnected = false
      console.log(`[WebSocket] Conexão fechada. Código: ${event.code}, Razão: ${event.reason}`)
      this.emit('disconnect', { type: 'disconnect' })

      if (this.intentionallyClosed) {
        console.log('[WebSocket] Fechamento intencional, não reconectando')
        return
      }

      if (event.code === 4003 || event.code === 4001 || event.code === 1008) {
        console.log('[WebSocket] Token inválido/expirado (código ' + event.code + '), renovando e reconectando...')
        authStore.refreshToken().then((success) => {
          if (success) {
            this.reconnect()
          } else {
            console.error('[WebSocket] Falha ao renovar token, não reconectando')
            this.emit('error', {
              type: 'error',
              error: 'Autenticação falhou. Faça login novamente.'
            })
          }
        })
      } else {
        this.reconnect()
      }
    }

    this.ws.onerror = (e) => {
      console.error('[WebSocket] Erro de conexão:', e)
      this.emit('error', { type: 'error', error: 'Erro de conexão WebSocket' })
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketPayload
        this.emit(data.type, data)
      } catch (e) {
        console.error('[WebSocket] Erro ao parsear mensagem:', e)
        this.emit('error', { type: 'error', error: 'Mensagem WebSocket inválida' })
      }
    }
  }

  reconnect() {
    if (this.reconnecting || this.retryCount >= this.maxRetries) {
      if (this.retryCount >= this.maxRetries) {
        console.error('[WebSocket] Limite de tentativas de reconexão atingido')
        this.emit('error', {
          type: 'error',
          error: 'Não foi possível reconectar ao servidor'
        })
      }
      return
    }

    this.reconnecting = true
    this.retryCount++

    const timeout = this.reconnectTimeout * this.retryCount

    console.log(`[WebSocket] Tentando reconectar em ${timeout / 1000}s (tentativa ${this.retryCount}/${this.maxRetries})`)

    setTimeout(() => {
      this.connect()
    }, timeout)
  }

  send(payload: object) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload))
    } else {
      console.warn('[WebSocket] Tentativa de envio sem conexão ativa. Estado:', this.ws?.readyState)
      this.emit('error', {
        type: 'error',
        error: 'Conexão WebSocket não está ativa'
      })
    }
  }

  on(type: WebSocketEventType, listener: WebSocketListener) {
    if (!this.listeners[type]) this.listeners[type] = []
    this.listeners[type]!.push(listener)
  }

  off(type: WebSocketEventType, listener: WebSocketListener) {
    if (!this.listeners[type]) return
    this.listeners[type] = this.listeners[type]!.filter((l) => l !== listener)
  }

  emit(type: WebSocketEventType, payload: WebSocketPayload) {
    if (this.listeners[type]) {
      this.listeners[type]!.forEach((listener) => listener(payload))
    }
  }

  close() {
    console.log('[WebSocket] Fechando conexão intencionalmente')
    this.intentionallyClosed = true
    if (this.ws) {
      this.ws.close(1000, 'Client closing connection')
      this.ws = null
    }
    this.isConnected = false
    this.reconnecting = false
    this.retryCount = 0
  }
}

export function createWebSocketService(url: string) {
  return new WebSocketService(url)
}
