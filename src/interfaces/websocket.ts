export interface WSChatMessage {
  id: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export interface WSMessageRejected {
  id: string;
  content: string;
  reason: string;
  created_at: string;
}

export type WebSocketEventType =
  | 'chat_message'
  | 'message_queued'
  | 'message_rejected'
  | 'connect'
  | 'disconnect'
  | 'error';

export type WebSocketPayload =
  | { type: 'chat_message'; message: WSChatMessage }
  | { type: 'message_queued'; message: WSChatMessage }
  | { type: 'message_rejected'; message: WSMessageRejected }
  | { type: 'connect' }
  | { type: 'disconnect' }
  | { type: 'error'; error: string };
