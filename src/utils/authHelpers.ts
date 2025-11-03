// Authentication helper utilities
import { auth, firebaseInitialized } from '../services/firebase';

export interface AuthDiagnostics {
  firebaseInitialized: boolean;
  authInitialized: boolean;
  currentDomain: string;
  authDomain: string;
  isLocalhost: boolean;
  browser: string;
  errors: string[];
}

/**
 * Validates Firebase configuration
 */
export function validateFirebaseConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!firebaseInitialized) {
    errors.push('Firebase nu este inițializat corect');
  }

  if (!auth) {
    errors.push('Firebase Auth nu este inițializat');
  }

  if (!auth?.app?.options?.authDomain) {
    errors.push('Auth domain lipsă din configurația Firebase');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Verifies if current domain is likely authorized
 */
export function checkDomainAuthorization(): { 
  authorized: boolean; 
  currentDomain: string;
  authDomain: string;
  isLocalhost: boolean;
} {
  if (!auth) {
    return {
      authorized: false,
      currentDomain: window.location.hostname,
      authDomain: '',
      isLocalhost: false
    };
  }

  const currentDomain = window.location.hostname;
  const authDomain = auth.app.options.authDomain || '';
  const isLocalhost = currentDomain === 'localhost' || 
                     currentDomain === '127.0.0.1' || 
                     currentDomain === '[::1]';

  // localhost is usually allowed by default
  const authorized = isLocalhost || currentDomain === authDomain;

  return {
    authorized,
    currentDomain,
    authDomain,
    isLocalhost
  };
}

/**
 * Gets comprehensive authentication diagnostics
 */
export function getAuthDiagnostics(): AuthDiagnostics {
  const config = validateFirebaseConfig();
  const domain = checkDomainAuthorization();
  
  // Detect browser
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edg')) browser = 'Edge';

  return {
    firebaseInitialized: firebaseInitialized,
    authInitialized: !!auth,
    currentDomain: domain.currentDomain,
    authDomain: domain.authDomain,
    isLocalhost: domain.isLocalhost,
    browser,
    errors: config.errors
  };
}

/**
 * Translates Firebase Auth error codes to user-friendly messages
 */
export function translateAuthError(errorCode: string, errorMessage?: string): string {
  const errorMap: Record<string, string> = {
    'auth/configuration-not-found': 'Autentificarea Google NU este activată în Firebase Console. Verifică setările Firebase.',
    'auth/unauthorized-domain': `Domainul "${window.location.hostname}" nu este autorizat. Adaugă-l în Firebase Console.`,
    'auth/popup-blocked': 'Popup-ul a fost blocat de browser. Permite popup-urile pentru acest site.',
    'auth/popup-closed-by-user': 'Popup-ul a fost închis de utilizator.',
    'auth/network-request-failed': 'Eroare de rețea. Verifică conexiunea la internet.',
    'auth/operation-not-allowed': 'Autentificarea Google NU este permisă. Activează-o în Firebase Console.',
    'auth/user-disabled': 'Contul a fost dezactivat. Contactează suportul.',
    'auth/user-not-found': 'Contul nu a fost găsit.',
    'auth/wrong-password': 'Parola este incorectă.',
    'auth/email-already-in-use': 'Acest email este deja folosit.',
    'auth/weak-password': 'Parola este prea slabă. Folosește cel puțin 6 caractere.',
    'auth/invalid-email': 'Email-ul nu este valid.',
    'auth/too-many-requests': 'Prea multe încercări. Așteaptă înainte de a reîncerca.',
    'auth/invalid-credential': 'Datele de autentificare sunt incorecte.',
    'auth/cancelled-popup-request': 'Cererea de autentificare a fost anulată.'
  };

  return errorMap[errorCode] || errorMessage || `Eroare necunoscută: ${errorCode}`;
}

/**
 * Checks if popup is likely to be blocked
 */
export function checkPopupSupport(): { 
  supported: boolean; 
  warning?: string;
} {
  // Check if browser supports popups
  if (typeof window === 'undefined') {
    return { supported: false, warning: 'Nu este un mediu browser' };
  }

  // Try to detect if popups are blocked
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return { 
      supported: true, 
      warning: 'Pe dispozitive mobile, popup-urile pot fi blocate. Consideră folosirea autentificării cu email/parolă.' 
    };
  }

  return { supported: true };
}

/**
 * Formats error message for display
 */
export function formatErrorForDisplay(error: any): { 
  title: string; 
  message: string;
  code?: string;
} {
  const code = error?.code || '';
  const message = translateAuthError(code, error?.message);
  
  // Extract title and detailed message
  const lines = message.split('\n');
  const title = lines[0] || 'Eroare la autentificare';
  const detailedMessage = lines.slice(1).join('\n') || message;

  return {
    title,
    message: detailedMessage,
    code: code || undefined
  };
}

