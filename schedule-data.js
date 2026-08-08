/*
 * Единственная точка обновления официального расписания.
 * Когда выйдет полная программа, меняем только этот файл.
 * UI, карта, фильтры, конфликты и блок «Сейчас» строятся автоматически.
 */
window.ITP_SCHEDULE = {
  schemaVersion: 1,
  dataVersion: "2026-08-08-partial-1",
  status: "partial", // partial | full
  date: "2026-08-08",
  timezone: "Europe/Moscow",
  source: {
    title: "ИТ-Пикник 2026",
    url: "https://it-picnic.ru/",
    publishedAt: null,
    note: "Пока внесены только подтвержденные общие события. Полные доклады добавятся после официальной публикации."
  },

  /* locationId обязан совпадать с id точки интерактивной карты. */
  locations: {
    prod1:     { title: "Лекторий 1 · Продукты от и до", mapId: "prod1", zone: "east" },
    data2:     { title: "Лекторий 2 · От данных к решениям", mapId: "data2", zone: "east" },
    eng3:      { title: "Лекторий 3 · Инженерная продуктивность", mapId: "eng3", zone: "west" },
    cyber4:    { title: "Лекторий 4 · Кибербезопасность", mapId: "cyber4", zone: "west" },
    big5:      { title: "Лекторий 5 · Бигтех в каске", mapId: "big5", zone: "north" },
    gen6:      { title: "Лекторий 6 · Генеративный ИИ", mapId: "gen6", zone: "north" },
    education: { title: "Образование", mapId: "education", zone: "north" },
    science:   { title: "Научная сцена", mapId: "science", zone: "east" },
    mainstage: { title: "Музыкальная сцена", mapId: "mainstage", zone: "south" },
    flat:      { title: "ИТ-квартирник", mapId: "flat", zone: "south" },
    team:      { title: "Т-Банк. Команда", mapId: "team", zone: "center" },
    tech:      { title: "Т-Банк. Технологии", mapId: "tech", zone: "center" },
    auto:      { title: "Авто.ру", mapId: "auto", zone: "center" },
    tproducts: { title: "Т-Банк. Продукты", mapId: "tproducts", zone: "west" }
  },

  tracks: {
    products:    { title: "Продукты от и до", icon: "📦", locationId: "prod1" },
    data:        { title: "От данных к решениям", icon: "📊", locationId: "data2" },
    engineering: { title: "Инженерная продуктивность", icon: "🛠", locationId: "eng3" },
    cyber:       { title: "Кибербезопасность", icon: "🔐", locationId: "cyber4" },
    bigtech:     { title: "Бигтех в каске", icon: "🏗", locationId: "big5" },
    genai:       { title: "Генеративный ИИ", icon: "🤖", locationId: "gen6" },
    education:   { title: "Образование", icon: "🎓", locationId: "education" },
    science:     { title: "Научпоп", icon: "🔬", locationId: "science" },
    music:       { title: "Музыка", icon: "🎵", locationId: "mainstage" }
  },

  /*
   * Формат события:
   * id              уникальный id
   * start/end       HH:MM по Москве
   * title           название доклада/события
   * type            talk | music | activity | service
   * trackId         ключ из tracks (может быть null)
   * locationId      ключ из locations; именно он связывает событие с картой
   * speaker/company необязательные строки
   * description     необязательное описание
   * score           { vlad:0..3, yulia:0..3 } — наша оценка полезности
   * reasons         { vlad:"...", yulia:"..." }
   * plan            [] | ["both"] | ["vlad"] | ["yulia"] | комбинация — финальный персональный маршрут
   * official        true для официальных слотов
   */
  events: [
    {
      id: "festival-open",
      start: "12:00", end: "12:05",
      title: "Открытие площадки",
      type: "service", trackId: null, locationId: null,
      speaker: null, company: null, description: null,
      score: { vlad: 0, yulia: 0 }, reasons: {}, plan: [], official: true
    },
    {
      id: "music-sova",
      start: "15:30", end: "16:10",
      title: "СОВА",
      type: "music", trackId: "music", locationId: "mainstage",
      speaker: null, company: null, description: "Главная музыкальная сцена",
      score: { vlad: 1, yulia: 1 }, reasons: {}, plan: [], official: true
    },
    {
      id: "music-pompeya",
      start: "16:20", end: "17:05",
      title: "Pompeya",
      type: "music", trackId: "music", locationId: "mainstage",
      speaker: null, company: null, description: "Точка встречи после раздельных треков",
      score: { vlad: 2, yulia: 2 }, reasons: {}, plan: ["both"], official: true
    },
    {
      id: "music-martin",
      start: "17:20", end: "18:10",
      title: "мартин",
      type: "music", trackId: "music", locationId: "mainstage",
      speaker: null, company: null, description: null,
      score: { vlad: 1, yulia: 1 }, reasons: {}, plan: [], official: true
    },
    {
      id: "music-cream-soda",
      start: "18:30", end: "19:25",
      title: "CREAM SODA",
      type: "music", trackId: "music", locationId: "mainstage",
      speaker: null, company: null, description: null,
      score: { vlad: 2, yulia: 2 }, reasons: {}, plan: ["both"], official: true
    },
    {
      id: "music-iowa",
      start: "19:40", end: "20:45",
      title: "IOWA",
      type: "music", trackId: "music", locationId: "mainstage",
      speaker: null, company: null, description: null,
      score: { vlad: 2, yulia: 2 }, reasons: {}, plan: ["both"], official: true
    },
    {
      id: "music-lab",
      start: "21:10", end: "22:25",
      title: "Антон Беляев / LAB",
      type: "music", trackId: "music", locationId: "mainstage",
      speaker: null, company: null, description: "Финальная большая точка дня",
      score: { vlad: 2, yulia: 2 }, reasons: {}, plan: ["both"], official: true
    }
  ]
};
