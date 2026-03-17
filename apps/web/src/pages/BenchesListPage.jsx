import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFilter, faStar } from '@fortawesome/free-solid-svg-icons';
import { statusMeta } from '@/data/benches';
import { useBenches } from '@/context/BenchesContext';

export function BenchesListPage() {
  const { benches, favorites, toggleFavorite, getMeeting, getStatus } = useBenches();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredBenches = useMemo(() => {
    return benches
      .filter((bench) => {
        const normalized = search.trim().toLowerCase();
        if (!normalized) {
          return true;
        }

        return bench.name.toLowerCase().includes(normalized) || bench.address.toLowerCase().includes(normalized);
      })
      .filter((bench) => {
        if (statusFilter === 'all') {
          return true;
        }
        return getStatus(bench.id) === statusFilter;
      })
      .filter((bench) => {
        return onlyFavorites ? favorites.includes(bench.id) : true;
      });
  }, [benches, favorites, getStatus, onlyFavorites, search, statusFilter]);

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[var(--outline-soft)] bg-white/85 p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-heading text-2xl leading-tight">Lista ławek</h1>
            <p className="text-sm text-[var(--text-muted)]">Filtrowanie wszystkich ławek w Sopocie.</p>
          </div>

          <Link
            to="/benches"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Wróć do mapy
          </Link>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj po nazwie lub adresie"
            className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-main)] outline-none focus:border-[#0f4c5c]"
          />

          <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-muted)]">
            <FontAwesomeIcon icon={faFilter} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full bg-transparent text-[var(--text-main)] outline-none"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="free">Wolna</option>
              <option value="joinable">Możliwość dołączenia</option>
              <option value="occupied">Zajęta</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => setOnlyFavorites((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${
              onlyFavorites
                ? 'border-[#f59f00]/40 bg-[#fff4dd] text-[#9a6400]'
                : 'border-[var(--outline-soft)] bg-white text-[var(--text-muted)]'
            }`}
          >
            <FontAwesomeIcon icon={faStar} />
            Tylko ulubione
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredBenches.map((bench) => {
          const status = getStatus(bench.id);
          const meeting = getMeeting(bench.id);
          const meta = statusMeta[status];
          const isFavorite = favorites.includes(bench.id);

          return (
            <article key={bench.id} className="rounded-2xl border border-[var(--outline-soft)] bg-white/85 p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-heading text-lg leading-tight">{bench.name}</h2>
                  <p className="text-sm text-[var(--text-muted)]">{bench.address}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${meta.badgeClass}`}>{meta.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(bench.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)]"
                    aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                  >
                    <FontAwesomeIcon icon={faStar} className={isFavorite ? 'text-[#f59f00]' : ''} />
                  </button>
                </div>
              </div>

              <p className="mt-2 text-sm text-[var(--text-muted)]">{bench.description}</p>

              {meeting && (
                <p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">
                  Uczestnicy: {meeting.participants.length}/{meeting.maxParticipants}
                </p>
              )}

              <Link
                to={`/benches?benchId=${bench.id}`}
                className="cta-btn mt-3 inline-block rounded-xl px-4 py-2 text-sm font-bold"
              >
                Otwórz na mapie
              </Link>
            </article>
          );
        })}

        {filteredBenches.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--outline-soft)] bg-white/80 p-6 text-center text-sm font-semibold text-[var(--text-muted)]">
            Brak ławek dla wybranych filtrów.
          </div>
        )}
      </div>
    </section>
  );
}
