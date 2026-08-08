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

  const scheduleReady = loadScript('./schedule-data.js')
    .then(()=>loadScript('./route-data.js'))
    .then(()=>loadScript('./schedule-engine.js'))
    .catch(err=>{console.warn('Schedule subsystem failed to load',err);throw err;});

  const geoReady = loadScript('./geo-data.js')
    .then(()=>loadScript('./yandex-layer.js'))
    .then(()=>loadScript('./geo-nav.js'))
    .catch(err=>{console.warn('Geo subsystem failed to load',err);throw err;});

  Promise.allSettled([scheduleReady,geoReady]).then(()=>
    loadScript('./route-graph.js')
      .then(()=>loadScript('./map-ux.js'))
      .catch(err=>console.warn('Map UX subsystem failed to load',err))
  );

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