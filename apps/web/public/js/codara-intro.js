/* CODARA Splash Intro (Neon) - reusable module */
(function(){
  const html = `
  <div id="codara-intro" class="codara-intro hidden" role="dialog" aria-modal="true" aria-label="CODARA intro">
    <div class="stage">
      <canvas id="spark"></canvas>
      <div class="halo top"></div>
      <div class="halo bottom"></div>

      <div class="stack">
        <div class="mark" aria-label="Codara mark">
          <span class="brace">{</span><span class="c">C</span><span class="brace">}</span>
        </div>
        <div class="word" aria-label="Codara wordmark">
          <div id="brand" class="brand" data-text="CODARA">CODARA</div>
          <div class="tag">GAME</div>
        </div>
      </div>

      <div class="skip">Devam etmek için bir tuşa basın / tıklayın</div>
    </div>
  </div>`;

  function ensureIntroMounted(){
    if(document.getElementById('codara-intro')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstElementChild);
  }

  let raf, particles = [], t0, dpi = 1, ctx, spark, stage, brand, root, done=false;

  function initRefs(){
    root = document.getElementById('codara-intro');
    stage = root.querySelector('.stage');
    brand = document.getElementById('brand');
    spark = document.getElementById('spark');
    ctx = spark.getContext('2d');
    dpi = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  }

  function glitchOnce(){
    brand.classList.add('glitch');
    setTimeout(()=> brand.classList.remove('glitch'), 160);
  }

  function initCanvas(){
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    t0 = performance.now();
  }
  function resizeCanvas(){
    const r = stage.getBoundingClientRect();
    spark.width = Math.floor(r.width * dpi);
    spark.height = Math.floor(r.height * dpi);
    spark.style.width = r.width + 'px';
    spark.style.height = r.height + 'px';
    ctx.setTransform(dpi,0,0,dpi,0,0);
    ctx.globalCompositeOperation = 'lighter';
  }
  function spawnBurst(n){
    particles.length = 0;
    const rect = stage.getBoundingClientRect();
    const cx = rect.width/2, cy = rect.height*0.56;
    for(let i=0;i<n;i++){
      const ang = (Math.random()*Math.PI - Math.PI/2) + (Math.random()*0.6-0.3);
      const spd = 120 + Math.random()*220;
      particles.push({
        x: cx + (Math.random()*40-20),
        y: cy + (Math.random()*10-5),
        vx: Math.cos(ang)*spd,
        vy: Math.sin(ang)*spd - 40,
        life: 700 + Math.random()*900,
        size: 1.2 + Math.random()*2.2,
        t:0
      });
    }
  }
  function animate(now){
    raf = requestAnimationFrame(animate);
    if(!now) return;
    const dt = Math.min(32, now - (t0||now)); t0 = now;

    ctx.clearRect(0,0,spark.width, spark.height);

    for(const p of particles){
      p.t += dt;
      const a = 1 - (p.t / p.life);
      if(a <= 0) continue;
      p.x += p.vx*dt/1000;
      p.y += p.vy*dt/1000;
      p.vy += 60*dt/1000;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      const c = 'rgba(0,209,255,' + (0.35 + 0.65*a).toFixed(3) + ')';
      ctx.fillStyle = c;
      ctx.shadowColor = 'rgba(0,209,255,0.9)';
      ctx.shadowBlur = 18;
      ctx.fill();
    }
  }

  window.startCodaraIntro = function(opts={}){
    const {autoFinish=true, minHoldMs=2600, maxDurationMs=7000} = opts;
    ensureIntroMounted();
    initRefs();
    done = false;
    return new Promise(resolve=>{
      root.classList.remove('hidden');
      requestAnimationFrame(()=> root.classList.add('intro-on'));

      setTimeout(()=> glitchOnce(), 1200);
      setTimeout(()=> glitchOnce(), 1700);

      initCanvas(); spawnBurst(90); animate();

      const finish = ()=>{
        if(done) return; done = true;
        cancelAnimationFrame(raf);
        root.classList.add('hidden');
        setTimeout(()=> resolve(), 620);
        window.removeEventListener('keydown', onKey, optsOnce);
        window.removeEventListener('mousedown', onKey, optsOnce);
        window.removeEventListener('touchstart', onKey, optsTouch);
      };
      const onKey = ()=> finish();
      const optsOnce = { once:true };
      const optsTouch = { once:true, passive:true };
      window.addEventListener('keydown', onKey, optsOnce);
      window.addEventListener('mousedown', onKey, optsOnce);
      window.addEventListener('touchstart', onKey, optsTouch);

      let canFinishAt = performance.now() + minHoldMs;
      function maybeFinish(){
        if(performance.now() >= canFinishAt) finish();
        else setTimeout(maybeFinish, Math.max(0, canFinishAt - performance.now()));
      }
      if(autoFinish){ setTimeout(()=> maybeFinish(), maxDurationMs); }
    });
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=> window.startCodaraIntro && window.startCodaraIntro());
  } else {
    window.startCodaraIntro && window.startCodaraIntro();
  }
})();
