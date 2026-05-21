import { AuthProvider } from '../context/AuthContext';
import { BenchesProvider } from '../context/BenchesContext';
import { RoutesProvider } from '../context/RoutesContext';
import { UiPrefsProvider } from '../context/UiPrefsContext';

export function AppProviders({ children }) {
  return (
    <UiPrefsProvider>
      <AuthProvider>
        <BenchesProvider>
          <RoutesProvider>{children}</RoutesProvider>
        </BenchesProvider>
      </AuthProvider>
    </UiPrefsProvider>
  );
}
