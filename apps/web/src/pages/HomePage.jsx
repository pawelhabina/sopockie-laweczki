import { Link } from 'react-router-dom';
import { useUiPrefs } from '@/context/UiPrefsContext';

const homeTiles = [
  {
    title: 'Spotkania',
    description: 'Dołącz lub utwórz spotkanie na ławce.',
    to: '/meetings',
    bgClass: 'from-[#1c5d73] to-[#2a7f87]',
  },
  {
    title: 'Trasy',
    description: 'Zobacz trasy oficjalne i społeczności.',
    to: '/routes',
    bgClass: 'from-[#f59f00] to-[#ff7d00]',
  },
  {
    title: 'Ławeczki',
    description: 'Mapa i lista ławek w Sopocie.',
    to: '/benches',
    bgClass: 'from-[#4d908e] to-[#577590]',
  },
];

export function HomePage() {
  const { fontScale, highContrast, setFontScale, toggleContrast } = useUiPrefs();

  return (
    <section className="flex flex-col gap-4">
      <div className="panel p-4">
        <h1 className="font-heading text-2xl leading-tight">Menu główne</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Każdy kafelek jest klikalny. Funkcje wewnątrz modułów są już podpięte i oznaczone jako W budowie.
        </p>
      </div>

      <div className="grid gap-3">
        {homeTiles.map((tile) => (
          <Link
            key={tile.title}
            to={tile.to}
            className={`rounded-2xl bg-gradient-to-br ${tile.bgClass} p-5 text-white shadow-card transition hover:scale-[1.01] focus-visible:scale-[1.01]`}
          >
            <p className="font-heading text-2xl">{tile.title}</p>
            <p className="mt-2 max-w-[26ch] text-sm opacity-95">{tile.description}</p>
          </Link>
        ))}
      </div>

      <div className="panel p-4">
        <p className="mb-2 text-sm font-bold">Dostępność (MVP)</p>
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
