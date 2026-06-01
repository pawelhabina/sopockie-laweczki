import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { UiPrefsProvider } from './context/UiPrefsContext';
import { BenchesProvider } from './context/BenchesContext';
import { AuthProvider } from './context/AuthContext';
import { ReportsProvider } from './context/ReportsContext';
import { RoutesProvider } from './context/RoutesContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UiPrefsProvider>
      <AuthProvider>
        <ReportsProvider>
          <BenchesProvider>
            <RoutesProvider>
              <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <App />
              </BrowserRouter>
            </RoutesProvider>
          </BenchesProvider>
        </ReportsProvider>
      </AuthProvider>
    </UiPrefsProvider>
  </React.StrictMode>,
);
