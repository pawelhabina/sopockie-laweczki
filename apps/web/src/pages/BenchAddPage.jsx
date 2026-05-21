import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCircleInfo, faLock, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useBenches } from '@/context/BenchesContext';

const defaultForm = {
  name: '',
  businessCategory: 'uslugi',
  address: '',
  lat: '54.4416',
  lng: '18.5601',
  capacity: '2',
  description: '',
  isPublic: true,
  isNonCityConfirmed: false,
};

const businessCategories = [
  { value: 'uslugi', label: 'Usługi' },
  { value: 'gastronomiczna', label: 'Gastronomia' },
  { value: 'edukacja', label: 'Edukacja' },
  { value: 'zdrowie', label: 'Zdrowie' },
  { value: 'handel', label: 'Handel' },
  { value: 'inne', label: 'Inne' },
];

export function BenchAddPage() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, saveBench } = useBenches();
  const [form, setForm] = useState(defaultForm);
  const [submitError, setSubmitError] = useState('');

  const onChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!form.isNonCityConfirmed) {
      setSubmitError('Potwierdź, że zgłaszana ławka nie jest elementem infrastruktury miejskiej.');
      return;
    }

    const result = saveBench({
      type: 'business',
      name: form.name,
      businessCategory: form.businessCategory,
      address: form.address,
      lat: form.lat,
      lng: form.lng,
      capacity: form.capacity,
      description: form.description,
      isPublic: form.isPublic,
      moderationStatus: 'pending',
      isNonCityConfirmed: true,
      createdByUserId: currentUser.id,
    });

    if (!result.ok) {
      setSubmitError('Uzupełnij nazwę, adres oraz prawidłowe współrzędne GPS.');
      return;
    }

    navigate(`/benches/details?benchId=${result.benchId}`);
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
              <h1 className="mt-3 font-heading text-3xl leading-tight">Dodaj ławkę biznesową</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Ławki biznesowe mogą zgłaszać tylko zalogowane osoby.
              </p>
            </div>

            <Link
              to="/benches"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Wróć do mapy
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
                Po zalogowaniu zgłoszenie zapisze się lokalnie i będzie oznaczone jako oczekujące na moderację.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/profile" className="cta-btn rounded-xl px-4 py-2 text-sm font-bold">
              Przejdź do profilu
            </Link>
            <Link
              to="/benches/list"
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-muted)]"
            >
              Zobacz ławki
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
            <p className="w-fit rounded-full bg-[#fff4dd] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#9a6400]">
              Ławka biznesowa
            </p>
            <h1 className="mt-3 font-heading text-3xl leading-tight">Dodaj ławkę</h1>
            <p className="mt-2 max-w-[48ch] text-sm text-[var(--text-muted)]">
              Zgłoszenie trafi do listy jako treść użytkownika i będzie widoczne dla gości dopiero po moderacji.
            </p>
          </div>

          <Link
            to="/benches"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Mapa ławek
          </Link>
        </div>
      </div>

      <form onSubmit={onSubmit} className="panel grid gap-4 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Nazwa
            <input
              required
              value={form.name}
              onChange={onChange('name')}
              placeholder="Np. Ławka przy księgarni"
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Typ działalności
            <select
              value={form.businessCategory}
              onChange={onChange('businessCategory')}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            >
              {businessCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            Adres
            <input
              required
              value={form.address}
              onChange={onChange('address')}
              placeholder="Ulica i numer, Sopot"
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Szerokość GPS
            <input
              required
              type="number"
              step="0.00001"
              value={form.lat}
              onChange={onChange('lat')}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Długość GPS
            <input
              required
              type="number"
              step="0.00001"
              value={form.lng}
              onChange={onChange('lng')}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Liczba miejsc
            <input
              required
              type="number"
              min="1"
              max="12"
              value={form.capacity}
              onChange={onChange('capacity')}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold">
            <input type="checkbox" checked={form.isPublic} onChange={onChange('isPublic')} className="h-5 w-5" />
            Widoczna publicznie po moderacji
          </label>

          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            Opis
            <textarea
              required
              value={form.description}
              onChange={onChange('description')}
              rows={4}
              placeholder="Krótko opisz miejsce i kontekst ławki."
              className="resize-none rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-[#f59f00]/35 bg-[#fff4dd] p-3 text-sm font-bold text-[#9a6400]">
          <input
            type="checkbox"
            checked={form.isNonCityConfirmed}
            onChange={onChange('isNonCityConfirmed')}
            className="mt-0.5 h-5 w-5"
          />
          <span>Oświadczam, że ławka NIE jest elementem infrastruktury miejskiej.</span>
        </label>

        <div className="rounded-2xl border border-[var(--outline-soft)] bg-[#f8fbfa] p-3 text-sm text-[var(--text-muted)]">
          <FontAwesomeIcon icon={faCircleInfo} className="mr-2" />
          Zgodnie z dokumentacją ławka biznesowa będzie oznaczona jako treść dodana przez użytkownika.
        </div>

        {submitError && (
          <div className="rounded-2xl border border-[#d94841]/35 bg-[#fdeceb] p-3 text-sm font-semibold text-[#8f231f]">
            {submitError}
          </div>
        )}

        <button type="submit" className="cta-btn inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold">
          <FontAwesomeIcon icon={faPlus} />
          Zapisz zgłoszenie
        </button>
      </form>
    </section>
  );
}
