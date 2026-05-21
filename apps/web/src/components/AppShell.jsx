import { Link, Outlet, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { BottomNav } from './BottomNav';

export function AppShell() {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const isFullMapPage = location.pathname === '/benches' || location.pathname === '/routes';

  return (
    <div className={`page-shell flex flex-col ${isFullMapPage ? 'gap-3 pt-3' : 'gap-8'}`}>
      {!isFullMapPage && (
        <header className="panel sticky top-3 z-20 flex items-center justify-between p-3 backdrop-blur">
          <Link
            to="/profile"
            aria-label="Profil"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-lg text-[var(--text-muted)] transition hover:scale-105"
          >
            <FontAwesomeIcon icon={faCircleUser} />
          </Link>

          <div className="text-center">
            <p className="font-heading text-lg leading-none tracking-tight">Sopockie Ławeczki</p>
            <p className="text-xs text-[var(--text-muted)]">Sopot moje miasto</p>
          </div>

          {isLoggedIn ? (
            <Link
              to="/sos"
              aria-label="SOS"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg text-white transition hover:scale-105"
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </Link>
          ) : (
            <div className="h-12 w-12" aria-hidden="true" />
          )}
        </header>
      )}

      <main className={`animate-riseIn ${isFullMapPage ? 'pb-0' : 'pb-2'}`}>
        <Outlet />
      </main>

      <BottomNav currentPath={location.pathname} />
    </div>
  );
}
