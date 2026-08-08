/* Personal route layer. Official schedule-data.js stays untouched. */
(function(){
  'use strict';

  const route = {
    schemaVersion: 1,
    dataVersion: '2026-08-08-agreed-route-2',
    primaryUser: 'vlad',
    labels: { vlad: 'Влад', yulia: 'Юля' },
    sharedEventIds: [
      'our-arrival',
      'prod-1300-tauto',
      'eng-1400-after-ai',
      'prod-1600-okko',
      'music-cream-soda',
      'music-iowa',
      'music-lab'
    ],
    vladEventIds: [
      'eng-1500-sdlc'
    ],
    yuliaEventIds: [
      'prod-1500-yandex-maps',
      'edu-1700-higher-ed'
    ],
    customEvents: [
      {
        id: 'route-vlad-networking-1700',
        start: '17:00', end: '18:00',
        title: 'Нетворкинг: Т-Банк / Авто.ру',
        type: 'networking', trackId: null, locationId: 'team',
        speaker: null, company: 'Т-Банк / Авто.ру',
        description: 'Не ещё одна лекция: найти backend lead / engineering manager / разработчиков. Начать с Т-Банк. Команды, затем Т-Банк. Технологии и Авто.ру.',
        score: { vlad: 3, yulia: 0 }, reasons: {}, plan: ['vlad'], official: false
      },
      {
        id: 'route-sync-1800',
        start: '18:00', end: '18:30',
        title: 'Встречаемся: еда + обмен результатами',
        type: 'break', trackId: null, locationId: null,
        speaker: null, company: null,
        description: 'Встречаетесь после раздельного часа: сохранить контакты, обменяться главными инсайтами и спокойно перейти к вечерней программе.',
        score: { vlad: 2, yulia: 2 }, reasons: {}, plan: ['both'], official: false
      }
    ]
  };

  function apply(){
    const s = window.ITP_SCHEDULE;
    if(!s || !Array.isArray(s.events)) return false;
    s.events.forEach(e => { e.plan = []; });
    s.events = s.events.filter(e => !String(e.id || '').startsWith('route-'));
    const byId = new Map(s.events.map(e => [e.id, e]));
    route.sharedEventIds.forEach(id => { if(byId.has(id)) byId.get(id).plan = ['both']; });
    route.vladEventIds.forEach(id => { if(byId.has(id)) byId.get(id).plan = ['vlad']; });
    route.yuliaEventIds.forEach(id => { if(byId.has(id)) byId.get(id).plan = ['yulia']; });
    route.customEvents.forEach(e => s.events.push(JSON.parse(JSON.stringify(e))));
    return true;
  }

  window.ITP_ROUTE = route;
  window.ITP_ROUTE_APPLY = apply;
  apply();
})();
