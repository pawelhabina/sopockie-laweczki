import { Link, Outlet, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { BottomNav } from './BottomNav';

export function AppShell() {
  const location = useLocation();

  return (
    <div className="page-shell flex flex-col gap-8">
      <header className="panel sticky top-3 z-20 flex items-center justify-between p-3 backdrop-blur">
        <Link
          to="/w-budowie/profile"
          aria-label="Profil"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-lg text-[var(--text-muted)] transition hover:scale-105"
        >
          <FontAwesomeIcon icon={faCircleUser} />
        </Link>

        <div className="text-center">
          <p className="font-heading text-lg leading-none tracking-tight">Sopockie Ławeczki</p>
          <p className="text-xs text-[var(--text-muted)]">Sopot moje miasto</p>
        </div>

        <Link
          to="/w-budowie/sos"
          aria-label="SOS"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg text-white transition hover:scale-105"
        >
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </Link>
      </header>

      <main className="animate-riseIn pb-2">
        <Outlet />
      </main>

      <BottomNav currentPath={location.pathname} />
    </div>
  );
}
