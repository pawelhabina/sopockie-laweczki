import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUiPrefs } from '@/context/UiPrefsContext';
import { useAuth } from '@/context/AuthContext';
import { useBenches } from '@/context/BenchesContext';
import { useReports } from '@/context/ReportsContext';
import { useRoutes } from '@/context/RoutesContext';

export function ProfilePage() {
  const { fontScale, highContrast, setFontScale, setHighContrast } = useUiPrefs();
  const { isLoggedIn, currentUser, login, logout, updateProfileName } = useAuth();
  const { favoriteBenches, followedBenches, meetingNotifications, visibleMeetings } = useBenches();
  const { myReports } = useReports();
  const { myRoutes, favoriteRoutes } = useRoutes();
  const [activeTab, setActiveTab] = useState('account');
  const [displayName, setDisplayName] = useState(currentUser.name === 'Gość' ? 'Mieszkaniec Sopotu' : currentUser.name);

  useEffect(() => {
    setDisplayName(currentUser.name === 'Gość' ? 'Mieszkaniec Sopotu' : currentUser.name);
  }, [currentUser.name]);

  return (
    <section className="flex min-h-[68vh] flex-col gap-4">
      <div className="panel p-5">
        <h1 className="font-heading text-2xl leading-tight">Profil</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Tu sterujesz prostym kontem lokalnym, które odblokowuje dodawanie własnych tras.
        </p>
      </div>

      <div className="panel p-5">
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--outline-soft)] bg-white p-1 text-sm font-bold">
          {[
            { id: 'account', label: 'Konto' },
            { id: 'activity', label: 'Aktywność' },
            { id: 'settings', label: 'Ustawienia' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-2 py-2 ${activeTab === tab.id ? 'cta-btn' : 'text-[var(--text-muted)]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'account' && (
          <div className="mt-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold">Konto</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Status: {isLoggedIn ? 'zalogowany użytkownik' : 'gość'}
                </p>
              </div>

              {isLoggedIn && (
                <span className="rounded-full border border-[#1f9d55]/35 bg-[#e8f8ef] px-3 py-1 text-xs font-bold text-[#0b5d33]">
                  Aktywne konto
                </span>
              )}
            </div>

            <label className="mt-4 grid gap-2 text-sm font-bold">
              Nazwa wyświetlana
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold text-[var(--text-main)] outline-none"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {!isLoggedIn && (
                <button type="button" onClick={() => login(displayName)} className="cta-btn rounded-xl px-4 py-2 text-sm font-bold">
                  Zaloguj lokalnie
                </button>
              )}

              {isLoggedIn && (
                <>
                  <button
                    type="button"
                    onClick={() => updateProfileName(displayName)}
                    className="cta-btn rounded-xl px-4 py-2 text-sm font-bold"
                  >
                    Zapisz nazwę
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-xl border border-[var(--outline-soft)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-muted)]"
                  >
                    Wyloguj
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="mt-4">
            <p className="text-sm font-bold">Aktywność</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--outline-soft)] bg-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)]">Użytkownik</p>
                <p className="mt-2 font-heading text-2xl">{currentUser.name}</p>
              </div>
              <div className="rounded-2xl border border-[var(--outline-soft)] bg-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)]">Moje trasy</p>
                <p className="mt-2 font-heading text-2xl">{myRoutes.length}</p>
              </div>
              <div className="rounded-2xl border border-[var(--outline-soft)] bg-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)]">Ulubione ławki</p>
                <p className="mt-2 font-heading text-2xl">{favoriteBenches.length}</p>
              </div>
              <div className="rounded-2xl border border-[var(--outline-soft)] bg-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)]">Ulubione trasy</p>
                <p className="mt-2 font-heading text-2xl">{favoriteRoutes.length}</p>
              </div>
            </div>

            {isLoggedIn && (
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-[var(--outline-soft)] bg-[#f8fbfa] p-4">
                  <p className="text-sm font-bold">Moje spotkania</p>
                  <div className="mt-2 grid gap-2">
                    {visibleMeetings
                      .filter((meeting) => meeting.participants.includes(currentUser.id))
                      .slice(0, 3)
                      .map((meeting) => (
                        <Link
                          key={meeting.id}
                          to={`/meetings`}
                          className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-muted)]"
                        >
                          {meeting.title}
                        </Link>
                      ))}
                    {visibleMeetings.filter((meeting) => meeting.participants.includes(currentUser.id)).length === 0 && (
                      <p className="text-sm text-[var(--text-muted)]">Nie uczestniczysz jeszcze w spotkaniach.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--outline-soft)] bg-[#f8fbfa] p-4">
                  <p className="text-sm font-bold">Obserwowane ławki i powiadomienia</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Obserwowane: {followedBenches.length}. Nowe powiadomienia: {meetingNotifications.length}.
                  </p>
                  <div className="mt-2 grid gap-2">
                    {meetingNotifications.slice(0, 3).map((notification) => (
                      <Link
                        key={notification.id}
                        to={`/benches?benchId=${notification.benchId}`}
                        className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-muted)]"
                      >
                        {notification.message}
                      </Link>
                    ))}
                    {meetingNotifications.length === 0 && (
                      <p className="text-sm text-[var(--text-muted)]">Brak nowych powiadomień.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--outline-soft)] bg-[#f8fbfa] p-4">
                  <p className="text-sm font-bold">Moje zgłoszenia</p>
                  <div className="mt-2 grid gap-2">
                    {myReports.slice(0, 3).map((report) => (
                      <div key={report.id} className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm">
                        <p className="font-bold">{report.targetLabel}</p>
                        <p className="text-xs text-[var(--text-muted)]">Status: przyjęte</p>
                      </div>
                    ))}
                    {myReports.length === 0 && (
                      <p className="text-sm text-[var(--text-muted)]">Nie masz jeszcze zgłoszeń.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-bold">Ustawienia</p>
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-20 text-sm font-semibold text-[var(--text-muted)]">Kontrast:</span>
                {[
                  { label: 'normalny', value: false },
                  { label: 'wysoki', value: true },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setHighContrast(option.value)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                      highContrast === option.value
                        ? 'cta-btn border-transparent'
                        : 'border-[var(--outline-soft)] bg-white text-[var(--text-muted)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-20 text-sm font-semibold text-[var(--text-muted)]">Rozmiar:</span>
                {[1, 1.1].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setFontScale(scale)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                      fontScale === scale
                        ? 'cta-btn border-transparent'
                        : 'border-[var(--outline-soft)] bg-white text-[var(--text-muted)]'
                    }`}
                  >
                    {Math.round(scale * 100)}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
