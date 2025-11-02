import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, firebaseInitialized } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();
// Force account selection for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseInitialized || !auth) {
      setLoading(false);
      return;
    }

    // Check for redirect result when app loads
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('[Auth] Signed in via redirect:', result.user.email);
          setUser(result.user);
          setLoading(false);
        }
      } catch (error: any) {
        console.error('[Auth] Error getting redirect result:', error);
        // Continue with auth state listener
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      console.log('[Auth] User state changed:', user ? user.email : 'signed out');
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      const error = new Error('Firebase Auth nu este inițializat. Verifică configurarea Firebase.');
      console.error('[Auth]', error);
      throw error;
    }

    if (!firebaseInitialized) {
      const error = new Error('Firebase nu este inițializat. Verifică configurarea.');
      console.error('[Auth]', error);
      throw error;
    }

    try {
      console.log('[Auth] Attempting Google sign-in...');
      console.log('[Auth] Current domain:', window.location.hostname);
      console.log('[Auth] Auth domain:', auth.app.options.authDomain);
      
      // Try popup first, fallback to redirect if popup fails
      let result;
      try {
        // Attempt popup authentication
        result = await signInWithPopup(auth, googleProvider);
        console.log('[Auth] Signed in with Google via popup:', result.user.email);
        console.log('[Auth] User ID:', result.user.uid);
      } catch (popupError: any) {
        // If popup fails (blocked or closed), try redirect
        if (popupError?.code === 'auth/popup-blocked' || 
            popupError?.code === 'auth/popup-closed-by-user' ||
            popupError?.code === 'auth/cancelled-popup-request') {
          console.log('[Auth] Popup failed, trying redirect method...');
          await signInWithRedirect(auth, googleProvider);
          // signInWithRedirect doesn't return - it navigates away
          return; // Exit early, redirect will handle auth
        }
        // Re-throw other errors
        throw popupError;
      }
    } catch (error: any) {
      console.error('[Auth] Error signing in with Google:', error);
      console.error('[Auth] Error code:', error?.code);
      console.error('[Auth] Error message:', error?.message);
      console.error('[Auth] Full error:', error);
      
      // Provide more specific error messages
      if (error?.code === 'auth/configuration-not-found') {
        const errMsg = 'Autentificarea Google NU este activată în Firebase Console!\n\n' +
          'Pași pentru activare:\n' +
          '1. Mergi la https://console.firebase.google.com\n' +
          '2. Selectează proiectul: dandulgheru-e5fcc\n' +
          '3. Authentication > Sign-in method\n' +
          '4. Activează "Google" provider\n' +
          '5. Adaugă domainul autorizat: ' + window.location.hostname;
        throw new Error(errMsg);
      } else if (error?.code === 'auth/unauthorized-domain') {
        const errMsg = 'Domainul NU este autorizat!\n\n' +
          'Pași pentru fixare:\n' +
          '1. Mergi la Firebase Console > Authentication > Sign-in method > Google\n' +
          '2. Scroll la "Authorized domains"\n' +
          '3. Adaugă: ' + window.location.hostname + '\n' +
          '4. Salvează și așteaptă 1-2 minute';
        throw new Error(errMsg);
      } else if (error?.code === 'auth/popup-blocked') {
        throw new Error('Popup-ul a fost blocat de browser!\n\n' +
          'Pași pentru fixare:\n' +
          '1. Permite popup-urile pentru acest site în setările browserului\n' +
          '2. Sau încearcă în modul incognito/private');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error('Popup închis'); // Acest mesaj va fi ignorat în LoginScreen
      } else if (error?.code === 'auth/network-request-failed') {
        throw new Error('Eroare de rețea!\n\nVerifică conexiunea la internet și reîncearcă.');
      } else if (error?.code === 'auth/operation-not-allowed') {
        throw new Error('Autentificarea Google NU este permisă!\n\n' +
          'Activează Google Authentication în Firebase Console.');
      } else {
        const errMsg = error?.message || error?.code || 'Eroare necunoscută';
        console.error('[Auth] Unknown error:', error);
        throw new Error(`Eroare la autentificare: ${errMsg}\n\n` +
          'Verifică console-ul browserului (F12) pentru detalii.');
      }
    }
  };

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    try {
      await firebaseSignOut(auth);
      console.log('[Auth] Signed out');
    } catch (error) {
      console.error('[Auth] Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

