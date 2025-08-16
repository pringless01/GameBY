(function(){
  const API_BASE = '/api/v2';
  const $ = (s)=>document.querySelector(s);
  const log = (t)=>{
    const li=document.createElement('li');
    li.textContent = `${new Date().toLocaleTimeString()} • ${t}`;
    document.getElementById('events').prepend(li);
  };
  async function getJSON(url, opts={}){
    const r = await fetch(url, { headers:{'Content-Type':'application/json'}, ...opts });
    if(!r.ok){ throw new Error(`HTTP ${r.status}`); }
    return r.json();
  }
  async function refresh(){
    try{
      const s = await getJSON(`${API_BASE}/resources`);
      $('#money').textContent = s.money;
      $('#wood').textContent = s.wood;
      $('#grain').textContent = s.grain;
    }catch(e){ log('Hata: kaynak okunamadı'); }
  }
  async function act(type){
    try{
      const res = await getJSON(`${API_BASE}/action`, { method:'POST', body:JSON.stringify({ type }) });
      const s = res.state || {};
      $('#money').textContent = s.money;
      $('#wood').textContent = s.wood;
      $('#grain').textContent = s.grain;
      if(type==='chop-wood') log('Ormandan odun topladın (+1 para)');
      if(type==='farm') log('Tarlada çalıştın (+1 para)');
    }catch(e){ log('Hata: eylem başarısız'); }
  }
  window.addEventListener('DOMContentLoaded',()=>{
    $('#btnChop').addEventListener('click',()=>act('chop-wood'));
    $('#btnFarm').addEventListener('click',()=>act('farm'));
    refresh();
  });
})();
