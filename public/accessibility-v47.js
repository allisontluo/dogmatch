(()=>{
 const key='pawfect-accessibility-v1',dialog=document.getElementById('accessibility-dialog');
 let settings={size:100,motion:false},frame;
 try{const saved=JSON.parse(localStorage.getItem(key));if(saved){settings.size=Math.max(85,Math.min(150,Number(saved.size)||100));settings.motion=saved.motion===true;}}catch{}
 const originals=new Map();
 function apply(){
  frame=null;
  for(const [el,original] of originals){if(el.isConnected){if(original)el.style.fontSize=original;else el.style.removeProperty('font-size');}else originals.delete(el);}
  const nodes=[...document.body.querySelectorAll('*')].filter(el=>!['SCRIPT','STYLE','SVG','PATH'].includes(el.tagName)&&(['INPUT','SELECT','TEXTAREA'].includes(el.tagName)||[...el.childNodes].some(node=>node.nodeType===3&&node.textContent.trim())));
  const sizes=nodes.map(el=>parseFloat(getComputedStyle(el).fontSize));
  if(settings.size!==100)nodes.forEach((el,i)=>{if(!originals.has(el))originals.set(el,el.style.fontSize);el.style.fontSize=`${sizes[i]*settings.size/100}px`;});
  const label=`${settings.size}%`;
  if(document.getElementById('text-size-status').textContent!==label)document.getElementById('text-size-status').textContent=label;
  document.getElementById('text-smaller').disabled=settings.size<=85;
  document.getElementById('text-larger').disabled=settings.size>=150;
  document.getElementById('reduce-motion').checked=settings.motion;
  document.documentElement.dataset.reduceMotion=String(settings.motion);
  document.documentElement.dataset.largeText=String(settings.size>100);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(apply);}
 function save(){try{localStorage.setItem(key,JSON.stringify(settings));}catch{}apply();}
 document.querySelectorAll('[data-accessibility-open]').forEach(button=>button.addEventListener('click',()=>{dialog.showModal();apply();}));
 document.getElementById('accessibility-close').addEventListener('click',()=>dialog.close());
 document.getElementById('text-smaller').addEventListener('click',()=>{settings.size=Math.max(85,settings.size-10);save();});
 document.getElementById('text-larger').addEventListener('click',()=>{settings.size=Math.min(150,settings.size+10);save();});
 document.getElementById('text-reset').addEventListener('click',()=>{settings.size=100;save();});
 document.getElementById('reduce-motion').addEventListener('change',event=>{settings.motion=event.target.checked;save();});
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('resize',schedule);
 apply();
})();
