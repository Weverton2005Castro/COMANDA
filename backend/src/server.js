import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import mesasRoutes from './routes/mesasRoutes.js';
import produtosRoutes from './routes/produtosRoutes.js';
import comandasRoutes from './routes/comandasRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';

const app = express();
const server = http.createServer(app);
const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if ([...defaultOrigins, ...allowedOrigins].includes(origin)) return true;

  try {
    return new URL(origin).hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};

const io = new Server(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/comandas', comandasRoutes);
app.use('/api/usuarios', usuariosRoutes);

io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Socket desconectado: ${socket.id}`));
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});

export default app;
