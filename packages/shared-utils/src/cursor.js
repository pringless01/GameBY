// Safe encode/decode helpers used by cursor security and misc utils
// Non-invasive: If input invalid, return null and let callers decide.

export function safeBase64Encode(str){
  try {
    if (str == null) return null;
    const s = String(str);
    return Buffer.from(s, 'utf8').toString('base64');
  } catch (_e) {
    return null;
  }
}

export function safeBase64Decode(b64){
  try {
    if (b64 == null) return null;
    const s = String(b64);
    // Reject non-base64 chars quickly
    if(!/^[0-9A-Za-z+/=]+$/.test(s)) return null;
    return Buffer.from(s, 'base64').toString('utf8');
  } catch (_e) {
    return null;
  }
}
