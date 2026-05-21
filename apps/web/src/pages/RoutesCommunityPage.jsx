import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faMapLocationDot,
  faPlus,
  faTrashCan,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons';
import { RouteMapPreview } from '@/components/RouteMap';
import { routeCategories } from '@/data/routes';
import { useAuth } from '@/context/AuthContext';
import { useRoutes } from '@/context/RoutesContext';

function formatDate(value) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function RoutesCommunityPage() {
  const { isLoggedIn, currentUser } = useAuth();
  const { communityRoutes, deleteRoute } = useRoutes();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [scope, setScope] = useState(() => (searchParams.get('mine') === '1' ? 'mine' : 'all'));
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const previewRef = useRef(null);

  const filteredRoutes = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return communityRoutes
      .filter((route) => {
        if (scope !== 'mine') {
          return true;
        }

        return route.authorId === currentUser.id;
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
          route.authorName.toLowerCase().includes(normalized)
        );
      });
  }, [category, communityRoutes, currentUser.id, scope, search]);

  useEffect(() => {
    if (!filteredRoutes.some((route) => route.id === selectedRouteId)) {
      setSelectedRouteId(filteredRoutes[0]?.id ?? '');
    }
  }, [filteredRoutes, selectedRouteId]);

  const createdFlash = searchParams.get('created') === '1';
  const selectedRoute = filteredRoutes.find((route) => route.id === selectedRouteId) ?? filteredRoutes[0] ?? null;

  const focusPreview = (routeId) => {
    setSelectedRouteId(routeId);
    window.requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="w-fit rounded-full bg-[#e6f7ef] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#0b5d33]">
              Społeczność
            </p>
            <h1 className="mt-3 font-heading text-3xl leading-tight">Trasy mieszkańców</h1>
            <p className="mt-2 max-w-[46ch] text-sm text-[var(--text-muted)]">
              Tutaj trafiają lokalne propozycje spacerów i przejazdów. Każda trasa ma własny przebieg na mapie, a
              zalogowani użytkownicy mogą narysować kolejną bez wychodzenia z aplikacji.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/routes"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Moduł tras
            </Link>
            <Link to="/routes/add" className="cta-btn inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold">
              <FontAwesomeIcon icon={faPlus} />
              Dodaj trasę
            </Link>
          </div>
        </div>

        {createdFlash && (
          <div className="mt-4 rounded-2xl border border-[#1f9d55]/30 bg-[#e8f8ef] px-4 py-3 text-sm font-semibold text-[#0b5d33]">
            Trasa została dodana do społeczności.
          </div>
        )}

        {!isLoggedIn && (
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--outline-soft)] bg-white px-4 py-3 text-sm text-[var(--text-muted)]">
            Dodawanie nowych tras wymaga zalogowania. Możesz obejrzeć listę, ale własny wpis dodasz dopiero po aktywacji konta w{' '}
            <Link to="/profile" className="font-bold text-[var(--cta)]">
              profilu
            </Link>
            .
          </div>
        )}

        <div className="mt-4 grid gap-2 md:grid-cols-[1.4fr,1fr,1fr]">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj po nazwie, opisie albo autorze"
            className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-main)] outline-none"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-main)] outline-none"
          >
            {routeCategories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <div className="flex rounded-xl border border-[var(--outline-soft)] bg-white p-1 text-sm font-bold">
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`flex-1 rounded-lg px-3 py-2 ${scope === 'all' ? 'cta-btn' : 'text-[var(--text-muted)]'}`}
            >
              Wszystkie
            </button>
            <button
              type="button"
              onClick={() => setScope('mine')}
              className={`flex-1 rounded-lg px-3 py-2 ${scope === 'mine' ? 'cta-btn' : 'text-[var(--text-muted)]'}`}
            >
              Moje
            </button>
          </div>
        </div>
      </div>

      {selectedRoute && (
        <article ref={previewRef} className="panel overflow-hidden p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="w-fit rounded-full bg-[#e6f7ef] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#0b5d33]">
                Podgląd trasy
              </p>
              <h2 className="mt-3 font-heading text-2xl leading-tight">{selectedRoute.title}</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Autor: {selectedRoute.authorName} • Start: {selectedRoute.startPlace}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1">
                {selectedRoute.category}
              </span>
              <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1">
                {selectedRoute.distanceKm} km
              </span>
              <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1">
                {selectedRoute.duration}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <RouteMapPreview path={selectedRoute.path} category={selectedRoute.category} interactive />
          </div>
        </article>
      )}

      <div className="grid gap-3">
        {filteredRoutes.map((route) => {
          const isOwner = route.authorId === currentUser.id;

          return (
            <article key={route.id} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-xl leading-tight">{route.title}</h2>
                    {isOwner && (
                      <span className="rounded-full border border-[#1f9d55]/35 bg-[#e8f8ef] px-3 py-1 text-xs font-bold text-[#0b5d33]">
                        Twoja trasa
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Autor: {route.authorName} • Dodano: {formatDate(route.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1">
                    {route.category}
                  </span>
                  <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1">
                    {route.distanceKm} km
                  </span>
                  <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1">
                    {route.duration}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-[var(--text-muted)]">{route.summary}</p>

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

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => focusPreview(route.id)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${
                    selectedRouteId === route.id
                      ? 'border-[var(--outline-soft)] bg-white text-[var(--text-muted)]'
                      : 'border-transparent cta-btn'
                  }`}
                >
                  <FontAwesomeIcon icon={faMapLocationDot} />
                  Pokaż na mapie
                </button>

                <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-muted)]">
                  <FontAwesomeIcon icon={faUserGroup} />
                  Start: {route.startPlace}
                </span>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => deleteRoute(route.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d94841]/35 bg-white px-3 py-2 text-sm font-bold text-[#8f231f]"
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                    Usuń
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {filteredRoutes.length === 0 && (
          <div className="panel border-dashed p-6 text-center text-sm font-semibold text-[var(--text-muted)]">
            Brak tras dla wybranego widoku.
          </div>
        )}
      </div>
    </section>
  );
}
