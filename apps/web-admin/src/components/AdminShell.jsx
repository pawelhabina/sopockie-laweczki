import { NavLink, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartColumn,
  faCouch,
  faGear,
  faRoute,
  faUsers,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { useBenches } from '@shared/context/BenchesContext.jsx';
import { useRoutes } from '@shared/context/RoutesContext.jsx';
import { useAuth } from '@shared/context/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: faChartColumn, end: true },
  { to: '/benches', label: 'Ławki', icon: faCouch },
  { to: '/meetings', label: 'Spotkania', icon: faUsers },
  { to: '/routes', label: 'Trasy', icon: faRoute },
  { to: '/settings', label: 'Aplikacja', icon: faGear },
];

export function AdminShell() {
  const { benches, meetingsByBench } = useBenches();
  const { officialRoutes, communityRoutes } = useRoutes();
  const { currentUser, isLoggedIn } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-4 p-4 lg:flex-row lg:p-6">
      <aside className="admin-panel w-full shrink-0 p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[300px]">
        <div className="rounded-[1.1rem] bg-[linear-gradient(135deg,#0f4c5c_0%,#22577a_100%)] p-4 text-white">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">web-admin</p>
          <h1 className="mt-2 font-heading text-3xl leading-tight">Sopockie Ławeczki</h1>
          <p className="mt-2 text-sm text-white/82">
            Panel do zarządzania treścią i stanem aplikacji użytkownika.
          </p>
        </div>

        <nav className="mt-4 grid gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? 'border-transparent bg-[var(--admin-cta)] text-white'
                    : 'border-[var(--admin-outline)] bg-white/80 text-[var(--admin-muted)]'
                }`
              }
            >
              <FontAwesomeIcon icon={item.icon} className="text-sm" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-[var(--admin-outline)] bg-white/80 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Stan danych</p>
            <div className="mt-3 grid gap-2 text-sm font-bold">
              <span>{benches.length} ławek</span>
              <span>{Object.keys(meetingsByBench).length} spotkań</span>
              <span>{officialRoutes.length + communityRoutes.length} tras</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--admin-outline)] bg-white/80 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Sesja</p>
            <p className="mt-3 font-heading text-xl">{currentUser.name}</p>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">
              {isLoggedIn ? 'zalogowany użytkownik' : 'tryb gościa'}
            </p>
          </div>
        </div>

        <a
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--admin-muted)]"
        >
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          Otwórz aplikację użytkownika
        </a>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
