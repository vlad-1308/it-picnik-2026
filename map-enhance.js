(function(){
  'use strict';

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      if(document.querySelector('script[data-dynamic="'+src+'"]')) return resolve();
      const s=document.createElement('script');
      s.src=src; s.defer=true; s.dataset.dynamic=src;
      s.onload=resolve; s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  /*
   * Schedule subsystem is deliberately loaded from here so index.html stays stable.
   * Future official-program updates only touch schedule-data.js.
   */
  loadScript('./schedule-data.js')
    .then(()=>loadScript('./schedule-engine.js'))
    .catch(err=>console.warn('Schedule subsystem failed to load',err));

  const shortLabels={
    team:'Т-Банк Команда',auto:'Авто.ру',eng3:'Л3 · Инженерия',education:'Образование',
    prod1:'Л1 · Продукты',data2:'Л2 · Data',mainstage:'Музыкальная сцена',
    tproducts:'Т-Банк Продукты',tech:'Т-Банк Технологии'
  };
  function enhancePins(){
    document.querySelectorAll('#mapPins .map-pin').forEach(pin=>{
      const id=pin.dataset.id;
      if(!shortLabels[id]) return;
      if(!pin.querySelector('.pin-core')){
        const txt=pin.textContent;
        pin.textContent='';
        const core=document.createElement('span');
        core.className='pin-core'; core.textContent=txt;
        pin.appendChild(core);
      }
      if(!pin.querySelector('.pin-label')){
        const label=document.createElement('span');
        label.className='pin-label'; label.textContent=shortLabels[id];
        pin.appendChild(label);
      }
    });
  }
  function jump(id){
    const pin=document.querySelector('#mapPins .map-pin[data-id="'+id+'"]');
    if(pin){ pin.click(); return; }
    const all=document.querySelector('#mapFilters [data-filter="all"]');
    if(all){ all.click(); setTimeout(()=>{ const p=document.querySelector('#mapPins .map-pin[data-id="'+id+'"]'); if(p)p.click(); },30); }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const pins=document.getElementById('mapPins');
    if(pins){
      new MutationObserver(enhancePins).observe(pins,{childList:true,subtree:true});
      enhancePins();
    }
    document.querySelectorAll('.zone-jump').forEach(btn=>btn.addEventListener('click',()=>jump(btn.dataset.point)));
  });
})();
