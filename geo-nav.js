(function(){
  'use strict';

  const STORE='itp26-geo-cal-v1';
  const VB_W=1200, VB_H=1136;
  const state={watchId:null,pos:null,cal:[],transform:null,target:null};

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
  function load(){
    try{const x=JSON.parse(localStorage.getItem(STORE)||'null');if(x&&Array.isArray(x.cal))state.cal=x.cal.slice(0,2);}catch(e){}
    computeTransform();
  }
  function save(){try{localStorage.setItem(STORE,JSON.stringify({cal:state.cal}))}catch(e){}}
  function pinInfo(id){
    const el=document.querySelector('#mapPins .map-pin[data-id="'+id+'"]');
    if(!el)return null;
    const x=parseFloat(el.style.left),y=parseFloat(el.style.top);
    if(!Number.isFinite(x)||!Number.isFinite(y))return null;
    return {id,x,y,el};
  }
  function mapToVB(x,y){return {x:x/100*VB_W,y:y/100*VB_H};}
  function vbToMap(p){return {x:p.x/VB_W*100,y:p.y/VB_H*100};}
  function geoVec(pos,origin){
    const lat0=(origin.lat+pos.lat)/2*Math.PI/180;
    return {x:(pos.lon-origin.lon)*111320*Math.cos(lat0),y:(pos.lat-origin.lat)*110540};
  }
  function computeTransform(){
    state.transform=null;
    if(state.cal.length<2)return;
    const a=state.cal[0],b=state.cal[1];
    const p=geoVec({lat:b.lat,lon:b.lon},{lat:a.lat,lon:a.lon});
    const qa=mapToVB(a.mapX,a.mapY),qb=mapToVB(b.mapX,b.mapY);
    const q={x:qb.x-qa.x,y:qb.y-qa.y};
    const lp=Math.hypot(p.x,p.y),lq=Math.hypot(q.x,q.y);
    if(lp<8||lq<8)return;
    const rot=Math.atan2(q.y,q.x)-Math.atan2(p.y,p.x);
    state.transform={origin:a,qa,scale:lq/lp,rot};
  }
  function geoToMap(pos){
    const t=state.transform;if(!t)return null;
    const p=geoVec(pos,{lat:t.origin.lat,lon:t.origin.lon});
    const c=Math.cos(t.rot),s=Math.sin(t.rot);
    const r={x:(p.x*c-p.y*s)*t.scale,y:(p.x*s+p.y*c)*t.scale};
    return vbToMap({x:t.qa.x+r.x,y:t.qa.y+r.y});
  }
  function metersPerVB(){return state.transform?1/state.transform.scale:null;}
  function distanceMeters(a,b){
    if(!state.transform||!a||!b)return null;
    const av=mapToVB(a.x,a.y),bv=mapToVB(b.x,b.y);
    return Math.hypot(bv.x-av.x,bv.y-av.y)*metersPerVB();
  }
  function formatDistance(m){if(m==null)return '';return m<1000?Math.round(m/5)*5+' м':(m/1000).toFixed(1)+' км';}
  function walkMinutes(m){return Math.max(1,Math.round(m/75));}

  function injectStyles(){
    if(document.getElementById('geoNavStyle'))return;
    const s=document.createElement('style');s.id='geoNavStyle';
    s.textContent=`
      .gps-box{margin:0 0 10px;padding:12px;background:var(--card);border:1px solid var(--border);border-radius:16px}
      .gps-top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.gps-title{font-weight:800}.gps-status{font-size:11px;color:var(--muted);margin-top:2px}
      .gps-btn{border:1px solid var(--border);background:var(--card2);color:var(--text);border-radius:11px;padding:8px 10px;font-size:12px;font-weight:700}.gps-btn.primary{background:#1688ff;border-color:#1688ff;color:#fff}.gps-btn.danger{color:#ffb1a7}
      .gps-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.gps-entry{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}.gps-entry button{padding:9px 5px}
      .gps-cal{margin-top:9px;padding:9px 10px;border:1px dashed var(--border);border-radius:12px;color:var(--muted);font-size:12px}.gps-cal b{color:#ddd}
      .gps-next{margin-top:9px;padding:10px;border-radius:13px;background:#10243a;border:1px solid #1e5b91;font-size:12px}.gps-next b{display:block;color:#9dd1ff;font-size:13px;margin-bottom:2px}
      .gps-dot{position:absolute;z-index:20;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:#1688ff;border:3px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,.45),0 0 0 7px rgba(22,136,255,.22);pointer-events:none}
      .gps-dot:after{content:'';position:absolute;inset:-10px;border:1px solid rgba(22,136,255,.45);border-radius:50%;animation:gpsPulse 1.8s ease-out infinite}@keyframes gpsPulse{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.8);opacity:0}}
      .gps-accuracy{position:absolute;z-index:18;transform:translate(-50%,-50%);border-radius:50%;background:rgba(22,136,255,.10);border:1px solid rgba(22,136,255,.25);pointer-events:none}
      .gps-target-line{position:absolute;z-index:17;height:3px;background:repeating-linear-gradient(90deg,#1688ff 0 8px,transparent 8px 14px);transform-origin:0 50%;pointer-events:none;opacity:.85}
      .gps-target-badge{position:absolute;z-index:21;transform:translate(-50%,-100%);background:#1688ff;color:#fff;border-radius:8px;padding:3px 6px;font-size:9px;font-weight:800;pointer-events:none;white-space:nowrap}
      @media(max-width:380px){.gps-entry{grid-template-columns:1fr 1fr 1fr}.gps-actions .gps-btn{flex:1}}
    `;document.head.appendChild(s);
  }

  function getRouteTarget(){
    const c=window.ITP_SCHEDULE;if(!c||c.status!=='full')return null;
    const now=new Date(),m=now.getHours()*60+now.getMinutes();
    const toMin=s=>{const [h,mm]=(s||'').split(':').map(Number);return h*60+mm};
    const route=c.events.filter(e=>Array.isArray(e.plan)&&e.plan.length&&e.locationId&&c.locations[e.locationId]).sort((a,b)=>toMin(a.start)-toMin(b.start));
    let e=route.find(x=>m>=toMin(x.start)&&m<toMin(x.end||x.start));
    if(!e)e=route.find(x=>toMin(x.start)>m);
    if(!e)return null;
    const loc=c.locations[e.locationId],p=pinInfo(loc.mapId);
    return p?{event:e,loc,p}:null;
  }

  function ensureOverlays(){
    const pins=document.getElementById('mapPins');if(!pins)return null;
    let dot=document.getElementById('gpsDot');if(!dot){dot=document.createElement('div');dot.id='gpsDot';dot.className='gps-dot';dot.hidden=true;pins.appendChild(dot);}
    let acc=document.getElementById('gpsAccuracy');if(!acc){acc=document.createElement('div');acc.id='gpsAccuracy';acc.className='gps-accuracy';acc.hidden=true;pins.appendChild(acc);}
    let line=document.getElementById('gpsTargetLine');if(!line){line=document.createElement('div');line.id='gpsTargetLine';line.className='gps-target-line';line.hidden=true;pins.appendChild(line);}
    let badge=document.getElementById('gpsTargetBadge');if(!badge){badge=document.createElement('div');badge.id='gpsTargetBadge';badge.className='gps-target-badge';badge.hidden=true;pins.appendChild(badge);}
    return {dot,acc,line,badge};
  }

  function renderPosition(){
    const ov=ensureOverlays();if(!ov)return;
    if(!state.pos||!state.transform){ov.dot.hidden=ov.acc.hidden=ov.line.hidden=ov.badge.hidden=true;renderPanel();return;}
    const mp=geoToMap(state.pos);
    if(!mp||mp.x<-15||mp.x>115||mp.y<-15||mp.y>115){ov.dot.hidden=ov.acc.hidden=ov.line.hidden=ov.badge.hidden=true;renderPanel('GPS вне границ схемы — возможно, калибровка неточна.');return;}
    ov.dot.hidden=false;ov.dot.style.left=mp.x+'%';ov.dot.style.top=mp.y+'%';
    const mPer=metersPerVB(),accVB=state.pos.accuracy/mPer;
    const w=accVB/VB_W*100*2,h=accVB/VB_H*100*2;
    ov.acc.hidden=false;ov.acc.style.left=mp.x+'%';ov.acc.style.top=mp.y+'%';ov.acc.style.width=w+'%';ov.acc.style.height=h+'%';

    const target=getRouteTarget();state.target=target;
    if(target){
      const dx=(target.p.x-mp.x)/100*VB_W,dy=(target.p.y-mp.y)/100*VB_H;
      const distVB=Math.hypot(dx,dy),distPxPct=distVB/VB_W*100;
      const angle=Math.atan2(dy/VB_H*100,dx/VB_W*100)*180/Math.PI;
      ov.line.hidden=false;ov.line.style.left=mp.x+'%';ov.line.style.top=mp.y+'%';ov.line.style.width=distPxPct+'%';ov.line.style.transform='rotate('+angle+'deg)';
      ov.badge.hidden=false;ov.badge.style.left=target.p.x+'%';ov.badge.style.top=target.p.y+'%';ov.badge.textContent='Следующее';
    }else{ov.line.hidden=ov.badge.hidden=true;}
    renderPanel();
  }

  function gpsStatus(){
    if(!('geolocation'in navigator))return 'Геолокация не поддерживается этим браузером';
    if(!state.pos)return state.watchId==null?'GPS выключен':'Ищу позицию…';
    return 'GPS ±'+Math.round(state.pos.accuracy)+' м';
  }
  function renderPanel(extra){
    const box=document.getElementById('gpsBox');if(!box)return;
    const selected=document.querySelector('#mapPins .map-pin.selected');
    const selectedName=selected?(selected.querySelector('.pin-label')?.textContent||selected.getAttribute('aria-label')||selected.dataset.id):null;
    const target=state.target||getRouteTarget();
    let next='';
    if(state.pos&&state.transform&&target){const mp=geoToMap(state.pos),d=distanceMeters(mp,target.p);next=`<div class="gps-next"><b>Следующее: ${esc(target.event.start)} · ${esc(target.event.title)}</b>${esc(target.loc.title)} · по прямой ≈ ${formatDistance(d)} · ориентир ${walkMinutes(d)} мин пешком<div class="gps-actions"><button class="gps-btn" id="gpsFocusNext" type="button">🧭 Показать точку</button></div></div>`;}
    box.innerHTML=`<div class="gps-top"><div><div class="gps-title">📍 Позиция на фестивале</div><div class="gps-status">${esc(extra||gpsStatus())}</div></div><button id="gpsToggle" class="gps-btn primary" type="button">${state.watchId==null?'Где я?':'GPS вкл.'}</button></div>
      ${state.cal.length<2?`<div class="gps-cal"><b>Калибровка ${state.cal.length}/2.</b> ${state.cal.length===0?'На входе запишите первую точку.':'Теперь выберите на карте место, у которого вы физически стоите, и запишите вторую.'}</div>`:''}
      ${state.cal.length===0?`<div class="gps-entry"><button class="gps-btn" data-entry="entr1" type="button">Я у входа 1</button><button class="gps-btn" data-entry="entr2" type="button">Я у входа 2</button><button class="gps-btn" data-entry="entr3" type="button">Я у входа 3</button></div>`:''}
      <div class="gps-actions">${state.cal.length===1&&selected?`<button id="gpsCalSelected" class="gps-btn primary" type="button">Калибровать: ${esc(selectedName)}</button>`:''}${state.cal.length?'<button id="gpsReset" class="gps-btn danger" type="button">Сбросить калибровку</button>':''}<button id="gpsYandex" class="gps-btn" type="button">Открыть GPS в Яндексе</button></div>${next}`;
    bindPanel();
  }
  function bindPanel(){
    document.getElementById('gpsToggle')?.addEventListener('click',startGPS);
    document.querySelectorAll('[data-entry]').forEach(b=>b.addEventListener('click',()=>calibrate(b.dataset.entry)));
    document.getElementById('gpsCalSelected')?.addEventListener('click',()=>{const s=document.querySelector('#mapPins .map-pin.selected');if(s)calibrate(s.dataset.id)});
    document.getElementById('gpsReset')?.addEventListener('click',()=>{state.cal=[];state.transform=null;save();renderPosition();});
    document.getElementById('gpsYandex')?.addEventListener('click',()=>{if(state.pos)window.open('https://yandex.ru/maps/?ll='+encodeURIComponent(state.pos.lon+','+state.pos.lat)+'&z=17','_blank');else if(window.ITP_GEO_UI)window.open(window.ITP_GEO_UI.externalUrl,'_blank');});
    document.getElementById('gpsFocusNext')?.addEventListener('click',()=>{if(state.target?.p?.el)state.target.p.el.click();});
  }
  function startGPS(){
    if(!navigator.geolocation){renderPanel('Геолокация недоступна');return;}
    if(state.watchId!=null)return;
    renderPanel('Запрашиваю доступ к геопозиции…');
    state.watchId=navigator.geolocation.watchPosition(p=>{
      state.pos={lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy,ts:p.timestamp};renderPosition();
    },e=>{state.watchId=null;renderPanel(e.code===1?'Доступ к геопозиции запрещён':'Не удалось получить GPS: '+e.message);},{enableHighAccuracy:true,maximumAge:3000,timeout:15000});
  }
  function calibrate(id){
    if(!state.pos){startGPS();renderPanel('Сначала дождитесь координат GPS, затем нажмите калибровку ещё раз.');return;}
    if(state.pos.accuracy>45){renderPanel('Точность сейчас ±'+Math.round(state.pos.accuracy)+' м. Подождите немного на открытом месте и повторите.');return;}
    const p=pinInfo(id);if(!p){renderPanel('Не нашёл выбранную точку на схеме.');return;}
    const cal={id,lat:state.pos.lat,lon:state.pos.lon,mapX:p.x,mapY:p.y,accuracy:state.pos.accuracy,at:Date.now()};
    if(state.cal.length===0)state.cal=[cal];else state.cal=[state.cal[0],cal];
    computeTransform();save();renderPosition();
  }

  function build(){
    const pane=document.getElementById('festivalGeoPane')||document.getElementById('map');if(!pane||document.getElementById('gpsBox'))return;
    injectStyles();load();
    const box=document.createElement('div');box.id='gpsBox';box.className='gps-box';
    const tools=pane.querySelector('.map-tools');if(tools)tools.before(box);else pane.prepend(box);
    renderPanel();ensureOverlays();
    const pins=document.getElementById('mapPins');if(pins)new MutationObserver(()=>{ensureOverlays();renderPanel();if(state.pos&&state.transform)renderPosition();}).observe(pins,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    document.querySelector('label[for="tab-map"]')?.addEventListener('click',()=>setTimeout(()=>{renderPanel();renderPosition();},80));
    window.ITP_GPS={start:startGPS,reset:()=>{state.cal=[];state.transform=null;save();renderPosition();},state:()=>state};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(build,120));else setTimeout(build,120);
})();
