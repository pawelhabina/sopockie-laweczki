import { Link } from 'react-router-dom';
import { moduleMenu, moduleTheme } from '@/data/modules';

export function ModuleHubPage({ moduleId, title, subtitle }) {
  const features = moduleMenu[moduleId];
  const theme = moduleTheme[moduleId];

  return (
    <section className="flex flex-col gap-4">
      <div className={`overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bgClass} ${theme.textClass} p-4 shadow-card`}>
        <h1 className="font-heading text-2xl leading-tight">{title}</h1>
        <p className={`mt-1 text-sm ${theme.subtitleClass}`}>{subtitle}</p>
      </div>

      <div className="grid gap-3">
        {features.map((feature) => (
          <Link
            key={feature.id}
            to={`/w-budowie/${feature.id}`}
            className={`flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-card transition hover:-translate-y-[1px] ${theme.cardClass}`}
          >
            <div>
              <p className="font-heading text-lg">{feature.label}</p>
              <p className={`text-sm ${theme.cardTextClass}`}>{feature.shortDescription}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${theme.chipClass}`}>
              W budowie
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
