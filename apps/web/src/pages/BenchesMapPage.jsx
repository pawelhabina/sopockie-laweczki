import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faListUl, faLocationDot, faXmark, faStar } from '@fortawesome/free-solid-svg-icons';
import { statusMeta } from '@/data/benches';
import { useBenches } from '@/context/BenchesContext';

const SOPOT_CENTER = [54.4416, 18.5601];
const DEFAULT_ZOOM = 14;

function MapFocus({ targetBench }) {
  const map = useMap();

  useEffect(() => {
    if (!targetBench) {
      return;
    }

    map.flyTo([targetBench.lat, targetBench.lng], 16, { duration: 0.6 });
  }, [map, targetBench]);

  return null;
}

function MapDeselectOnClick({ onDeselect }) {
  useMapEvents({
    click: () => onDeselect(),
  });

  return null;
}

export function BenchesMapPage() {
  const [searchParams] = useSearchParams();
  const {
    benches,
    favorites,
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
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedBenchId, setSelectedBenchId] = useState(() => {
    return searchParams.get('benchId') || searchParams.get('bench') || '';
  });

  const selectedBench = useMemo(() => {
    if (!selectedBenchId) {
      return null;
    }

    return benches.find((bench) => bench.id === selectedBenchId) ?? null;
  }, [benches, selectedBenchId]);

  useEffect(() => {
    if (selectedBenchId && !benches.some((bench) => bench.id === selectedBenchId)) {
      setSelectedBenchId('');
    }
  }, [benches, selectedBenchId]);

  const selectedMeeting = selectedBench ? getMeeting(selectedBench.id) : null;
  const selectedStatus = selectedBench ? getStatus(selectedBench.id) : 'free';
  const selectedStatusMeta = statusMeta[selectedStatus];
  const selectedIsOwner = selectedBench ? isOwner(selectedBench.id) : false;
  const selectedIsParticipant = selectedBench ? isParticipant(selectedBench.id) : false;
  const selectedCanJoin =
    !!selectedMeeting &&
    !selectedIsParticipant &&
    selectedMeeting.participants.length < selectedMeeting.maxParticipants;

  const favoriteBenches = benches.filter((bench) => favorites.includes(bench.id));

  return (
    <section className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen">
      <div className="relative h-[calc(100svh-7rem)] overflow-hidden border-y border-[var(--outline-soft)] bg-white md:h-[calc(100dvh-7rem)]">
          <MapContainer center={SOPOT_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {benches.map((bench) => {
              const benchStatus = getStatus(bench.id);
              const meta = statusMeta[benchStatus];

              return (
                <CircleMarker
                  key={bench.id}
                  center={[bench.lat, bench.lng]}
                  radius={10}
                  pathOptions={{
                    color: meta.markerStroke,
                    fillColor: meta.markerFill,
                    fillOpacity: 0.94,
                    weight: selectedBenchId === bench.id ? 4 : 3,
                    bubblingMouseEvents: false,
                  }}
                  eventHandlers={{
                    click: () => setSelectedBenchId(bench.id),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                    {bench.name} - {meta.label}
                  </Tooltip>
                </CircleMarker>
              );
            })}

            <MapFocus targetBench={selectedBench} />
            <MapDeselectOnClick onDeselect={() => setSelectedBenchId('')} />
            {selectedBench && (
              <Popup
                position={[selectedBench.lat, selectedBench.lng]}
                closeButton={false}
                autoPan
                keepInView
                offset={[0, -14]}
                maxWidth={360}
                className="bench-popup"
              >
                <article className="w-[min(360px,calc(100vw-3.5rem))] rounded-2xl border border-[var(--outline-soft)] bg-white/95 p-3 backdrop-blur">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-heading text-lg leading-tight">{selectedBench.name}</h2>
                      <p className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <FontAwesomeIcon icon={faLocationDot} />
                        {selectedBench.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(selectedBench.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)]"
                        aria-label={isFavorite(selectedBench.id) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                      >
                        <FontAwesomeIcon
                          icon={faStar}
                          className={isFavorite(selectedBench.id) ? 'text-[#f59f00]' : ''}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedBenchId('')}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)]"
                        aria-label="Zamknij szczegóły ławki"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${selectedStatusMeta.badgeClass}`}>
                      {selectedStatusMeta.label}
                    </span>
                    <span className="rounded-full border border-[var(--outline-soft)] bg-[#f8fbfa] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                      {selectedMeeting
                        ? `Spotkanie ${selectedMeeting.participants.length}/${selectedMeeting.maxParticipants}`
                        : 'Brak spotkania'}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {!selectedMeeting && (
                      <button
                        type="button"
                        onClick={() => createMeeting(selectedBench.id)}
                        className="cta-btn rounded-xl px-3 py-2 text-xs font-bold"
                      >
                        Utwórz spotkanie
                      </button>
                    )}

                    {selectedMeeting && selectedIsParticipant && (
                      <button
                        type="button"
                        onClick={() => leaveMeeting(selectedBench.id)}
                        className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-xs font-bold text-[var(--text-muted)]"
                      >
                        Opuść spotkanie
                      </button>
                    )}

                    {selectedMeeting && !selectedIsParticipant && selectedCanJoin && (
                      <button
                        type="button"
                        onClick={() => joinMeeting(selectedBench.id)}
                        className="cta-btn rounded-xl px-3 py-2 text-xs font-bold"
                      >
                        Dołącz do spotkania
                      </button>
                    )}

                    {selectedMeeting && !selectedIsParticipant && !selectedCanJoin && (
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-xl border border-[#d94841]/30 bg-[#fdeceb] px-3 py-2 text-xs font-bold text-[#8f231f]"
                      >
                        Spotkanie pełne
                      </button>
                    )}

                    {selectedMeeting && selectedIsOwner && (
                      <button
                        type="button"
                        onClick={() => deleteMeeting(selectedBench.id)}
                        className="rounded-xl border border-[#d94841]/35 bg-white px-3 py-2 text-xs font-bold text-[#8f231f]"
                      >
                        Usuń spotkanie
                      </button>
                    )}
                  </div>

                  <Link
                    to={`/benches/details?benchId=${selectedBench.id}`}
                    className="mt-3 inline-flex rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-xs font-bold text-[var(--text-muted)]"
                  >
                    Więcej szczegółów
                  </Link>
                </article>
              </Popup>
            )}
          </MapContainer>

          <button
            type="button"
            onClick={() => setShowFavorites((prev) => !prev)}
            className="absolute right-3 top-3 z-[500] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)] shadow-card transition hover:scale-105"
            aria-label="Ulubione ławki"
          >
            <FontAwesomeIcon icon={faHeart} className={favoriteBenches.length > 0 ? 'text-[#d94841]' : ''} />
          </button>

          <Link
            to="/benches/list"
            className="absolute bottom-3 right-3 z-[500] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--outline-soft)] bg-white text-[var(--text-muted)] shadow-card transition hover:scale-105"
            aria-label="Lista ławek"
          >
            <FontAwesomeIcon icon={faListUl} />
          </Link>

          <div className="absolute bottom-3 left-3 right-16 z-[500] flex flex-wrap gap-2">
            {Object.entries(statusMeta).map(([statusKey, meta]) => (
              <div
                key={statusKey}
                className={`inline-flex items-center gap-2 rounded-full border bg-white/95 px-3 py-1 text-xs font-bold backdrop-blur ${meta.badgeClass}`}
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: meta.markerFill }}
                />
                {meta.label}
              </div>
            ))}
          </div>

          {showFavorites && (
            <aside className="absolute right-3 top-16 z-[500] w-[min(280px,calc(100%-1.5rem))] rounded-2xl border border-[var(--outline-soft)] bg-white p-3 shadow-card sm:right-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-heading text-base">Ulubione ławki</p>
                <button
                  type="button"
                  onClick={() => setShowFavorites(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--outline-soft)] text-[var(--text-muted)]"
                  aria-label="Zamknij ulubione"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              {favoriteBenches.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--outline-soft)] bg-[#f8fbfa] p-3 text-sm text-[var(--text-muted)]">
                  Brak ulubionych ławek.
                </p>
              ) : (
                <ul className="grid gap-2">
                  {favoriteBenches.map((bench) => {
                    const benchStatus = getStatus(bench.id);
                    const meta = statusMeta[benchStatus];

                    return (
                      <li key={bench.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBenchId(bench.id);
                            setShowFavorites(false);
                          }}
                          className="w-full rounded-xl border border-[var(--outline-soft)] bg-[#f8fbfa] p-3 text-left transition hover:bg-white"
                        >
                          <p className="font-bold">{bench.name}</p>
                          <p className="mt-1 text-xs text-[var(--text-muted)]">{bench.address}</p>
                          <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${meta.badgeClass}`}>
                            {meta.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>
          )}
      </div>
    </section>
  );
}
