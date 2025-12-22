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

  constructor(url: string) {
    this.url = url
  }

  connect() {
    const authStore = useAuthStore()
    const token = authStore.accessToken || ''
    this.ws = new WebSocket(`${this.url}?token=${token}`)
    this.ws.onopen = () => {
      this.isConnected = true
      this.emit('connect', { type: 'connect' })
    }
    this.ws.onclose = () => {
      this.isConnected = false
      this.emit('disconnect', { type: 'disconnect' })
      this.reconnect()
    }
    this.ws.onerror = (e) => {
      this.emit('error', { type: 'error', error: 'Erro de conexão WebSocket' })
    }
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketPayload
        this.emit(data.type, data)
      } catch (e) {
        this.emit('error', { type: 'error', error: 'Mensagem WebSocket inválida' })
      }
    }
  }

  reconnect() {
    if (this.reconnecting) return
    this.reconnecting = true
    setTimeout(() => {
      this.reconnecting = false
      this.connect()
    }, this.reconnectTimeout)
  }

  send(payload: object) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(payload))
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
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export function createWebSocketService(url: string) {
  return new WebSocketService(url)
}
