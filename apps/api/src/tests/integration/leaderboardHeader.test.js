import assert from 'assert';
import '../migrations/run-migrations.js';

(async()=>{
  await import('../../server.js');
  await new Promise(r=>setTimeout(r,300));
  const res=await fetch('http://localhost:3000/health');
  assert(res.headers.get('x-leaderboard-version')==='v1','get header yok');
  const resH=await fetch('http://localhost:3000/health',{method:'HEAD'});
  assert(resH.headers.get('x-leaderboard-version')==='v1','head header yok');
  console.log('leaderboard header ok');
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
