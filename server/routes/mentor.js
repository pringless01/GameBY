import express from 'express';

import { envConfig } from '../config/env.js';
import { authRequired } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { MentorService } from '../modules/mentor/index.js';

const router = express.Router();

router.get('/state', authRequired, async (req, res) => {
  const s = await MentorService.getUserState(req.user.id);
  if(!s) return res.status(404).json({ error: 'bulunamadi' });
  res.json(s);
});

router.post('/advance', authRequired, async (req, res) => {
  try {
  const next = await MentorService.advanceState(req.user.id);
    res.json({ state: next });
  } catch(e){
    res.status(500).json({ error: 'advance_failed' });
  }
});

router.get('/guidance', authRequired, async (req, res) => {
  const g = await MentorService.getGuidance(req.user.id);
  res.json({ guidance: g });
});

router.post('/set', authRequired, async (req, res) => {
  const { state } = req.body;
  try {
  const st = await MentorService.setState(req.user.id, state);
    res.json({ state: st });
  } catch(e){
    if(e.message === 'invalid_state') return res.status(400).json({ error: 'invalid_state' });
    res.status(500).json({ error: 'set_failed' });
  }
});

const mentorLimiter = rateLimit({ windowMs: Number(envConfig.MENTOR_RATE_WINDOW_MS||10000), max: Number(envConfig.MENTOR_RATE_MAX||20), keyGenerator:(req)=> 'mentor:'+req.ip});

router.post('/mentor/ready', authRequired, mentorLimiter, async (req,res)=>{ const r = await MentorService.joinMentorQueue(req.user.id); if(!r.ok) return res.status(400).json(r); res.json(r); });
router.post('/mentor/leave', authRequired, (req,res)=>{ MentorService.leaveMentorQueue(req.user.id); res.json({ ok:true }); });
router.post('/mentor/request', authRequired, mentorLimiter, async (req,res)=>{ const r = await MentorService.requestMentor(req.user.id); if(!r.ok) return res.status(400).json(r); res.json(r); });
router.get('/mentor/eligibility', authRequired, async (req,res)=>{ const e = await MentorService.canBeMentor(req.user.id); res.json(e); });
router.get('/queues', authRequired, (req,res)=>{ res.json(MentorService.getQueues()); });
router.get('/active', authRequired, async (req,res)=>{
  try {
  const m = await MentorService.getActiveMentorship(req.user.id);
    if(!m) return res.json({ active:false });
    res.json({ active:true, mentorship:m });
  } catch(e){ res.status(500).json({ error:'active_failed' }); }
});
router.post('/mentor/toggle', authRequired, mentorLimiter, async (req,res)=>{
  const { ready } = req.body;
  const r = await MentorService.setMentorReady(req.user.id, !!ready);
  if(!r.ok) return res.status(400).json(r);
  res.json(r);
});
router.post('/mentee/toggle', authRequired, mentorLimiter, async (req,res)=>{
  const { waiting } = req.body;
  const r = await MentorService.setMenteeWaiting(req.user.id, !!waiting);
  if(!r.ok) return res.status(400).json(r);
  res.json(r);
});
router.get('/mentorship/active', authRequired, async (req,res)=>{
  try { const m = await listActiveMentorship(req.user.id); res.json({ mentorship: m }); } catch(e){ res.status(500).json({ error:'active_failed' }); }
});
router.post('/mentorship/:id/complete', authRequired, async (req,res)=>{
  const { id } = req.params; const { mentor_rating=null, mentee_rating=null } = req.body || {};
  try {
  const updated = await MentorService.completeMentorship(Number(id), req.user.id, { mentor_rating, mentee_rating });
    res.json({ mentorship: updated });
  } catch(e){
    if(e.message==='not_found') return res.status(404).json({ error:'not_found' });
    if(e.message==='forbidden') return res.status(403).json({ error:'forbidden' });
    if(e.message==='invalid_state') return res.status(400).json({ error:'invalid_state' });
    res.status(500).json({ error:'complete_failed' });
  }
});

export default router;
