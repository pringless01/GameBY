import { initDb } from '../config/database.js';
import { envConfig } from '../config/env.js';
import { autoAdvanceOnEvent } from '../services/mentorService.js';
import { emitReputationEvent, ReputationEventType } from '../services/reputationEvents.js';
import { isTokenRevoked } from '../security/tokenBlacklist.js';
import { logChatSpam } from '../services/chatSpamService.js';
import { wsMessageDuration } from '../metrics/latencyMetrics.js';

const onlineUsers = new Set();
// Basit in-memory flood sayaçları (TODO: kalıcı / kaydırmalı pencere rate limit)
const messageWindow = Number(envConfig.CHAT_FLOOD_WINDOW_MS || 10000);
const maxMessagesPerWindow = Number(envConfig.CHAT_FLOOD_MAX_MESSAGES || 8);
const userMessageTimestamps = new Map(); // userId -> [timestamps]
const ipMessageTimestamps = new Map();   // ip -> [timestamps]

function sanitize(msg){
  if(typeof msg !== 'string') return '';
  msg = msg.replace(/<script.*?>[\s\S]*?<\/script>/gi,'');
  const allowed = ['b','i','em','strong','a'];
  return msg.replace(/<\/?.*?>/g, (m)=>{
    const isClose = m.startsWith('</');
    const tag = m.replace(/[<>]/g,'').replace(/^\//,'').split(/\s+/)[0].toLowerCase();
    if(allowed.includes(tag)) return isClose?`</${tag}>`:`<${tag}>`;
    return '';
  });
}

function prune(tsArr){
  const now = Date.now();
  while(tsArr.length && now - tsArr[0] > messageWindow){ tsArr.shift(); }
}

export function registerChatNamespace(io) {
  io.on('connection', (socket) => {
    let userId = socket.user?.id || null;
  // Kullanıcıya özel oda: direct messages teslimi için
  if(userId){ socket.join('user:'+userId); }
    socket.use(async (packet, next) => {
      const token = socket.handshake.auth?.token;
      if(await isTokenRevoked(token) || !socket.user){
        const err = new Error('Unauthorized');
        err.data = { code: 4401 };
        return next(err);
      }
      next();
    });

    socket.on('join_chat', () => {
      userId = socket.user?.id;
      if (userId) {
        onlineUsers.add(userId);
        io.emit('online_count_updated', onlineUsers.size);
      }
    });

    socket.on('send_message', async (data) => {
      const endWs = wsMessageDuration.startTimer();
      if (!socket.user?.id || !data?.message) return;
      const now = Date.now();
      const ip = socket.handshake.address;
      // Flood kontrolü (kullanıcı)
      let bucket = userMessageTimestamps.get(socket.user.id);
      if(!bucket){ bucket = []; userMessageTimestamps.set(socket.user.id, bucket); }
      prune(bucket);
      // Flood kontrolü (IP)
      let ipBucket = ipMessageTimestamps.get(ip);
      if(!ipBucket){ ipBucket = []; ipMessageTimestamps.set(ip, ipBucket); }
      prune(ipBucket);
      if(bucket.length >= maxMessagesPerWindow || ipBucket.length >= maxMessagesPerWindow){
        emitReputationEvent({ userId: socket.user.id, type: ReputationEventType.SPAM_PENALTY }).catch(()=>{});
        logChatSpam({ userId: socket.user.id, ip }).catch(()=>{});
        return;
      }
      bucket.push(now); ipBucket.push(now);

      const sanitized = sanitize(data.message);
      if(!sanitized.trim()) return;

      const db = await initDb();
      const countRow = await db.get('SELECT COUNT(*) as c FROM chat_messages WHERE user_id = ?', [socket.user.id]);
      const first = countRow.c === 0;
      const result = await db.run('INSERT INTO chat_messages (user_id, message) VALUES (?, ?)', [socket.user.id, sanitized]);
      const row = await db.get('SELECT cm.id, cm.message, cm.created_at, u.username FROM chat_messages cm JOIN users u ON u.id = cm.user_id WHERE cm.id = ?', [result.lastID]);
      io.emit('new_message', row);
      if(first) {
        autoAdvanceOnEvent(socket.user.id, 'chat:first_message').catch(()=>{});
      }
      emitReputationEvent({ userId: socket.user.id, type: ReputationEventType.CHAT_MESSAGE }).catch(()=>{});
      endWs();
    });

    // Yeni DM gönderim (basit): event adı 'dm:send', cevap 'dm:new'
    socket.on('dm:send', async (payload) => {
      try {
        if(!socket.user?.id) return;
        const to = Number(payload?.to);
        const rawMsg = payload?.message;
        if(!to || !rawMsg) return;
        if(to === socket.user.id) return;
        const sanitized = sanitize(rawMsg).slice(0,1000);
        if(!sanitized.trim()) return;
        const db = await initDb();
        const u = await db.get('SELECT id, username FROM users WHERE id=?', [to]);
        if(!u) return;
        const ins = await db.run('INSERT INTO direct_messages (sender_id, recipient_id, message) VALUES (?,?,?)', [socket.user.id, to, sanitized]);
        const row = await db.get(`SELECT dm.id, dm.message, dm.created_at, dm.sender_id, su.username AS sender_username,
                                         dm.recipient_id, ru.username AS recipient_username
                                  FROM direct_messages dm
                                  JOIN users su ON su.id = dm.sender_id
                                  JOIN users ru ON ru.id = dm.recipient_id
                                  WHERE dm.id = ?`, [ins.lastID]);
        socket.emit('dm:new', row);
        io.to('user:'+to).emit('dm:new', row);
      } catch(e){ console.warn('[ws] dm:send error', e.message); }
    });

    socket.on('disconnect', () => {
      if (userId && onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        io.emit('online_count_updated', onlineUsers.size);
      }
    });
  });
}
