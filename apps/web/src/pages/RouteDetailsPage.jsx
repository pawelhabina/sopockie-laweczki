import { Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMapLocationDot, faStar, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { RouteMapPreview } from '@/components/RouteMap';
import { ReportButton } from '@/components/ReportButton';
import { routeSourceMeta } from '@/data/routes';
import { useAuth } from '@/context/AuthContext';
import { useRoutes } from '@/context/RoutesContext';

export function RouteDetailsPage() {
  const [searchParams] = useSearchParams();
  const { currentUser, isLoggedIn } = useAuth();
  const { visibleRoutes, toggleFavorite, isFavorite, deleteRoute } = useRoutes();
  const routeId = searchParams.get('routeId') || searchParams.get('route') || visibleRoutes[0]?.id || '';
  const route = visibleRoutes.find((item) => item.id === routeId) ?? visibleRoutes[0] ?? null;

  if (!route) {
    return (
      <section className="panel p-5">
        <p className="text-sm font-semibold text-[var(--text-muted)]">Nie znaleziono trasy.</p>
        <Link to="/routes/list" className="cta-btn mt-3 inline-block rounded-xl px-4 py-2 text-sm font-bold">
          Wróć do listy
        </Link>
      </section>
    );
  }

  const sourceMeta = routeSourceMeta[route.source] ?? routeSourceMeta.community;
  const isOwner = route.authorId === currentUser.id;

  return (
    <section className="flex flex-col gap-4">
      <div className="panel p-4">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/routes/list"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Lista tras
          </Link>
          <Link
            to={`/routes?routeId=${route.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
          >
            <FontAwesomeIcon icon={faMapLocationDot} />
            Mapa
          </Link>
        </div>
      </div>

      <article className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${sourceMeta.badgeClass}`}>
                {sourceMeta.label}
              </span>
              {route.visibility === 'private' && (
                <span className="rounded-full border border-[#f59f00]/35 bg-[#fff4dd] px-3 py-1 text-xs font-bold text-[#9a6400]">
                  Prywatna
                </span>
              )}
            </div>
            <h1 className="mt-3 font-heading text-3xl leading-tight">{route.title}</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">Start: {route.startPlace}</p>
          </div>

          {isLoggedIn && (
            <button
              type="button"
              onClick={() => toggleFavorite(route.id)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)]"
              aria-label={isFavorite(route.id) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            >
              <FontAwesomeIcon icon={faStar} className={isFavorite(route.id) ? 'text-[#f59f00]' : ''} />
            </button>
          )}
        </div>

        <p className="mt-4 text-sm text-[var(--text-muted)]">{route.summary}</p>

        <div className="mt-4">
          <RouteMapPreview path={route.path} category={route.category} />
        </div>

        <div className="mt-4 grid gap-2 text-sm font-bold sm:grid-cols-3">
          <span className="rounded-xl border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-2">
            {route.distanceKm} km
          </span>
          <span className="rounded-xl border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-2">
            {route.duration}
          </span>
          <span className="rounded-xl border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-2">
            {route.difficulty}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
          {isOwner && route.source === 'community' && (
            <button
              type="button"
              onClick={() => deleteRoute(route.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d94841]/35 bg-white px-4 py-2 text-sm font-bold text-[#8f231f]"
            >
              <FontAwesomeIcon icon={faTrashCan} />
              Usuń trasę
            </button>
          )}

          {!isOwner && route.source === 'community' && (
            <ReportButton targetType="route" targetId={route.id} targetLabel={route.title} />
          )}
        </div>
      </article>
    </section>
  );
}
