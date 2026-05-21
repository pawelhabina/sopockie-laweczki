import { useMemo } from 'react';
import { statusMeta } from '@shared/data/benches.js';
import { routeSourceMeta } from '@shared/data/routes.js';
import { useBenches } from '@shared/context/BenchesContext.jsx';
import { useRoutes } from '@shared/context/RoutesContext.jsx';
import { useAuth } from '@shared/context/AuthContext.jsx';
import { useUiPrefs } from '@shared/context/UiPrefsContext.jsx';

function StatCard({ label, value, description }) {
  return (
    <article className="admin-panel p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">{label}</p>
      <p className="mt-3 font-heading text-4xl">{value}</p>
      <p className="mt-2 text-sm text-[var(--admin-muted)]">{description}</p>
    </article>
  );
}

export function DashboardPage() {
  const { benches, favorites, meetingsByBench, getStatus } = useBenches();
  const { officialRoutes, communityRoutes, favoriteRoutes } = useRoutes();
  const { currentUser, isLoggedIn } = useAuth();
  const { fontScale, highContrast } = useUiPrefs();

  const benchStatusBreakdown = useMemo(() => {
    return benches.reduce(
      (acc, bench) => {
        const status = getStatus(bench.id);
        acc[status] += 1;
        return acc;
      },
      { free: 0, joinable: 0, occupied: 0 },
    );
  }, [benches, getStatus]);

  const latestRoutes = useMemo(() => {
    return [...officialRoutes, ...communityRoutes]
      .slice()
      .sort((left, right) => String(right.createdAt ?? '').localeCompare(String(left.createdAt ?? '')))
      .slice(0, 5);
  }, [communityRoutes, officialRoutes]);

  return (
    <section className="grid gap-4">
      <div className="admin-panel p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--admin-muted)]">Dashboard</p>
        <h2 className="mt-2 font-heading text-4xl leading-tight">Pełny podgląd danych aplikacji</h2>
        <p className="mt-3 max-w-[70ch] text-sm text-[var(--admin-muted)]">
          Panel operuje na tych samych kluczach `localStorage` co aplikacja użytkownika. Współdzielenie danych działa,
          gdy oba frontend'y są uruchomione pod tym samym originem, np. pod tym samym hostem z adminem wystawionym pod
          ścieżką `/admin`.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ławki" value={benches.length} description="Liczba lokalizacji dostępnych w module ławek." />
        <StatCard
          label="Spotkania"
          value={Object.keys(meetingsByBench).length}
          description="Aktywne spotkania przypięte do konkretnych ławek."
        />
        <StatCard
          label="Trasy"
          value={officialRoutes.length + communityRoutes.length}
          description="Suma tras oficjalnych i społecznościowych."
        />
        <StatCard
          label="Ulubione"
          value={favorites.length + favoriteRoutes.length}
          description="Łączna liczba zapisanych ulubionych ławek i tras."
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="admin-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Ławki</p>
              <h3 className="mt-2 font-heading text-2xl">Statusy dostępności</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusMeta).map(([status, meta]) => (
                <span key={status} className={`rounded-full border px-3 py-1 text-xs font-bold ${meta.badgeClass}`}>
                  {meta.label}: {benchStatusBreakdown[status]}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {benches.slice(0, 3).map((bench) => (
              <article key={bench.id} className="rounded-2xl border border-[var(--admin-outline)] bg-white/80 p-4">
                <p className="font-bold">{bench.name}</p>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">{bench.address}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--admin-muted)]">
                  Status: {statusMeta[getStatus(bench.id)].label}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-panel p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Sesja i UI</p>
          <h3 className="mt-2 font-heading text-2xl">Bieżąca konfiguracja</h3>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-[var(--admin-outline)] bg-white/80 p-4">
              <p className="text-sm font-bold">Użytkownik</p>
              <p className="mt-2 font-heading text-2xl">{currentUser.name}</p>
              <p className="mt-1 text-sm text-[var(--admin-muted)]">{isLoggedIn ? 'Sesja aktywna' : 'Tryb gościa'}</p>
            </div>

            <div className="rounded-2xl border border-[var(--admin-outline)] bg-white/80 p-4">
              <p className="text-sm font-bold">Preferencje</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="admin-pill">Skala fontu: {Math.round(fontScale * 100)}%</span>
                <span className="admin-pill">Kontrast: {highContrast ? 'wysoki' : 'standard'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Trasy</p>
            <h3 className="mt-2 font-heading text-2xl">Ostatnio zapisane pozycje</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${routeSourceMeta.official.badgeClass}`}>
              Oficjalne: {officialRoutes.length}
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${routeSourceMeta.community.badgeClass}`}>
              Społeczności: {communityRoutes.length}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {latestRoutes.map((route) => (
            <article key={route.id} className="rounded-2xl border border-[var(--admin-outline)] bg-white/80 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{route.title}</p>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    (routeSourceMeta[route.source] ?? routeSourceMeta.community).badgeClass
                  }`}
                >
                  {(routeSourceMeta[route.source] ?? routeSourceMeta.community).label}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--admin-muted)]">
                {route.distanceKm} km • {route.duration} • start: {route.startPlace}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
