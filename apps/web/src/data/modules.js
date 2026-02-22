export const moduleMenu = {
  routes: [
    {
      id: 'routes-official-list',
      moduleId: 'routes',
      label: 'Trasy oficjalne',
      shortDescription: 'Lista tras od miasta',
    },
    {
      id: 'routes-community-list',
      moduleId: 'routes',
      label: 'Trasy społeczności',
      shortDescription: 'Pomysły od mieszkańców',
    },
    {
      id: 'routes-add',
      moduleId: 'routes',
      label: 'Dodaj trasę',
      shortDescription: 'Nowa trasa użytkownika',
    },
  ],
  benches: [
    {
      id: 'benches-list',
      moduleId: 'benches',
      label: 'Lista ławek',
      shortDescription: 'Filtry i wyszukiwarka',
    },
    {
      id: 'benches-map',
      moduleId: 'benches',
      label: 'Mapa ławek',
      shortDescription: 'Dokładne pinezki na mapie',
    },
    {
      id: 'benches-add',
      moduleId: 'benches',
      label: 'Dodaj ławkę',
      shortDescription: 'Zgłoszenie nowej lokalizacji',
    },
  ],
  meetings: [
    {
      id: 'meetings-list',
      moduleId: 'meetings',
      label: 'Lista spotkań',
      shortDescription: 'Nadchodzące i aktywne',
    },
    {
      id: 'meetings-create',
      moduleId: 'meetings',
      label: 'Utwórz spotkanie',
      shortDescription: 'Wybór ławki i czasu',
    },
    {
      id: 'meetings-join',
      moduleId: 'meetings',
      label: 'Dołącz do spotkania',
      shortDescription: 'Szybkie dołączenie',
    },
  ],
};

export const featureLookup = Object.values(moduleMenu)
  .flat()
  .reduce((acc, feature) => {
    acc[feature.id] = feature;
    return acc;
  }, {});
