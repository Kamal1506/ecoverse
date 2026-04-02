import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './styles/theme.css';

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
const hasGoogleClientId = GOOGLE_CLIENT_ID.length > 0;

if (!hasGoogleClientId) {
  // Keep app usable even if Google Sign-In env var is missing in a deployment.
  console.warn('VITE_GOOGLE_CLIENT_ID is missing. Google Sign-In will be hidden.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {hasGoogleClientId ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
