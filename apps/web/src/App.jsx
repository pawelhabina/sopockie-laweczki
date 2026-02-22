import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { ModuleHubPage } from './pages/ModuleHubPage';
import { UnderConstructionPage } from './pages/UnderConstructionPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/routes"
          element={<ModuleHubPage moduleId="routes" title="Trasy" subtitle="Wybierz, co chcesz zrobić" />}
        />
        <Route
          path="/benches"
          element={<ModuleHubPage moduleId="benches" title="Ławeczki" subtitle="Wybierz funkcję" />}
        />
        <Route
          path="/meetings"
          element={<ModuleHubPage moduleId="meetings" title="Spotkania" subtitle="Wybierz funkcję" />}
        />
        <Route path="/trasy" element={<Navigate to="/routes" replace />} />
        <Route path="/laweczki" element={<Navigate to="/benches" replace />} />
        <Route path="/spotkania" element={<Navigate to="/meetings" replace />} />
        <Route path="/w-budowie/:featureId" element={<UnderConstructionPage />} />
        <Route path="/ustawienia" element={<Navigate to="/w-budowie/settings" replace />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
