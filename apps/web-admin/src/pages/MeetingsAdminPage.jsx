import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useBenches } from '@shared/context/BenchesContext.jsx';

function createEmptyForm(defaultBenchId) {
  return {
    originalBenchId: '',
    benchId: defaultBenchId ?? '',
    ownerId: '',
    participantsText: '',
    maxParticipants: '4',
    createdAt: new Date().toISOString(),
  };
}

function mapMeetingToForm(meeting, defaultBenchId) {
  if (!meeting) {
    return createEmptyForm(defaultBenchId);
  }

  return {
    originalBenchId: meeting.benchId,
    benchId: meeting.benchId,
    ownerId: meeting.ownerId,
    participantsText: meeting.participants.join(', '),
    maxParticipants: String(meeting.maxParticipants),
    createdAt: meeting.createdAt,
  };
}

export function MeetingsAdminPage() {
  const { benches, meetingsByBench, saveMeeting, removeMeeting } = useBenches();
  const meetings = useMemo(() => Object.values(meetingsByBench), [meetingsByBench]);
  const [selectedBenchId, setSelectedBenchId] = useState(() => meetings[0]?.benchId ?? '');
  const [form, setForm] = useState(() => mapMeetingToForm(meetings[0] ?? null, benches[0]?.id ?? ''));

  const selectedMeeting = useMemo(() => {
    return selectedBenchId ? meetingsByBench[selectedBenchId] ?? null : null;
  }, [meetingsByBench, selectedBenchId]);

  useEffect(() => {
    if (selectedBenchId && !benches.some((bench) => bench.id === selectedBenchId)) {
      setSelectedBenchId(meetings[0]?.benchId ?? '');
    }
  }, [benches, meetings, selectedBenchId]);

  useEffect(() => {
    setForm(mapMeetingToForm(selectedMeeting, benches[0]?.id ?? ''));
  }, [benches, selectedMeeting]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    const result = saveMeeting({
      originalBenchId: form.originalBenchId || undefined,
      benchId: form.benchId,
      ownerId: form.ownerId,
      participants: form.participantsText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      maxParticipants: Number(form.maxParticipants),
      createdAt: form.createdAt,
    });

    if (result.ok) {
      setSelectedBenchId(form.benchId);
    }
  };

  const handleNew = () => {
    setSelectedBenchId('');
    setForm(createEmptyForm(benches[0]?.id ?? ''));
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="admin-panel p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Spotkania</p>
            <h2 className="mt-2 font-heading text-3xl">Aktywne rezerwacje ławek</h2>
          </div>
          <button type="button" onClick={handleNew} className="admin-btn admin-btn-primary">
            <FontAwesomeIcon icon={faPlus} />
            Dodaj spotkanie
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {meetings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--admin-outline)] bg-white/80 p-5 text-sm font-semibold text-[var(--admin-muted)]">
              Brak aktywnych spotkań.
            </div>
          )}

          {meetings.map((meeting) => (
            <button
              key={meeting.id}
              type="button"
              onClick={() => setSelectedBenchId(meeting.benchId)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedBenchId === meeting.benchId
                  ? 'border-transparent bg-[var(--admin-cta)] text-white'
                  : 'border-[var(--admin-outline)] bg-white/80 text-[var(--admin-text)]'
              }`}
            >
              <p className="font-bold">{benches.find((bench) => bench.id === meeting.benchId)?.name ?? meeting.benchId}</p>
              <p className={`mt-2 text-sm ${selectedBenchId === meeting.benchId ? 'text-white/78' : 'text-[var(--admin-muted)]'}`}>
                Właściciel: {meeting.ownerId}
              </p>
              <p className={`mt-2 text-xs font-bold uppercase tracking-wide ${selectedBenchId === meeting.benchId ? 'text-white/72' : 'text-[var(--admin-muted)]'}`}>
                {meeting.participants.length}/{meeting.maxParticipants} uczestników
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Edycja</p>
          <h2 className="mt-2 font-heading text-3xl">{selectedMeeting ? 'Aktualizacja spotkania' : 'Nowe spotkanie'}</h2>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="admin-label">
            Ławka
            <select value={form.benchId} onChange={handleChange('benchId')} className="admin-select">
              {benches.map((bench) => (
                <option key={bench.id} value={bench.id}>
                  {bench.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="admin-label">
              Owner ID
              <input value={form.ownerId} onChange={handleChange('ownerId')} className="admin-input" />
            </label>

            <label className="admin-label">
              Limit uczestników
              <input value={form.maxParticipants} onChange={handleChange('maxParticipants')} className="admin-input" />
            </label>
          </div>

          <label className="admin-label">
            Uczestnicy
            <textarea
              value={form.participantsText}
              onChange={handleChange('participantsText')}
              className="admin-textarea"
              placeholder="anna, marek, ola"
            />
          </label>

          <label className="admin-label">
            Data utworzenia
            <input value={form.createdAt} onChange={handleChange('createdAt')} className="admin-input" />
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleSave} className="admin-btn admin-btn-primary">
              Zapisz spotkanie
            </button>
            <button type="button" onClick={handleNew} className="admin-btn admin-btn-secondary">
              <FontAwesomeIcon icon={faPlus} />
              Nowe spotkanie
            </button>
            {selectedMeeting && (
              <button
                type="button"
                onClick={() => removeMeeting(selectedMeeting.benchId)}
                className="admin-btn admin-btn-danger"
              >
                <FontAwesomeIcon icon={faTrashCan} />
                Usuń spotkanie
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
