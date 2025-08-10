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
import contractRoutes from './routes/contract.js';
import { registerChatNamespace } from './sockets/chatSocket.js';
import { setIo } from './sockets/io.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const startTime = Date.now();
let currentCommit = process.env.GIT_COMMIT || null;

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    commit: currentCommit,
    uptime_sec: Math.round((Date.now() - startTime) / 1000),
    memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024)
  });
});
app.get('/metrics', async (req, res) => {
  try {
    const db = await initDb();
    const users = await db.get('SELECT COUNT(*) as c FROM users');
    const messages = await db.get('SELECT COUNT(*) as c FROM chat_messages');
    const trust = await db.get('SELECT AVG(trust_score) as avg_trust FROM users');
    res.json({
      users: users.c,
      messages: messages.c,
      avg_trust: trust.avg_trust !== null ? Number(trust.avg_trust.toFixed(2)) : null,
      timestamp: Date.now()
    });
  } catch (e) {
    res.status(500).json({ error: 'metrics_failed' });
  }
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/contracts', contractRoutes);

// Serve frontend (optional quick integration)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

(async () => {
  await initDb();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  setIo(io);
  registerChatNamespace(io);
  const PORT = process.env.PORT || 8081;
  server.listen(PORT, () => {
    console.log('Server listening on port', PORT);
  });

  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down...`);
    io.close();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Force exit');
      process.exit(1);
    }, 8000).unref();
  };
  ['SIGINT','SIGTERM'].forEach(sig => process.on(sig, () => shutdown(sig)));
})();
