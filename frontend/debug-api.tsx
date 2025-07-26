import React from 'react';
import ReactDOM from 'react-dom/client';
import DebugApiView from './components/views/DebugApiView';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <DebugApiView />
  </React.StrictMode>
);
