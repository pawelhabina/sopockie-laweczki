import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminShell } from './components/AdminShell';
import { DashboardPage } from './pages/DashboardPage';
import { BenchesAdminPage } from './pages/BenchesAdminPage';
import { MeetingsAdminPage } from './pages/MeetingsAdminPage';
import { RoutesAdminPage } from './pages/RoutesAdminPage';
import { SettingsAdminPage } from './pages/SettingsAdminPage';

function App() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/benches" element={<BenchesAdminPage />} />
        <Route path="/meetings" element={<MeetingsAdminPage />} />
        <Route path="/routes" element={<RoutesAdminPage />} />
        <Route path="/settings" element={<SettingsAdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
