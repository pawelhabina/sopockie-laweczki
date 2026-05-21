import { AuthProvider } from '../context/AuthContext';
import { BenchesProvider } from '../context/BenchesContext';
import { ReportsProvider } from '../context/ReportsContext';
import { RoutesProvider } from '../context/RoutesContext';
import { UiPrefsProvider } from '../context/UiPrefsContext';

export function AppProviders({ children }) {
  return (
    <UiPrefsProvider>
      <AuthProvider>
        <ReportsProvider>
          <BenchesProvider>
            <RoutesProvider>{children}</RoutesProvider>
          </BenchesProvider>
        </ReportsProvider>
      </AuthProvider>
    </UiPrefsProvider>
  );
}
