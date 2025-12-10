const canvas=document.getElementById('canvas'),ctx=canvas.getContext('2d');
let strokes=[],drawing=false,startTime=0;

function pos(ev){
  const r=canvas.getBoundingClientRect();
  return {
    x:(ev.clientX-r.left)*(canvas.width/r.width),
    y:(ev.clientY-r.top)*(canvas.height/r.height)
  };
}

function start(ev){
  drawing=true;
  startTime=performance.now();
  strokes.push([]);
}

function move(ev){
  if(!drawing)return;
  const {x,y}=pos(ev);
  const t=(performance.now()-startTime)/1000;
  strokes[strokes.length-1].push({x,y,t});
  draw();
}

function end(){
  drawing=false;
  draw();
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='#3f51b5';
  ctx.lineWidth=3;
  ctx.lineCap='round';
  for(const s of strokes){
    if(s.length<1)continue;
    ctx.beginPath();
    ctx.moveTo(s[0].x,s[0].y);
    for(const p of s)ctx.lineTo(p.x,p.y);
    ctx.stroke();
  }
}

canvas.addEventListener('pointerdown',start);
canvas.addEventListener('pointermove',move);
canvas.addEventListener('pointerup',end);
canvas.addEventListener('pointerleave',end);

const phonemesEl=document.getElementById('phonemes'),
      candidatesEl=document.getElementById('candidates'),
      bestWordEl=document.getElementById('bestWord'),
      confidenceEl=document.getElementById('confidence'),
      targetWordEl=document.getElementById('targetWord'),
      historyList=document.getElementById('historyList');

const MAP={short_down:'ba',short_right:'ku',long_right:'bu',curve_small:'la',curve_big:'ma'};

function strokeToken(s){
  if(s.length<2)return'unknown';
  const dx=s[s.length-1].x-s[0].x,
        dy=s[s.length-1].y-s[0].y,
        len=Math.hypot(dx,dy);
  if(len<25) return Math.abs(dx)>Math.abs(dy)?'short_right':'short_down';
  else return Math.abs(dx)>Math.abs(dy)?'long_right':dy>0?'curve_big':'curve_small';
}

function tokensToPhonemes(t){return t.map(x=>MAP[x]||'??');}

function candidates(ph){
  const j=ph.join('');
  const c=new Set();
  if(j.includes('bu')&&j.includes('ku'))c.add('buku');
  if(j.includes('ma')&&j.includes('lam'))c.add('malam');
  if(j.includes('ma')&&j.includes('kan'))c.add('makan');
  if(j.includes('bu')&&j.includes('ka'))c.add('buka');
  ['buku','makan','malam','buka','balik','lama','lusa'].forEach(w=>c.add(w));
  return Array.from(c).slice(0,5);
}

function score(ph,w){
  let b=0.5;
  const j=ph.join('');
  if(w.includes(j)||j.includes(w))b+=0.3;
  if(['buku','makan','malam','buka'].includes(w))b+=0.1;
  return Math.min(b,0.95);
}

function recognize(){
  const f=strokes.filter(s=>s.length>0);
  if(f.length===0){alert('Sila lukis dahulu');return;}
  const tokens=f.map(strokeToken),
        ph=tokensToPhonemes(tokens),
        c=candidates(ph),
        sc=c.map(w=>[w,score(ph,w)]).sort((a,b)=>b[1]-a[1]);
  let [best,conf]=sc[0];
  
  phonemesEl.textContent=ph.join(' ');
  candidatesEl.textContent=sc.map(x=>x[0]).join(', ');
  bestWordEl.textContent=best;
  confidenceEl.textContent=(conf*100).toFixed(0)+'%';

  // Save to history
  const li=document.createElement('li');
  li.textContent=`Fonem: ${ph.join(' ')} | Best: ${best} | Keyakinan: ${(conf*100).toFixed(0)}%`;
  historyList.prepend(li);
}

// Button wiring
document.getElementById('recognizeBtn').addEventListener('click',recognize);
document.getElementById('clearBtn').addEventListener('click',()=>{
  strokes=[];draw();
});
document.getElementById('exportCsvBtn').addEventListener('click',()=>{
  let csv="Fonem,Best,Keyakinan\n";
  historyList.querySelectorAll('li').forEach(li=>{
    csv+=li.textContent.replace(/\s*\|\s*/g,",")+"\n";
  });
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download="history.csv";a.click();
  URL.revokeObjectURL(url);
});

// Register service worker
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js');
  });
}
