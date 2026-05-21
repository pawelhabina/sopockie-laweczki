import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faClock, faLock, faMapLocationDot, faPlus, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { getMeetingEndAt, getMeetingStatus, useBenches } from '@/context/BenchesContext';

const statusLabels = {
  active: 'Teraz',
  upcoming: 'Nadchodzące',
};

function formatDateTime(value) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function anonymizedParticipantLabel(participantId, currentUserId, index) {
  if (participantId === currentUserId) {
    return 'Ty';
  }

  const letter = participantId.charAt(0).toUpperCase() || 'U';
  return `${letter}. ${62 + ((index * 5) % 18)}`;
}

export function MeetingsListPage() {
  const {
    currentUser,
    isLoggedIn,
    visibleMeetings,
    visibleBenches,
    joinMeeting,
    leaveMeeting,
    deleteMeeting,
    isParticipant,
    isOwner,
  } = useBenches();
  const [filter, setFilter] = useState('all');

  const benchesById = useMemo(() => {
    return visibleBenches.reduce((acc, bench) => {
      acc[bench.id] = bench;
      return acc;
    }, {});
  }, [visibleBenches]);

  const filteredMeetings = useMemo(() => {
    return visibleMeetings
      .map((meeting) => ({
        ...meeting,
        status: getMeetingStatus(meeting),
        bench: benchesById[meeting.benchId],
      }))
      .filter((meeting) => meeting.bench)
      .filter((meeting) => {
        if (filter === 'all') {
          return true;
        }
        if (filter === 'mine') {
          return meeting.participants.includes(currentUser.id);
        }
        return meeting.status === filter;
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [benchesById, currentUser.id, filter, visibleMeetings]);

  if (!isLoggedIn) {
    return (
      <section className="flex flex-col gap-4">
        <div className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="w-fit rounded-full bg-[#fff4dd] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#9a6400]">
                Konto wymagane
              </p>
              <h1 className="mt-3 font-heading text-3xl leading-tight">Spotkania</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Zgodnie z dokumentacją spotkania są dostępne tylko dla zalogowanych użytkowników.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Menu
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
                Po zalogowaniu pojawi się lista aktywnych spotkań, dołączanie i formularz tworzenia spotkania.
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
              Spotkania
            </p>
            <h1 className="mt-3 font-heading text-3xl leading-tight">Lista spotkań</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Spotkania pokazują przybliżony kontekst ławki i anonimową listę uczestników.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/meetings/create" className="cta-btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold">
              <FontAwesomeIcon icon={faPlus} />
              Utwórz
            </Link>
            <Link
              to="/benches"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
            >
              <FontAwesomeIcon icon={faMapLocationDot} />
              Mapa ławek
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl border border-[var(--outline-soft)] bg-white p-1 text-sm font-bold">
          {[
            { value: 'all', label: 'Wszystkie' },
            { value: 'active', label: 'Teraz' },
            { value: 'upcoming', label: 'Planowane' },
            { value: 'mine', label: 'Moje' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-lg px-2 py-2 ${filter === item.value ? 'cta-btn' : 'text-[var(--text-muted)]'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {filteredMeetings.map((meeting) => {
          const joined = isParticipant(meeting.benchId);
          const owner = isOwner(meeting.benchId);
          const full = meeting.participants.length >= meeting.maxParticipants;
          const endAt = getMeetingEndAt(meeting);

          return (
            <article key={meeting.id} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#2a7f87]/35 bg-[#eaf5f8] px-3 py-1 text-xs font-bold text-[#2d6072]">
                      {statusLabels[meeting.status] ?? 'Spotkanie'}
                    </span>
                    <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                      {meeting.topic}
                    </span>
                  </div>
                  <h2 className="mt-2 font-heading text-xl leading-tight">{meeting.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">{meeting.bench.name}</p>
                </div>

                <Link
                  to={`/benches?benchId=${meeting.benchId}`}
                  className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
                >
                  Mapa
                </Link>
              </div>

              <div className="mt-3 grid gap-2 text-sm font-semibold text-[var(--text-muted)] sm:grid-cols-2">
                <p className="flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-2">
                  <FontAwesomeIcon icon={faClock} />
                  {formatDateTime(meeting.startAt)} - {endAt ? formatDateTime(endAt) : ''}
                </p>
                <p className="flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-2">
                  <FontAwesomeIcon icon={faUserGroup} />
                  {meeting.participants.length}/{meeting.maxParticipants} uczestników
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {meeting.participants.map((participantId, index) => (
                  <span
                    key={participantId}
                    className="rounded-full border border-[var(--outline-soft)] bg-white px-3 py-1 text-xs font-bold text-[var(--text-muted)]"
                  >
                    {anonymizedParticipantLabel(participantId, currentUser.id, index)}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {joined ? (
                  <button
                    type="button"
                    onClick={() => leaveMeeting(meeting.benchId)}
                    className="rounded-xl border border-[var(--outline-soft)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-muted)]"
                  >
                    Opuść
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => joinMeeting(meeting.benchId)}
                    disabled={full}
                    className="cta-btn rounded-xl px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {full ? 'Pełne' : 'Dołącz'}
                  </button>
                )}

                {owner && (
                  <button
                    type="button"
                    onClick={() => deleteMeeting(meeting.benchId)}
                    className="rounded-xl border border-[#d94841]/35 bg-white px-4 py-2 text-sm font-bold text-[#8f231f]"
                  >
                    Usuń
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {filteredMeetings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--outline-soft)] bg-white/80 p-6 text-center text-sm font-semibold text-[var(--text-muted)]">
            Brak spotkań dla wybranego filtra.
          </div>
        )}
      </div>
    </section>
  );
}
