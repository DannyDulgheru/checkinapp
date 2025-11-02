import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { auth, firebaseInitialized } from '../services/firebase';

export default function LoginScreen() {
  const { signInWithGoogle, loading } = useAuth();
  const { theme, isDark } = useTheme();
  const [signingIn, setSigningIn] = React.useState(false);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      
      // Check if Firebase is initialized
      if (!auth || !firebaseInitialized) {
        alert('Firebase nu este inițializat. Verifică configurarea.');
        return;
      }
      
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      // Don't show alert if user simply closed the popup
      if (error?.code === 'auth/popup-closed-by-user' || error?.message === 'Popup închis') {
        console.log('[Auth] User closed the popup - no action needed');
        // Just reset the signing in state, don't show error
      } else {
        // Show alert for actual errors
        const errorMessage = error?.message || 'Eroare la autentificare. Te rugăm să încerci din nou.';
        alert(errorMessage);
        
        // Log detailed error info for debugging
        console.error('[Auth] Detailed error info:', {
          code: error?.code,
          message: error?.message,
          stack: error?.stack,
          domain: window.location.hostname,
          url: window.location.href
        });
      }
    } finally {
      setSigningIn(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: isDark ? '#000000' : theme.colors.background,
    background: isDark 
      ? '#000000'
      : `radial-gradient(ellipse at top, ${theme.colors.primary}05 0%, ${theme.colors.background} 50%)`,
  };

  const cardStyle: React.CSSProperties = {
    background: isDark 
      ? `linear-gradient(135deg, ${theme.colors.cardBackground} 0%, ${theme.colors.cardBackground}EE 100%)`
      : `linear-gradient(135deg, ${theme.colors.cardBackground} 0%, ${theme.colors.cardBackground}FF 100%)`,
    borderRadius: '28px',
    padding: '48px 32px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: isDark 
      ? `0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3)`
      : `0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)`,
    border: isDark ? `1px solid rgba(255, 255, 255, 0.1)` : `1px solid rgba(0, 0, 0, 0.05)`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 800,
    color: theme.colors.text,
    marginBottom: '12px',
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 500,
    color: theme.colors.textSecondary,
    marginBottom: '32px',
    textAlign: 'center',
    fontFamily: theme.fonts.medium,
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 24px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
    boxShadow: isDark 
      ? `0 6px 20px ${theme.colors.primary}40, 0 3px 10px rgba(0, 0, 0, 0.3)`
      : `0 6px 20px ${theme.colors.primary}30, 0 3px 10px rgba(0, 0, 0, 0.1)`,
    border: 'none',
    cursor: signingIn || loading ? 'not-allowed' : 'pointer',
    opacity: signingIn || loading ? 0.7 : 1,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const buttonTextStyle: React.CSSProperties = {
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: theme.fonts.bold,
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Check-in App</h1>
        <p style={subtitleStyle}>
          Conectează-te cu contul tău Google pentru a-ți sincroniza datele pe toate dispozitivele
        </p>
        <button
          style={buttonStyle}
          onClick={handleSignIn}
          disabled={signingIn || loading}
          onMouseDown={(e) => {
            if (!signingIn && !loading) {
              e.currentTarget.style.transform = 'scale(0.98)';
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span style={buttonTextStyle}>
            {signingIn ? 'Conectare...' : 'Conectează-te cu Google'}
          </span>
        </button>
      </div>
    </div>
  );
}

