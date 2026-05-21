import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircleMarker, Popup, Polyline, TileLayer, Tooltip, useMap, useMapEvents, MapContainer } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faListUl, faLocationDot, faPlus, faStar, faXmark } from '@fortawesome/free-solid-svg-icons';
import { routeCategoryMeta, routeSourceMeta, SOPOT_CENTER } from '@/data/routes';
import { useAuth } from '@/context/AuthContext';
import { useRoutes } from '@/context/RoutesContext';

const DEFAULT_ZOOM = 13;

function SelectedRouteFocus({ selectedRoute }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedRoute?.path?.length) {
      return;
    }

    if (selectedRoute.path.length === 1) {
      map.flyTo(selectedRoute.path[0], 15, { duration: 0.5 });
      return;
    }

    map.fitBounds(selectedRoute.path, { padding: [32, 32] });
  }, [map, selectedRoute]);

  return null;
}

function DeselectRouteOnMapClick({ onDeselect }) {
  useMapEvents({
    click: () => onDeselect(),
  });

  return null;
}

function RouteStatusLegend() {
  return (
    <div className="absolute bottom-3 left-3 right-16 z-[500] flex flex-wrap gap-2">
      {Object.entries(routeCategoryMeta).map(([category, meta]) => (
        <div
          key={category}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--outline-soft)] bg-white/95 px-3 py-1 text-xs font-bold text-[var(--text-muted)] backdrop-blur"
        >
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.lineColor }} />
          {meta.label}
        </div>
      ))}
    </div>
  );
}

export function RoutesMapPage() {
  const [searchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const { allRoutes, favoriteRoutes, toggleFavorite, isFavorite } = useRoutes();
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(() => searchParams.get('routeId') || '');

  const selectedRoute = useMemo(() => {
    if (!selectedRouteId) {
      return null;
    }

    return allRoutes.find((route) => route.id === selectedRouteId) ?? null;
  }, [allRoutes, selectedRouteId]);

  useEffect(() => {
    if (selectedRouteId && !allRoutes.some((route) => route.id === selectedRouteId)) {
      setSelectedRouteId('');
    }
  }, [allRoutes, selectedRouteId]);

  return (
    <section className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen">
      <div className="relative h-[calc(100svh-7rem)] overflow-hidden border-y border-[var(--outline-soft)] bg-white md:h-[calc(100dvh-7rem)]">
        <MapContainer center={SOPOT_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {allRoutes.map((route) => {
            const categoryTheme = routeCategoryMeta[route.category] ?? routeCategoryMeta.piesza;
            const routeSourceTheme = routeSourceMeta[route.source] ?? routeSourceMeta.community;
            const isSelected = selectedRouteId === route.id;
            const startPoint = route.path[0];

            return (
              <Fragment key={route.id}>
                <Polyline
                  positions={route.path}
                  pathOptions={{
                    color: categoryTheme.lineColor,
                    weight: isSelected ? 7 : 5,
                    opacity: isSelected ? 0.95 : 0.55,
                    bubblingMouseEvents: false,
                  }}
                  eventHandlers={{
                    click: () => setSelectedRouteId(route.id),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                    {route.title}
                  </Tooltip>
                </Polyline>

                {startPoint && (
                  <CircleMarker
                    center={startPoint}
                    radius={isSelected ? 8 : 6}
                    pathOptions={{
                      color: '#ffffff',
                      weight: 3,
                      fillColor: categoryTheme.lineColor,
                      fillOpacity: 1,
                      bubblingMouseEvents: false,
                    }}
                    eventHandlers={{
                      click: () => setSelectedRouteId(route.id),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                      {route.title} • {routeSourceTheme.label}
                    </Tooltip>
                  </CircleMarker>
                )}
              </Fragment>
            );
          })}

          <SelectedRouteFocus selectedRoute={selectedRoute} />
          <DeselectRouteOnMapClick onDeselect={() => setSelectedRouteId('')} />

          {selectedRoute && (
            <Popup
              position={selectedRoute.path[0] ?? SOPOT_CENTER}
              closeButton={false}
              autoPan
              keepInView
              offset={[0, -12]}
              maxWidth={360}
              className="bench-popup"
            >
              <article className="w-[min(360px,calc(100vw-3.5rem))] rounded-2xl border border-[var(--outline-soft)] bg-white/95 p-3 backdrop-blur">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          (routeSourceMeta[selectedRoute.source] ?? routeSourceMeta.community).badgeClass
                        }`}
                      >
                        {(routeSourceMeta[selectedRoute.source] ?? routeSourceMeta.community).label}
                      </span>
                      <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                        {selectedRoute.category}
                      </span>
                    </div>
                    <h2 className="mt-2 font-heading text-lg leading-tight">{selectedRoute.title}</h2>
                    <p className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <FontAwesomeIcon icon={faLocationDot} />
                      Start: {selectedRoute.startPlace}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={() => toggleFavorite(selectedRoute.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)]"
                        aria-label={isFavorite(selectedRoute.id) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                      >
                        <FontAwesomeIcon icon={faStar} className={isFavorite(selectedRoute.id) ? 'text-[#f59f00]' : ''} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedRouteId('')}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)]"
                      aria-label="Zamknij szczegóły trasy"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm text-[var(--text-muted)]">{selectedRoute.summary}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                    {selectedRoute.distanceKm} km
                  </span>
                  <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                    {selectedRoute.duration}
                  </span>
                  <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                    {selectedRoute.difficulty}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedRoute.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full border border-[var(--outline-soft)] bg-white px-3 py-1 text-xs font-semibold text-[var(--text-muted)]"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={`/routes/list?routeId=${selectedRoute.id}&segment=${selectedRoute.source}`}
                    className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-xs font-bold text-[var(--text-muted)]"
                  >
                    Szczegóły na liście
                  </Link>
                  {isLoggedIn && selectedRoute.source === 'community' && (
                    <Link to="/routes/add" className="cta-btn rounded-xl px-3 py-2 text-xs font-bold">
                      Dodaj własną trasę
                    </Link>
                  )}
                </div>
              </article>
            </Popup>
          )}
        </MapContainer>

        {isLoggedIn && (
          <button
            type="button"
            onClick={() => setShowFavorites((prev) => !prev)}
            className="absolute right-3 top-3 z-[500] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)] shadow-card transition hover:scale-105"
            aria-label="Ulubione trasy"
          >
            <FontAwesomeIcon icon={faHeart} className={favoriteRoutes.length > 0 ? 'text-[#d94841]' : ''} />
          </button>
        )}

        <Link
          to="/routes/list"
          className="absolute bottom-3 right-3 z-[500] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)] shadow-card transition hover:scale-105"
          aria-label="Lista tras"
        >
          <FontAwesomeIcon icon={faListUl} />
        </Link>

        {isLoggedIn && (
          <Link
            to="/routes/add"
            className="absolute right-3 top-16 z-[500] flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cta)] text-white shadow-card transition hover:scale-105"
            aria-label="Dodaj trasę"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Link>
        )}

        <RouteStatusLegend />

        {isLoggedIn && showFavorites && (
          <aside className="absolute right-3 top-16 z-[500] w-[min(300px,calc(100%-1.5rem))] rounded-2xl border border-[var(--outline-soft)] bg-white p-3 shadow-card sm:right-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-heading text-base">Ulubione trasy</p>
              <button
                type="button"
                onClick={() => setShowFavorites(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--outline-soft)] text-[var(--text-muted)]"
                aria-label="Zamknij ulubione"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {favoriteRoutes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--outline-soft)] bg-[#f8fbfa] p-3 text-sm text-[var(--text-muted)]">
                Brak ulubionych tras.
              </p>
            ) : (
              <ul className="grid gap-2">
                {favoriteRoutes.map((route) => (
                  <li key={route.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRouteId(route.id);
                        setShowFavorites(false);
                      }}
                      className="w-full rounded-xl border border-[var(--outline-soft)] bg-[#f8fbfa] p-3 text-left transition hover:bg-white"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">{route.title}</p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                            (routeSourceMeta[route.source] ?? routeSourceMeta.community).badgeClass
                          }`}
                        >
                          {(routeSourceMeta[route.source] ?? routeSourceMeta.community).label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {route.distanceKm} km • {route.duration}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}
