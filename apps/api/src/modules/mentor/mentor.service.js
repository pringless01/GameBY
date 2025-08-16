export async function getQueues() { return { counts: { wait: 0 } }; }
export async function canBeMentor(_userId) { return { eligible: false, reason: 'not_implemented' }; }
export async function getActiveMentorship(_userId) { return null; }
export async function computeMentorQualityScore(_mentorId) { return 0; }
