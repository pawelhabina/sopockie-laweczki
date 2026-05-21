import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock, faPlus, faTrashCan, faTurnUp } from '@fortawesome/free-solid-svg-icons';
import { RouteMapPreview } from '@/components/RouteMap';
import { calculateRouteDistanceKm, estimateDurationLabel, routeCategories } from '@/data/routes';
import { useAuth } from '@/context/AuthContext';
import { useRoutes } from '@/context/RoutesContext';

const defaultForm = {
  title: '',
  category: 'piesza',
  difficulty: 'lekka',
  startPlace: 'Sopot',
  summary: '',
  highlights: '',
  visibility: 'public',
};

export function RouteAddPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { createRoute } = useRoutes();
  const [form, setForm] = useState(defaultForm);
  const [path, setPath] = useState([]);
  const [submitError, setSubmitError] = useState('');

  const onChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const distanceKm = useMemo(() => calculateRouteDistanceKm(path), [path]);
  const durationLabel = useMemo(() => estimateDurationLabel(distanceKm, form.category), [distanceKm, form.category]);

  const addPoint = (point) => {
    setPath((prev) => [...prev, point]);
  };

  const removeLastPoint = () => {
    setPath((prev) => prev.slice(0, -1));
  };

  const clearPath = () => {
    setPath([]);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitError('');

    if (path.length < 2) {
      setSubmitError('Dodaj co najmniej dwa punkty na mapie, aby utworzyć przebieg trasy.');
      return;
    }

    const result = createRoute({
      ...form,
      path,
      distanceKm,
      duration: durationLabel,
      highlights: form.highlights
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    });

    if (result.ok) {
      navigate('/routes/list?segment=community&created=1');
      return;
    }

    if (result.reason === 'path') {
      setSubmitError('Trasa musi mieć przynajmniej dwa punkty na mapie.');
    }
  };

  if (!isLoggedIn) {
    return (
      <section className="flex flex-col gap-4">
        <div className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="w-fit rounded-full bg-[#fff4dd] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#9a6400]">
                Konto wymagane
              </p>
              <h1 className="mt-3 font-heading text-3xl leading-tight">Dodaj trasę</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Własne trasy mogą dodawać tylko zalogowane osoby, żeby dało się przypisać autorstwo i później nimi zarządzać.
              </p>
            </div>

            <Link
              to="/routes"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Moduł tras
            </Link>
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4dd] text-[#9a6400]">
              <FontAwesomeIcon icon={faLock} />
            </div>

            <div>
              <p className="font-heading text-xl">Najpierw aktywuj konto</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Po zalogowaniu formularz zapisze trasę lokalnie w aplikacji i pokaże ją na liście społeczności.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/profile" className="cta-btn rounded-xl px-4 py-2 text-sm font-bold">
              Przejdź do profilu
            </Link>
            <Link
              to="/routes/list?segment=community"
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-muted)]"
            >
              Zobacz istniejące trasy
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="w-fit rounded-full bg-[#e6f7ef] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#0b5d33]">
              Twoja trasa
            </p>
            <h1 className="mt-3 font-heading text-3xl leading-tight">Dodaj nową trasę</h1>
            <p className="mt-2 max-w-[46ch] text-sm text-[var(--text-muted)]">
              Klikaj na mapie Sopotu, aby dodać kolejne punkty przebiegu. Dane dystansu i czasu policzymy automatycznie.
            </p>
          </div>

          <Link
            to="/routes/list?segment=community"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Lista tras
          </Link>
        </div>
      </div>

      <form onSubmit={onSubmit} className="panel grid gap-4 p-5">
        <div className="grid gap-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold">Przebieg trasy</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Kliknij na mapie, aby dodawać punkty. Pierwszy punkt to start, ostatni to koniec.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={removeLastPoint}
                  disabled={path.length === 0}
                  className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTurnUp} className="mr-2" />
                  Cofnij punkt
                </button>
                <button
                  type="button"
                  onClick={clearPath}
                  disabled={path.length === 0}
                  className="rounded-xl border border-[#d94841]/35 bg-white px-3 py-2 text-sm font-bold text-[#8f231f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="mr-2" />
                  Wyczyść
                </button>
              </div>
            </div>

            <div className="mt-3">
              <RouteMapPreview path={path} category={form.category} editable onAddPoint={addPoint} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
              <span className="rounded-full border border-[var(--outline-soft)] bg-white px-3 py-2">
                Punkty: {path.length}
              </span>
              <span className="rounded-full border border-[var(--outline-soft)] bg-white px-3 py-2">
                Dystans: {distanceKm} km
              </span>
              <span className="rounded-full border border-[var(--outline-soft)] bg-white px-3 py-2">
                Szacowany czas: {durationLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Tytuł trasy
            <input
              required
              value={form.title}
              onChange={onChange('title')}
              placeholder="Np. Sopot o zachodzie słońca"
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Typ trasy
            <select
              value={form.category}
              onChange={onChange('category')}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            >
              {routeCategories.filter((item) => item.value !== 'all').map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Poziom
            <input
              value={form.difficulty}
              onChange={onChange('difficulty')}
              placeholder="Np. lekka"
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Punkt startowy
            <input
              required
              value={form.startPlace}
              onChange={onChange('startPlace')}
              placeholder="Np. Molo w Sopocie"
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Widoczność
            <select
              value={form.visibility}
              onChange={onChange('visibility')}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            >
              <option value="public">Publiczna</option>
              <option value="private">Prywatna</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-bold">
          Opis
          <textarea
            required
            rows="4"
            value={form.summary}
            onChange={onChange('summary')}
            placeholder="Krótko opisz klimat i przebieg trasy."
            className="rounded-2xl border border-[var(--outline-soft)] bg-white px-3 py-3 font-semibold text-[var(--text-main)] outline-none"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Najważniejsze punkty
          <input
            value={form.highlights}
            onChange={onChange('highlights')}
            placeholder="Np. Monciak, plaża, Opera Leśna"
            className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
          />
          <span className="text-xs font-semibold text-[var(--text-muted)]">Wpisz po przecinku.</span>
        </label>

        {submitError && (
          <div className="rounded-2xl border border-[#d94841]/35 bg-[#fdeceb] px-4 py-3 text-sm font-semibold text-[#8f231f]">
            {submitError}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="cta-btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold">
            <FontAwesomeIcon icon={faPlus} />
            Zapisz trasę
          </button>
          <Link
            to="/routes/list?segment=community"
            className="rounded-xl border border-[var(--outline-soft)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-muted)]"
          >
            Anuluj
          </Link>
        </div>
      </form>
    </section>
  );
}
