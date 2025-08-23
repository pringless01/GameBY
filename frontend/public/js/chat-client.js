// Chat Client Module
// Sorumluluklar:
// 1. Auth token (AuthClient) ile socket.io bağlantısını kurmak
// 2. join_chat tetiklemek ve online_count_updated / new_message eventlerini dinlemek
// 3. Flood (sessiz) engellenmiş gönderimlerde UI'ya sinyal döndürmek (emit sonucu yoksa timeout)
// 4. Otomatik yeniden bağlanma denemesi & durum callback'leri
// 5. Harici UI katmanına minimal API expose

(function(){
  const ENDPOINT = (typeof window !== 'undefined' && window.__API_BASE) ? window.__API_BASE : '';
  const DEFAULT_NS = '/'; // root namespace
  let socket = null;
  let state = {
    connected: false,
    connecting: false,
    retries: 0,
    maxRetries: 10,
    lastError: null
  };
  const listeners = { message: new Set(), online: new Set(), status: new Set(), flood: new Set() };
  // DM event kanalı
  listeners.dm = new Set();

  function notify(type, payload){ (listeners[type]||[]).forEach(cb=>{ try{ cb(payload); }catch(e){} }); }

  function getTokenSafe(){ return (window.AuthClient && window.AuthClient.getToken && window.AuthClient.getToken()) || null; }

  async function connect(){
    if(state.connecting || state.connected) return;
    state.connecting = true; notify('status', { ...state });
    const tk = getTokenSafe();
    if(!tk){ state.connecting=false; state.lastError='no_token'; notify('status', { ...state }); return; }
    // Dinamik import (socket.io script'i yoksa yükle)
    if(!window.io){ await loadIoScript(); }
    socket = window.io(ENDPOINT || undefined, {
      autoConnect: true,
      auth: { token: tk },
      reconnection: true,
      reconnectionAttempts: state.maxRetries,
      reconnectionDelay: 800,
      timeout: 8000,
      transports: ['websocket','polling']
    });

    socket.on('connect', ()=>{
      state.connected = true; state.connecting = false; state.retries = 0; state.lastError = null;
      notify('status', { ...state });
      socket.emit('join_chat');
    });
    socket.on('disconnect', (reason)=>{
      state.connected = false; state.lastError = reason; notify('status', { ...state });
    });
    socket.on('connect_error', (err)=>{
      state.connected = false; state.connecting = false; state.lastError = err && err.message;
      state.retries++; notify('status', { ...state });
    });

    socket.on('online_count_updated', (count)=> notify('online', { count }) );
  socket.on('new_message', (msg)=> notify('message', sanitizeIncoming(msg)) );
  socket.on('dm:new', (msg)=> notify('dm', sanitizeIncomingDm(msg)) );
  }

  function loadIoScript(){
    return new Promise((resolve, reject)=>{
      const s = document.createElement('script');
      s.src = '/socket.io/socket.io.js';
      s.onload = ()=> resolve();
      s.onerror = ()=> reject(new Error('socket.io load failed'));
      document.head.appendChild(s);
    });
  }

  function sanitizeIncoming(row){
    if(!row || typeof row !== 'object') return row;
    // Server zaten sanitize ediyor; yine de dar beyaz liste
    const safe = { id: row.id, message: (''+row.message).slice(0,2000), created_at: row.created_at, username: row.username };
    return safe;
  }
  function sanitizeIncomingDm(row){
    if(!row || typeof row !== 'object') return row;
    return {
      id: row.id,
      message: (''+row.message).slice(0,2000),
      created_at: row.created_at,
      sender_id: row.sender_id,
      recipient_id: row.recipient_id,
      sender_username: row.sender_username,
      recipient_username: row.recipient_username
    };
  }

  // Mesaj gönderimi (flood tespitinde server sessizce yutabilir). Cevap yoksa optimistic UI.
  function sendMessage(text){
    if(!socket || !state.connected) return { ok:false, error:'not_connected' };
    text = (text||'').trim();
    if(!text) return { ok:false, error:'empty' };
    try { socket.emit('send_message', { message: text }); return { ok:true }; } catch(e){ return { ok:false, error:'emit_failed' }; }
  }
  function sendDirectMessage(toUserId, text){
    if(!socket || !state.connected){ console.warn('[dm] sendDirectMessage blocked: not_connected', { toUserId, state }); return { ok:false, error:'not_connected' }; }
    text = (text||'').trim();
    if(!text) return { ok:false, error:'empty' };
    try {
      const payload = { to: Number(toUserId), message: text };
      console.debug('[dm] emit dm:send', payload);
      socket.emit('dm:send', payload);
      return { ok:true };
    } catch(e){ console.error('[dm] emit failed', e); return { ok:false, error:'emit_failed' }; }
  }

  function on(type, cb){ if(listeners[type]) listeners[type].add(cb); return ()=>off(type, cb); }
  function off(type, cb){ if(listeners[type]) listeners[type].delete(cb); }

  function getStatus(){ return { ...state }; }
  function disconnect(){ if(socket){ socket.disconnect(); socket = null; state.connected=false; notify('status', { ...state }); } }

  window.ChatClient = { connect, sendMessage, sendDirectMessage, on, off, getStatus, disconnect };
})();
