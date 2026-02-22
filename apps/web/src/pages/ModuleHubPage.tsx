import { Link } from 'react-router-dom';
import { moduleMenu } from '@/data/modules';
import { ModuleId } from '@/types';

type ModuleHubPageProps = {
  moduleId: ModuleId;
  title: string;
  subtitle: string;
};

export function ModuleHubPage({ moduleId, title, subtitle }: ModuleHubPageProps) {
  const features = moduleMenu[moduleId];

  return (
    <section className="flex flex-col gap-4">
      <div className="panel p-4">
        <h1 className="font-heading text-2xl leading-tight">{title}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
      </div>

      <div className="grid gap-3">
        {features.map((feature) => (
          <Link
            key={feature.id}
            to={`/w-budowie/${feature.id}`}
            className="panel flex items-center justify-between gap-3 p-4 transition hover:-translate-y-[1px]"
          >
            <div>
              <p className="font-heading text-lg">{feature.label}</p>
              <p className="text-sm text-[var(--text-muted)]">{feature.shortDescription}</p>
            </div>
            <span className="rounded-full border border-[var(--outline-soft)] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
              W budowie
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
