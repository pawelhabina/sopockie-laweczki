import { faCouch, faRoute, faUsers } from '@fortawesome/free-solid-svg-icons';

export const moduleMenu = {
  routes: [
    {
      id: 'routes-official-list',
      moduleId: 'routes',
      label: 'Trasy oficjalne',
      shortDescription: 'Gotowe przebiegi tras na mapie',
      to: '/routes/official',
      chipLabel: 'Mapa',
    },
    {
      id: 'routes-community-list',
      moduleId: 'routes',
      label: 'Trasy społeczności',
      shortDescription: 'Pomysły i spacery od mieszkańców',
      to: '/routes/community',
      chipLabel: 'Aktywne',
    },
    {
      id: 'routes-add',
      moduleId: 'routes',
      label: 'Dodaj trasę',
      shortDescription: 'Własna trasa dla zalogowanych',
      to: '/routes/add',
      chipLabel: 'Login',
    },
  ],
  benches: [
    {
      id: 'benches-list',
      moduleId: 'benches',
      label: 'Lista ławek',
      shortDescription: 'Filtry i wyszukiwarka',
      to: '/benches/list',
      chipLabel: 'Lista',
    },
    {
      id: 'benches-map',
      moduleId: 'benches',
      label: 'Mapa ławek',
      shortDescription: 'Dokładne pinezki na mapie',
      to: '/benches',
      chipLabel: 'Mapa',
    },
    {
      id: 'benches-add',
      moduleId: 'benches',
      label: 'Dodaj ławkę biznesową',
      shortDescription: 'Zgłoszenie lokalizacji użytkownika',
      to: '/benches/add',
      chipLabel: 'Login',
    },
  ],
  meetings: [
    {
      id: 'meetings-list',
      moduleId: 'meetings',
      label: 'Lista spotkań',
      shortDescription: 'Nadchodzące i aktywne',
      to: '/meetings',
      chipLabel: 'Lista',
    },
    {
      id: 'meetings-create',
      moduleId: 'meetings',
      label: 'Utwórz spotkanie',
      shortDescription: 'Wybór ławki i czasu',
      to: '/meetings/create',
      chipLabel: 'Login',
    },
    {
      id: 'meetings-join',
      moduleId: 'meetings',
      label: 'Dołącz do spotkania',
      shortDescription: 'Szybkie dołączenie',
      to: '/meetings',
      chipLabel: 'Aktywne',
    },
  ],
};

export const moduleTheme = {
  benches: {
    icon: faCouch,
    bgClass: 'from-[#f6c453] to-[#f59f00]',
    textClass: 'text-[#1a2a33]',
    iconClass: 'text-black/20',
    subtitleClass: 'text-[#5f4300]',
    cardClass: 'border-[#d59b27]/35 bg-[#fff8ea]',
    cardTextClass: 'text-[#5f4300]',
    chipClass: 'border-[#ba8a2f]/35 bg-white/70 text-[#5f4300]',
  },
  meetings: {
    icon: faUsers,
    bgClass: 'from-[#1c5d73] to-[#2a7f87]',
    textClass: 'text-white',
    iconClass: 'text-black/25',
    subtitleClass: 'text-white/90',
    cardClass: 'border-[#2a7f87]/35 bg-[#eaf5f8]',
    cardTextClass: 'text-[#2d6072]',
    chipClass: 'border-[#3b7084]/35 bg-white/75 text-[#2d6072]',
  },
  routes: {
    icon: faRoute,
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
