import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useBenches } from '@/context/BenchesContext';

function toLocalDatetimeValue(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function MeetingCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, visibleBenches, createMeeting, getMeeting } = useBenches();
  const defaultBenchId = searchParams.get('benchId') || visibleBenches[0]?.id || '';
  const [form, setForm] = useState({
    benchId: defaultBenchId,
    title: '',
    topic: 'rozmowa',
    startAt: toLocalDatetimeValue(new Date(Date.now() + 15 * 60 * 1000)),
    durationMinutes: '30',
    maxParticipants: '4',
  });
  const [submitError, setSubmitError] = useState('');

  const selectedBench = useMemo(() => {
    return visibleBenches.find((bench) => bench.id === form.benchId) ?? null;
  }, [form.benchId, visibleBenches]);

  const selectedMeeting = selectedBench ? getMeeting(selectedBench.id) : null;

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!selectedBench) {
      setSubmitError('Wybierz ławkę dla spotkania.');
      return;
    }

    const result = createMeeting(selectedBench.id, {
      title: form.title,
      topic: form.topic,
      startAt: new Date(form.startAt).toISOString(),
      durationMinutes: form.durationMinutes,
      maxParticipants: form.maxParticipants,
    });

    if (result.ok) {
      navigate('/meetings?created=1');
      return;
    }

    if (result.reason === 'occupied') {
      setSubmitError('Na tej ławce jest już aktywne lub zaplanowane spotkanie.');
      return;
    }

    setSubmitError('Nie udało się utworzyć spotkania. Sprawdź dane formularza.');
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
              <h1 className="mt-3 font-heading text-3xl leading-tight">Utwórz spotkanie</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Spotkania można tworzyć po zalogowaniu.</p>
            </div>

            <Link
              to="/meetings"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Spotkania
            </Link>
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4dd] text-[#9a6400]">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <div>
              <p className="font-heading text-xl">Aktywuj konto</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Po zalogowaniu wybierzesz ławkę, czas i temat spotkania.
              </p>
            </div>
          </div>

          <Link to="/profile" className="cta-btn mt-4 inline-flex rounded-xl px-4 py-2 text-sm font-bold">
            Przejdź do profilu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="w-fit rounded-full bg-[#eaf5f8] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#2d6072]">
              Nowe spotkanie
            </p>
            <h1 className="mt-3 font-heading text-3xl leading-tight">Utwórz spotkanie</h1>
            <p className="mt-2 max-w-[48ch] text-sm text-[var(--text-muted)]">
              Wybierz ławkę, czas pobytu od 15 do 60 minut oraz temat rozmowy.
            </p>
          </div>

          <Link
            to="/meetings"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Lista spotkań
          </Link>
        </div>
      </div>

      <form onSubmit={onSubmit} className="panel grid gap-4 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            Ławka
            <select
              required
              value={form.benchId}
              onChange={onChange('benchId')}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            >
              {visibleBenches.map((bench) => (
                <option key={bench.id} value={bench.id}>
                  {bench.name} - {bench.address}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            Nazwa spotkania
            <input
              required
              value={form.title}
              onChange={onChange('title')}
              placeholder="Np. Spacer i rozmowa o Sopocie"
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Temat
            <select
              value={form.topic}
              onChange={onChange('topic')}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            >
              <option value="rozmowa">Rozmowa</option>
              <option value="spacery">Spacery</option>
              <option value="kultura">Kultura</option>
              <option value="zdrowie">Zdrowie</option>
              <option value="pomoc">Pomoc sąsiedzka</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Start
            <input
              required
              type="datetime-local"
              value={form.startAt}
              onChange={onChange('startAt')}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Czas pobytu
            <select
              value={form.durationMinutes}
              onChange={onChange('durationMinutes')}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            >
              <option value="15">15 minut</option>
              <option value="30">30 minut</option>
              <option value="45">45 minut</option>
              <option value="60">60 minut</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Limit uczestników
            <input
              required
              type="number"
              min="1"
              max={selectedBench?.capacity ?? 12}
              value={form.maxParticipants}
              onChange={onChange('maxParticipants')}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>
        </div>

        {selectedMeeting && (
          <div className="rounded-2xl border border-[#d94841]/35 bg-[#fdeceb] p-3 text-sm font-semibold text-[#8f231f]">
            Na tej ławce jest już aktywne lub zaplanowane spotkanie.
          </div>
        )}

        {submitError && (
          <div className="rounded-2xl border border-[#d94841]/35 bg-[#fdeceb] p-3 text-sm font-semibold text-[#8f231f]">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={!!selectedMeeting}
          className="cta-btn inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faPlus} />
          Utwórz spotkanie
        </button>
      </form>
    </section>
  );
}
