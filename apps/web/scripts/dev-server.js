// 🚀 Basit Node.js HTTP Server
const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types
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
  // Basit proxy: /api veya /socket.io isteklerini backend'e yönlendir
  const backend = process.env.API_ORIGIN || 'http://localhost:3000';
  if(req.url.startsWith('/api/') || req.url.startsWith('/socket.io')){
    const target = new URL(req.url, backend);
  const proxyReq = http.request(target, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
  proxyReq.on('error', (_err) => {
      res.writeHead(502);
      res.end('Proxy error');
    });
    if(req.method !== 'GET' && req.method !== 'HEAD') req.pipe(proxyReq); else proxyReq.end();
    return;
  }
  // URL'yi temizle
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Güvenlik - parent directory'e çıkmayı engelle
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Dosyayı oku
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }

    // MIME type belirle
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';

    // CORS headers ekle
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

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
