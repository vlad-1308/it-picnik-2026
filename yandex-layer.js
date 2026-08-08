(function(){
  'use strict';

  function css(){
    if(document.getElementById('itp-yandex-style')) return;
    const s=document.createElement('style');
    s.id='itp-yandex-style';
    s.textContent=`
      .geo-switch{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:4px;margin:0 0 10px;background:var(--card);border:1px solid var(--border);border-radius:14px}
      .geo-switch button{border:0;border-radius:10px;padding:10px 8px;background:transparent;color:var(--muted);font-weight:700;font-size:13px}
      .geo-switch button.active{background:var(--card2);color:var(--text)}
      .geo-pane[hidden]{display:none!important}
      .yandex-intro{padding:12px;margin-bottom:9px;border:1px solid var(--border);border-radius:15px;background:var(--card);font-size:13px;color:#d7d7db}
      .yandex-intro b{color:#fff}
      .yandex-map-wrap{position:relative;overflow:hidden;border:1px solid var(--border);border-radius:18px;background:#121214;min-height:480px}
      .yandex-map-wrap iframe{display:block;width:100%;height:520px;border:0;background:#121214}
      .yandex-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}
      .yandex-actions a{display:block;text-align:center;text-decoration:none;border-radius:13px;padding:11px 8px;font-size:13px;font-weight:700;background:var(--card);border:1px solid var(--border);color:var(--text)}
      .yandex-actions a.primary-y{background:#ffd633;color:#111;border-color:#ffd633}
      .entrance-title{margin:15px 2px 8px;font-size:15px;font-weight:800}
      .entrance-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
      .entrance-grid a{text-decoration:none;text-align:center;background:var(--card);border:1px solid var(--border);border-radius:13px;padding:10px 6px;font-size:12px;color:var(--text)}
      .ops-note{margin-top:9px;padding:10px 11px;border-radius:13px;background:#25180d;border:1px solid #66441f;color:#ffd2a6;font-size:12px}
      .yandex-help{margin-top:9px;color:var(--muted);font-size:12px;line-height:1.45}
      @media(max-width:380px){.yandex-actions{grid-template-columns:1fr}.entrance-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function build(){
    const cfg=window.ITP_GEO;
    const section=document.getElementById('map');
    if(!cfg||!section||document.getElementById('geoSwitch')) return;
    css();

    const children=[...section.children];
    const head=children[0];
    const rest=children.slice(1);

    const switcher=document.createElement('div');
    switcher.id='geoSwitch';
    switcher.className='geo-switch';
    switcher.innerHTML='<button type="button" data-geo-mode="festival" class="active">🎪 Схема фестиваля</button><button type="button" data-geo-mode="yandex">🗺 Яндекс Карты</button>';

    const festival=document.createElement('div');
    festival.id='festivalGeoPane';
    festival.className='geo-pane';
    rest.forEach(n=>festival.appendChild(n));

    const yandex=document.createElement('div');
    yandex.id='yandexGeoPane';
    yandex.className='geo-pane';
    yandex.hidden=true;

    const entrances=cfg.entrances.map(e=>'<a href="'+e.url+'" target="_blank" rel="noopener">'+e.title+'</a>').join('');
    yandex.innerHTML=`
      <div class="yandex-intro"><b>Официальный географический слой организаторов.</b><br>Здесь полезнее смотреть реальное расположение объектов относительно дорожек Коломенского. Для выбора докладов и персонального маршрута удобнее наша схема.</div>
      <div class="yandex-map-wrap"><iframe title="Официальная карта локаций ИТ-Пикника в Яндекс Картах" loading="lazy" allow="geolocation" referrerpolicy="strict-origin-when-cross-origin" src="${cfg.yandex.widgetUrl}"></iframe></div>
      <div class="yandex-actions"><a class="primary-y" href="${cfg.yandex.mapUrl}" target="_blank" rel="noopener">📍 Открыть в Яндекс Картах</a><a href="#" id="backFestivalMap">🎪 Вернуться к нашей схеме</a></div>
      <div class="entrance-title">Оперативные входы</div>
      <div class="entrance-grid">${entrances}</div>
      <div class="ops-note">${cfg.operational.note}</div>
      <div class="yandex-help">Совет на площадке: если непонятно, в какую сторону идти физически — сверяйтесь с Яндекс-слоем. Если нужно понять, зачем идти в точку и какой там следующий доклад — возвращайтесь в «Схему фестиваля».</div>
    `;

    section.appendChild(switcher);
    section.appendChild(festival);
    section.appendChild(yandex);
    head.after(switcher);

    function show(mode){
      const isY=mode==='yandex';
      festival.hidden=isY;
      yandex.hidden=!isY;
      switcher.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.geoMode===mode));
      try{localStorage.setItem('itp26-geo-mode',mode);}catch(e){}
    }

    switcher.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.geoMode)));
    yandex.querySelector('#backFestivalMap').addEventListener('click',e=>{e.preventDefault();show('festival');});

    let saved='festival';
    try{saved=localStorage.getItem('itp26-geo-mode')||'festival';}catch(e){}
    show(saved==='yandex'?'yandex':'festival');

    window.ITP_GEO_UI={
      show,
      openYandex:function(){show('yandex');},
      openFestival:function(){show('festival');},
      externalUrl:cfg.yandex.mapUrl
    };
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build);
  else build();
})();
