import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faLocationDot,
  faMagnifyingGlass,
  faMapLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { RouteMapPreview } from '@/components/RouteMap';
import { routeCategories } from '@/data/routes';
import { useRoutes } from '@/context/RoutesContext';

function RouteStats({ route }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
      <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1">
        {route.category}
      </span>
      <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1">
        {route.distanceKm} km
      </span>
      <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1">
        {route.duration}
      </span>
      <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1">
        {route.difficulty}
      </span>
    </div>
  );
}

export function RoutesOfficialPage() {
  const { officialRoutes } = useRoutes();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedRouteId, setSelectedRouteId] = useState(() => officialRoutes[0]?.id ?? '');
  const previewRef = useRef(null);

  const filteredRoutes = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return officialRoutes.filter((route) => {
      const matchesSearch =
        !normalized ||
        route.title.toLowerCase().includes(normalized) ||
        route.summary.toLowerCase().includes(normalized) ||
        route.highlights.some((item) => item.toLowerCase().includes(normalized));

      const matchesCategory = category === 'all' || route.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, officialRoutes, search]);

  useEffect(() => {
    if (!filteredRoutes.some((route) => route.id === selectedRouteId)) {
      setSelectedRouteId(filteredRoutes[0]?.id ?? '');
    }
  }, [filteredRoutes, selectedRouteId]);

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
      <div className="panel overflow-hidden p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="w-fit rounded-full bg-[#d8eef7] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#1c5d73]">
              Oficjalne
            </p>
            <h1 className="mt-3 font-heading text-3xl leading-tight">Gotowe trasy</h1>
            <p className="mt-2 max-w-[44ch] text-sm text-[var(--text-muted)]">
              Przeglądaj gotowe przebiegi tras bezpośrednio na mapie w aplikacji i wybierz najlepszy wariant dla siebie.
            </p>
          </div>

          <Link
            to="/routes"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Moduł tras
          </Link>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1.5fr,1fr]">
          <label className="flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm text-[var(--text-muted)]">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Szukaj po nazwie albo klimacie trasy"
              className="w-full bg-transparent font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

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
        </div>
      </div>

      {selectedRoute && (
        <article ref={previewRef} className="panel overflow-hidden p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="w-fit rounded-full bg-[#d8eef7] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#1c5d73]">
                Mapa aktywnej trasy
              </p>
              <h2 className="mt-3 font-heading text-2xl leading-tight">{selectedRoute.title}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <FontAwesomeIcon icon={faLocationDot} />
                Start: {selectedRoute.startPlace}
              </p>
            </div>

            <span className="rounded-full border border-[#3b7084]/35 bg-[#e8f2f8] px-3 py-2 text-sm font-bold text-[#2d6072]">
              Aktywna trasa
            </span>
          </div>

          <div className="mt-4">
            <RouteMapPreview path={selectedRoute.path} category={selectedRoute.category} interactive />
          </div>
        </article>
      )}

      <div className="grid gap-3">
        {filteredRoutes.map((route) => (
          <article key={route.id} className="panel p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl leading-tight">{route.title}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <FontAwesomeIcon icon={faLocationDot} />
                  Start: {route.startPlace}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm text-[var(--text-muted)]">{route.summary}</p>
            <RouteStats route={route} />

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

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => focusPreview(route.id)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold ${
                    selectedRouteId === route.id
                      ? 'border-[var(--outline-soft)] bg-white text-[var(--text-muted)]'
                      : 'border-transparent cta-btn'
                  }`}
                >
                <FontAwesomeIcon icon={faMapLocationDot} />
                Pokaż na mapie
              </button>
            </div>
          </article>
        ))}

        {filteredRoutes.length === 0 && (
          <div className="panel border-dashed p-6 text-center text-sm font-semibold text-[var(--text-muted)]">
            Brak tras dla wybranego filtra.
          </div>
        )}
      </div>
    </section>
  );
}
