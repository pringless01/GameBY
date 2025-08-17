// 🚀 Basit Node.js HTTP Server (CommonJS)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const backend = process.env.API_ORIGIN || 'http://localhost:3000';
  if(req.url.startsWith('/api/') || req.url.startsWith('/socket.io')){
    const target = new URL(req.url, backend);
    const opts = { method: req.method, headers: { ...req.headers, host: target.host } };
    const proxyReq = http.request(target, proxyRes => { res.writeHead(proxyRes.statusCode, proxyRes.headers); proxyRes.pipe(res); });
    proxyReq.on('error', () => { res.writeHead(502); res.end('Proxy error'); });
    if(req.method !== 'GET' && req.method !== 'HEAD') req.pipe(proxyReq); else proxyReq.end();
    return;
  }
  let urlPath = req.url === '/' ? '/index.html' : req.url; // default index.html (splash)
  let filePath = path.join(PUBLIC_DIR, urlPath);
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return void res.end('Forbidden'); }
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(err.code==='ENOENT'?404:500); return void res.end(err.code==='ENOENT'?'File not found':'Server error'); }
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
  console.log(`📁 Klasör: ${PUBLIC_DIR}`);
  console.log(`⏰ Başlatma zamanı: ${new Date().toLocaleString('tr-TR')}`);
});

server.on('error', (err) => {
  console.error('❌ Server hatası:', err.message);
});
