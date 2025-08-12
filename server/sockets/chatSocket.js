import { initDb } from '../config/database.js';
import { envConfig } from '../config/env.js';
import { autoAdvanceOnEvent } from '../services/mentorService.js';
import { emitReputationEvent, ReputationEventType } from '../services/reputationEvents.js';

const onlineUsers = new Set();
// Basit in-memory flood sayaçları (TODO: kalıcı / kaydırmalı pencere rate limit)
const messageWindow = Number(envConfig.CHAT_FLOOD_WINDOW_MS || 10000);
const maxMessagesPerWindow = Number(envConfig.CHAT_FLOOD_MAX_MESSAGES || 8);
const userMessageTimestamps = new Map(); // userId -> [timestamps]

function prune(tsArr){
  const now = Date.now();
  while(tsArr.length && now - tsArr[0] > messageWindow){ tsArr.shift(); }
}

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
      const now = Date.now();
      // Flood kontrolü
      let bucket = userMessageTimestamps.get(data.userId);
      if(!bucket){ bucket = []; userMessageTimestamps.set(data.userId, bucket); }
      prune(bucket);
      if(bucket.length >= maxMessagesPerWindow){
        // Flood: reputasyon cezası tetikleyebilir.
        emitReputationEvent({ userId: data.userId, type: ReputationEventType.SPAM_PENALTY }).catch(()=>{});
        return; // mesajı kayıt etmiyoruz (sessiz drop)
      }
      bucket.push(now);

      const db = await initDb();
      // İlk mesaj mı kontrol et
      const countRow = await db.get('SELECT COUNT(*) as c FROM chat_messages WHERE user_id = ?', [data.userId]);
      const first = countRow.c === 0;
      const result = await db.run('INSERT INTO chat_messages (user_id, message) VALUES (?, ?)', [data.userId, data.message]);
      const row = await db.get('SELECT cm.id, cm.message, cm.created_at, u.username FROM chat_messages cm JOIN users u ON u.id = cm.user_id WHERE cm.id = ?', [result.lastID]);
      io.emit('new_message', row);
      if(first) {
        autoAdvanceOnEvent(data.userId, 'chat:first_message').catch(()=>{});
      }
      // Reputation +1 (cap uygulanır)
      emitReputationEvent({ userId: data.userId, type: ReputationEventType.CHAT_MESSAGE }).catch(()=>{});
    });

    socket.on('disconnect', () => {
      if (userId && onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        io.emit('online_count_updated', onlineUsers.size);
      }
    });
  });
}
