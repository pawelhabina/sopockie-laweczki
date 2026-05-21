import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRotateLeft, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { routeCategories, routeSourceMeta } from '@shared/data/routes.js';
import { useRoutes } from '@shared/context/RoutesContext.jsx';

const emptyRouteForm = {
  id: '',
  source: 'community',
  title: '',
  category: 'piesza',
  difficulty: 'lekka',
  startPlace: 'Sopot',
  summary: '',
  highlightsText: '',
  authorId: '',
  authorName: '',
  createdAt: new Date().toISOString(),
  pathText: '',
};

function formatPath(path) {
  return Array.isArray(path) ? path.map(([lat, lng]) => `${lat}, ${lng}`).join('\n') : '';
}

function parsePath(pathText) {
  return pathText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(',').map((part) => Number(part.trim())));
}

function mapRouteToForm(route) {
  if (!route) {
    return emptyRouteForm;
  }

  return {
    id: route.id,
    source: route.source,
    title: route.title,
    category: route.category,
    difficulty: route.difficulty,
    startPlace: route.startPlace,
    summary: route.summary,
    highlightsText: route.highlights.join(', '),
    authorId: route.authorId,
    authorName: route.authorName,
    createdAt: route.createdAt,
    pathText: formatPath(route.path),
  };
}

export function RoutesAdminPage() {
  const { allRoutes, saveRoute, deleteRouteAdmin, resetRoutes } = useRoutes();
  const [selectedRouteId, setSelectedRouteId] = useState(() => allRoutes[0]?.id ?? '');
  const [form, setForm] = useState(() => mapRouteToForm(allRoutes[0] ?? null));

  const selectedRoute = useMemo(() => {
    if (!selectedRouteId) {
      return null;
    }

    return allRoutes.find((route) => route.id === selectedRouteId) ?? null;
  }, [allRoutes, selectedRouteId]);

  useEffect(() => {
    if (!selectedRouteId && allRoutes[0]) {
      setSelectedRouteId(allRoutes[0].id);
      return;
    }

    if (selectedRouteId && !allRoutes.some((route) => route.id === selectedRouteId)) {
      setSelectedRouteId(allRoutes[0]?.id ?? '');
    }
  }, [allRoutes, selectedRouteId]);

  useEffect(() => {
    setForm(mapRouteToForm(selectedRoute));
  }, [selectedRoute]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    const result = saveRoute({
      id: form.id || undefined,
      source: form.source,
      title: form.title,
      category: form.category,
      difficulty: form.difficulty,
      startPlace: form.startPlace,
      summary: form.summary,
      highlights: form.highlightsText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      authorId: form.authorId,
      authorName: form.authorName,
      createdAt: form.createdAt,
      path: parsePath(form.pathText),
    });

    if (result.ok) {
      setSelectedRouteId(result.routeId);
    }
  };

  const handleNew = () => {
    setSelectedRouteId('');
    setForm(emptyRouteForm);
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="admin-panel p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Trasy</p>
            <h2 className="mt-2 font-heading text-3xl">Oficjalne i społecznościowe</h2>
          </div>
          <button type="button" onClick={handleNew} className="admin-btn admin-btn-primary">
            <FontAwesomeIcon icon={faPlus} />
            Nowa trasa
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {allRoutes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => setSelectedRouteId(route.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedRouteId === route.id
                  ? 'border-transparent bg-[var(--admin-cta)] text-white'
                  : 'border-[var(--admin-outline)] bg-white/80 text-[var(--admin-text)]'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{route.title}</p>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    selectedRouteId === route.id
                      ? 'border-white/20 bg-white/10 text-white'
                      : (routeSourceMeta[route.source] ?? routeSourceMeta.community).badgeClass
                  }`}
                >
                  {(routeSourceMeta[route.source] ?? routeSourceMeta.community).label}
                </span>
              </div>
              <p className={`mt-2 text-sm ${selectedRouteId === route.id ? 'text-white/78' : 'text-[var(--admin-muted)]'}`}>
                {route.distanceKm} km • {route.startPlace}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">Edycja</p>
          <h2 className="mt-2 font-heading text-3xl">{selectedRoute ? selectedRoute.title : 'Nowa trasa'}</h2>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="admin-label">
              Typ źródła
              <select value={form.source} onChange={handleChange('source')} className="admin-select">
                <option value="official">Oficjalna</option>
                <option value="community">Społeczność</option>
              </select>
            </label>

            <label className="admin-label">
              Kategoria
              <select value={form.category} onChange={handleChange('category')} className="admin-select">
                {routeCategories
                  .filter((item) => item.value !== 'all')
                  .map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
              </select>
            </label>

            <label className="admin-label md:col-span-2">
              Tytuł
              <input value={form.title} onChange={handleChange('title')} className="admin-input" />
            </label>

            <label className="admin-label">
              Poziom trudności
              <input value={form.difficulty} onChange={handleChange('difficulty')} className="admin-input" />
            </label>

            <label className="admin-label">
              Start
              <input value={form.startPlace} onChange={handleChange('startPlace')} className="admin-input" />
            </label>

            <label className="admin-label">
              Author ID
              <input value={form.authorId} onChange={handleChange('authorId')} className="admin-input" />
            </label>

            <label className="admin-label">
              Author name
              <input value={form.authorName} onChange={handleChange('authorName')} className="admin-input" />
            </label>
          </div>

          <label className="admin-label">
            Opis
            <textarea value={form.summary} onChange={handleChange('summary')} className="admin-textarea" />
          </label>

          <label className="admin-label">
            Highlighty
            <textarea
              value={form.highlightsText}
              onChange={handleChange('highlightsText')}
              className="admin-textarea"
              placeholder="molo, Monciak, widoki"
            />
          </label>

          <label className="admin-label">
            Przebieg trasy
            <textarea
              value={form.pathText}
              onChange={handleChange('pathText')}
              className="admin-textarea"
              placeholder="54.4418, 18.5603"
            />
          </label>

          <label className="admin-label">
            Data utworzenia
            <input value={form.createdAt} onChange={handleChange('createdAt')} className="admin-input" />
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleSave} className="admin-btn admin-btn-primary">
              Zapisz trasę
            </button>

            <button type="button" onClick={handleNew} className="admin-btn admin-btn-secondary">
              <FontAwesomeIcon icon={faPlus} />
              Wyczyść formularz
            </button>

            {selectedRoute && (
              <button
                type="button"
                onClick={() => deleteRouteAdmin(selectedRoute.id)}
                className="admin-btn admin-btn-danger"
              >
                <FontAwesomeIcon icon={faTrashCan} />
                Usuń trasę
              </button>
            )}

            <button type="button" onClick={resetRoutes} className="admin-btn admin-btn-secondary">
              <FontAwesomeIcon icon={faRotateLeft} />
              Przywróć dane startowe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
