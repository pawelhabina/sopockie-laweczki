import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  calculateRouteDistanceKm,
  estimateDurationLabel,
  initialCommunityRoutes,
  officialRoutes as officialRouteSeed,
  routeCategoryMeta,
} from '../data/routes';
import { useAuth } from './AuthContext';

const RoutesContext = createContext(null);

const OFFICIAL_ROUTES_KEY = 'official-routes-v1';
const COMMUNITY_ROUTES_KEY = 'community-routes-v1';
const ROUTE_FAVORITES_KEY = 'routes-favorites-v1';

function readStorage(key, fallbackValue) {
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

function ensureString(value, fallbackValue = '') {
  const normalized = String(value ?? '').trim();
  return normalized || fallbackValue;
}

function createRouteId(source) {
  return `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizePath(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((point) => {
      if (!Array.isArray(point) || point.length < 2) {
        return null;
      }

      const lat = Number(point[0]);
      const lng = Number(point[1]);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      return [Math.round(lat * 100000) / 100000, Math.round(lng * 100000) / 100000];
    })
    .filter(Boolean);
}

function ensureRoute(candidate, fallbackRoute = null) {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const source = candidate.source === 'official' ? 'official' : 'community';
  const title = ensureString(candidate.title);

  if (!title) {
    return null;
  }

  const path = sanitizePath(candidate.path ?? fallbackRoute?.path);
  if (path.length < 2) {
    return null;
  }

  const distanceKm = Number(candidate.distanceKm);
  const resolvedDistanceKm = Number.isFinite(distanceKm) && distanceKm > 0 ? distanceKm : calculateRouteDistanceKm(path);
  const category = ensureString(candidate.category, fallbackRoute?.category ?? 'piesza');
  const resolvedCategory = routeCategoryMeta[category] ? category : 'piesza';
  const defaultAuthorId = source === 'official' ? 'miasto-sopot' : 'community-user';
  const defaultAuthorName = source === 'official' ? 'Miasto Sopot' : 'Społeczność';

  return {
    id: ensureString(candidate.id, fallbackRoute?.id ?? createRouteId(source)),
    source,
    title,
    category: resolvedCategory,
    distanceKm: resolvedDistanceKm,
    duration: ensureString(candidate.duration, estimateDurationLabel(resolvedDistanceKm, resolvedCategory)),
    difficulty: ensureString(candidate.difficulty, fallbackRoute?.difficulty ?? 'lekka'),
    startPlace: ensureString(candidate.startPlace, fallbackRoute?.startPlace ?? 'Sopot'),
    summary: ensureString(candidate.summary, fallbackRoute?.summary),
    highlights: Array.isArray(candidate.highlights)
      ? candidate.highlights.map((item) => ensureString(item)).filter(Boolean)
      : fallbackRoute?.highlights ?? [],
    authorId: ensureString(candidate.authorId, fallbackRoute?.authorId ?? defaultAuthorId),
    authorName: ensureString(candidate.authorName, fallbackRoute?.authorName ?? defaultAuthorName),
    createdAt: ensureString(candidate.createdAt, fallbackRoute?.createdAt ?? new Date().toISOString()),
    visibility: source === 'official' ? 'public' : candidate.visibility === 'private' ? 'private' : fallbackRoute?.visibility ?? 'public',
    path,
  };
}

function sanitizeRoutes(value, fallbackRoutes) {
  if (!Array.isArray(value)) {
    return fallbackRoutes;
  }

  const parsed = value.map((route) => ensureRoute(route)).filter(Boolean);
  return parsed.length > 0 ? parsed : fallbackRoutes;
}

function sanitizeFavorites(value, validRouteIds) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((routeId) => validRouteIds.has(routeId));
}

export function RoutesProvider({ children }) {
  const { currentUser, isLoggedIn } = useAuth();
  const [officialRoutes, setOfficialRoutes] = useState(() => {
    return sanitizeRoutes(readStorage(OFFICIAL_ROUTES_KEY, officialRouteSeed), officialRouteSeed);
  });
  const [communityRoutes, setCommunityRoutes] = useState(() => {
    return sanitizeRoutes(readStorage(COMMUNITY_ROUTES_KEY, initialCommunityRoutes), initialCommunityRoutes);
  });
  const [favorites, setFavorites] = useState(() => readStorage(ROUTE_FAVORITES_KEY, []));

  const allRoutes = useMemo(() => {
    return [...officialRoutes, ...communityRoutes];
  }, [communityRoutes, officialRoutes]);

  useEffect(() => {
    window.localStorage.setItem(OFFICIAL_ROUTES_KEY, JSON.stringify(officialRoutes));
  }, [officialRoutes]);

  useEffect(() => {
    window.localStorage.setItem(COMMUNITY_ROUTES_KEY, JSON.stringify(communityRoutes));
  }, [communityRoutes]);

  useEffect(() => {
    const validRouteIds = new Set(allRoutes.map((route) => route.id));
    setFavorites((prev) => sanitizeFavorites(prev, validRouteIds));
  }, [allRoutes]);

  useEffect(() => {
    window.localStorage.setItem(ROUTE_FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const value = useMemo(() => {
    const visibleCommunityRoutes = communityRoutes.filter((route) => {
      return route.visibility !== 'private' || route.authorId === currentUser.id;
    });
    const visibleRoutes = [...officialRoutes, ...visibleCommunityRoutes];
    const myRoutes = communityRoutes.filter((route) => route.authorId === currentUser.id);
    const favoriteRoutes = visibleRoutes.filter((route) => favorites.includes(route.id));

    return {
      officialRoutes,
      communityRoutes,
      allRoutes,
      visibleRoutes,
      myRoutes,
      favorites,
      favoriteRoutes,
      toggleFavorite: (routeId) => {
        if (!isLoggedIn) {
          return { ok: false, reason: 'auth' };
        }

        setFavorites((prev) => {
          if (prev.includes(routeId)) {
            return prev.filter((id) => id !== routeId);
          }
          return [...prev, routeId];
        });

        return { ok: true };
      },
      clearFavorites: () => setFavorites([]),
      isFavorite: (routeId) => isLoggedIn && favorites.includes(routeId),
      createRoute: (payload) => {
        if (!isLoggedIn) {
          return { ok: false, reason: 'auth' };
        }

        const nextRoute = ensureRoute(
          {
            ...payload,
            id: createRouteId('community'),
            source: 'community',
            authorId: currentUser.id,
            authorName: currentUser.name,
            createdAt: new Date().toISOString(),
            visibility: payload.visibility,
          },
          null,
        );

        if (!nextRoute) {
          return { ok: false, reason: 'path' };
        }

        setCommunityRoutes((prev) => [nextRoute, ...prev]);
        return { ok: true, routeId: nextRoute.id };
      },
      deleteRoute: (routeId) => {
        setCommunityRoutes((prev) => prev.filter((route) => !(route.id === routeId && route.authorId === currentUser.id)));
      },
      saveRoute: (payload) => {
        const existingRoute = allRoutes.find((route) => route.id === payload?.id) ?? null;
        const nextRoute = ensureRoute(
          {
            ...existingRoute,
            ...payload,
            authorId: payload?.authorId ?? existingRoute?.authorId ?? currentUser.id,
            authorName: payload?.authorName ?? existingRoute?.authorName ?? currentUser.name,
          },
          existingRoute,
        );

        if (!nextRoute) {
          return { ok: false, reason: 'invalid' };
        }

        const updateCollection = (collection) => {
          const exists = collection.some((route) => route.id === nextRoute.id);
          if (!exists) {
            return [nextRoute, ...collection];
          }

          return collection.map((route) => (route.id === nextRoute.id ? nextRoute : route));
        };

        if (nextRoute.source === 'official') {
          setOfficialRoutes((prev) => updateCollection(prev));
          setCommunityRoutes((prev) => prev.filter((route) => route.id !== nextRoute.id));
        } else {
          setCommunityRoutes((prev) => updateCollection(prev));
          setOfficialRoutes((prev) => prev.filter((route) => route.id !== nextRoute.id));
        }

        return { ok: true, routeId: nextRoute.id };
      },
      deleteRouteAdmin: (routeId) => {
        setOfficialRoutes((prev) => prev.filter((route) => route.id !== routeId));
        setCommunityRoutes((prev) => prev.filter((route) => route.id !== routeId));
        setFavorites((prev) => prev.filter((favoriteId) => favoriteId !== routeId));
      },
      resetRoutes: () => {
        setOfficialRoutes(officialRouteSeed);
        setCommunityRoutes(initialCommunityRoutes);
        setFavorites([]);
      },
    };
  }, [allRoutes, communityRoutes, currentUser, favorites, isLoggedIn, officialRoutes]);

  return <RoutesContext.Provider value={value}>{children}</RoutesContext.Provider>;
}

export function useRoutes() {
  const context = useContext(RoutesContext);

  if (!context) {
    throw new Error('useRoutes must be used inside RoutesProvider');
  }

  return context;
}
