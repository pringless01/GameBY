# Release Notes

## Nginx
- Ensure `nginx.conf` includes WebSocket upgrade headers:
  ```nginx
  location / {
    proxy_pass http://app:3000;
    proxy_set_header Host $host;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
  ```

## SSL (Let's Encrypt / Certbot)
- Obtain certificates:
  ```bash
  sudo certbot --nginx -d oyun.senin-domainin.com
  ```
- Auto-renew timer should be active:
  ```bash
  sudo systemctl status certbot.timer
  ```

## Docker Compose
- Containers include health checks; start services:
  ```bash
  docker compose up -d
  docker compose ps
  ```
- All services should report `healthy`.

## Production Verification
- Health endpoint:
  ```bash
  curl -I https://oyun.senin-domainin.com/health
  ```
- Metrics:
  ```bash
  curl https://oyun.senin-domainin.com/metrics | grep -E "p95|p99"
  ```
- Idempotent marketplace call:
  ```bash
  curl -X POST https://oyun.senin-domainin.com/api/marketplace/buy \
    -H "Authorization: Bearer <ACCESS>" \
    -H "X-Idempotency-Key: 123e4567-e89b-12d3-a456-426614174000" \
    -H "Content-Type: application/json" \
    -d '{"listingId":42,"qty":1}'
  ```
- WebSocket:
  ```javascript
  io("https://oyun.senin-domainin.com", { transports: ["websocket"], auth: { token: "Bearer <ACCESS>" } });
  ```
