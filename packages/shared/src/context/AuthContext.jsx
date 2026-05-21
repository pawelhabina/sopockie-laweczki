import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const AUTH_PROFILE_KEY = 'auth-profile-v1';
const AUTH_SESSION_KEY = 'auth-session-v1';

export const guestUser = {
  id: 'guest-user',
  name: 'Gość',
};

function sanitizeName(value) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ');

  return normalized || 'Mieszkaniec Sopotu';
}

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

function createDefaultProfile() {
  return {
    id: `user-${Date.now()}`,
    name: 'Mieszkaniec Sopotu',
  };
}

function ensureProfile(candidate, fallbackProfile = createDefaultProfile()) {
  if (!candidate || typeof candidate !== 'object') {
    return fallbackProfile;
  }

  const id = typeof candidate.id === 'string' && candidate.id.trim() ? candidate.id.trim() : fallbackProfile.id;
  return {
    id,
    name: sanitizeName(candidate.name ?? fallbackProfile.name),
  };
}

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    return ensureProfile(readStorage(AUTH_PROFILE_KEY, null));
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return readStorage(AUTH_SESSION_KEY, false) === true;
  });

  useEffect(() => {
    window.localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  const value = useMemo(() => {
    return {
      isLoggedIn,
      profile,
      currentUser: isLoggedIn ? profile : guestUser,
      login: (name) => {
        setProfile((prev) => ensureProfile({ ...prev, name }, prev));
        setIsLoggedIn(true);
      },
      logout: () => setIsLoggedIn(false),
      updateProfileName: (name) => {
        setProfile((prev) => ensureProfile({ ...prev, name }, prev));
      },
      setProfile: (candidate) => {
        setProfile((prev) => ensureProfile(candidate, prev));
      },
      setLoginState: (nextState) => setIsLoggedIn(nextState === true),
      resetProfile: () => {
        setProfile(createDefaultProfile());
        setIsLoggedIn(false);
      },
    };
  }, [isLoggedIn, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
