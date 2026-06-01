import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRotateLeft, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { statusMeta } from '@shared/data/benches.js';
import { useBenches } from '@shared/context/BenchesContext.jsx';

function createEmptyBenchForm() {
  return {
    id: '',
    name: '',
    address: '',
    lat: '54.4418',
    lng: '18.5603',
    capacity: '4',
    description: '',
    photosText: '',
  };
}

function mapBenchToForm(bench) {
  if (!bench) {
    return createEmptyBenchForm();
  }

  return {
    id: bench.id,
    name: bench.name,
    address: bench.address,
    lat: String(bench.lat),
    lng: String(bench.lng),
    capacity: String(bench.capacity),
    description: bench.description,
    photosText: bench.photos.join('\n'),
  };
}

export function BenchesAdminPage() {
  const { benches, saveBench, deleteBench, resetBenches, getStatus, getMeeting } = useBenches();
  const [selectedBenchId, setSelectedBenchId] = useState(() => benches[0]?.id ?? '');
  const [form, setForm] = useState(() => mapBenchToForm(benches[0] ?? null));

  const selectedBench = useMemo(() => {
    if (!selectedBenchId) {
      return null;
    }

    return benches.find((bench) => bench.id === selectedBenchId) ?? null;
  }, [benches, selectedBenchId]);

  useEffect(() => {
    if (selectedBenchId && !benches.some((bench) => bench.id === selectedBenchId)) {
      setSelectedBenchId(benches[0]?.id ?? '');
    }
  }, [benches, selectedBenchId]);

  useEffect(() => {
    setForm(mapBenchToForm(selectedBench));
  }, [selectedBench]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleNew = () => {
    setSelectedBenchId('');
    setForm(createEmptyBenchForm());
  };

  const handleSave = () => {
    const result = saveBench({
      id: form.id || undefined,
      name: form.name,
      address: form.address,
      lat: Number(form.lat),
      lng: Number(form.lng),
      capacity: Number(form.capacity),
      description: form.description,
      photos: form.photosText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    });

    if (result.ok) {
      setSelectedBenchId(result.benchId);
    }
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="admin-panel p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Ławki</p>
            <h2 className="mt-2 font-heading text-3xl">Katalog lokalizacji</h2>
          </div>
          <button type="button" onClick={handleNew} className="admin-btn admin-btn-primary">
            <FontAwesomeIcon icon={faPlus} />
            Dodaj ławkę
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {benches.map((bench) => {
            const status = getStatus(bench.id);
            const meeting = getMeeting(bench.id);
            const isSelected = selectedBenchId === bench.id;

            return (
              <button
                key={bench.id}
                type="button"
                onClick={() => setSelectedBenchId(bench.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-transparent bg-[var(--admin-cta)] text-white'
                    : 'border-[var(--admin-outline)] bg-white/80 text-[var(--admin-text)]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">{bench.name}</p>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      isSelected ? 'border-white/20 bg-white/10 text-white' : statusMeta[status].badgeClass
                    }`}
                  >
                    {statusMeta[status].label}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${isSelected ? 'text-white/78' : 'text-[var(--admin-muted)]'}`}>{bench.address}</p>
                <p className={`mt-2 text-xs font-bold uppercase tracking-wide ${isSelected ? 'text-white/72' : 'text-[var(--admin-muted)]'}`}>
                  {bench.capacity} miejsc
                  {meeting ? ` • spotkanie ${meeting.participants.length}/${meeting.maxParticipants}` : ''}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Edycja</p>
            <h2 className="mt-2 font-heading text-3xl">{selectedBench ? selectedBench.name : 'Nowa ławka'}</h2>
          </div>
          {selectedBench && (
            <span className="admin-pill">
              ID: <code>{selectedBench.id}</code>
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="admin-label">
              Nazwa
              <input value={form.name} onChange={handleChange('name')} className="admin-input" />
            </label>

            <label className="admin-label">
              Adres
              <input value={form.address} onChange={handleChange('address')} className="admin-input" />
            </label>

            <label className="admin-label">
              Szerokość geograficzna
              <input value={form.lat} onChange={handleChange('lat')} className="admin-input" />
            </label>

            <label className="admin-label">
              Długość geograficzna
              <input value={form.lng} onChange={handleChange('lng')} className="admin-input" />
            </label>

            <label className="admin-label md:col-span-2">
              Pojemność
              <input value={form.capacity} onChange={handleChange('capacity')} className="admin-input" />
            </label>
          </div>

          <label className="admin-label">
            Opis
            <textarea value={form.description} onChange={handleChange('description')} className="admin-textarea" />
          </label>

          <label className="admin-label">
            Zdjęcia
            <textarea
              value={form.photosText}
              onChange={handleChange('photosText')}
              className="admin-textarea"
              placeholder="Jedno URL na linię"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleSave} className="admin-btn admin-btn-primary">
              Zapisz ławkę
            </button>

            <button type="button" onClick={handleNew} className="admin-btn admin-btn-secondary">
              <FontAwesomeIcon icon={faPlus} />
              Nowa ławka
            </button>

            {selectedBench && (
              <button
                type="button"
                onClick={() => deleteBench(selectedBench.id)}
                className="admin-btn admin-btn-danger"
              >
                <FontAwesomeIcon icon={faTrashCan} />
                Usuń ławkę
              </button>
            )}

            <button type="button" onClick={resetBenches} className="admin-btn admin-btn-secondary">
              <FontAwesomeIcon icon={faRotateLeft} />
              Przywróć dane startowe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
