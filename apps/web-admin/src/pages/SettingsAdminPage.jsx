import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@shared/context/AuthContext.jsx';
import { useUiPrefs } from '@shared/context/UiPrefsContext.jsx';
import { useBenches } from '@shared/context/BenchesContext.jsx';
import { useRoutes } from '@shared/context/RoutesContext.jsx';

export function SettingsAdminPage() {
  const { profile, isLoggedIn, setProfile, setLoginState, resetProfile } = useAuth();
  const { fontScale, highContrast, setFontScale, setHighContrast, resetUiPrefs } = useUiPrefs();
  const { clearFavorites: clearBenchFavorites, favorites: benchFavorites } = useBenches();
  const { clearFavorites: clearRouteFavorites, favorites: routeFavorites } = useRoutes();
  const [profileForm, setProfileForm] = useState(() => ({
    id: profile.id,
    name: profile.name,
  }));

  useEffect(() => {
    setProfileForm({
      id: profile.id,
      name: profile.name,
    });
  }, [profile.id, profile.name]);

  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="admin-panel p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Konto i sesja</p>
        <h2 className="mt-2 font-heading text-3xl">Tożsamość użytkownika</h2>

        <div className="mt-5 grid gap-4">
          <label className="admin-label">
            User ID
            <input
              value={profileForm.id}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, id: event.target.value }))}
              className="admin-input"
            />
          </label>

          <label className="admin-label">
            Nazwa wyświetlana
            <input
              value={profileForm.name}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
              className="admin-input"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setProfile(profileForm)}
              className="admin-btn admin-btn-primary"
            >
              Zapisz profil
            </button>

            <button
              type="button"
              onClick={() => setLoginState(!isLoggedIn)}
              className="admin-btn admin-btn-secondary"
            >
              Sesja: {isLoggedIn ? 'wyloguj' : 'zaloguj'}
            </button>

            <button type="button" onClick={resetProfile} className="admin-btn admin-btn-danger">
              <FontAwesomeIcon icon={faRotateLeft} />
              Reset profilu
            </button>
          </div>
        </div>
      </div>

      <div className="admin-panel p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">UI i preferencje</p>
        <h2 className="mt-2 font-heading text-3xl">Ustawienia lokalne aplikacji</h2>

        <div className="mt-5 grid gap-5">
          <div className="rounded-2xl border border-[var(--admin-outline)] bg-white/80 p-4">
            <p className="text-sm font-bold">Skala fontu</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 1.1].map((scale) => (
                <button
                  key={scale}
                  type="button"
                  onClick={() => setFontScale(scale)}
                  className={`admin-btn ${
                    fontScale === scale ? 'admin-btn-primary' : 'admin-btn-secondary'
                  }`}
                >
                  {Math.round(scale * 100)}%
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--admin-outline)] bg-white/80 p-4">
            <p className="text-sm font-bold">Kontrast</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setHighContrast(false)}
                className={`admin-btn ${!highContrast ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setHighContrast(true)}
                className={`admin-btn ${highContrast ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                Wysoki kontrast
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--admin-outline)] bg-white/80 p-4">
            <p className="text-sm font-bold">Ulubione</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={clearBenchFavorites} className="admin-btn admin-btn-secondary">
                Wyczyść ławki ({benchFavorites.length})
              </button>
              <button type="button" onClick={clearRouteFavorites} className="admin-btn admin-btn-secondary">
                Wyczyść trasy ({routeFavorites.length})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={resetUiPrefs} className="admin-btn admin-btn-secondary">
              <FontAwesomeIcon icon={faRotateLeft} />
              Reset UI
            </button>
            <button
              type="button"
              onClick={() => {
                clearBenchFavorites();
                clearRouteFavorites();
              }}
              className="admin-btn admin-btn-danger"
            >
              <FontAwesomeIcon icon={faTrashCan} />
              Wyczyść ulubione
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
