import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { UiPrefsProvider } from './context/UiPrefsContext';
import { BenchesProvider } from './context/BenchesContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UiPrefsProvider>
      <BenchesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </BenchesProvider>
    </UiPrefsProvider>
  </React.StrictMode>,
);
