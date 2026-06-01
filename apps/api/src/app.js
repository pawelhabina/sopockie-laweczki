import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { benchList, getDefaultBenchPhoto } from '../../../packages/shared/src/data/benches.js';
import {
  calculateRouteDistanceKm,
  estimateDurationLabel,
  initialCommunityRoutes,
  officialRoutes,
  routeCategoryMeta,
} from '../../../packages/shared/src/data/routes.js';

const BUSINESS_APPROVED_STATUS = 'approved';
const DEFAULT_USER = {
  id: 'user-demo',
  name: 'Mieszkaniec Sopotu',
  role: 'USER',
  points: 0,
  settings: {
    fontScale: 1,
    highContrast: false,
  },
};

const benchSchema = z.object({
  type: z.enum(['city', 'business']).default('city'),
  businessCategory: z.string().trim().optional(),
  isPublic: z.boolean().optional(),
  moderationStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  isNonCityConfirmed: z.boolean().optional(),
  name: z.string().trim().min(2),
  address: z.string().trim().min(2),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  capacity: z.coerce.number().int().positive().max(50).default(4),
  description: z.string().trim().optional().default(''),
  photos: z.array(z.string().trim().url()).optional().default([]),
});

const meetingSchema = z.object({
  benchId: z.string().trim().min(1),
  title: z.string().trim().min(3).max(80).default('Spotkanie przy ławce'),
  description: z.string().trim().optional().default(''),
  topic: z.string().trim().optional().default('rozmowa'),
  startAt: z.string().datetime().optional(),
  durationMin: z.coerce.number().int().min(15).max(180).optional(),
  durationMinutes: z.coerce.number().int().min(15).max(180).optional(),
  maxParticipants: z.coerce.number().int().positive().max(50),
  visibility: z.enum(['PRIVATE', 'LOGGED_ONLY']).default('LOGGED_ONLY'),
});

const routeSchema = z.object({
  source: z.enum(['official', 'community']).default('community'),
  title: z.string().trim().min(3).max(120),
  category: z.string().trim().default('piesza'),
  difficulty: z.string().trim().default('lekka'),
  startPlace: z.string().trim().default('Sopot'),
  summary: z.string().trim().default(''),
  highlights: z.array(z.string().trim()).optional().default([]),
  duration: z.string().trim().optional(),
  distanceKm: z.coerce.number().positive().optional(),
  visibility: z.enum(['private', 'logged', 'public']).default('public'),
  path: z.array(z.tuple([z.coerce.number(), z.coerce.number()])).min(2),
});

const reportSchema = z.object({
  targetType: z.enum(['BENCH', 'ROUTE', 'MEETING', 'bench', 'route', 'meeting']),
  targetId: z.string().trim().min(1),
  reason: z.string().trim().min(3).max(500),
});

const sosSchema = z.object({
  contactName: z.string().trim().min(2).max(120),
  contactPhone: z.string().trim().min(3).max(40),
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  displayName: z.string().trim().min(2).max(80).optional(),
  birthYear: z.coerce.number().int().min(1900).max(2026).optional().nullable(),
});

const settingsSchema = z.object({
  fontScale: z.coerce.number().min(1).max(1.3).optional(),
  highContrast: z.boolean().optional(),
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function normalizePhotos(photos) {
  const cleaned = Array.isArray(photos) ? photos.map((photo) => String(photo).trim()).filter(Boolean) : [];
  return cleaned.length > 0 ? cleaned : [getDefaultBenchPhoto()];
}

function buildInitialMeetings() {
  const now = new Date();
  const addMinutes = (minutes) => new Date(now.getTime() + minutes * 60 * 1000).toISOString();

  return [
    {
      id: 'meeting-bench-2',
      benchId: 'bench-2',
      ownerId: 'anna',
      participants: ['anna', 'marek'],
      maxParticipants: 3,
      title: 'Spacer i kawa na Monciaku',
      description: '',
      topic: 'spacery',
      startAt: addMinutes(10),
      durationMinutes: 45,
      visibility: 'LOGGED_ONLY',
      createdAt: now.toISOString(),
    },
    {
      id: 'meeting-bench-4',
      benchId: 'bench-4',
      ownerId: 'ola',
      participants: ['ola', 'jan', 'ewa', 'piotr'],
      maxParticipants: 4,
      title: 'Po wydarzeniu w Ergo Arenie',
      description: '',
      topic: 'kultura',
      startAt: addMinutes(25),
      durationMinutes: 30,
      visibility: 'LOGGED_ONLY',
      createdAt: now.toISOString(),
    },
  ];
}

function createInitialStore() {
  const users = new Map([[DEFAULT_USER.id, clone(DEFAULT_USER)]]);

  return {
    users,
    sessions: new Map(),
    benches: clone(benchList).map((bench) => ({
      ...bench,
      isPublic: bench.isPublic ?? bench.type === 'city',
      moderationStatus: bench.moderationStatus ?? BUSINESS_APPROVED_STATUS,
      isNonCityConfirmed: bench.isNonCityConfirmed ?? false,
      createdByUserId: bench.createdByUserId ?? 'seed',
      createdAt: bench.createdAt ?? nowIso(),
      photos: normalizePhotos(bench.photos),
    })),
    meetings: buildInitialMeetings(),
    routes: [...clone(officialRoutes), ...clone(initialCommunityRoutes)].map((route) => ({
      ...route,
      visibility: route.source === 'official' ? 'public' : route.visibility ?? 'public',
      authorId: route.authorId ?? 'miasto-sopot',
      authorName: route.authorName ?? 'Miasto Sopot',
      createdAt: route.createdAt ?? nowIso(),
    })),
    favorites: {
      benches: new Map(),
      routes: new Map(),
    },
    reports: [],
    sosEvents: [],
  };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    displayName: user.name,
    birthYear: user.birthYear ?? null,
    role: user.role,
    points: user.points,
    settings: user.settings,
  };
}

function getUserFromRequest(req, store) {
  const authHeader = req.get('authorization') ?? '';
  const [, token] = authHeader.match(/^Bearer\s+(.+)$/i) ?? [];

  if (!token) {
    return null;
  }

  const userId = store.sessions.get(token);
  return userId ? store.users.get(userId) ?? null : null;
}

function requireAuth(store) {
  return (req, res, next) => {
    const user = getUserFromRequest(req, store);

    if (!user) {
      res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Ten endpoint wymaga mock logowania.' });
      return;
    }

    req.user = user;
    next();
  };
}

function optionalAuth(store) {
  return (req, _res, next) => {
    req.user = getUserFromRequest(req, store);
    next();
  };
}

function errorResponse(res, status, code, message, details) {
  res.status(status).json({ error: code, message, details });
}

function validate(schema, payload) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    return { ok: false, error: result.error.flatten() };
  }

  return { ok: true, data: result.data };
}

function getMeetingEndAt(meeting) {
  return new Date(new Date(meeting.startAt).getTime() + meeting.durationMinutes * 60 * 1000);
}

function getMeetingStatus(meeting) {
  const now = new Date();
  const startAt = new Date(meeting.startAt);
  const endAt = getMeetingEndAt(meeting);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
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

function intervalsOverlap(leftStart, leftEnd, rightStart, rightEnd) {
  return leftStart < rightEnd && rightStart < leftEnd;
}

function findMeetingConflict(store, benchId, startAt, durationMinutes, exceptMeetingId = null) {
  const start = new Date(startAt);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return (
    store.meetings.find((meeting) => {
      if (meeting.id === exceptMeetingId || meeting.benchId !== benchId || getMeetingStatus(meeting) === 'ended') {
        return false;
      }

      return intervalsOverlap(start, end, new Date(meeting.startAt), getMeetingEndAt(meeting));
    }) ?? null
  );
}

function benchStatus(store, benchId) {
  const meeting = store.meetings.find((item) => item.benchId === benchId && getMeetingStatus(item) !== 'ended');

  if (!meeting) {
    return 'free';
  }

  return meeting.participants.length < meeting.maxParticipants ? 'joinable' : 'occupied';
}

function canSeeBench(user, bench) {
  if (user) {
    return true;
  }

  return bench.type !== 'business' || (bench.isPublic === true && bench.moderationStatus === BUSINESS_APPROVED_STATUS);
}

function canSeeRoute(user, route) {
  if (route.source === 'official' || route.visibility === 'public') {
    return true;
  }

  if (!user) {
    return false;
  }

  return route.visibility === 'logged' || route.authorId === user.id;
}

function normalizeRoute(input, user) {
  const source = input.source === 'official' && user?.role === 'ADMIN' ? 'official' : 'community';
  const category = routeCategoryMeta[input.category] ? input.category : 'piesza';
  const distanceKm = input.distanceKm ?? calculateRouteDistanceKm(input.path);

  return {
    id: `${source}-${Date.now()}-${randomUUID().slice(0, 8)}`,
    source,
    title: input.title,
    category,
    distanceKm,
    duration: input.duration || estimateDurationLabel(distanceKm, category),
    difficulty: input.difficulty,
    startPlace: input.startPlace,
    summary: input.summary,
    highlights: input.highlights.filter(Boolean),
    authorId: source === 'official' ? 'miasto-sopot' : user.id,
    authorName: source === 'official' ? 'Miasto Sopot' : user.name,
    createdAt: nowIso(),
    visibility: source === 'official' ? 'public' : input.visibility,
    path: input.path.map(([lat, lng]) => [Math.round(lat * 100000) / 100000, Math.round(lng * 100000) / 100000]),
  };
}

function createApp({ store = createInitialStore() } = {}) {
  const app = express();
  const auth = requireAuth(store);

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'sopockie-laweczki-api',
      storage: 'memory',
      qb: 'disabled',
      timestamp: nowIso(),
    });
  });

  app.post('/api/auth/mock-login', (req, res) => {
    const name = String(req.body?.name ?? req.body?.displayName ?? DEFAULT_USER.name).trim() || DEFAULT_USER.name;
    const id = String(req.body?.userId ?? req.body?.id ?? DEFAULT_USER.id).trim() || DEFAULT_USER.id;
    const existing = store.users.get(id);
    const user = {
      ...clone(DEFAULT_USER),
      ...existing,
      id,
      name,
    };
    const token = `mock.${randomUUID()}`;

    store.users.set(id, user);
    store.sessions.set(token, id);
    res.status(201).json({ token, user: publicUser(user) });
  });

  app.post('/api/auth/logout', auth, (req, res) => {
    const authHeader = req.get('authorization') ?? '';
    const [, token] = authHeader.match(/^Bearer\s+(.+)$/i) ?? [];

    if (token) {
      store.sessions.delete(token);
    }

    res.status(204).send();
  });

  app.get('/api/me', auth, (req, res) => {
    res.json({ user: publicUser(req.user) });
  });

  app.patch('/api/me/profile', auth, (req, res) => {
    const parsed = validate(profileSchema, req.body);
    if (!parsed.ok) {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'Nieprawidłowe dane profilu.', parsed.error);
      return;
    }

    const nextName = parsed.data.displayName ?? parsed.data.name ?? req.user.name;
    req.user.name = nextName;
    req.user.birthYear = parsed.data.birthYear ?? req.user.birthYear ?? null;
    store.users.set(req.user.id, req.user);
    res.json({ user: publicUser(req.user) });
  });

  app.patch('/api/me/settings', auth, (req, res) => {
    const parsed = validate(settingsSchema, req.body);
    if (!parsed.ok) {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'Nieprawidłowe ustawienia.', parsed.error);
      return;
    }

    req.user.settings = {
      ...req.user.settings,
      ...parsed.data,
    };
    store.users.set(req.user.id, req.user);
    res.json({ user: publicUser(req.user) });
  });

  app.get('/api/benches', optionalAuth(store), (req, res) => {
    const query = String(req.query.q ?? '').trim().toLowerCase();
    const type = String(req.query.type ?? '').trim();
    const bbox = String(req.query.bbox ?? '').split(',').map(Number);
    const hasBbox = bbox.length === 4 && bbox.every(Number.isFinite);
    const [minLng, minLat, maxLng, maxLat] = bbox;

    const benches = store.benches
      .filter((bench) => canSeeBench(req.user, bench))
      .filter((bench) => (type ? bench.type === type : true))
      .filter((bench) => {
        if (!query) {
          return true;
        }

        return [bench.name, bench.address, bench.description].some((value) => String(value ?? '').toLowerCase().includes(query));
      })
      .filter((bench) => {
        if (!hasBbox) {
          return true;
        }

        return bench.lng >= minLng && bench.lng <= maxLng && bench.lat >= minLat && bench.lat <= maxLat;
      })
      .map((bench) => ({
        ...bench,
        status: benchStatus(store, bench.id),
      }));

    res.json({ benches });
  });

  app.get('/api/benches/:id', optionalAuth(store), (req, res) => {
    const bench = store.benches.find((item) => item.id === req.params.id);

    if (!bench || !canSeeBench(req.user, bench)) {
      errorResponse(res, 404, 'NOT_FOUND', 'Ławka nie istnieje albo nie jest widoczna.');
      return;
    }

    res.json({
      bench: {
        ...bench,
        status: benchStatus(store, bench.id),
      },
    });
  });

  app.post('/api/benches', auth, (req, res) => {
    const parsed = validate(benchSchema, req.body);
    if (!parsed.ok) {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'Nieprawidłowe dane ławki.', parsed.error);
      return;
    }

    const bench = {
      ...parsed.data,
      id: `bench-${Date.now()}-${randomUUID().slice(0, 8)}`,
      photos: normalizePhotos(parsed.data.photos),
      moderationStatus: parsed.data.type === 'business' ? parsed.data.moderationStatus ?? 'pending' : BUSINESS_APPROVED_STATUS,
      isPublic: parsed.data.type === 'city' ? true : parsed.data.isPublic === true,
      isNonCityConfirmed: parsed.data.type === 'business' ? parsed.data.isNonCityConfirmed === true : false,
      createdByUserId: req.user.id,
      createdAt: nowIso(),
    };

    req.user.points += 10;
    store.benches.unshift(bench);
    res.status(201).json({ bench, user: publicUser(req.user) });
  });

  app.post('/api/benches/:id/favorite', auth, (req, res) => {
    if (!store.benches.some((bench) => bench.id === req.params.id)) {
      errorResponse(res, 404, 'NOT_FOUND', 'Ławka nie istnieje.');
      return;
    }

    const favorites = store.favorites.benches.get(req.user.id) ?? new Set();
    favorites.add(req.params.id);
    store.favorites.benches.set(req.user.id, favorites);
    res.json({ favorites: Array.from(favorites) });
  });

  app.delete('/api/benches/:id/favorite', auth, (req, res) => {
    const favorites = store.favorites.benches.get(req.user.id) ?? new Set();
    favorites.delete(req.params.id);
    store.favorites.benches.set(req.user.id, favorites);
    res.json({ favorites: Array.from(favorites) });
  });

  app.get('/api/benches/:id/meeting-availability', auth, (req, res) => {
    const bench = store.benches.find((item) => item.id === req.params.id);
    if (!bench) {
      errorResponse(res, 404, 'NOT_FOUND', 'Ławka nie istnieje.');
      return;
    }

    const startAt = String(req.query.startAt ?? nowIso());
    const durationMinutes = Number(req.query.durationMin ?? req.query.durationMinutes ?? 30);
    const conflict = findMeetingConflict(store, bench.id, startAt, durationMinutes);

    res.json({
      canCreate: !conflict,
      meetingId: conflict?.id ?? null,
    });
  });

  app.get('/api/meetings', auth, (req, res) => {
    const status = String(req.query.status ?? 'ALL').toUpperCase();
    const meetings = store.meetings
      .map((meeting) => ({ ...meeting, status: getMeetingStatus(meeting), endAt: getMeetingEndAt(meeting).toISOString() }))
      .filter((meeting) => meeting.status !== 'ended')
      .filter((meeting) => {
        if (status === 'MINE') {
          return meeting.participants.includes(req.user.id) || meeting.ownerId === req.user.id;
        }

        if (status === 'UPCOMING') {
          return meeting.status === 'upcoming';
        }

        return true;
      });

    res.json({ meetings });
  });

  app.get('/api/meetings/:id', auth, (req, res) => {
    const meeting = store.meetings.find((item) => item.id === req.params.id);

    if (!meeting || getMeetingStatus(meeting) === 'ended') {
      errorResponse(res, 404, 'NOT_FOUND', 'Spotkanie nie istnieje albo już się zakończyło.');
      return;
    }

    res.json({ meeting: { ...meeting, status: getMeetingStatus(meeting), endAt: getMeetingEndAt(meeting).toISOString() } });
  });

  app.post('/api/meetings', auth, (req, res) => {
    const parsed = validate(meetingSchema, req.body);
    if (!parsed.ok) {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'Nieprawidłowe dane spotkania.', parsed.error);
      return;
    }

    const bench = store.benches.find((item) => item.id === parsed.data.benchId);
    if (!bench) {
      errorResponse(res, 404, 'NOT_FOUND', 'Ławka nie istnieje.');
      return;
    }

    const durationMinutes = parsed.data.durationMin ?? parsed.data.durationMinutes ?? 30;
    const startAt = parsed.data.startAt ?? nowIso();
    const conflict = findMeetingConflict(store, bench.id, startAt, durationMinutes);
    if (conflict) {
      errorResponse(res, 409, 'BENCH_OCCUPIED', 'Wybrana ławka jest zajęta w podanym terminie.', {
        meetingId: conflict.id,
      });
      return;
    }

    const meeting = {
      id: `meeting-${Date.now()}-${randomUUID().slice(0, 8)}`,
      benchId: bench.id,
      ownerId: req.user.id,
      participants: [req.user.id],
      maxParticipants: parsed.data.maxParticipants,
      title: parsed.data.title,
      description: parsed.data.description,
      topic: parsed.data.topic,
      startAt,
      durationMinutes,
      visibility: parsed.data.visibility,
      createdAt: nowIso(),
    };

    store.meetings.unshift(meeting);
    res.status(201).json({ meeting });
  });

  app.post('/api/meetings/:id/join', auth, (req, res) => {
    const meeting = store.meetings.find((item) => item.id === req.params.id);

    if (!meeting || getMeetingStatus(meeting) === 'ended') {
      errorResponse(res, 404, 'NOT_FOUND', 'Spotkanie nie istnieje albo już się zakończyło.');
      return;
    }

    if (!meeting.participants.includes(req.user.id)) {
      if (meeting.participants.length >= meeting.maxParticipants) {
        errorResponse(res, 409, 'MEETING_FULL', 'Spotkanie ma już komplet uczestników.');
        return;
      }

      meeting.participants.push(req.user.id);
    }

    res.json({ meeting });
  });

  app.post('/api/meetings/:id/leave', auth, (req, res) => {
    const meetingIndex = store.meetings.findIndex((item) => item.id === req.params.id);
    const meeting = store.meetings[meetingIndex];

    if (!meeting) {
      errorResponse(res, 404, 'NOT_FOUND', 'Spotkanie nie istnieje.');
      return;
    }

    meeting.participants = meeting.participants.filter((participant) => participant !== req.user.id);

    if (meeting.participants.length === 0) {
      store.meetings.splice(meetingIndex, 1);
      res.status(204).send();
      return;
    }

    if (meeting.ownerId === req.user.id) {
      meeting.ownerId = meeting.participants[0];
    }

    res.json({ meeting });
  });

  app.get('/api/routes', optionalAuth(store), (req, res) => {
    const tab = String(req.query.tab ?? 'ALL').toUpperCase();
    const routes = store.routes
      .filter((route) => canSeeRoute(req.user, route))
      .filter((route) => {
        if (tab === 'OFFICIAL') {
          return route.source === 'official';
        }

        if (tab === 'COMMUNITY') {
          return route.source === 'community';
        }

        if (tab === 'MINE') {
          return req.user && route.authorId === req.user.id;
        }

        return true;
      });

    res.json({ routes });
  });

  app.get('/api/routes/:id', optionalAuth(store), (req, res) => {
    const route = store.routes.find((item) => item.id === req.params.id);

    if (!route || !canSeeRoute(req.user, route)) {
      errorResponse(res, 404, 'NOT_FOUND', 'Trasa nie istnieje albo nie jest widoczna.');
      return;
    }

    res.json({ route });
  });

  app.post('/api/routes', auth, (req, res) => {
    const parsed = validate(routeSchema, req.body);
    if (!parsed.ok) {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'Nieprawidłowe dane trasy.', parsed.error);
      return;
    }

    const route = normalizeRoute(parsed.data, req.user);
    store.routes.unshift(route);
    res.status(201).json({ route });
  });

  app.post('/api/routes/:id/favorite', auth, (req, res) => {
    if (!store.routes.some((route) => route.id === req.params.id && canSeeRoute(req.user, route))) {
      errorResponse(res, 404, 'NOT_FOUND', 'Trasa nie istnieje albo nie jest widoczna.');
      return;
    }

    const favorites = store.favorites.routes.get(req.user.id) ?? new Set();
    favorites.add(req.params.id);
    store.favorites.routes.set(req.user.id, favorites);
    res.json({ favorites: Array.from(favorites) });
  });

  app.delete('/api/routes/:id/favorite', auth, (req, res) => {
    const favorites = store.favorites.routes.get(req.user.id) ?? new Set();
    favorites.delete(req.params.id);
    store.favorites.routes.set(req.user.id, favorites);
    res.json({ favorites: Array.from(favorites) });
  });

  app.post('/api/reports', auth, (req, res) => {
    const parsed = validate(reportSchema, req.body);
    if (!parsed.ok) {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'Nieprawidłowe zgłoszenie.', parsed.error);
      return;
    }

    const report = {
      id: `report-${Date.now()}-${randomUUID().slice(0, 8)}`,
      reporterUserId: req.user.id,
      targetType: parsed.data.targetType.toUpperCase(),
      targetId: parsed.data.targetId,
      reason: parsed.data.reason,
      createdAt: nowIso(),
    };

    store.reports.unshift(report);
    res.status(201).json({ report });
  });

  app.post('/api/sos', auth, (req, res) => {
    const parsed = validate(sosSchema, req.body);
    if (!parsed.ok) {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'Nieprawidłowe dane SOS.', parsed.error);
      return;
    }

    const event = {
      id: `sos-${Date.now()}-${randomUUID().slice(0, 8)}`,
      userId: req.user.id,
      contactName: parsed.data.contactName,
      contactPhone: parsed.data.contactPhone,
      createdAt: nowIso(),
    };

    store.sosEvents.unshift(event);
    res.status(201).json({ event });
  });

  app.use('/api', (_req, res) => {
    errorResponse(res, 404, 'NOT_FOUND', 'Endpoint API nie istnieje.');
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    errorResponse(res, 500, 'INTERNAL_ERROR', 'Wewnętrzny błąd API.');
  });

  return app;
}

export { createApp, createInitialStore };
