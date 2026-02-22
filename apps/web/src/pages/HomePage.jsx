import { Link } from 'react-router-dom';
import { useUiPrefs } from '@/context/UiPrefsContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCouch, faUsers, faRoute } from '@fortawesome/free-solid-svg-icons';

const mainTile = {
  title: 'Ławeczki',
  description: 'Mapa i lista ławek w Sopocie.',
  to: '/benches',
  icon: faCouch,
};

const secondaryTiles = [
  {
    title: 'Spotkania',
    description: 'Dołącz lub utwórz spotkanie na ławce.',
    to: '/meetings',
    bgClass: 'from-[#1c5d73] to-[#2a7f87]',
    icon: faUsers,
  },
  {
    title: 'Trasy',
    description: 'Zobacz trasy oficjalne i społeczności.',
    to: '/routes',
    bgClass: 'from-[#22577a] to-[#2c7da0]',
    icon: faRoute,
  },
];

export function HomePage() {
  const { fontScale, highContrast, setFontScale, toggleContrast } = useUiPrefs();

  return (
    <section className="flex flex-col gap-8">

      <div className="grid gap-3">
        <Link
          to={mainTile.to}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#f6c453] to-[#f59f00] p-6 pr-24 text-[#1a2a33] shadow-card transition hover:scale-[1.01] focus-visible:scale-[1.01]"
        >
          <FontAwesomeIcon
            icon={mainTile.icon}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-8xl text-black/20"
          />
          <p className="font-heading text-3xl">{mainTile.title}</p>
          <p className="mt-2 text-sm font-semibold opacity-95">{mainTile.description}</p>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          {secondaryTiles.map((tile) => (
            <Link
              key={tile.title}
              to={tile.to}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tile.bgClass} p-4 pr-14 text-white shadow-card transition hover:scale-[1.01] focus-visible:scale-[1.01]`}
            >
              <FontAwesomeIcon
                icon={tile.icon}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-6xl text-black/25"
              />
              <p className="font-heading text-xl">{tile.title}</p>
              <p className="mt-2 text-xs opacity-95">{tile.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="panel p-4">
        <p className="mb-2 text-sm font-bold">Ustawienia</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleContrast}
            className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-semibold"
          >
            Kontrast: {highContrast ? 'wysoki' : 'normalny'}
          </button>

          {[1, 1.15, 1.3].map((scale) => (
            <button
              key={scale}
              type="button"
              onClick={() => setFontScale(scale)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                fontScale === scale
                  ? 'cta-btn border-transparent'
                  : 'border-[var(--outline-soft)] bg-white text-[var(--text-muted)]'
              }`}
            >
              {Math.round(scale * 100)}%
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
