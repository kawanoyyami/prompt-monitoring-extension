import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { IssuesProvider } from './context/IssuesContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <IssuesProvider>
      <App />
    </IssuesProvider>
  </React.StrictMode>
);
