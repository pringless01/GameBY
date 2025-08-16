import { envConfig } from '../../config/env.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import * as MentorSvc from '../../modules/mentor/mentor.service.js';

// Orijinal rate limiter yapılandırması (aynı davranış)
export const mentorLimiter = rateLimit({
  windowMs: Number(envConfig.MENTOR_RATE_WINDOW_MS||10000),
  max: Number(envConfig.MENTOR_RATE_MAX||20),
  keyGenerator:(req)=> 'mentor:'+req.ip
});

export async function getState(req, res){
  const s = await MentorSvc.getUserState(req.user.id);
  if(!s) return res.status(404).json({ error: 'bulunamadi' });
  res.json(s);
}

export async function postAdvance(req, res){
  try { const next = await MentorSvc.advanceState(req.user.id); res.json({ state: next }); }
  catch { res.status(500).json({ error: 'advance_failed' }); }
}

export async function getGuidance(req, res){
  const g = await MentorSvc.getGuidance(req.user.id);
  res.json({ guidance: g });
}

export async function postSet(req, res){
  const { state } = req.body || {};
  try { const st = await MentorSvc.setState(req.user.id, state); res.json({ state: st }); }
  catch(e){ if(e.message==='invalid_state') return res.status(400).json({ error:'invalid_state' }); res.status(500).json({ error: 'set_failed' }); }
}

export async function postMentorReady(req,res){ const r = await MentorSvc.joinMentorQueue(req.user.id); if(!r.ok) return res.status(400).json(r); res.json(r); }
export function postMentorLeave(req,res){ MentorSvc.leaveMentorQueue(req.user.id); res.json({ ok:true }); }
export async function postMentorRequest(req,res){ const r = await MentorSvc.requestMentor(req.user.id); if(!r.ok) return res.status(400).json(r); res.json(r); }
export async function getMentorEligibility(req,res){ const e = await MentorSvc.canBeMentor(req.user.id); res.json(e); }
export function getQueues(_req,res){ res.json(MentorSvc.getQueues()); }
export async function getActive(req,res){
  try { const m = await MentorSvc.getActiveMentorship(req.user.id); if(!m) return res.json({ active:false }); res.json({ active:true, mentorship:m }); }
  catch { res.status(500).json({ error:'active_failed' }); }
}
export async function postMentorToggle(req,res){ const { ready } = req.body || {}; const r = await MentorSvc.setMentorReady(req.user.id, !!ready); if(!r.ok) return res.status(400).json(r); res.json(r); }
export async function postMenteeToggle(req,res){ const { waiting } = req.body || {}; const r = await MentorSvc.setMenteeWaiting(req.user.id, !!waiting); if(!r.ok) return res.status(400).json(r); res.json(r); }
export async function getMentorshipActive(req,res){ try { const m = await MentorSvc.listActiveMentorship(req.user.id); res.json({ mentorship: m }); } catch { res.status(500).json({ error:'active_failed' }); } }
export async function postMentorshipComplete(req,res){
  const { id } = req.params; const { mentor_rating=null, mentee_rating=null } = req.body || {};
  try {
  const updated = await MentorSvc.completeMentorship(Number(id), req.user.id, { mentor_rating, mentee_rating });
    res.json({ mentorship: updated });
  } catch(e){
    if(e.message==='not_found') return res.status(404).json({ error:'not_found' });
    if(e.message==='forbidden') return res.status(403).json({ error:'forbidden' });
    if(e.message==='invalid_state') return res.status(400).json({ error:'invalid_state' });
    res.status(500).json({ error:'complete_failed' });
  }
}
