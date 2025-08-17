import crypto from 'crypto';
export function buildEtag(obj){ try { const json=JSON.stringify(obj); const hash=crypto.createHash('sha1').update(json).digest('base64').slice(0,20); return 'W/"'+hash+'"'; } catch { return undefined; } }
export function sendWithEtag(req,res,payload, meta){
  const etag = buildEtag(payload);
  const inm = req.headers['if-none-match'];
  if(etag && inm && inm===etag){ return res.status(304).end(); }
  if(meta?.lastTs){
    const lm = new Date(meta.lastTs).toUTCString(); res.setHeader('Last-Modified', lm);
    if(!etag){ const ims=req.headers['if-modified-since']; if(ims && new Date(ims).getTime() >= meta.lastTs){ return res.status(304).end(); } }
  }
  if(etag) res.setHeader('ETag', etag);
  res.json(payload);
}
