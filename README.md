# Moderated Chat - Frontend

Sistema de chat colaborativo com moderação automática de mensagens.

## Tecnologias

- **Vue 3** - Framework JavaScript progressivo
- **TypeScript** - Tipagem estática
- **PrimeVue 4** - Biblioteca de componentes UI
- **Tailwind CSS 4** - Framework CSS utilitário
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento SPA

## Instalação

```bash
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev` - Servidor de desenvolvimento
- `pnpm build` - Build de produção
- `pnpm type-check` - Verificação de tipos
- `pnpm lint` - Linting

## Estrutura

```
src/
├── axios/              # Configuração HTTP
├── components/
│   ├── chat/           # Componentes de chat
│   ├── layout/         # Layout da aplicação
│   └── ui/             # Componentes genéricos
├── router/             # Rotas
├── services/           # Serviços de API
├── stores/             # Stores Pinia
├── types/              # Tipos TypeScript
└── views/              # Páginas
```

## API

Endpoints utilizados:

- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/chat/rooms/` - Listar salas
- `POST /api/chat/rooms/` - Criar sala
- `GET /api/chat/rooms/{id}/messages/` - Mensagens da sala

# moderated-chat-front
