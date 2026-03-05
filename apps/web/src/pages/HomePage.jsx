import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCouch, faUsers, faRoute } from '@fortawesome/free-solid-svg-icons';
import { moduleTheme } from '@/data/modules';

const homeTiles = [
  {
    moduleId: 'benches',
    title: 'Ławeczki',
    description: 'Mapa i lista ławek w Sopocie.',
    to: '/benches',
    icon: faCouch,
  },
  {
    moduleId: 'meetings',
    title: 'Spotkania',
    description: 'Dołącz lub utwórz spotkanie na ławce.',
    to: '/meetings',
    icon: faUsers,
  },
  {
    moduleId: 'routes',
    title: 'Trasy',
    description: 'Zobacz trasy oficjalne i społeczności.',
    to: '/routes',
    icon: faRoute,
  },
];

export function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-[560px] flex-col justify-center gap-3 py-1">
      {homeTiles.map((tile) => {
        const theme = moduleTheme[tile.moduleId];

        return (
          <Link
            key={tile.title}
            to={tile.to}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bgClass} ${theme.textClass} p-4 pr-20 shadow-card transition hover:scale-[1.01] focus-visible:scale-[1.01]`}
          >
            <FontAwesomeIcon
              icon={tile.icon}
              className={`pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-7xl ${theme.iconClass}`}
            />
            <p className="font-heading text-3xl">{tile.title}</p>
            <p className="mt-1 text-sm font-semibold opacity-95">{tile.description}</p>
          </Link>
        );
      })}
    </section>
  );
}
