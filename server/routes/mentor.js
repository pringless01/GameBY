import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { getUserState, advanceState, getGuidance, setState } from '../services/mentorService.js';

const router = express.Router();

router.get('/state', authRequired, async (req, res) => {
  const s = await getUserState(req.user.id);
  if(!s) return res.status(404).json({ error: 'bulunamadi' });
  res.json(s);
});

router.post('/advance', authRequired, async (req, res) => {
  try {
    const next = await advanceState(req.user.id);
    res.json({ state: next });
  } catch(e){
    res.status(500).json({ error: 'advance_failed' });
  }
});

router.get('/guidance', authRequired, async (req, res) => {
  const g = await getGuidance(req.user.id);
  res.json({ guidance: g });
});

router.post('/set', authRequired, async (req, res) => {
  const { state } = req.body;
  try {
    const st = await setState(req.user.id, state);
    res.json({ state: st });
  } catch(e){
    if(e.message === 'invalid_state') return res.status(400).json({ error: 'invalid_state' });
    res.status(500).json({ error: 'set_failed' });
  }
});

export default router;
