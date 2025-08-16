import express from 'express';

const router = express.Router();

// In-memory demo state (per ip)
const store = new Map();
function getKey(req){ return (req.ip || req.connection?.remoteAddress || 'local'); }
function getState(req){
  const k = getKey(req);
  const now = Date.now();
  let s = store.get(k);
  if(!s) { s = { money:50, wood:0, grain:0, updatedAt:now }; store.set(k,s); }
  return s;
}

router.get('/resources', (req,res)=>{
  return res.json(getState(req));
});

router.post('/action', express.json(), (req,res)=>{
  const { type } = req.body || {};
  const s = getState(req);
  if(type === 'chop-wood') { s.wood += 1; s.money += 1; s.updatedAt = Date.now(); return res.json({ ok:true, state:s }); }
  if(type === 'farm') { s.grain += 1; s.money += 1; s.updatedAt = Date.now(); return res.json({ ok:true, state:s }); }
  return res.status(400).json({ error:'invalid_action' });
});

export default router;
