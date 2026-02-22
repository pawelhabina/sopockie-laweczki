import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="page-shell flex items-center justify-center">
      <section className="panel w-full p-6 text-center">
        <h1 className="font-heading text-3xl">404</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Nie znaleziono strony.</p>
        <Link to="/" className="cta-btn mt-5 inline-block rounded-xl px-4 py-3 text-sm font-bold">
          Wróć do startu
        </Link>
      </section>
    </div>
  );
}
