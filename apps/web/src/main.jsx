import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
import 'leaflet/dist/leaflet.css';
import './styles/global.css';
import './styles/resident.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
