import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faListUl, faLocationDot, faStar, faTrashCan, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { statusMeta } from '@/data/benches';
import { useBenches } from '@/context/BenchesContext';

function participantLabel(participantId, currentUserId) {
  if (participantId === currentUserId) {
    return 'Ty';
  }

  return participantId.charAt(0).toUpperCase() + participantId.slice(1);
}

export function BenchDetailsPage() {
  const [searchParams] = useSearchParams();
  const {
    currentUser,
    benches,
    toggleFavorite,
    getMeeting,
    getStatus,
    isFavorite,
    isParticipant,
    isOwner,
    createMeeting,
    joinMeeting,
    leaveMeeting,
    deleteMeeting,
  } = useBenches();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const selectedBenchId = searchParams.get('benchId') || searchParams.get('bench') || benches[0]?.id || '';

  const selectedBench = useMemo(() => {
    return benches.find((bench) => bench.id === selectedBenchId) ?? benches[0] ?? null;
  }, [benches, selectedBenchId]);

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [selectedBenchId]);

  if (!selectedBench) {
    return (
      <section className="rounded-2xl border border-[var(--outline-soft)] bg-white/85 p-4 shadow-card">
        <p className="text-sm font-semibold text-[var(--text-muted)]">Nie znaleziono ławki.</p>
        <Link to="/benches" className="cta-btn mt-3 inline-block rounded-xl px-4 py-2 text-sm font-bold">
          Wróć do mapy
        </Link>
      </section>
    );
  }

  const selectedMeeting = getMeeting(selectedBench.id);
  const selectedStatus = getStatus(selectedBench.id);
  const selectedStatusMeta = statusMeta[selectedStatus];
  const selectedIsOwner = isOwner(selectedBench.id);
  const selectedIsParticipant = isParticipant(selectedBench.id);
  const selectedCanJoin =
    !!selectedMeeting &&
    !selectedIsParticipant &&
    selectedMeeting.participants.length < selectedMeeting.maxParticipants;

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[var(--outline-soft)] bg-white/85 p-4 shadow-card">
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/benches?benchId=${selectedBench.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Wróć do mapy
          </Link>
          <Link
            to="/benches/list"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
          >
            <FontAwesomeIcon icon={faListUl} />
            Lista ławek
          </Link>
        </div>
      </div>

      <article className="rounded-2xl border border-[var(--outline-soft)] bg-white/85 p-4 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl leading-tight">{selectedBench.name}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <FontAwesomeIcon icon={faLocationDot} />
              {selectedBench.address}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${selectedStatusMeta.badgeClass}`}>
              {selectedStatusMeta.label}
            </span>
            <button
              type="button"
              onClick={() => toggleFavorite(selectedBench.id)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)]"
              aria-label={isFavorite(selectedBench.id) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            >
              <FontAwesomeIcon icon={faStar} className={isFavorite(selectedBench.id) ? 'text-[#f59f00]' : ''} />
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-[var(--text-muted)]">{selectedBench.description}</p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--outline-soft)] bg-[#edf4f4]">
          <img
            src={selectedBench.photos[activePhotoIndex]}
            alt={`${selectedBench.name} - zdjęcie ${activePhotoIndex + 1}`}
            className="h-56 w-full object-cover"
          />
          <div className="flex gap-2 overflow-x-auto p-2">
            {selectedBench.photos.map((photoUrl, index) => (
              <button
                key={photoUrl}
                type="button"
                onClick={() => setActivePhotoIndex(index)}
                className={`h-14 w-20 overflow-hidden rounded-lg border ${
                  activePhotoIndex === index ? 'border-[#0f4c5c]' : 'border-transparent'
                }`}
              >
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--outline-soft)] bg-[#f8fbfa] p-3">
          {selectedMeeting ? (
            <>
              <p className="flex items-center gap-2 text-sm font-bold">
                <FontAwesomeIcon icon={faUserGroup} />
                Spotkanie: {selectedMeeting.participants.length}/{selectedMeeting.maxParticipants}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Uczestnicy:{' '}
                {selectedMeeting.participants
                  .map((participantId) => participantLabel(participantId, currentUser.id))
                  .join(', ')}
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Brak aktywnego spotkania na tej ławce.</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {!selectedMeeting && (
            <button type="button" onClick={() => createMeeting(selectedBench.id)} className="cta-btn rounded-xl px-4 py-2 text-sm font-bold">
              Utwórz spotkanie
            </button>
          )}

          {selectedMeeting && selectedIsParticipant && (
            <button
              type="button"
              onClick={() => leaveMeeting(selectedBench.id)}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-muted)]"
            >
              Opuść spotkanie
            </button>
          )}

          {selectedMeeting && !selectedIsParticipant && selectedCanJoin && (
            <button type="button" onClick={() => joinMeeting(selectedBench.id)} className="cta-btn rounded-xl px-4 py-2 text-sm font-bold">
              Dołącz do spotkania
            </button>
          )}

          {selectedMeeting && !selectedIsParticipant && !selectedCanJoin && (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl border border-[#d94841]/30 bg-[#fdeceb] px-4 py-2 text-sm font-bold text-[#8f231f]"
            >
              Spotkanie pełne
            </button>
          )}

          {selectedMeeting && selectedIsOwner && (
            <button
              type="button"
              onClick={() => deleteMeeting(selectedBench.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d94841]/35 bg-white px-4 py-2 text-sm font-bold text-[#8f231f]"
            >
              <FontAwesomeIcon icon={faTrashCan} />
              Usuń spotkanie
            </button>
          )}
        </div>
      </article>
    </section>
  );
}
