const { chromium } = require('playwright');
const path=require('path'), fs=require('fs');
(async()=>{
  const [,,out,mode,...times]=process.argv;
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await p.goto('file://'+path.resolve(__dirname,'story.html')+'',{waitUntil:'networkidle'});
  await p.evaluate(()=>window.ready);
  const dur=await p.evaluate(()=>window.DUR);
  fs.mkdirSync(out,{recursive:true});
  const ts = mode==='all' ? Array.from({length:Math.round(dur*30)},(_,i)=>i/30) : times.map(Number);
  for(let i=0;i<ts.length;i++){
    await p.evaluate(t=>window.render(t),ts[i]);
    await p.screenshot({path:`${out}/f${String(i).padStart(4,'0')}.${mode==='all'?'jpg':'png'}`,type:mode==='all'?'jpeg':'png',quality:mode==='all'?95:undefined});
  }
  await b.close(); console.log('frames',ts.length,'dur',dur);
})();
