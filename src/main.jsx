// Entry point — mounts the React tree into the #root div defined in index.html.
// StrictMode intentionally renders components twice in development to expose
// side-effect bugs; it has no effect in production builds.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
