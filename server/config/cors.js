import cors from 'cors';

const originEnv = process.env.CORS_ORIGIN || 'http://localhost:8080';
const allowed = originEnv.split(',').map(s=>s.trim()).filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    if(!origin) return cb(null, true);
    if(allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked'), false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
});
