import { getIdempotency, saveIdempotency } from '../services/idempotencyService.js';

export async function idempotencyMiddleware(req, res, next){
  const key = req.headers['x-idempotency-key'];
  if(!key) return next();
  try{
    const existing = await getIdempotency(key);
    if(existing){
      return res.status(existing.status).json(JSON.parse(existing.response));
    }
    const originalJson = res.json.bind(res);
    res.json = async (body)=>{
      try{ await saveIdempotency(key, res.statusCode, body); }catch{}
      return originalJson(body);
    };
  }catch{}
  next();
}
