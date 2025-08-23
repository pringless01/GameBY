import request from 'supertest';
import '../config/env.js';
import { initDb } from '../../config/database.js';
import '../../server.js';

// Yardımcı: test kullanıcı adı benzersiz olsun
const rnd = () => Math.random().toString(36).slice(2,10);

async function registerAndLogin(app, identity){
  const email = `${identity}@example.com`;
  const username = identity;
  const password = 'Passw0rd!'+identity;
  await request(app).post('/api/auth/register').send({ email, username, password });
  const loginRes = await request(app).post('/api/auth/login').send({ identity: username, password });
  return loginRes.body.token;
}

describe('Auth Logout Flow', () => {
  let app;
  beforeAll(async () => {
    const mod = await import('../../server.js');
    app = mod.default || mod.app || mod; // server exports yoksa express instance global olabilir
    await initDb();
  });

  test('logout sonrası token invalid olmalı', async () => {
    const token = await registerAndLogin(app, 'u'+rnd());
    // me çalışmalı
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer '+token).expect(200);
    // logout
    await request(app).post('/api/auth/logout').set('Authorization', 'Bearer '+token).expect(200);
    // me artık 401
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer '+token).expect(401);
  });
});
