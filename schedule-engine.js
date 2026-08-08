(function(){
  'use strict';

  const state = {
    mode: localStorageSafeGet('itp26-program-mode') || 'vlad',
    generalFilter: 'all',
    query: ''
  };

  function c(){ return window.ITP_SCHEDULE || null; }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function toMin(hm){ const m=/^(\d{2}):(\d{2})$/.exec(hm||''); return m ? (+m[1]*60 + +m[2]) : 0; }
  function localStorageSafeGet(k){ try{return localStorage.getItem(k);}catch(e){return null;} }
  function localStorageSafeSet(k,v){ try{localStorage.setItem(k,v);}catch(e){} }
  function planHas(e,who){ const p=Array.isArray(e.plan)?e.plan:[]; return p.includes('both') || p.includes(who); }
  function routeEvents(who){ return (c()?.events||[]).filter(e=>planHas(e,who)).sort((a,b)=>toMin(a.start)-toMin(b.start)); }
  function isShared(e){ return planHas(e,'vlad') && planHas(e,'yulia'); }
  function loc(e){ return e.locationId && c()?.locations?.[e.locationId] || null; }
  function track(e){ return e.trackId && c()?.tracks?.[e.trackId] || null; }

  function goMap(locationId){
    const cfg=c(), l=cfg?.locations?.[locationId]; if(!l)return;
    const tab=document.getElementById('tab-map'); if(tab)tab.checked=true;
    setTimeout(()=>{
      window.ITP_GEO_UI?.openFestival?.();
      const all=document.querySelector('#mapFilters [data-filter="all"]'); if(all)all.click();
      setTimeout(()=>{
        const pin=document.querySelector('#mapPins .map-pin[data-id="'+l.mapId+'"]');
        const item=document.querySelector('.map-item[data-id="'+l.mapId+'"]');
        (pin||item)?.click();
      },50);
    },30);
  }

  function injectStyles(){
    if(document.getElementById('programV2Style'))return;
    const s=document.createElement('style');s.id='programV2Style';s.textContent=`
      .pv2-tabs{display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:5px;padding:4px;background:var(--card);border:1px solid var(--border);border-radius:15px;margin-bottom:12px}
      .pv2-tab{border:0;border-radius:11px;padding:10px 6px;background:transparent;color:var(--muted);font-weight:800;font-size:12px}.pv2-tab.active{background:var(--a);color:#111}
      .pv2-hero{padding:13px;border:1px solid var(--border);border-radius:16px;background:linear-gradient(145deg,var(--soft),var(--card));margin-bottom:11px}.pv2-hero b{display:block;font-size:18px}.pv2-hero span{font-size:12px;color:var(--muted)}
      .pv2-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}.pv2-stat{padding:9px;background:var(--card);border:1px solid var(--border);border-radius:13px}.pv2-stat b{display:block;font-size:18px}.pv2-stat span{font-size:10px;color:var(--muted)}
      .pv2-route{position:relative}.pv2-route:before{content:'';position:absolute;left:17px;top:19px;bottom:19px;border-left:2px solid var(--border)}
      .pv2-card{position:relative;margin:0 0 9px 34px;padding:12px;background:var(--card);border:1px solid var(--border);border-radius:15px}.pv2-card:before{content:'';position:absolute;left:-23px;top:18px;width:10px;height:10px;border-radius:50%;background:var(--a);box-shadow:0 0 0 4px var(--bg)}.pv2-card.current{border-color:var(--a);box-shadow:0 0 0 1px var(--a) inset}.pv2-card.next{border-color:#3f6f9a}
      .pv2-top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.pv2-time{font-size:12px;font-weight:900;color:#ffbd84}.pv2-title{font-size:16px;font-weight:800;margin-top:2px}.pv2-meta{font-size:12px;color:var(--muted);margin-top:4px}.pv2-desc{font-size:13px;color:#d5d5d8;margin-top:7px}.pv2-badges{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}.pv2-badge{font-size:10px;border-radius:999px;padding:3px 6px;background:var(--card2);color:#ddd}.pv2-badge.shared{background:var(--soft);color:#ffc18a}.pv2-badge.personal{background:#10243a;color:#9dd1ff}.pv2-map{border:1px solid var(--border);background:var(--card2);color:var(--text);border-radius:10px;padding:7px 8px;font-size:11px;white-space:nowrap}
      .pv2-tools{display:grid;gap:8px;margin-bottom:10px}.pv2-search{display:flex;gap:7px}.pv2-search input{min-width:0;flex:1;background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:12px;padding:10px 11px;outline:none}.pv2-search input:focus{border-color:var(--a)}.pv2-filterrow{display:flex;gap:6px;overflow:auto;scrollbar-width:none}.pv2-filterrow::-webkit-scrollbar{display:none}.pv2-chip{flex:none;border:1px solid var(--border);background:var(--card);color:var(--muted);border-radius:999px;padding:7px 9px;font-size:11px}.pv2-chip.active{background:var(--a);color:#111;border-color:var(--a);font-weight:800}
      .pv2-slot{margin-bottom:15px}.pv2-slot-time{font-size:14px;font-weight:900;color:#ffbd84;margin:0 0 6px}.pv2-general-card{padding:11px;background:var(--card);border:1px solid var(--border);border-radius:14px;margin-bottom:7px}.pv2-general-card .pv2-title{font-size:14px}.pv2-general-card .pv2-top{align-items:flex-start}
      .pv2-empty{padding:18px;text-align:center;color:var(--muted);border:1px dashed var(--border);border-radius:14px}
      .home-profile{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:4px;background:var(--card);border:1px solid var(--border);border-radius:14px;margin:10px 0}.home-profile button{border:0;border-radius:10px;padding:9px;background:transparent;color:var(--muted);font-weight:800}.home-profile button.active{background:var(--card2);color:var(--text)}
      .home-route-v2{margin:10px 0}.home-route-v2 h2{margin-bottom:8px}.home-mini{display:grid;grid-template-columns:52px 1fr auto;gap:8px;align-items:start;padding:9px 0;border-top:1px solid var(--border)}.home-mini:first-of-type{border-top:0}.home-mini b{font-size:12px;color:#ffbd84}.home-mini span{font-size:13px}.home-mini em{font-style:normal;font-size:10px;color:var(--muted)}
      @media(max-width:380px){.pv2-tabs{grid-template-columns:1fr 1fr 1.15fr}.pv2-summary{grid-template-columns:1fr 1fr 1fr}.pv2-tab{font-size:11px;padding:9px 4px}}
    `;document.head.appendChild(s);
  }

  function currentInfo(events){
    const n=new Date(); if(n.getFullYear()!==2026||n.getMonth()!==7||n.getDate()!==8)return {current:null,next:events[0]||null};
    const m=n.getHours()*60+n.getMinutes();
    return {current:events.find(e=>m>=toMin(e.start)&&m<toMin(e.end||e.start)), next:events.find(e=>toMin(e.start)>m)};
  }

  function routeCard(e,who,ci){
    const l=loc(e),tr=track(e),shared=isShared(e),cls=ci.current?.id===e.id?' current':ci.next?.id===e.id?' next':'';
    return `<article class="pv2-card${cls}"><div class="pv2-top"><div><div class="pv2-time">${esc(e.start)}${e.end?'–'+esc(e.end):''}</div><div class="pv2-title">${esc(e.title)}</div></div>${l?`<button class="pv2-map" type="button" data-map="${esc(e.locationId)}">🗺 Карта</button>`:''}</div>
      ${e.speaker||e.company?`<div class="pv2-meta">${esc(e.speaker||'')}${e.speaker&&e.company?' · ':''}${esc(e.company||'')}</div>`:''}
      ${e.description?`<div class="pv2-desc">${esc(e.description)}</div>`:''}
      <div class="pv2-badges">${shared?'<span class="pv2-badge shared">👫 вместе</span>':`<span class="pv2-badge personal">${who==='vlad'?'👨 только Влад':'👩 только Юля'}</span>`}${tr?`<span class="pv2-badge">${esc((tr.icon||'')+' '+tr.title)}</span>`:''}${l?`<span class="pv2-badge">${esc(l.title)}</span>`:''}${e.official===false?'<span class="pv2-badge">наш блок</span>':''}</div></article>`;
  }

  function tabsHtml(active){return `<button class="pv2-tab ${active==='vlad'?'active':''}" data-pmode="vlad" type="button">👨 Влад</button><button class="pv2-tab ${active==='yulia'?'active':''}" data-pmode="yulia" type="button">👩 Юля</button><button class="pv2-tab ${active==='general'?'active':''}" data-pmode="general" type="button">🌐 Весь пикник</button>`;}

  function renderPersonal(root,who){
    const events=routeEvents(who),ci=currentInfo(events),sharedCount=events.filter(isShared).length,soloCount=events.length-sharedCount;
    const hero=ci.current?`Сейчас: ${ci.current.title}`:ci.next?`Дальше: ${ci.next.start} · ${ci.next.title}`:'Маршрут завершён';
    root.innerHTML=`<div class="pv2-tabs">${tabsHtml(who)}</div><div class="pv2-hero"><b>${esc(hero)}</b><span>${who==='vlad'?'Твой персональный маршрут':'Юлин персональный маршрут'} · выбран после повторного анализа официальной сетки</span></div>
      <div class="pv2-summary"><div class="pv2-stat"><b>${events.length}</b><span>блоков</span></div><div class="pv2-stat"><b>${sharedCount}</b><span>вместе</span></div><div class="pv2-stat"><b>${soloCount}</b><span>отдельно</span></div></div><div class="pv2-route">${events.map(e=>routeCard(e,who,ci)).join('')}</div>`;
  }

  function generalEvents(){
    const q=state.query.trim().toLowerCase();
    return (c()?.events||[]).filter(e=>e.official!==false).filter(e=>{
      if(state.generalFilter==='talks' && e.type!=='talk')return false;
      if(state.generalFilter==='activities' && e.type!=='activity')return false;
      if(state.generalFilter==='music' && e.type!=='music')return false;
      if(!q)return true;
      const l=loc(e),tr=track(e);return [e.title,e.speaker,e.company,e.description,l?.title,tr?.title].filter(Boolean).join(' ').toLowerCase().includes(q);
    }).sort((a,b)=>toMin(a.start)-toMin(b.start)||String(a.title).localeCompare(String(b.title),'ru'));
  }

  function generalCard(e){
    const l=loc(e),tr=track(e);
    return `<article class="pv2-general-card"><div class="pv2-top"><div><div class="pv2-title">${esc(e.title)}</div><div class="pv2-meta">${esc(e.start)}${e.end?'–'+esc(e.end):''}${e.speaker?' · '+esc(e.speaker):''}${e.company?' · '+esc(e.company):''}</div></div>${l?`<button class="pv2-map" type="button" data-map="${esc(e.locationId)}">🗺</button>`:''}</div><div class="pv2-badges">${tr?`<span class="pv2-badge">${esc((tr.icon||'')+' '+tr.title)}</span>`:''}${l?`<span class="pv2-badge">${esc(l.title)}</span>`:''}${planHas(e,'vlad')||planHas(e,'yulia')?'<span class="pv2-badge shared">⭐ в нашем маршруте</span>':''}</div></article>`;
  }

  function chip(id,label){return `<button class="pv2-chip ${state.generalFilter===id?'active':''}" type="button" data-gf="${id}">${label}</button>`;}

  function renderGeneral(root){
    const events=generalEvents(),slots=new Map();events.forEach(e=>{if(!slots.has(e.start))slots.set(e.start,[]);slots.get(e.start).push(e);});
    root.innerHTML=`<div class="pv2-tabs">${tabsHtml('general')}</div><div class="pv2-hero"><b>Общее расписание ИТ-Пикника</b><span>Официальные лектории, интерактивы и музыка из присланных PDF. Наши личные остановки сюда не подмешиваются.</span></div>
      <div class="pv2-tools"><div class="pv2-search"><input id="pv2Search" type="search" placeholder="Найти доклад, спикера, компанию…" value="${esc(state.query)}"></div><div class="pv2-filterrow">${chip('all','Все')} ${chip('talks','Лектории')} ${chip('activities','Интерактивы')} ${chip('music','Музыка')}</div></div>
      <div>${events.length?[...slots.entries()].map(([time,items])=>`<section class="pv2-slot"><div class="pv2-slot-time">${esc(time)}</div>${items.map(generalCard).join('')}</section>`).join(''):'<div class="pv2-empty">Ничего не найдено</div>'}</div>`;
    root.querySelector('#pv2Search')?.addEventListener('input',e=>{state.query=e.target.value;renderProgram();});
    root.querySelectorAll('[data-gf]').forEach(b=>b.addEventListener('click',()=>{state.generalFilter=b.dataset.gf;renderProgram();}));
  }

  function bindProgram(root){
    root.querySelectorAll('[data-pmode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.pmode;localStorageSafeSet('itp26-program-mode',state.mode);renderProgram();renderHome();document.dispatchEvent(new CustomEvent('itp:profile-change',{detail:{profile:state.mode}}));}));
    root.querySelectorAll('[data-map]').forEach(b=>b.addEventListener('click',()=>goMap(b.dataset.map)));
  }

  function renderProgram(){
    const root=document.getElementById('program');if(!root||!c())return;
    injectStyles();
    if(state.mode==='general')renderGeneral(root);else renderPersonal(root,state.mode);
    bindProgram(root);
  }

  function selectedProfile(){return state.mode==='yulia'?'yulia':'vlad';}

  function hideLegacyHome(){
    const home=document.getElementById('home');if(!home)return;
    const heads=[...home.querySelectorAll('.head')];
    const h=heads.find(x=>x.textContent.includes('Наш план'));
    if(h)h.style.display='none';
    const seg=home.querySelector('.seg');if(seg)seg.style.display='none';
    ['both','vlad','yulia'].forEach(id=>{const x=document.getElementById(id);if(x)x.style.display='none';});
  }

  function renderHome(){
    const home=document.getElementById('home');if(!home||!c())return;
    hideLegacyHome();
    let box=document.getElementById('homeRouteV2');if(!box){box=document.createElement('section');box.id='homeRouteV2';box.className='home-route-v2';const alert=home.querySelector('.alert');(alert||home.querySelector('.grid')||home.querySelector('.hero')).insertAdjacentElement('afterend',box);}
    const who=selectedProfile(),ev=routeEvents(who),ci=currentInfo(ev),start=ci.current?ev.indexOf(ci.current):ci.next?ev.indexOf(ci.next):Math.max(0,ev.length-1),slice=ev.slice(Math.max(0,start),Math.max(0,start)+4);
    box.innerHTML=`<div class="home-profile"><button type="button" data-hp="vlad" class="${who==='vlad'?'active':''}">👨 Влад</button><button type="button" data-hp="yulia" class="${who==='yulia'?'active':''}">👩 Юля</button></div><h2>${who==='vlad'?'Твой маршрут':'Маршрут Юли'}</h2>${slice.map(e=>`<div class="home-mini"><b>${esc(e.start)}</b><span>${esc(e.title)}${isShared(e)?' <em>· вместе</em>':''}</span>${loc(e)?`<button class="pv2-map" data-map="${esc(e.locationId)}" type="button">🗺</button>`:''}</div>`).join('')}`;
    box.querySelectorAll('[data-hp]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.hp;localStorageSafeSet('itp26-program-mode',state.mode);renderHome();renderProgram();document.dispatchEvent(new CustomEvent('itp:profile-change',{detail:{profile:state.mode}}));}));
    box.querySelectorAll('[data-map]').forEach(b=>b.addEventListener('click',()=>goMap(b.dataset.map)));
    updateHero(who);
  }

  function updateHero(who){
    const ev=routeEvents(who),ci=currentInfo(ev),ns=document.getElementById('nowState'),nt=document.getElementById('nowTitle'),nx=document.getElementById('nowText');if(!ns||!nt||!nx)return;
    const label=who==='vlad'?'Влад':'Юля';
    if(ci.current){ns.textContent='Сейчас · '+label;nt.textContent=ci.current.title;nx.textContent=(loc(ci.current)?.title?loc(ci.current).title+' · ':'')+(ci.next?'Дальше '+ci.next.start+' — '+ci.next.title:'Последний блок маршрута');}
    else if(ci.next){ns.textContent='Дальше · '+label;nt.textContent=ci.next.start+' · '+ci.next.title;nx.textContent=loc(ci.next)?.title||'Смотрите подробности в «Программе»';}
  }

  function init(){
    if(!c())return;
    window.ITP_ROUTE_APPLY?.();
    if(!['vlad','yulia','general'].includes(state.mode))state.mode='vlad';
    injectStyles();renderProgram();renderHome();setInterval(()=>{renderHome();if(state.mode!=='general')renderProgram();},60000);
    window.ITP_SCHEDULE_API={
      data:()=>c(), routeEvents, activeProfile:()=>selectedProfile(), setActiveProfile:(p)=>{if(p==='vlad'||p==='yulia'){state.mode=p;localStorageSafeSet('itp26-program-mode',p);renderProgram();renderHome();}}, goMap
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
