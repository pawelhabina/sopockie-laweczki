import { useUiPrefs } from '@/context/UiPrefsContext';

export function ProfilePage() {
  const { fontScale, highContrast, setFontScale, toggleContrast } = useUiPrefs();

  return (
    <section className="flex min-h-[68vh] flex-col gap-4">
      <div className="panel p-5">
        <h1 className="font-heading text-2xl leading-tight">Profil</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Tu będą dane użytkownika i opcje konta.</p>
      </div>

      <div className="panel p-5">
        <p className="text-sm font-bold">Konto</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">##TODO dogadać jakie rzeczy będą w profilu <br />- na pewno uwzględnić ilość punktów</p>
      </div>

      <div className="panel mt-auto p-4">
        <p className="mb-2 text-sm font-bold">Ustawienia</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleContrast}
            className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-semibold"
          >
            Kontrast: {highContrast ? 'wysoki' : 'normalny'}
          </button>

          {[1, 1.15, 1.3].map((scale) => (
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
    </section>
  );
}
