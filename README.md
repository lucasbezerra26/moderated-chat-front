# Chat Moderado - Frontend

Sistema de chat com moderação em tempo real. Vue 3 + TypeScript + WebSocket.

## 🚀 Como Executar

### Desenvolvimento

Para desenvolvimento local, copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
pnpm install
pnpm dev
```

Disponível em: `http://localhost:5173`

**Variáveis de ambiente para desenvolvimento (`.env.local`):**
```env
VITE_CLIENT_URL=http://127.0.0.1:8010
VITE_WS_URL=ws://127.0.0.1:8010
```

### Produção

Build via Docker multi-stage:

```bash
./build-docker.sh
```

Arquivos estáticos gerados em `./dist`.

**Ou manualmente com Docker Compose:**
```bash
docker-compose up --build
docker cp frontend:/app/dist ./dist
```

**Variáveis de ambiente para produção (`.env`):**
```env
VITE_CLIENT_URL=https://4.155.72.118
VITE_WS_URL=wss://4.155.72.118
```

**Para sobrescrever em produção local (opcional):**
```bash
cp .env.production.local.example .env.production.local
# Edite .env.production.local com suas URLs customizadas
```

**Nota:**
- O arquivo `.env` já está configurado para produção
- Use `.env.local` para desenvolvimento (não commitado)
- Use `.env.production.local` para customizar produção local (não commitado)

---

## 🏛️ Estrutura e Decisões

### Organização

```
src/
├── components/
│   ├── chat/           # ChatRoom, ChatMessage, RoomListItem
│   └── layout/         # AppTopbar, AppFooter, AppLayout
├── composables/        # useChatWebSocket (lógica WebSocket)
├── services/           # API HTTP e WebSocket
├── stores/             # Pinia (authStore com refresh automático)
├── views/              # Páginas (HomeView, LoginView)
└── axios/              # Interceptors (refresh token em 401)
```

### Autenticação WebSocket

Refresh automático de token JWT antes de conectar ao WebSocket:

1. **Validação pré-conexão**: `checkTokenValidity()` verifica se o token expira em <60s
2. **Refresh transparente**: Renova via `/api/auth/refresh/` antes de abrir o socket
3. **Reconexão inteligente**: Backoff exponencial (3s → 15s, max 5 tentativas)
4. **Fallback em erro de auth**: Códigos 4003/4001/1008 disparam novo refresh antes de reconectar

**Fluxo:**
```
Token válido? → Conecta WS com ?token=JWT
Token expirado → Refresh → Conecta
WS fecha com auth error → Refresh → Reconecta
Logout → Fecha WS intencionalmente
```

### Composable `useChatWebSocket`

Encapsula toda lógica de WebSocket em hook reutilizável:

```typescript
const { isConnected, connectionError, sendMessage, on } = useChatWebSocket(roomId)

on('chat_message', (payload) => {
  messages.value.push(payload.message)
})

sendMessage('Olá mundo') // Valida conexão antes de enviar
```

- Auto-conecta no `onMounted`, auto-desconecta no `onUnmounted`
- Watch em `isAuthenticated` fecha socket ao fazer logout
- Estado reativo exposto (`isConnected`, `connectionError`)

### Feedback Otimista

Mensagens aparecem como "Pendente" instantaneamente. O backend envia:
- `message_queued`: Confirmação de recebimento
- `chat_message`: Mensagem aprovada pela moderação
- `message_rejected`: Mensagem rejeitada (modal com motivo)

---

## 📦 Stack

- **Vue 3** (Composition API) + **TypeScript**
- **PrimeVue 4** (componentes) + **Tailwind CSS 4**
- **Pinia** (state) + **Vue Router**
- **Axios** (HTTP com retry automático em 401)

**Decisões técnicas:**
- **Composables**: Reuso de lógica (WebSocket, HTTP) sem mixins
- **TypeScript**: Segurança de tipos em payloads WebSocket e API
- **Interceptors HTTP**: Refresh token transparente em todas requisições
- **Dockerfile multi-stage**: Imagem Alpine final com <50MB

---

## 🔒 Segurança

- Token JWT no header `Authorization: Bearer` (HTTP)
- Token JWT na query string `?token=` (WebSocket - única forma segura com browsers)
- Refresh automático **antes** de expirar (buffer de 60s)
- Fila de requisições durante refresh (evita múltiplos refreshes simultâneos)
- Logout limpa localStorage e fecha WebSocket intencionalmente

---
