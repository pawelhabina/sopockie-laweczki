import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { UiPrefsProvider } from './context/UiPrefsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UiPrefsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UiPrefsProvider>
  </React.StrictMode>,
);
