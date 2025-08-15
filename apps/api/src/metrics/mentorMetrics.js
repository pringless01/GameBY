import { Histogram, Counter } from 'prom-client';

export const mentorSessionDuration = new Histogram({
  name: 'mentor_session_duration_ms',
  help: 'Mentor session duration in ms',
  buckets: [60000, 300000, 900000, 1800000, 3600000]
});

export const mentorSessionStart = new Counter({
  name: 'mentor_session_start_total',
  help: 'Mentor sessions started'
});

export const mentorSessionOver30m = new Counter({
  name: 'mentor_session_over_30m_total',
  help: 'Mentor sessions over 30 minutes'
});

const startTimes = new Map();

export function startMentorSession(id){
  mentorSessionStart.inc();
  startTimes.set(id, Date.now());
}

export function endMentorSession(id){
  const start = startTimes.get(id);
  if(start){
    const dur = Date.now() - start;
    mentorSessionDuration.observe(dur);
    if(dur > 30 * 60 * 1000) mentorSessionOver30m.inc();
    startTimes.delete(id);
  }
}
