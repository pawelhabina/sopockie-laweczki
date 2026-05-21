import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { UnderConstructionPage } from './pages/UnderConstructionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { BenchesMapPage } from './pages/BenchesMapPage';
import { BenchesListPage } from './pages/BenchesListPage';
import { BenchDetailsPage } from './pages/BenchDetailsPage';
import { BenchAddPage } from './pages/BenchAddPage';
import { MeetingCreatePage } from './pages/MeetingCreatePage';
import { MeetingsListPage } from './pages/MeetingsListPage';
import { RouteAddPage } from './pages/RouteAddPage';
import { RoutesMapPage } from './pages/RoutesMapPage';
import { RoutesListPage } from './pages/RoutesListPage';
import { SosPage } from './pages/SosPage';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/routes" element={<RoutesMapPage />} />
        <Route path="/routes/list" element={<RoutesListPage />} />
        <Route path="/routes/official" element={<Navigate to="/routes/list?segment=official" replace />} />
        <Route path="/routes/community" element={<Navigate to="/routes/list?segment=community" replace />} />
        <Route path="/routes/add" element={<RouteAddPage />} />
        <Route path="/benches" element={<BenchesMapPage />} />
        <Route path="/benches/list" element={<BenchesListPage />} />
        <Route path="/benches/details" element={<BenchDetailsPage />} />
        <Route path="/benches/add" element={<BenchAddPage />} />
        <Route path="/meetings" element={<MeetingsListPage />} />
        <Route path="/meetings/create" element={<MeetingCreatePage />} />
        <Route path="/trasy" element={<Navigate to="/routes" replace />} />
        <Route path="/laweczki" element={<Navigate to="/benches" replace />} />
        <Route path="/spotkania" element={<Navigate to="/meetings" replace />} />
        <Route path="/sos" element={<SosPage />} />
        <Route path="/w-budowie/sos" element={<Navigate to="/sos" replace />} />
        <Route path="/w-budowie/:featureId" element={<UnderConstructionPage />} />
        <Route path="/ustawienia" element={<Navigate to="/w-budowie/settings" replace />} />
      </Route>
      <Route path="/profile" element={<AppShell />}>
        <Route index element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
