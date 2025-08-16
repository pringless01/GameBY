// Placeholder for future structured logging; keep compatibility
export const log = {
  info: (...args) => { try { console.info(...args); } catch(_) {} },
  warn: (...args) => { try { console.warn(...args); } catch(_) {} },
  error: (...args) => { try { console.error(...args); } catch(_) {} },
};
