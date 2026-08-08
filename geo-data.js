/* Географический слой приложения. UI не должен хранить Yandex-ссылки и идентификаторы напрямую. */
window.ITP_GEO = {
  schemaVersion: 1,
  dataVersion: "2026-08-08-official-yandex-1",
  source: {
    title: "Официальная карта локаций ИТ-Пикника в Яндекс Картах",
    kind: "organizer-yandex-constructor",
    note: "Ссылка опубликована организаторами в оперативном посте по площадке 8 августа."
  },
  yandex: {
    constructorId: "5b5f37d98152c3d007c4f6b77b9d2eeedbe6417be37a51e6dc2792b6a9bfaa39",
    mapUrl: "https://yandex.ru/maps/?um=constructor%3A5b5f37d98152c3d007c4f6b77b9d2eeedbe6417be37a51e6dc2792b6a9bfaa39&source=constructorLink",
    widgetUrl: "https://yandex.ru/map-widget/v1/?um=constructor%3A5b5f37d98152c3d007c4f6b77b9d2eeedbe6417be37a51e6dc2792b6a9bfaa39&source=constructor",
    apiKey: null
  },
  entrances: [
    { id: "entr1", title: "Главный вход 1", url: "https://yandex.ru/maps/-/CHt6jWyC", active: true },
    { id: "entr2", title: "Вход 2", url: "https://yandex.ru/maps/-/CHt6Z0j8", active: true },
    { id: "entr3", title: "Вход 3", url: "https://yandex.ru/maps/-/CHt6nR2Y", active: true }
  ],
  operational: {
    activeEntranceIds: ["entr1", "entr2", "entr3"],
    note: "В сегодняшнем оперативном посте организаторы указывают три входа. Если старая схема расходится с Яндекс-слоем, используем оперативные ссылки организаторов."
  }
};
