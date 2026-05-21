export const SOPOT_CENTER = [54.4418, 18.5603];

export const routeCategoryMeta = {
  piesza: {
    label: 'Piesza',
    lineColor: '#1c7c54',
    averageSpeedKmH: 4.6,
  },
  rowerowa: {
    label: 'Rowerowa',
    lineColor: '#1d5f91',
    averageSpeedKmH: 14,
  },
  biegowa: {
    label: 'Biegowa',
    lineColor: '#b34700',
    averageSpeedKmH: 8.5,
  },
  rodzinna: {
    label: 'Rodzinna',
    lineColor: '#8a5a00',
    averageSpeedKmH: 3.6,
  },
};

export const routeSourceMeta = {
  official: {
    label: 'Oficjalna',
    badgeClass: 'border-[#3b7084]/35 bg-[#e8f2f8] text-[#2d6072]',
  },
  community: {
    label: 'Społeczność',
    badgeClass: 'border-[#1f9d55]/35 bg-[#e8f8ef] text-[#0b5d33]',
  },
};

function roundCoordinate(value) {
  return Math.round(value * 100000) / 100000;
}

function createPath(points) {
  return points.map(([lat, lng]) => [roundCoordinate(lat), roundCoordinate(lng)]);
}

export const officialRoutes = [
  {
    id: 'official-spacer-po-sopocie',
    source: 'official',
    title: 'Spacer po Sopocie',
    category: 'piesza',
    distanceKm: 1.9,
    duration: 'ok. 45 min',
    difficulty: 'lekka',
    startPlace: 'Centrum Sopotu',
    summary: 'Krótka trasa po centrum, molo i reprezentacyjnych punktach miasta.',
    highlights: ['Monciak', 'molo', 'nadmorski spacer'],
    path: createPath([
      [54.44446, 18.56893],
      [54.4441, 18.56664],
      [54.44347, 18.56493],
      [54.44267, 18.56638],
      [54.44362, 18.57067],
      [54.44501, 18.57103],
    ]),
  },
  {
    id: 'official-luzny-spacer',
    source: 'official',
    title: 'Luźny spacer',
    category: 'piesza',
    distanceKm: 3.7,
    duration: 'ok. 1 h',
    difficulty: 'lekka',
    startPlace: 'Lasy Oliwskie / Sopot',
    summary: 'Spokojna trasa dla osób, które chcą wejść w bardziej zieloną część Sopotu.',
    highlights: ['leśne odcinki', 'cisza', 'widoki'],
    path: createPath([
      [54.43718, 18.5553],
      [54.43861, 18.55358],
      [54.44034, 18.55265],
      [54.44257, 18.55341],
      [54.44454, 18.55544],
      [54.44618, 18.55892],
      [54.44477, 18.56168],
    ]),
  },
  {
    id: 'official-trasa-sopot',
    source: 'official',
    title: 'Trasa Sopot',
    category: 'rowerowa',
    distanceKm: 26,
    duration: 'ok. 1 h 47 min',
    difficulty: 'średnia',
    startPlace: 'Gdynia / Sopot',
    summary: 'Dłuższa trasa rowerowa przez Trójmiejski Park Krajobrazowy i okolice Sopotu.',
    highlights: ['podjazdy', 'park krajobrazowy', 'widokowe odcinki'],
    path: createPath([
      [54.45472, 18.53657],
      [54.44848, 18.54466],
      [54.44078, 18.55132],
      [54.43295, 18.55847],
      [54.42541, 18.56777],
      [54.43008, 18.57724],
      [54.44031, 18.57554],
      [54.44729, 18.56948],
      [54.45216, 18.55963],
    ]),
  },
];

export const initialCommunityRoutes = [
  {
    id: 'community-seed-1',
    source: 'community',
    title: 'Sopot na spokojnie',
    category: 'piesza',
    distanceKm: 4.2,
    duration: 'ok. 70 min',
    difficulty: 'lekka',
    startPlace: 'Dworzec PKP Sopot',
    summary: 'Trasa od dworca przez Monciak do plaży z przystankami przy ławkach i punktach widokowych.',
    highlights: ['ławki przy Monciaku', 'plaża', 'kawa po drodze'],
    authorId: 'anna',
    authorName: 'Anna',
    createdAt: '2026-04-05T09:30:00.000Z',
    path: createPath([
      [54.44344, 18.56144],
      [54.44294, 18.56472],
      [54.44268, 18.56627],
      [54.44316, 18.56872],
      [54.44443, 18.57128],
      [54.44627, 18.56953],
    ]),
  },
  {
    id: 'community-seed-2',
    source: 'community',
    title: 'Leśny reset po pracy',
    category: 'piesza',
    distanceKm: 6.8,
    duration: 'ok. 1 h 35 min',
    difficulty: 'średnia',
    startPlace: 'Opera Leśna',
    summary: 'Pętla przez spokojniejsze partie Sopotu, dobra na wieczorny reset i mniej zatłoczone alejki.',
    highlights: ['Opera Leśna', 'zielone odcinki', 'mniej ludzi'],
    authorId: 'marek',
    authorName: 'Marek',
    createdAt: '2026-04-12T17:10:00.000Z',
    path: createPath([
      [54.4355, 18.55092],
      [54.43705, 18.54837],
      [54.44023, 18.54754],
      [54.44296, 18.54943],
      [54.44423, 18.55361],
      [54.44267, 18.55741],
      [54.43921, 18.55796],
      [54.43669, 18.55539],
    ]),
  },
];

export const routeCategories = [
  { value: 'all', label: 'Wszystkie typy' },
  { value: 'piesza', label: 'Piesza' },
  { value: 'rowerowa', label: 'Rowerowa' },
  { value: 'biegowa', label: 'Biegowa' },
  { value: 'rodzinna', label: 'Rodzinna' },
];

function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function calculateRouteDistanceKm(path) {
  if (!Array.isArray(path) || path.length < 2) {
    return 0;
  }

  let total = 0;

  for (let index = 1; index < path.length; index += 1) {
    const [prevLat, prevLng] = path[index - 1];
    const [nextLat, nextLng] = path[index];

    const earthRadiusKm = 6371;
    const deltaLat = toRadians(nextLat - prevLat);
    const deltaLng = toRadians(nextLng - prevLng);
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(toRadians(prevLat)) * Math.cos(toRadians(nextLat)) * Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    total += earthRadiusKm * c;
  }

  return Math.round(total * 10) / 10;
}

export function estimateDurationLabel(distanceKm, category) {
  const meta = routeCategoryMeta[category] ?? routeCategoryMeta.piesza;
  const totalMinutes = Math.max(10, Math.round(((distanceKm / meta.averageSpeedKmH) * 60) / 5) * 5);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `ok. ${minutes} min`;
  }

  if (minutes === 0) {
    return `ok. ${hours} h`;
  }

  return `ok. ${hours} h ${minutes} min`;
}
