import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface EmailLoginFormProps {
  onSuccess?: () => void;
}

export default function EmailLoginForm({ onSuccess }: EmailLoginFormProps) {
  const { signInWithEmailPassword, sendPasswordResetEmail } = useAuth();
  const { theme, isDark } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Email și parolă sunt necesare.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailPassword(email, password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Eroare la autentificare.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Introdu email-ul pentru resetare parolă.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(email);
      setSuccess('Email-ul pentru resetare parolă a fost trimis! Verifică inbox-ul.');
      setShowForgotPassword(false);
    } catch (err: any) {
      setError(err.message || 'Eroare la trimiterea email-ului.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: isDark 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: isDark 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.02)',
    color: theme.colors.text,
    fontSize: '15px',
    fontFamily: theme.fonts.medium,
    outline: 'none',
    transition: 'all 0.2s ease',
    marginBottom: '12px',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 24px',
    borderRadius: '12px',
    border: 'none',
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: theme.fonts.bold,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.3s ease',
    marginTop: '8px',
  };

  const linkStyle: React.CSSProperties = {
    color: theme.colors.primary,
    fontSize: '14px',
    fontFamily: theme.fonts.medium,
    cursor: 'pointer',
    textDecoration: 'none',
    marginTop: '8px',
    display: 'inline-block',
  };

  const errorStyle: React.CSSProperties = {
    color: '#FF4444',
    fontSize: '14px',
    fontFamily: theme.fonts.medium,
    marginTop: '8px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: isDark ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 68, 68, 0.05)',
    border: `1px solid ${isDark ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 68, 68, 0.1)'}`,
  };

  const successStyle: React.CSSProperties = {
    color: '#34A853',
    fontSize: '14px',
    fontFamily: theme.fonts.medium,
    marginTop: '8px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: isDark ? 'rgba(52, 168, 83, 0.1)' : 'rgba(52, 168, 83, 0.05)',
    border: `1px solid ${isDark ? 'rgba(52, 168, 83, 0.2)' : 'rgba(52, 168, 83, 0.1)'}`,
  };

  if (showForgotPassword) {
    return (
      <div>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          color: theme.colors.text, 
          marginBottom: '16px',
          fontFamily: theme.fonts.bold,
        }}>
          Resetare Parolă
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              type="submit"
              style={buttonStyle}
              disabled={loading}
            >
              {loading ? 'Se trimite...' : 'Trimite Email'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError(null);
                setSuccess(null);
              }}
              style={{
                ...buttonStyle,
                background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: theme.colors.text,
              }}
            >
              Anulează
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
        required
      />
      <input
        type="password"
        placeholder="Parolă"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
        required
      />
      
      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}
      
      <button type="submit" style={buttonStyle} disabled={loading}>
        {loading ? 'Se conectează...' : 'Conectează-te'}
      </button>
      
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <a
          style={linkStyle}
          onClick={(e) => {
            e.preventDefault();
            setShowForgotPassword(true);
            setError(null);
            setSuccess(null);
          }}
        >
          Ai uitat parola?
        </a>
      </div>
    </form>
  );
}
