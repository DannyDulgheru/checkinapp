import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import EmailLoginForm from '../components/EmailLoginForm';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();

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

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Check-in App</h1>
        <p style={subtitleStyle}>
          Conectează-te cu email/parolă pentru sincronizare cloud
        </p>
        <EmailLoginForm />
      </div>
    </div>
  );
}
