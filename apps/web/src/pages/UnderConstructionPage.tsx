import { Link, useParams } from 'react-router-dom';
import { featureLookup } from '@/data/modules';

const staticLabels: Record<string, string> = {
  profile: 'Profil użytkownika',
  sos: 'SOS',
  settings: 'Ustawienia',
};

export function UnderConstructionPage() {
  const { featureId = '' } = useParams();
  const feature = featureLookup[featureId];
  const title = feature?.label ?? staticLabels[featureId] ?? 'Funkcja';

  return (
    <section className="panel flex flex-col gap-4 p-5">
      <p className="w-fit rounded-full bg-[#ffd8b2] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#8c2f00]">
        maintance
      </p>

      <div>
        <h1 className="font-heading text-3xl leading-tight">{title}</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          kiedyś będzie
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--outline-soft)] bg-white p-4">
        <p className="text-sm font-semibold">Status: W budowie</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]"> </p>
      </div>

      <Link to="/" className="cta-btn w-full rounded-xl px-4 py-3 text-center text-sm font-bold">
        Wróć do menu głównego
      </Link>
    </section>
  );
}
