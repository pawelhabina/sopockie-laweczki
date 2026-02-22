import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const UiPrefsContext = createContext(null);

const FONT_SCALE_KEY = 'ui-font-scale';
const CONTRAST_KEY = 'ui-contrast';

export function UiPrefsProvider({ children }) {
  const [fontScale, setFontScale] = useState(() => {
    const saved = window.localStorage.getItem(FONT_SCALE_KEY);
    if (saved === '1.15' || saved === '1.3') {
      return Number(saved);
    }
    return 1;
  });

  const [highContrast, setHighContrast] = useState(() => {
    return window.localStorage.getItem(CONTRAST_KEY) === '1';
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale));
    window.localStorage.setItem(FONT_SCALE_KEY, String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.dataset.contrast = 'high';
      window.localStorage.setItem(CONTRAST_KEY, '1');
      return;
    }

    delete document.documentElement.dataset.contrast;
    window.localStorage.removeItem(CONTRAST_KEY);
  }, [highContrast]);

  const value = useMemo(
    () => ({
      fontScale,
      highContrast,
      setFontScale,
      toggleContrast: () => setHighContrast((prev) => !prev),
    }),
    [fontScale, highContrast],
  );

  return <UiPrefsContext.Provider value={value}>{children}</UiPrefsContext.Provider>;
}

export function useUiPrefs() {
  const ctx = useContext(UiPrefsContext);
  if (!ctx) {
    throw new Error('useUiPrefs must be used inside UiPrefsProvider');
  }
  return ctx;
}
