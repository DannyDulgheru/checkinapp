import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('ERROR: Root element not found!');
  throw new Error('Root element not found');
}

console.log('Root element found:', rootElement);
console.log('Starting React render...');

// Register Service Worker for PWA (iOS support)
if ('serviceWorker' in navigator) {
  // Register immediately, not on load (better for PWA)
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.log('SW registered successfully:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available. Refresh to update.');
            }
          });
        }
      });
    })
    .catch((registrationError) => {
      console.log('SW registration failed (this is OK for HTTP):', registrationError);
      // Service workers require HTTPS, but app will still work without it
    });
  
  // Handle service worker updates
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing && navigator.serviceWorker.controller) {
      refreshing = true;
      window.location.reload();
    }
  });
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('React render completed - Full App loaded');
} catch (error) {
  console.error('ERROR during React render:', error);
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 50px; background: #FF0000; color: white; font-size: 20px;">
        <h1>Rendering Error!</h1>
        <p>${error instanceof Error ? error.message : String(error)}</p>
        <pre>${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `;
  }
}

