export const benchList = [
  {
    id: 'bench-1',
    name: 'Ławka przy molo',
    address: 'Skwer Kuracyjny 1, Sopot',
    lat: 54.44531,
    lng: 18.5704,
    capacity: 4,
    description: 'Widok na molo i plażę, dużo spacerowiczów.',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1280&q=80',
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1280&q=80',
    ],
  },
  {
    id: 'bench-2',
    name: 'Ławka przy Monciaku',
    address: 'Bohaterów Monte Cassino 22, Sopot',
    lat: 54.44288,
    lng: 18.56625,
    capacity: 3,
    description: 'Środek miasta, blisko kawiarni i restauracji.',
    photos: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1280&q=80',
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1280&q=80',
    ],
  },
  {
    id: 'bench-3',
    name: 'Ławka przy parku północnym',
    address: 'Aleja Franciszka Mamuszki 14, Sopot',
    lat: 54.45174,
    lng: 18.56364,
    capacity: 5,
    description: 'Spokojna strefa zieleni, dobre miejsce na dłuższe spotkania.',
    photos: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1280&q=80',
      'https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=1280&q=80',
    ],
  },
  {
    id: 'bench-4',
    name: 'Ławka przy Ergo Arenie',
    address: 'Plac Dwóch Miast 1, Sopot',
    lat: 54.42658,
    lng: 18.57514,
    capacity: 4,
    description: 'Dobre dojście z SKM, miejsce często odwiedzane po wydarzeniach.',
    photos: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1280&q=80',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1280&q=80',
    ],
  },
  {
    id: 'bench-5',
    name: 'Ławka przy Operze Leśnej',
    address: 'Stanisława Moniuszki 12, Sopot',
    lat: 54.43538,
    lng: 18.55077,
    capacity: 4,
    description: 'Leśny klimat i cisza poza godzinami koncertów.',
    photos: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1280&q=80',
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1280&q=80',
    ],
  },
];

export const statusMeta = {
  free: {
    label: 'Wolna',
    markerFill: '#1f9d55',
    markerStroke: '#0b5d33',
    badgeClass: 'border-[#1f9d55]/35 bg-[#e8f8ef] text-[#0b5d33]',
  },
  joinable: {
    label: 'Możliwość dołączenia',
    markerFill: '#f59f00',
    markerStroke: '#9a6400',
    badgeClass: 'border-[#f59f00]/35 bg-[#fff4dd] text-[#9a6400]',
  },
  occupied: {
    label: 'Zajęta',
    markerFill: '#d94841',
    markerStroke: '#8f231f',
    badgeClass: 'border-[#d94841]/35 bg-[#fdeceb] text-[#8f231f]',
  },
};
