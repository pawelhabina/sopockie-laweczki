import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { moduleMenu, moduleTheme } from '@/data/modules';

export function ModuleHubPage({ moduleId, title, subtitle }) {
  const features = moduleMenu[moduleId];
  const theme = moduleTheme[moduleId];

  return (
    <section className="flex flex-col gap-4">
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bgClass} ${theme.textClass} p-4 pr-20 shadow-card`}
      >
        <FontAwesomeIcon
          icon={theme.icon}
          className={`pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-7xl ${theme.iconClass}`}
        />
        <h1 className="font-heading text-2xl leading-tight">{title}</h1>
        <p className={`mt-1 text-sm ${theme.subtitleClass}`}>{subtitle}</p>
      </div>

      <div className="grid gap-3">
        {features.map((feature) => (
          <Link
            key={feature.id}
            to={feature.to ?? `/w-budowie/${feature.id}`}
            className={`flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-card transition hover:-translate-y-[1px] ${theme.cardClass}`}
          >
            <div>
              <p className="font-heading text-lg">{feature.label}</p>
              <p className={`text-sm ${theme.cardTextClass}`}>{feature.shortDescription}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${theme.chipClass}`}>
              {feature.chipLabel ?? 'W budowie'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
