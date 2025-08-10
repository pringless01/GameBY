import { initDb } from '../config/database.js';

const onlineUsers = new Set();

export function registerChatNamespace(io) {
  io.on('connection', (socket) => {
    let userId = null;

    socket.on('join_chat', (payload) => {
      userId = payload?.userId;
      if (userId) {
        onlineUsers.add(userId);
        io.emit('online_count_updated', onlineUsers.size);
      }
    });

    socket.on('send_message', async (data) => {
      if (!data?.userId || !data?.message) return;
      const db = await initDb();
      const result = await db.run('INSERT INTO chat_messages (user_id, message) VALUES (?, ?)', [data.userId, data.message]);
      const row = await db.get('SELECT cm.id, cm.message, cm.created_at, u.username FROM chat_messages cm JOIN users u ON u.id = cm.user_id WHERE cm.id = ?', [result.lastID]);
      io.emit('new_message', row);
    });

    socket.on('disconnect', () => {
      if (userId && onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        io.emit('online_count_updated', onlineUsers.size);
      }
    });
  });
}
