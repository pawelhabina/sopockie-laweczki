import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCouch, faUsers, faRoute } from '@fortawesome/free-solid-svg-icons';

const homeTiles = [
  {
    title: 'Ławeczki',
    description: 'Mapa i lista ławek w Sopocie.',
    to: '/benches',
    bgClass: 'from-[#f6c453] to-[#f59f00]',
    textClass: 'text-[#1a2a33]',
    iconClass: 'text-black/20',
    icon: faCouch,
  },
  {
    title: 'Spotkania',
    description: 'Dołącz lub utwórz spotkanie na ławce.',
    to: '/meetings',
    bgClass: 'from-[#1c5d73] to-[#2a7f87]',
    textClass: 'text-white',
    iconClass: 'text-black/25',
    icon: faUsers,
  },
  {
    title: 'Trasy',
    description: 'Zobacz trasy oficjalne i społeczności.',
    to: '/routes',
    bgClass: 'from-[#22577a] to-[#2c7da0]',
    textClass: 'text-white',
    iconClass: 'text-black/25',
    icon: faRoute,
  },
];

export function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-[560px] flex-col justify-center gap-3 py-1">
      {homeTiles.map((tile) => (
        <Link
          key={tile.title}
          to={tile.to}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tile.bgClass} ${tile.textClass} p-4 pr-20 shadow-card transition hover:scale-[1.01] focus-visible:scale-[1.01]`}
        >
          <FontAwesomeIcon
            icon={tile.icon}
            className={`pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-7xl ${tile.iconClass}`}
          />
          <p className="font-heading text-3xl">{tile.title}</p>
          <p className="mt-1 text-sm font-semibold opacity-95">{tile.description}</p>
        </Link>
      ))}
    </section>
  );
}
