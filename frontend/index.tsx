import React from 'react';
import ReactDOM from 'react-dom/client';
import DebugApiView from './components/views/DebugApiView';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DebugApiView />} />
        {/* Optional: andere Routen blockieren oder anzeigen */}
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
