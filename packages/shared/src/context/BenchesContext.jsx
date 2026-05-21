import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { benchList, getDefaultBenchPhoto } from '../data/benches';
import { useAuth } from './AuthContext';

const BenchesContext = createContext(null);

const BENCHES_KEY = 'benches-catalog-v1';
const FAVORITES_KEY = 'benches-favorites-v1';
const MEETINGS_KEY = 'benches-meetings-v1';
const BUSINESS_APPROVED_STATUS = 'approved';

function readJsonStorage(key, fallbackValue) {
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) {
      return fallbackValue;
    }
    return JSON.parse(saved);
  } catch {
    return fallbackValue;
  }
}

function createBenchId() {
  return `bench-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createMeetingId() {
  return `meeting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function normalizeDuration(value, fallbackValue = 30) {
  const duration = Number(value);
  if (!Number.isFinite(duration)) {
    return fallbackValue;
  }

  return Math.min(60, Math.max(15, Math.round(duration / 15) * 15));
}

function buildInitialMeetings() {
  const now = new Date();
  return {
    'bench-2': {
      id: 'meeting-bench-2',
      benchId: 'bench-2',
      ownerId: 'anna',
      participants: ['anna', 'marek'],
      maxParticipants: 3,
      title: 'Spacer i kawa na Monciaku',
      topic: 'spacery',
      startAt: addMinutes(now, 10).toISOString(),
      durationMinutes: 45,
      createdAt: now.toISOString(),
    },
    'bench-4': {
      id: 'meeting-bench-4',
      benchId: 'bench-4',
      ownerId: 'ola',
      participants: ['ola', 'jan', 'ewa', 'piotr'],
      maxParticipants: 4,
      title: 'Po wydarzeniu w Ergo Arenie',
      topic: 'kultura',
      startAt: addMinutes(now, 25).toISOString(),
      durationMinutes: 30,
      createdAt: now.toISOString(),
    },
  };
}

function sanitizePhotos(value) {
  if (!Array.isArray(value)) {
    return [getDefaultBenchPhoto()];
  }

  const cleaned = value.map((photo) => String(photo ?? '').trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : [getDefaultBenchPhoto()];
}

function normalizeBenchType(value, fallbackType = 'city') {
  return value === 'business' || fallbackType === 'business' ? 'business' : 'city';
}

function ensureBenchShape(candidate, fallbackBench = null) {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const name = String(candidate.name ?? '').trim();
  const address = String(candidate.address ?? '').trim();
  const lat = Number(candidate.lat);
  const lng = Number(candidate.lng);

  if (!name || !address || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const type = normalizeBenchType(candidate.type, fallbackBench?.type);
  const nextCapacity = Number(candidate.capacity);
  const moderationStatus = String(candidate.moderationStatus ?? fallbackBench?.moderationStatus ?? 'pending').trim();

  return {
    id: String(candidate.id ?? fallbackBench?.id ?? createBenchId()),
    type,
    businessCategory:
      type === 'business' ? String(candidate.businessCategory ?? fallbackBench?.businessCategory ?? '').trim() : '',
    isPublic: candidate.isPublic ?? fallbackBench?.isPublic ?? type === 'city',
    moderationStatus: type === 'business' ? moderationStatus : BUSINESS_APPROVED_STATUS,
    isNonCityConfirmed:
      type === 'business' ? candidate.isNonCityConfirmed === true || fallbackBench?.isNonCityConfirmed === true : false,
    createdByUserId: String(candidate.createdByUserId ?? fallbackBench?.createdByUserId ?? '').trim(),
    name,
    address,
    lat: Math.round(lat * 100000) / 100000,
    lng: Math.round(lng * 100000) / 100000,
    capacity: Number.isFinite(nextCapacity) && nextCapacity > 0 ? Math.round(nextCapacity) : fallbackBench?.capacity ?? 4,
    description: String(candidate.description ?? fallbackBench?.description ?? '').trim(),
    photos: sanitizePhotos(candidate.photos ?? fallbackBench?.photos),
  };
}

function sanitizeBenches(value) {
  if (!Array.isArray(value)) {
    return benchList.map((bench) => ensureBenchShape(bench)).filter(Boolean);
  }

  const parsed = value.map((candidate) => ensureBenchShape(candidate)).filter(Boolean);
  return parsed.length > 0 ? parsed : benchList.map((bench) => ensureBenchShape(bench)).filter(Boolean);
}

function ensureMeetingShape(candidate, benchesById) {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const benchId = String(candidate.benchId ?? '');
  const bench = benchesById[benchId];

  if (!benchId || !bench || !Array.isArray(candidate.participants)) {
    return null;
  }

  const uniqueParticipants = Array.from(
    new Set(candidate.participants.map((participant) => String(participant ?? '').trim()).filter(Boolean)),
  );
  const maxParticipants = Number(candidate.maxParticipants);
  const resolvedMax = Number.isFinite(maxParticipants) && maxParticipants > 0 ? Math.round(maxParticipants) : bench.capacity;

  if (uniqueParticipants.length === 0) {
    return null;
  }

  const ownerId = String(candidate.ownerId ?? uniqueParticipants[0]).trim() || uniqueParticipants[0];
  const createdAt = String(candidate.createdAt ?? new Date().toISOString());
  const startAt = String(candidate.startAt ?? new Date().toISOString());

  return {
    id: String(candidate.id ?? createMeetingId()),
    benchId,
    ownerId,
    participants: uniqueParticipants.slice(0, resolvedMax),
    maxParticipants: resolvedMax,
    title: String(candidate.title ?? 'Spotkanie przy ławce').trim() || 'Spotkanie przy ławce',
    topic: String(candidate.topic ?? 'rozmowa').trim() || 'rozmowa',
    startAt,
    durationMinutes: normalizeDuration(candidate.durationMinutes),
    createdAt,
  };
}

function sanitizeMeetingsMap(value, benchesById) {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value).reduce((acc, [benchId, meeting]) => {
    const parsedMeeting = ensureMeetingShape({ ...meeting, benchId }, benchesById);
    if (parsedMeeting) {
      acc[benchId] = parsedMeeting;
    }
    return acc;
  }, {});
}

function sanitizeFavorites(value, validBenchIds) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((benchId) => validBenchIds.has(benchId));
}

export function getMeetingEndAt(meeting) {
  if (!meeting) {
    return null;
  }

  return addMinutes(new Date(meeting.startAt), meeting.durationMinutes);
}

export function getMeetingStatus(meeting) {
  if (!meeting) {
    return 'none';
  }

  const now = new Date();
  const startAt = new Date(meeting.startAt);
  const endAt = getMeetingEndAt(meeting);

  if (Number.isNaN(startAt.getTime()) || !endAt || Number.isNaN(endAt.getTime())) {
    return 'active';
  }

  if (now < startAt) {
    return 'upcoming';
  }

  if (now <= endAt) {
    return 'active';
  }

  return 'ended';
}

export function isBenchVisibleForGuest(bench) {
  if (bench.type !== 'business') {
    return true;
  }

  return bench.isPublic === true && bench.moderationStatus === BUSINESS_APPROVED_STATUS;
}

export function getBenchStatus(meeting) {
  if (!meeting || getMeetingStatus(meeting) === 'ended') {
    return 'free';
  }

  if (meeting.participants.length < meeting.maxParticipants) {
    return 'joinable';
  }

  return 'occupied';
}

export function BenchesProvider({ children }) {
  const { currentUser, isLoggedIn } = useAuth();
  const [benches, setBenches] = useState(() => sanitizeBenches(readJsonStorage(BENCHES_KEY, benchList)));
  const [favorites, setFavorites] = useState(() => readJsonStorage(FAVORITES_KEY, []));
  const [meetingsByBench, setMeetingsByBench] = useState(() => readJsonStorage(MEETINGS_KEY, buildInitialMeetings()));

  const benchesById = useMemo(() => {
    return benches.reduce((acc, bench) => {
      acc[bench.id] = bench;
      return acc;
    }, {});
  }, [benches]);

  useEffect(() => {
    window.localStorage.setItem(BENCHES_KEY, JSON.stringify(benches));
  }, [benches]);

  useEffect(() => {
    const validBenchIds = new Set(benches.map((bench) => bench.id));
    setFavorites((prev) => sanitizeFavorites(prev, validBenchIds));
    setMeetingsByBench((prev) => sanitizeMeetingsMap(prev, benchesById));
  }, [benches, benchesById]);

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetingsByBench));
  }, [meetingsByBench]);

  const value = useMemo(() => {
    const activeMeetings = Object.values(meetingsByBench).filter((meeting) => getMeetingStatus(meeting) !== 'ended');
    const visibleBenches = isLoggedIn ? benches : benches.filter(isBenchVisibleForGuest);
    const visibleMeetings = isLoggedIn ? activeMeetings : [];

    const getActiveMeeting = (benchId) => {
      const meeting = meetingsByBench[benchId] ?? null;
      return getMeetingStatus(meeting) === 'ended' ? null : meeting;
    };

    return {
      currentUser,
      isLoggedIn,
      benches,
      visibleBenches,
      meetings: activeMeetings,
      visibleMeetings,
      meetingsByBench,
      favorites,
      toggleFavorite: (benchId) => {
        if (!isLoggedIn) {
          return { ok: false, reason: 'auth' };
        }

        setFavorites((prev) => {
          if (prev.includes(benchId)) {
            return prev.filter((id) => id !== benchId);
          }
          return [...prev, benchId];
        });

        return { ok: true };
      },
      clearFavorites: () => setFavorites([]),
      createMeeting: (benchId, payload = {}) => {
        if (!isLoggedIn) {
          return { ok: false, reason: 'auth' };
        }

        const bench = benchesById[benchId];
        if (!bench) {
          return { ok: false, reason: 'invalid' };
        }

        const existingMeeting = getActiveMeeting(benchId);
        if (existingMeeting) {
          return { ok: false, reason: 'occupied', meetingId: existingMeeting.id };
        }

        const meeting = ensureMeetingShape(
          {
            id: createMeetingId(),
            benchId,
            ownerId: currentUser.id,
            participants: [currentUser.id],
            maxParticipants: payload.maxParticipants ?? bench.capacity,
            title: payload.title,
            topic: payload.topic,
            startAt: payload.startAt,
            durationMinutes: payload.durationMinutes,
            createdAt: new Date().toISOString(),
          },
          benchesById,
        );

        if (!meeting) {
          return { ok: false, reason: 'invalid' };
        }

        setMeetingsByBench((prev) => ({
          ...prev,
          [benchId]: meeting,
        }));

        return { ok: true, meetingId: meeting.id, benchId };
      },
      joinMeeting: (benchId) => {
        if (!isLoggedIn) {
          return { ok: false, reason: 'auth' };
        }

        let result = { ok: false, reason: 'invalid' };
        setMeetingsByBench((prev) => {
          const meeting = prev[benchId];
          if (!meeting || getMeetingStatus(meeting) === 'ended') {
            return prev;
          }

          if (meeting.participants.includes(currentUser.id)) {
            result = { ok: true };
            return prev;
          }

          if (meeting.participants.length >= meeting.maxParticipants) {
            result = { ok: false, reason: 'full' };
            return prev;
          }

          result = { ok: true };
          return {
            ...prev,
            [benchId]: {
              ...meeting,
              participants: [...meeting.participants, currentUser.id],
            },
          };
        });

        return result;
      },
      leaveMeeting: (benchId) => {
        if (!isLoggedIn) {
          return { ok: false, reason: 'auth' };
        }

        setMeetingsByBench((prev) => {
          const meeting = prev[benchId];
          if (!meeting || !meeting.participants.includes(currentUser.id)) {
            return prev;
          }

          const nextParticipants = meeting.participants.filter((participant) => participant !== currentUser.id);

          if (nextParticipants.length === 0) {
            const nextState = { ...prev };
            delete nextState[benchId];
            return nextState;
          }

          return {
            ...prev,
            [benchId]: {
              ...meeting,
              ownerId: meeting.ownerId === currentUser.id ? nextParticipants[0] : meeting.ownerId,
              participants: nextParticipants,
            },
          };
        });

        return { ok: true };
      },
      deleteMeeting: (benchId) => {
        if (!isLoggedIn) {
          return { ok: false, reason: 'auth' };
        }

        setMeetingsByBench((prev) => {
          const meeting = prev[benchId];
          if (!meeting || meeting.ownerId !== currentUser.id) {
            return prev;
          }

          const nextState = { ...prev };
          delete nextState[benchId];
          return nextState;
        });

        return { ok: true };
      },
      saveBench: (payload) => {
        const existingBench = payload?.id ? benchesById[payload.id] ?? null : null;
        const nextBench = ensureBenchShape(payload, existingBench);

        if (!nextBench) {
          return { ok: false, reason: 'invalid' };
        }

        setBenches((prev) => {
          const exists = prev.some((bench) => bench.id === nextBench.id);
          if (exists) {
            return prev.map((bench) => (bench.id === nextBench.id ? nextBench : bench));
          }
          return [nextBench, ...prev];
        });

        return { ok: true, benchId: nextBench.id };
      },
      deleteBench: (benchId) => {
        setBenches((prev) => prev.filter((bench) => bench.id !== benchId));
        setFavorites((prev) => prev.filter((favoriteId) => favoriteId !== benchId));
        setMeetingsByBench((prev) => {
          const nextState = { ...prev };
          delete nextState[benchId];
          return nextState;
        });
      },
      resetBenches: () => {
        setBenches(sanitizeBenches(benchList));
        setFavorites([]);
        setMeetingsByBench(buildInitialMeetings());
      },
      saveMeeting: (payload) => {
        const benchId = String(payload?.benchId ?? '');
        const parsedMeeting = ensureMeetingShape(payload, benchesById);

        if (!benchId || !parsedMeeting) {
          return { ok: false, reason: 'invalid' };
        }

        setMeetingsByBench((prev) => {
          const nextState = { ...prev };

          if (payload?.originalBenchId && payload.originalBenchId !== benchId) {
            delete nextState[payload.originalBenchId];
          }

          nextState[benchId] = parsedMeeting;
          return nextState;
        });

        return { ok: true, meetingId: parsedMeeting.id };
      },
      removeMeeting: (benchId) => {
        setMeetingsByBench((prev) => {
          const nextState = { ...prev };
          delete nextState[benchId];
          return nextState;
        });
      },
      getMeeting: getActiveMeeting,
      getStatus: (benchId) => getBenchStatus(getActiveMeeting(benchId)),
      isFavorite: (benchId) => isLoggedIn && favorites.includes(benchId),
      isParticipant: (benchId) => {
        const meeting = getActiveMeeting(benchId);
        return meeting ? meeting.participants.includes(currentUser.id) : false;
      },
      isOwner: (benchId) => {
        const meeting = getActiveMeeting(benchId);
        return meeting ? meeting.ownerId === currentUser.id : false;
      },
    };
  }, [benches, benchesById, currentUser, favorites, isLoggedIn, meetingsByBench]);

  return <BenchesContext.Provider value={value}>{children}</BenchesContext.Provider>;
}

export function useBenches() {
  const context = useContext(BenchesContext);

  if (!context) {
    throw new Error('useBenches must be used inside BenchesProvider');
  }

  return context;
}
