import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { benchList } from '@/data/benches';

const BenchesContext = createContext(null);

const FAVORITES_KEY = 'benches-favorites-v1';
const MEETINGS_KEY = 'benches-meetings-v1';

const defaultCurrentUser = {
  id: 'local-user',
  name: 'Ty',
};

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

function buildInitialMeetings() {
  return {
    'bench-2': {
      id: 'meeting-bench-2',
      benchId: 'bench-2',
      ownerId: 'anna',
      participants: ['anna', 'marek'],
      maxParticipants: 3,
      createdAt: '2026-03-01T10:00:00.000Z',
    },
    'bench-4': {
      id: 'meeting-bench-4',
      benchId: 'bench-4',
      ownerId: 'ola',
      participants: ['ola', 'jan', 'ewa', 'piotr'],
      maxParticipants: 4,
      createdAt: '2026-03-04T08:30:00.000Z',
    },
  };
}

function ensureMeetingShape(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  if (!candidate.benchId || !Array.isArray(candidate.participants)) {
    return null;
  }

  return {
    id: String(candidate.id ?? `meeting-${candidate.benchId}`),
    benchId: String(candidate.benchId),
    ownerId: String(candidate.ownerId ?? ''),
    participants: candidate.participants.map((participant) => String(participant)),
    maxParticipants: Number(candidate.maxParticipants ?? 4),
    createdAt: String(candidate.createdAt ?? new Date().toISOString()),
  };
}

function sanitizeMeetingsMap(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value).reduce((acc, [benchId, meeting]) => {
    const parsedMeeting = ensureMeetingShape(meeting);
    if (parsedMeeting) {
      acc[benchId] = parsedMeeting;
    }
    return acc;
  }, {});
}

function sanitizeFavorites(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const validBenchIds = new Set(benchList.map((bench) => bench.id));
  return value.filter((benchId) => validBenchIds.has(benchId));
}

export function getBenchStatus(meeting) {
  if (!meeting) {
    return 'free';
  }

  if (meeting.participants.length < meeting.maxParticipants) {
    return 'joinable';
  }

  return 'occupied';
}

export function BenchesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const persisted = readJsonStorage(FAVORITES_KEY, []);
    return sanitizeFavorites(persisted);
  });

  const [meetingsByBench, setMeetingsByBench] = useState(() => {
    const persisted = readJsonStorage(MEETINGS_KEY, null);
    if (persisted) {
      return sanitizeMeetingsMap(persisted);
    }
    return buildInitialMeetings();
  });

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetingsByBench));
  }, [meetingsByBench]);

  const benchesById = useMemo(() => {
    return benchList.reduce((acc, bench) => {
      acc[bench.id] = bench;
      return acc;
    }, {});
  }, []);

  const toggleFavorite = (benchId) => {
    setFavorites((prev) => {
      if (prev.includes(benchId)) {
        return prev.filter((id) => id !== benchId);
      }
      return [...prev, benchId];
    });
  };

  const createMeeting = (benchId) => {
    const bench = benchesById[benchId];
    if (!bench) {
      return;
    }

    setMeetingsByBench((prev) => {
      if (prev[benchId]) {
        return prev;
      }

      return {
        ...prev,
        [benchId]: {
          id: `meeting-${Date.now()}`,
          benchId,
          ownerId: defaultCurrentUser.id,
          participants: [defaultCurrentUser.id],
          maxParticipants: bench.capacity,
          createdAt: new Date().toISOString(),
        },
      };
    });
  };

  const joinMeeting = (benchId) => {
    setMeetingsByBench((prev) => {
      const meeting = prev[benchId];
      if (!meeting) {
        return prev;
      }

      if (meeting.participants.includes(defaultCurrentUser.id)) {
        return prev;
      }

      if (meeting.participants.length >= meeting.maxParticipants) {
        return prev;
      }

      return {
        ...prev,
        [benchId]: {
          ...meeting,
          participants: [...meeting.participants, defaultCurrentUser.id],
        },
      };
    });
  };

  const leaveMeeting = (benchId) => {
    setMeetingsByBench((prev) => {
      const meeting = prev[benchId];
      if (!meeting || !meeting.participants.includes(defaultCurrentUser.id)) {
        return prev;
      }

      const nextParticipants = meeting.participants.filter((participant) => participant !== defaultCurrentUser.id);

      if (nextParticipants.length === 0) {
        const nextState = { ...prev };
        delete nextState[benchId];
        return nextState;
      }

      const nextOwnerId = meeting.ownerId === defaultCurrentUser.id ? nextParticipants[0] : meeting.ownerId;
      return {
        ...prev,
        [benchId]: {
          ...meeting,
          ownerId: nextOwnerId,
          participants: nextParticipants,
        },
      };
    });
  };

  const deleteMeeting = (benchId) => {
    setMeetingsByBench((prev) => {
      const meeting = prev[benchId];
      if (!meeting || meeting.ownerId !== defaultCurrentUser.id) {
        return prev;
      }

      const nextState = { ...prev };
      delete nextState[benchId];
      return nextState;
    });
  };

  const value = useMemo(() => {
    return {
      currentUser: defaultCurrentUser,
      benches: benchList,
      meetingsByBench,
      favorites,
      toggleFavorite,
      createMeeting,
      joinMeeting,
      leaveMeeting,
      deleteMeeting,
      getMeeting: (benchId) => meetingsByBench[benchId] ?? null,
      getStatus: (benchId) => getBenchStatus(meetingsByBench[benchId]),
      isFavorite: (benchId) => favorites.includes(benchId),
      isParticipant: (benchId) => {
        const meeting = meetingsByBench[benchId];
        return meeting ? meeting.participants.includes(defaultCurrentUser.id) : false;
      },
      isOwner: (benchId) => {
        const meeting = meetingsByBench[benchId];
        return meeting ? meeting.ownerId === defaultCurrentUser.id : false;
      },
    };
  }, [favorites, meetingsByBench]);

  return <BenchesContext.Provider value={value}>{children}</BenchesContext.Provider>;
}

export function useBenches() {
  const context = useContext(BenchesContext);

  if (!context) {
    throw new Error('useBenches must be used inside BenchesProvider');
  }

  return context;
}
