# Sistema de Comandas

Aplicacao full-stack para restaurante com frontend 100% React, backend Node.js/Express, WebSocket com Socket.io, autenticacao JWT e banco Supabase/PostgreSQL.

## Estrutura

- `frontend/`: React 18 + Vite, rotas com `react-router-dom`, API com `axios` e tempo real com `socket.io-client`.
- `backend/`: Express, Socket.io, Supabase client no servidor, JWT e bcryptjs.
- `supabase/schema.sql`: tabelas, enums, indice parcial, triggers e dados iniciais.

## Requisitos

- Node.js 18+
- Projeto Supabase
- PostgreSQL/Supabase com acesso ao SQL Editor

## Banco de dados

1. Abra o SQL Editor do Supabase.
2. Execute o arquivo `supabase/schema.sql`.
3. Copie a URL do projeto e a service role key para o `.env` do backend.

Usuarios iniciais:

- Admin: `admin@restaurante.com`
- Garcom: `joao@restaurante.com`
- Gestor: `maria@restaurante.com`
- Senha: `password`

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Configure o `.env`:

```env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=troque-este-segredo
JWT_EXPIRE=7d
PORT=5000
```

API: `http://localhost:5000/api`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

## Rotas principais

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/mesas`
- `POST /api/mesas`
- `PUT /api/mesas/:id`
- `DELETE /api/mesas/:id`
- `GET /api/produtos`
- `POST /api/produtos`
- `PUT /api/produtos/:id`
- `DELETE /api/produtos/:id`
- `GET /api/comandas`
- `GET /api/comandas/mesa/:mesaId/ativa`
- `POST /api/comandas`
- `POST /api/comandas/:id/itens`
- `DELETE /api/comandas/:id/itens/:itemId`
- `PUT /api/comandas/:id/status`
- `POST /api/comandas/:id/pagar`
- `GET /api/comandas/financeiro/dia`
- `GET /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`

## Eventos Socket.io

O backend emite:

- `comanda_criada`
- `comanda_atualizada`
- `comanda_status_atualizado`
- `comanda_paga`

O React escuta esses eventos pelo `SocketContext` para recarregar mesas, comandas e financeiro automaticamente.

## Observacoes

- O frontend nao usa jQuery, HTML estatico de layout, `document.querySelector`, `innerHTML` ou manipulacao direta do DOM.
- O unico HTML manual e o `frontend/index.html` padrao do Vite, com `<div id="root"></div>`.
- A conexao com o banco fica somente no backend via `@supabase/supabase-js`.
# COMANDA
# COMANDA
# COMANDA
