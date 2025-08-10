import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import { registerChatNamespace } from './sockets/chatSocket.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Serve frontend (optional quick integration)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

(async () => {
  await initDb();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  registerChatNamespace(io);
  const PORT = process.env.PORT || 8081;
  server.listen(PORT, () => {
    console.log('Server listening on port', PORT);
  });
})();
