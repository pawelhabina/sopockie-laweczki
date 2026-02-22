import { Link } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Trasy', to: '/routes' },
  { label: 'Ławeczki', to: '/benches' },
  { label: 'Spotkania', to: '/meetings' },
];

export function BottomNav({ currentPath }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[680px] border-t border-white/60 bg-white/90 px-3 pb-4 pt-2 backdrop-blur">
      <ul className="grid grid-cols-4 gap-2">
        {navItems.map((item) => {
          const active =
            item.to === '/' ? currentPath === '/' : currentPath === item.to || currentPath.startsWith(`${item.to}/`);

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`block rounded-xl px-2 py-2 text-center text-xs font-bold transition ${
                  active ? 'cta-btn' : 'border border-[var(--outline-soft)] bg-white text-[var(--text-muted)]'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
