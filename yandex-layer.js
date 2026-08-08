(function(){
  'use strict';

  function css(){
    if(document.getElementById('itp-yandex-style'))return;
    const s=document.createElement('style');s.id='itp-yandex-style';
    s.textContent=`
      .geo-switch{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:4px;margin:0 0 10px;background:var(--card);border:1px solid var(--border);border-radius:14px}
      .geo-switch button{border:0;border-radius:10px;padding:10px 8px;background:transparent;color:var(--muted);font-weight:700;font-size:13px}
      .geo-switch button.active{background:var(--card2);color:var(--text)}
      .geo-pane[hidden]{display:none!important}
      .yandex-intro{padding:12px;margin-bottom:9px;border:1px solid var(--border);border-radius:15px;background:var(--card);font-size:13px;color:#d7d7db}.yandex-intro b{color:#fff}
      .yandex-map-wrap{position:relative;overflow:hidden;border:1px solid var(--border);border-radius:18px;background:#eef2f3;min-height:520px}
      #itpYandexConstructorMap{width:100%;height:520px;background:#eef2f3}
      #itpYandexConstructorMap>*{max-width:100%}
      .yandex-fallback{position:absolute;inset:0;display:grid;place-items:center;background:#eef2f3;color:#222;text-align:center;padding:22px;z-index:2}
      .yandex-fallback[hidden]{display:none}.yandex-fallback img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
      .yandex-fallback-card{position:relative;z-index:2;max-width:300px;background:rgba(255,255,255,.94);border-radius:15px;padding:13px;box-shadow:0 5px 24px rgba(0,0,0,.15)}
      .yandex-fallback-card b{display:block;margin-bottom:5px}
      .yandex-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}
      .yandex-actions a{display:block;text-align:center;text-decoration:none;border-radius:13px;padding:11px 8px;font-size:13px;font-weight:700;background:var(--card);border:1px solid var(--border);color:var(--text)}
      .yandex-actions a.primary-y{background:#ffd633;color:#111;border-color:#ffd633}
      .entrance-title{margin:15px 2px 8px;font-size:15px;font-weight:800}.entrance-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
      .entrance-grid a{text-decoration:none;text-align:center;background:var(--card);border:1px solid var(--border);border-radius:13px;padding:10px 6px;font-size:12px;color:var(--text)}
      .ops-note{margin-top:9px;padding:10px 11px;border-radius:13px;background:#25180d;border:1px solid #66441f;color:#ffd2a6;font-size:12px}
      .yandex-help{margin-top:9px;color:var(--muted);font-size:12px;line-height:1.45}
      @media(max-width:380px){.yandex-actions{grid-template-columns:1fr}.entrance-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function constructorScriptUrl(cfg){
    const id=encodeURIComponent('constructor:'+cfg.yandex.constructorId);
    return 'https://api-maps.yandex.ru/services/constructor/1.0/js/?um='+id+'&width=100%25&height=520&id=itpYandexConstructorMap&lang=ru_RU&scroll=true';
  }
  function staticUrl(cfg){
    const id=encodeURIComponent('constructor:'+cfg.yandex.constructorId);
    return 'https://api-maps.yandex.ru/services/constructor/1.0/static/?um='+id+'&width=600&height=520&lang=ru_RU';
  }

  function build(){
    const cfg=window.ITP_GEO,section=document.getElementById('map');
    if(!cfg||!section||document.getElementById('geoSwitch'))return;
    css();

    const children=[...section.children],head=children[0],rest=children.slice(1);
    const switcher=document.createElement('div');switcher.id='geoSwitch';switcher.className='geo-switch';
    switcher.innerHTML='<button type="button" data-geo-mode="festival" class="active">🎪 Схема фестиваля</button><button type="button" data-geo-mode="yandex">🗺 Яндекс Карты</button>';

    const festival=document.createElement('div');festival.id='festivalGeoPane';festival.className='geo-pane';rest.forEach(n=>festival.appendChild(n));
    const y=document.createElement('div');y.id='yandexGeoPane';y.className='geo-pane';y.hidden=true;
    const entrances=cfg.entrances.map(e=>'<a href="'+e.url+'" target="_blank" rel="noopener">'+e.title+'</a>').join('');

    y.innerHTML=`
      <div class="yandex-intro"><b>Реальная география Коломенского.</b><br>Это официальный Constructor организаторов. Наша фестивальная схема лучше отвечает на вопрос «что здесь происходит», а Яндекс — «где это физически».</div>
      <div class="yandex-map-wrap">
        <div id="itpYandexConstructorMap" aria-label="Официальная карта локаций в Яндекс Картах"></div>
        <div id="yandexFallback" class="yandex-fallback" hidden>
          <img id="yandexStatic" alt="Статическая карта Яндекс">
          <div class="yandex-fallback-card"><b>Интерактивный слой не загрузился</b><span>Показываю статическую карту. Полную версию можно открыть кнопкой ниже.</span></div>
        </div>
      </div>
      <div class="yandex-actions"><a class="primary-y" href="${cfg.yandex.mapUrl}" target="_blank" rel="noopener">📍 Открыть в Яндекс Картах</a><a href="#" id="backFestivalMap">🎪 Наша схема</a></div>
      <div class="entrance-title">Оперативные входы</div><div class="entrance-grid">${entrances}</div>
      <div class="ops-note">${cfg.operational.note}</div>
      <div class="yandex-help">Интерактивный Constructor грузится только после открытия этой вкладки — так он получает реальный размер контейнера и не рисует пустую/чёрную область.</div>`;

    section.appendChild(switcher);section.appendChild(festival);section.appendChild(y);head.after(switcher);

    let constructorState='idle';
    function loadConstructor(){
      if(constructorState!=='idle')return;
      constructorState='loading';
      const script=document.createElement('script');script.type='text/javascript';script.charset='utf-8';script.async=true;script.src=constructorScriptUrl(cfg);
      script.onload=()=>{constructorState='loaded';setTimeout(checkConstructor,1200)};
      script.onerror=()=>{constructorState='error';fallback()};
      document.head.appendChild(script);
      setTimeout(()=>{if(constructorState==='loading')checkConstructor()},6500);
    }
    function checkConstructor(){
      const box=document.getElementById('itpYandexConstructorMap');
      if(box&&box.children.length>0){constructorState='loaded';return}
      fallback();
    }
    function fallback(){
      const f=document.getElementById('yandexFallback'),img=document.getElementById('yandexStatic');if(!f||!img)return;
      img.src=staticUrl(cfg);f.hidden=false;constructorState='fallback';
    }

    function show(mode){
      const isY=mode==='yandex';festival.hidden=isY;y.hidden=!isY;
      switcher.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.geoMode===mode));
      if(isY)setTimeout(loadConstructor,50);
      try{localStorage.setItem('itp26-geo-mode',mode)}catch(e){}
    }

    switcher.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.geoMode)));
    y.querySelector('#backFestivalMap').addEventListener('click',e=>{e.preventDefault();show('festival')});
    let saved='festival';try{saved=localStorage.getItem('itp26-geo-mode')||'festival'}catch(e){}
    show(saved==='yandex'?'yandex':'festival');

    window.ITP_GEO_UI={show,openYandex:()=>show('yandex'),openFestival:()=>show('festival'),externalUrl:cfg.yandex.mapUrl};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();