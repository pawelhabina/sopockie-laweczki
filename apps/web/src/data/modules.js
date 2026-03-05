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

export const moduleTheme = {
  benches: {
    bgClass: 'from-[#f6c453] to-[#f59f00]',
    textClass: 'text-[#1a2a33]',
    iconClass: 'text-black/20',
    subtitleClass: 'text-[#5f4300]',
    cardClass: 'border-[#d59b27]/35 bg-[#fff8ea]',
    cardTextClass: 'text-[#5f4300]',
    chipClass: 'border-[#ba8a2f]/35 bg-white/70 text-[#5f4300]',
  },
  meetings: {
    bgClass: 'from-[#1c5d73] to-[#2a7f87]',
    textClass: 'text-white',
    iconClass: 'text-black/25',
    subtitleClass: 'text-white/90',
    cardClass: 'border-[#2a7f87]/35 bg-[#eaf5f8]',
    cardTextClass: 'text-[#2d6072]',
    chipClass: 'border-[#3b7084]/35 bg-white/75 text-[#2d6072]',
  },
  routes: {
    bgClass: 'from-[#22577a] to-[#2c7da0]',
    textClass: 'text-white',
    iconClass: 'text-black/25',
    subtitleClass: 'text-white/90',
    cardClass: 'border-[#2f6d97]/35 bg-[#e8f2f8]',
    cardTextClass: 'text-[#2d6072]',
    chipClass: 'border-[#3b7084]/35 bg-white/75 text-[#2d6072]',
  },
};

export const featureLookup = Object.values(moduleMenu)
  .flat()
  .reduce((acc, feature) => {
    acc[feature.id] = feature;
    return acc;
  }, {});
