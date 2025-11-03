import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, firebaseInitialized } from '../services/firebase';
import { getAuthDiagnostics, checkPopupSupport, translateAuthError } from '../utils/authHelpers';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  createUserWithEmailPassword: (email: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  getDiagnostics: () => ReturnType<typeof getAuthDiagnostics>;
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
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Log diagnostics on mount
    const diagnostics = getAuthDiagnostics();
    console.log('[Auth] Diagnostics on mount:', diagnostics);
    
    if (!firebaseInitialized || !auth) {
      console.warn('[Auth] Firebase or Auth not initialized:', {
        firebaseInitialized,
        authInitialized: !!auth
      });
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let redirectResultChecked = false;

    // Check for redirect result when app loads (only once on mount)
    const checkRedirectResult = async () => {
      if (!auth) return;
      
      if (!redirectResultChecked) {
        redirectResultChecked = true;
        try {
          const result = await getRedirectResult(auth);
          if (result?.user) {
            console.log('[Auth] Signed in via redirect:', result.user.email);
            setUser(result.user);
            setLoading(false);
            // Set up listener for future changes
            unsubscribe = onAuthStateChanged(auth, (user) => {
              setUser(user);
              setLoading(false);
              console.log('[Auth] User state changed:', user ? user.email : 'signed out');
            });
            return;
          }
        } catch (error: any) {
          console.error('[Auth] Error getting redirect result:', error);
        }
      }

      // Set up auth state listener
      // This will handle auth state changes (sign out, token refresh, etc.)
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log('[Auth] Auth state changed:', {
          hasUser: !!currentUser,
          email: currentUser?.email,
          uid: currentUser?.uid,
          isAnonymous: currentUser?.isAnonymous
        });
        setUser(currentUser);
        setLoading(false);
        setIsSigningIn(false);
      });
    };

    checkRedirectResult();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Only run on mount

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

    // Prevent double sign-in
    if (isSigningIn || user) {
      console.log('[Auth] Sign-in already in progress or user already signed in');
      return;
    }

    try {
      setIsSigningIn(true);
      
      // Run diagnostics before attempting login
      const diagnostics = getAuthDiagnostics();
      console.log('[Auth] Google sign-in diagnostics:', diagnostics);
      
      // Check popup support
      const popupCheck = checkPopupSupport();
      if (!popupCheck.supported) {
        throw new Error('Browser-ul nu suportă popup-uri. Folosește autentificarea cu email/parolă.');
      }
      if (popupCheck.warning) {
        console.warn('[Auth] Popup warning:', popupCheck.warning);
      }
      
      console.log('[Auth] Attempting Google sign-in...');
      console.log('[Auth] Current domain:', window.location.hostname);
      console.log('[Auth] Auth domain:', auth.app.options.authDomain);
      
      // Use only popup method (more reliable and prevents double authentication)
      const result = await signInWithPopup(auth, googleProvider);
      console.log('[Auth] Signed in with Google via popup:', result.user.email);
      console.log('[Auth] User ID:', result.user.uid);
      
      // Set user directly after successful popup auth
      // onAuthStateChanged will also fire, but setting it here ensures immediate update
      setUser(result.user);
      setLoading(false);
      setIsSigningIn(false);
    } catch (error: any) {
      setIsSigningIn(false);
      console.error('[Auth] Error signing in with Google:', error);
      console.error('[Auth] Error code:', error?.code);
      console.error('[Auth] Error message:', error?.message);
      console.error('[Auth] Full error:', error);
      
      // Use helper function for consistent error messages
      const translatedError = translateAuthError(error?.code, error?.message);
      
      // Provide more specific error messages with actionable steps
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
          '2. Sau încearcă în modul incognito/private\n' +
          '3. Sau folosește autentificarea cu email/parolă');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error('Popup închis'); // Acest mesaj va fi ignorat în LoginScreen
      } else {
        throw new Error(translatedError);
      }
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth nu este inițializat.');
    }

    if (!email || !password) {
      throw new Error('Email și parolă sunt necesare.');
    }

    if (isSigningIn || user) {
      console.log('[Auth] Sign-in already in progress or user already signed in');
      return;
    }

    try {
      setIsSigningIn(true);
      console.log('[Auth] Attempting email/password sign-in...');
      
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('[Auth] Signed in with email:', result.user.email);
      
      setUser(result.user);
      setLoading(false);
      setIsSigningIn(false);
    } catch (error: any) {
      setIsSigningIn(false);
      console.error('[Auth] Error signing in with email/password:', error);
      throw new Error(translateAuthError(error?.code, error?.message));
    }
  };

  const createUserWithEmailPassword = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth nu este inițializat.');
    }

    if (!email || !password) {
      throw new Error('Email și parolă sunt necesare.');
    }

    if (password.length < 6) {
      throw new Error('Parola trebuie să aibă cel puțin 6 caractere.');
    }

    if (isSigningIn || user) {
      console.log('[Auth] Sign-in already in progress or user already signed in');
      return;
    }

    try {
      setIsSigningIn(true);
      console.log('[Auth] Creating account with email/password...');
      
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      console.log('[Auth] Account created:', result.user.email);
      
      setUser(result.user);
      setLoading(false);
      setIsSigningIn(false);
    } catch (error: any) {
      setIsSigningIn(false);
      console.error('[Auth] Error creating account:', error);
      throw new Error(translateAuthError(error?.code, error?.message));
    }
  };

  const sendPasswordResetEmailHandler = async (email: string) => {
    if (!auth) {
      throw new Error('Firebase Auth nu este inițializat.');
    }

    if (!email) {
      throw new Error('Email este necesar.');
    }

    try {
      console.log('[Auth] Sending password reset email...');
      await sendPasswordResetEmail(auth, email.trim());
      console.log('[Auth] Password reset email sent');
    } catch (error: any) {
      console.error('[Auth] Error sending password reset email:', error);
      throw new Error(translateAuthError(error?.code, error?.message));
    }
  };

  const signInAnonymously = async () => {
    if (!auth) {
      throw new Error('Firebase Auth nu este inițializat.');
    }

    if (isSigningIn || user) {
      console.log('[Auth] Sign-in already in progress or user already signed in');
      return;
    }

    try {
      setIsSigningIn(true);
      console.log('[Auth] Attempting anonymous sign-in...');
      
      const result = await firebaseSignInAnonymously(auth);
      console.log('[Auth] Signed in anonymously, UID:', result.user.uid);
      
      setUser(result.user);
      setLoading(false);
      setIsSigningIn(false);
    } catch (error: any) {
      setIsSigningIn(false);
      console.error('[Auth] Error signing in anonymously:', error);
      throw new Error(translateAuthError(error?.code, error?.message));
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

  const getDiagnostics = () => {
    return getAuthDiagnostics();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle,
      signInWithEmailPassword,
      createUserWithEmailPassword,
      sendPasswordResetEmail: sendPasswordResetEmailHandler,
      signInAnonymously,
      signOut,
      getDiagnostics
    }}>
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

