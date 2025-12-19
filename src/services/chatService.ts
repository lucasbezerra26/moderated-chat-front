import axiosInstance from '@/axios/globalAxios'

export type MessageStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ParticipantRole = 'ADMIN' | 'MEMBER'

export interface Author {
  id: string
  name: string
  email: string
}

export interface Message {
  id: string
  content: string
  status: MessageStatus
  created_at: string
  author: Author
}

export interface Room {
  id: string
  name: string
  is_private: boolean
  created_at: string
}

export interface RoomParticipant {
  user: Author
  role: ParticipantRole
  created_at: string
}

export interface CreateRoomData {
  name: string
  is_private?: boolean
}

export interface RoomsResponse {
  results: Room[]
  next?: string
  previous?: string
}

export interface MessagesResponse {
  results: Message[]
  next?: string
  previous?: string
}

const chatService = {
  async getRooms(): Promise<RoomsResponse> {
    const response = await axiosInstance.get('chat/rooms/')
    return response.data
  },

  async getRoom(roomId: string): Promise<Room> {
    const response = await axiosInstance.get(`chat/rooms/${roomId}/`)
    return response.data
  },

  async createRoom(data: CreateRoomData): Promise<Room> {
    const response = await axiosInstance.post('chat/rooms/', data)
    return response.data
  },

  async getRoomMessages(roomId: string, cursor?: string): Promise<MessagesResponse> {
    const params = cursor ? { cursor } : {}
    const response = await axiosInstance.get(`chat/rooms/${roomId}/messages/`, { params })
    return response.data
  },

  async addParticipant(roomId: string, userId: string): Promise<RoomParticipant> {
    const response = await axiosInstance.post(`chat/rooms/${roomId}/participants/`, {
      user_id: userId,
    })
    return response.data
  },

  async removeParticipant(roomId: string, userId: string): Promise<void> {
    await axiosInstance.delete(`chat/rooms/${roomId}/participants/${userId}/`)
  },
}

export { chatService }

