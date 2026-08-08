(function(){
  'use strict';

  const ROOT = 'ITP_SCHEDULE';
  const state = { filter: 'ours' };

  function cfg(){ return window[ROOT] || null; }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function toMin(hm){ const m=/^(\d{2}):(\d{2})$/.exec(hm||''); return m ? (+m[1]*60 + +m[2]) : null; }
  function timeLabel(e){ return e.end ? e.start+'–'+e.end : e.start; }
  function score(e, who){ return e.score && Number.isFinite(+e.score[who]) ? +e.score[who] : 0; }
  function planned(e, who){ const p=Array.isArray(e.plan)?e.plan:[]; return p.includes('both') || p.includes(who); }
  function recommended(e, who){ return planned(e,who) || score(e,who)>=2; }

  function validate(c){
    const errors=[];
    if(!c || c.schemaVersion!==1) errors.push('schemaVersion');
    if(!Array.isArray(c && c.events)) errors.push('events');
    (c && c.events || []).forEach((e,i)=>{
      if(!e.id || !e.start || !e.title) errors.push('event['+i+']');
      if(toMin(e.start)==null) errors.push('start:'+e.id);
      if(e.end && toMin(e.end)==null) errors.push('end:'+e.id);
      if(e.locationId && !(c.locations||{})[e.locationId]) errors.push('location:'+e.id);
    });
    return errors;
  }

  function overlaps(a,b){
    const as=toMin(a.start), ae=toMin(a.end||a.start)+1, bs=toMin(b.start), be=toMin(b.end||b.start)+1;
    return as<be && bs<ae;
  }

  function conflicts(events,who){
    const rec=events.filter(e=>recommended(e,who));
    const ids=new Set();
    for(let i=0;i<rec.length;i++) for(let j=i+1;j<rec.length;j++) if(overlaps(rec[i],rec[j])){ ids.add(rec[i].id); ids.add(rec[j].id); }
    return ids;
  }

  function goMap(locationId){
    const c=cfg(); const loc=c && c.locations && c.locations[locationId];
    if(!loc) return;
    const tab=document.getElementById('tab-map'); if(tab) tab.checked=true;
    setTimeout(()=>{
      const all=document.querySelector('#mapFilters [data-filter="all"]'); if(all) all.click();
      setTimeout(()=>{
        const pin=document.querySelector('#mapPins .map-pin[data-id="'+loc.mapId+'"]');
        const item=document.querySelector('.map-item[data-id="'+loc.mapId+'"]');
        (pin||item)?.click();
      },40);
    },20);
  }

  function injectStyles(){
    if(document.getElementById('scheduleEngineStyle')) return;
    const s=document.createElement('style'); s.id='scheduleEngineStyle';
    s.textContent=`
      .sched-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-end;margin:0 0 10px}
      .sched-status{font-size:11px;border:1px solid var(--border);border-radius:999px;padding:4px 7px;color:var(--muted)}
      .sched-status.full{border-color:var(--a);color:#ffc18a;background:var(--soft)}
      .sched-filters{display:flex;gap:6px;overflow:auto;margin:0 0 11px;scrollbar-width:none}.sched-filters::-webkit-scrollbar{display:none}
      .sched-filter{flex:none;border:1px solid var(--border);background:var(--card);color:var(--muted);border-radius:999px;padding:8px 10px;font-size:12px}
      .sched-filter.active{background:var(--a);border-color:var(--a);color:#111;font-weight:700}
      .sched-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}
      .sched-stat{background:var(--card);border:1px solid var(--border);border-radius:13px;padding:9px}.sched-stat b{display:block;font-size:18px}.sched-stat span{font-size:11px;color:var(--muted)}
      .sched-slot{margin:0 0 14px}.sched-slot-time{font-size:13px;font-weight:800;color:#ffbd84;margin:0 0 6px}
      .sched-card{background:var(--card);border:1px solid var(--border);border-radius:15px;padding:12px;margin-bottom:7px}.sched-card.plan{border-color:var(--a)}
      .sched-card-top{display:flex;justify-content:space-between;gap:8px}.sched-title{font-weight:700}.sched-meta{font-size:12px;color:var(--muted);margin-top:3px}.sched-desc{font-size:13px;color:#d3d3d7;margin-top:7px}
      .sched-badges{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.sched-badge{font-size:10px;border-radius:999px;padding:3px 6px;background:var(--card2);color:#ddd}.sched-badge.hot{background:var(--soft);color:#ffc18a}.sched-badge.conflict{background:#38200d;color:#ffd2a6}
      .sched-map{border:1px solid var(--border);background:var(--card2);color:var(--text);border-radius:10px;padding:7px 8px;font-size:12px;white-space:nowrap}
      .sched-source{font-size:11px;color:var(--muted);margin-top:12px}
      .official-route{margin:12px 0;padding:12px;border:1px solid var(--a);background:var(--soft);border-radius:15px}.official-route h3{margin:0 0 7px}.official-route-row{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:1px solid rgba(255,255,255,.08)}.official-route-row:first-of-type{border-top:0}.official-route-row b{min-width:44px;font-size:12px}.official-route-row span{font-size:13px}
      @media(max-width:380px){.sched-summary{grid-template-columns:1fr 1fr 1fr}.sched-card-top{align-items:flex-start}}
    `;
    document.head.appendChild(s);
  }

  function visibleEvents(c){
    const es=[...c.events].sort((a,b)=>toMin(a.start)-toMin(b.start));
    if(state.filter==='all') return es;
    if(state.filter==='music') return es.filter(e=>e.type==='music');
    if(state.filter==='vlad') return es.filter(e=>recommended(e,'vlad'));
    if(state.filter==='yulia') return es.filter(e=>recommended(e,'yulia'));
    return es.filter(e=>planned(e,'vlad') || planned(e,'yulia') || (score(e,'vlad')>=2 && score(e,'yulia')>=2));
  }

  function cardHtml(e,c,confV,confY){
    const tr=e.trackId && c.tracks[e.trackId]; const loc=e.locationId && c.locations[e.locationId];
    const planV=planned(e,'vlad'), planY=planned(e,'yulia'); const isPlan=planV||planY;
    let audience='';
    if(planV&&planY) audience='👫 Наш план'; else if(planV) audience='👨 Влад'; else if(planY) audience='👩 Юля';
    else if(score(e,'vlad')>=2&&score(e,'yulia')>=2) audience='👫 Рекомендуем'; else if(score(e,'vlad')>=2) audience='👨 Владу'; else if(score(e,'yulia')>=2) audience='👩 Юле';
    const conflict=(confV.has(e.id)&&recommended(e,'vlad')) || (confY.has(e.id)&&recommended(e,'yulia'));
    return `<article class="sched-card ${isPlan?'plan':''}">
      <div class="sched-card-top"><div><div class="sched-title">${esc(e.title)}</div>
      <div class="sched-meta">${esc(timeLabel(e))}${e.speaker?' · '+esc(e.speaker):''}${e.company?' · '+esc(e.company):''}</div></div>
      ${loc?`<button class="sched-map" type="button" data-map="${esc(e.locationId)}">🗺 Карта</button>`:''}</div>
      <div class="sched-badges">
        ${audience?`<span class="sched-badge hot">${audience}</span>`:''}
        ${tr?`<span class="sched-badge">${esc((tr.icon||'')+' '+tr.title)}</span>`:''}
        ${loc?`<span class="sched-badge">${esc(loc.title)}</span>`:''}
        ${conflict?'<span class="sched-badge conflict">⚡ конфликт выбора</span>':''}
      </div>
      ${e.description?`<div class="sched-desc">${esc(e.description)}</div>`:''}
    </article>`;
  }

  function renderProgram(){
    const c=cfg(); const root=document.getElementById('program'); if(!c||!root) return;
    const err=validate(c); if(err.length){ console.warn('ITP schedule validation:',err); return; }
    const ev=visibleEvents(c), all=c.events, confV=conflicts(all,'vlad'), confY=conflicts(all,'yulia');
    const slots=new Map(); ev.forEach(e=>{ const k=e.start; if(!slots.has(k)) slots.set(k,[]); slots.get(k).push(e); });
    root.innerHTML=`
      <div class="sched-head"><div><h2>Официальная программа</h2><div class="small muted">данные отделены от интерфейса</div></div><span class="sched-status ${c.status==='full'?'full':''}">${c.status==='full'?'✓ полная':'частичная'}</span></div>
      ${c.status!=='full'?`<div class="alert"><b>Архитектура готова.</b><br>${esc(c.source.note||'Полное расписание ещё не загружено.')}</div>`:''}
      <div class="sched-filters">
        <button class="sched-filter ${state.filter==='ours'?'active':''}" data-sf="ours">⭐ Для нас</button>
        <button class="sched-filter ${state.filter==='all'?'active':''}" data-sf="all">Все</button>
        <button class="sched-filter ${state.filter==='vlad'?'active':''}" data-sf="vlad">👨 Влад</button>
        <button class="sched-filter ${state.filter==='yulia'?'active':''}" data-sf="yulia">👩 Юля</button>
        <button class="sched-filter ${state.filter==='music'?'active':''}" data-sf="music">🎵 Музыка</button>
      </div>
      <div class="sched-summary"><div class="sched-stat"><b>${all.length}</b><span>событий</span></div><div class="sched-stat"><b>${new Set(all.map(e=>e.locationId).filter(Boolean)).size}</b><span>площадок</span></div><div class="sched-stat"><b>${confV.size+confY.size}</b><span>конфликтов*</span></div></div>
      <div id="scheduleSlots">${[...slots.entries()].map(([t,items])=>`<section class="sched-slot"><div class="sched-slot-time">${esc(t)}</div>${items.map(e=>cardHtml(e,c,confV,confY)).join('')}</section>`).join('') || '<div class="alert">Для выбранного фильтра событий нет.</div>'}</div>
      <div class="sched-source">Источник: ${esc(c.source.title||'официальная программа')}${c.source.publishedAt?' · '+esc(c.source.publishedAt):''}. *Конфликт означает пересечение двух рекомендованных событий по времени.</div>
    `;
    root.querySelectorAll('[data-sf]').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.sf;renderProgram();}));
    root.querySelectorAll('[data-map]').forEach(b=>b.addEventListener('click',()=>goMap(b.dataset.map)));
  }

  function plannedEvents(c,who){ return c.events.filter(e=>planned(e,who)).sort((a,b)=>toMin(a.start)-toMin(b.start)); }

  function renderHomeRoute(){
    const c=cfg(); if(!c || c.status!=='full') return;
    const home=document.getElementById('home'); if(!home) return;
    let box=document.getElementById('officialRoute');
    if(!box){ box=document.createElement('section'); box.id='officialRoute'; box.className='official-route'; const hero=home.querySelector('.hero'); hero?.insertAdjacentElement('afterend',box); }
    const both=c.events.filter(e=>planned(e,'vlad')&&planned(e,'yulia')).sort((a,b)=>toMin(a.start)-toMin(b.start));
    const separate=c.events.filter(e=>planned(e,'vlad')!==planned(e,'yulia')).sort((a,b)=>toMin(a.start)-toMin(b.start));
    box.innerHTML=`<h3>✓ Маршрут по официальному расписанию</h3>${both.slice(0,4).map(e=>`<div class="official-route-row"><b>${esc(e.start)}</b><span>${esc(e.title)}</span></div>`).join('')}${separate.length?`<div class="official-route-row"><b>↔</b><span>${separate.length} раздельных выбранных слотов — детали во вкладке «Программа»</span></div>`:''}`;
  }

  function updateOfficialNow(){
    const c=cfg(); if(!c || c.status!=='full') return;
    const now=new Date(); if(now.getFullYear()!==2026||now.getMonth()!==7||now.getDate()!==8) return;
    const m=now.getHours()*60+now.getMinutes();
    const route=c.events.filter(e=>Array.isArray(e.plan)&&e.plan.length).sort((a,b)=>toMin(a.start)-toMin(b.start));
    const current=route.find(e=>m>=toMin(e.start)&&m<(toMin(e.end||e.start)+1));
    const next=route.find(e=>toMin(e.start)>m);
    const ns=document.getElementById('nowState'), nt=document.getElementById('nowTitle'), nx=document.getElementById('nowText');
    if(current){ ns.textContent='Сейчас · официальный маршрут'; nt.textContent=current.title; nx.textContent=(current.locationId&&c.locations[current.locationId]?c.locations[current.locationId].title+' · ':'')+(next?'Дальше '+next.start+' — '+next.title:'Последний выбранный блок'); }
    else if(next){ ns.textContent='Следующее по плану'; nt.textContent=next.start+' · '+next.title; nx.textContent=next.locationId&&c.locations[next.locationId]?c.locations[next.locationId].title:'Смотрите вкладку «Программа»'; }
  }

  function init(){
    const c=cfg(); if(!c) return;
    injectStyles(); renderProgram(); renderHomeRoute(); updateOfficialNow(); setInterval(updateOfficialNow,60000);
    window.ITP_SCHEDULE_API={ validate:()=>validate(cfg()), render:renderProgram, goMap, data:()=>cfg(), planned:(who)=>plannedEvents(cfg(),who) };
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
