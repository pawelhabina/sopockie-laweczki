import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faCouch, faUsers, faRoute } from '@fortawesome/free-solid-svg-icons';

const navItems = [
  { label: 'Menu', to: '/', icon: faHouse },
  { label: 'Ławeczki', to: '/benches', icon: faCouch },
  { label: 'Spotkania', to: '/meetings', icon: faUsers },
  { label: 'Trasy', to: '/routes', icon: faRoute },
];

export function BottomNav({ currentPath }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[680px] border-t border-white/60 bg-white/90 px-3 pb-3 pt-2 backdrop-blur">
      <ul className="mx-auto grid w-full max-w-[460px] grid-cols-4 gap-2">
        {navItems.map((item) => {
          const active =
            item.to === '/' ? currentPath === '/' : currentPath === item.to || currentPath.startsWith(`${item.to}/`);

          return (
            <li key={item.to} className="min-w-0">
              <Link
                to={item.to}
                className={`mx-auto flex h-20 w-20 flex-col items-center justify-center rounded-xl border text-center transition ${
                  active
                    ? 'cta-btn border-transparent'
                    : 'border-[var(--outline-soft)] bg-white text-[var(--text-muted)]'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-base" />
                <span className="mt-1 text-[11px] font-bold leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
