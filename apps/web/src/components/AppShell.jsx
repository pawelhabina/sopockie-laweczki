import { Link, Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppShell() {
  const location = useLocation();

  return (
    <div className="page-shell flex flex-col gap-4">
      <header className="panel sticky top-3 z-20 flex items-center justify-between p-3 backdrop-blur">
        <Link
          to="/w-budowie/profile"
          className="rounded-xl border border-[var(--outline-soft)] px-4 py-2 text-sm font-semibold"
        >
          Profil
        </Link>

        <div className="text-center">
          <p className="font-heading text-lg leading-none tracking-tight">Sopockie Ławeczki</p>
          <p className="text-xs text-[var(--text-muted)]">Sopot moje miasto</p>
        </div>

        <Link
          to="/w-budowie/sos"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-extrabold text-white"
        >
          SOS
        </Link>
      </header>

      <main className="animate-riseIn pb-2">
        <Outlet />
      </main>

      <BottomNav currentPath={location.pathname} />
    </div>
  );
}
