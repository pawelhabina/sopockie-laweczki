import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFilter, faPlus, faStar } from '@fortawesome/free-solid-svg-icons';
import { routeCategories, routeSourceMeta } from '@/data/routes';
import { useAuth } from '@/context/AuthContext';
import { useRoutes } from '@/context/RoutesContext';

export function RoutesListPage() {
  const { isLoggedIn, currentUser } = useAuth();
  const { allRoutes, favorites, toggleFavorite, isFavorite, deleteRoute } = useRoutes();
  const [searchParams] = useSearchParams();
  const createdFlash = searchParams.get('created') === '1';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [segment, setSegment] = useState(() => {
    const fromQuery = searchParams.get('segment');
    return fromQuery === 'official' || fromQuery === 'community' ? fromQuery : 'all';
  });
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredRoutes = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return allRoutes
      .filter((route) => {
        if (segment === 'all') {
          return true;
        }

        return route.source === segment;
      })
      .filter((route) => {
        if (category === 'all') {
          return true;
        }

        return route.category === category;
      })
      .filter((route) => {
        if (!normalized) {
          return true;
        }

        return (
          route.title.toLowerCase().includes(normalized) ||
          route.summary.toLowerCase().includes(normalized) ||
          route.startPlace.toLowerCase().includes(normalized)
        );
      })
      .filter((route) => (isLoggedIn && onlyFavorites ? favorites.includes(route.id) : true));
  }, [allRoutes, category, favorites, isLoggedIn, onlyFavorites, search, segment]);

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[var(--outline-soft)] bg-white/85 p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-heading text-2xl leading-tight">Lista tras</h1>
            <p className="text-sm text-[var(--text-muted)]">Przeglądaj trasy oficjalne i społecznościowe w jednym miejscu.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isLoggedIn && (
              <Link to="/routes/add" className="cta-btn inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold">
                <FontAwesomeIcon icon={faPlus} />
                Dodaj trasę
              </Link>
            )}
            <Link
              to="/routes"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Wróć do mapy
            </Link>
          </div>
        </div>

        <div className="mt-3 flex rounded-xl border border-[var(--outline-soft)] bg-white p-1 text-sm font-bold">
          {[
            { value: 'all', label: 'Wszystkie' },
            { value: 'official', label: 'Oficjalne' },
            { value: 'community', label: 'Społeczności' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setSegment(item.value)}
              className={`flex-1 rounded-lg px-3 py-2 ${segment === item.value ? 'cta-btn' : 'text-[var(--text-muted)]'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {createdFlash && (
          <div className="mt-3 rounded-2xl border border-[#1f9d55]/30 bg-[#e8f8ef] px-4 py-3 text-sm font-semibold text-[#0b5d33]">
            Trasa została dodana do społeczności.
          </div>
        )}

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj po nazwie, opisie lub starcie"
            className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-main)] outline-none focus:border-[#0f4c5c]"
          />

          <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-muted)]">
            <FontAwesomeIcon icon={faFilter} />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full bg-transparent text-[var(--text-main)] outline-none"
            >
              {routeCategories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setOnlyFavorites((prev) => !prev)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${
                onlyFavorites
                  ? 'border-[#f59f00]/40 bg-[#fff4dd] text-[#9a6400]'
                  : 'border-[var(--outline-soft)] bg-white text-[var(--text-muted)]'
              }`}
            >
              <FontAwesomeIcon icon={faStar} />
              Tylko ulubione
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {filteredRoutes.map((route) => {
          const isOwner = route.authorId === currentUser.id;
          const sourceMeta = routeSourceMeta[route.source] ?? routeSourceMeta.community;

          return (
            <article key={route.id} className="rounded-2xl border border-[var(--outline-soft)] bg-white/85 p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-lg leading-tight">{route.title}</h2>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${sourceMeta.badgeClass}`}>
                      {sourceMeta.label}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">Start: {route.startPlace}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                    {route.category}
                  </span>
                  {isLoggedIn && (
                    <button
                      type="button"
                      onClick={() => toggleFavorite(route.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)]"
                      aria-label={isFavorite(route.id) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                    >
                      <FontAwesomeIcon icon={faStar} className={isFavorite(route.id) ? 'text-[#f59f00]' : ''} />
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-2 text-sm text-[var(--text-muted)]">{route.summary}</p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1 text-[var(--text-muted)]">
                  {route.distanceKm} km
                </span>
                <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1 text-[var(--text-muted)]">
                  {route.duration}
                </span>
                <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1 text-[var(--text-muted)]">
                  {route.difficulty}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {route.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-[var(--outline-soft)] bg-white px-3 py-1 text-xs font-semibold text-[var(--text-muted)]"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/routes?routeId=${route.id}`} className="cta-btn rounded-xl px-4 py-2 text-sm font-bold">
                  Otwórz na mapie
                </Link>
                {isOwner && route.source === 'community' && (
                  <button
                    type="button"
                    onClick={() => deleteRoute(route.id)}
                    className="rounded-xl border border-[#d94841]/35 bg-white px-4 py-2 text-sm font-bold text-[#8f231f]"
                  >
                    Usuń
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {filteredRoutes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--outline-soft)] bg-white/80 p-6 text-center text-sm font-semibold text-[var(--text-muted)]">
            Brak tras dla wybranych filtrów.
          </div>
        )}
      </div>
    </section>
  );
}
