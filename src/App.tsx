import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import CheckInScreen from './screens/CheckInScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { IoSettings, IoTime, IoList } from 'react-icons/io5';
import './styles/App.css';

function CustomTabBar() {
  try {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, isDark } = useTheme();

    const tabs = [
      { path: '/', name: 'CheckIn', label: 'Check-in', icon: IoTime },
      { path: '/history', name: 'History', label: 'Istoric', icon: IoList },
      { path: '/settings', name: 'Settings', label: 'Setări', icon: IoSettings },
    ];

    const tabBarContainerStyle: React.CSSProperties = {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      paddingTop: '8px',
      paddingLeft: '12px',
      paddingRight: '12px',
      paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
      margin: 0,
      marginBottom: 0,
      backgroundColor: theme.colors.tabBarBackground,
      background: theme.colors.tabBarBackground,
      borderTop: isDark ? `1px solid rgba(255, 255, 255, 0.08)` : `1px solid rgba(0, 0, 0, 0.06)`,
      zIndex: 10000,
      transform: 'translateZ(0)',
      WebkitTransform: 'translateZ(0)',
      willChange: 'transform',
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden',
      pointerEvents: 'auto',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    };

    const tabBarContentStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '20px',
      padding: '6px',
      gap: '6px',
      boxShadow: isDark 
        ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
        : '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
    };

    return (
      <div style={tabBarContainerStyle}>
        <div style={tabBarContentStyle}>
          {tabs.map((tab) => {
            const isFocused = location.pathname === tab.path;
            const Icon = tab.icon;

            const tabItemStyle: React.CSSProperties = {
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            };

            const tabButtonStyle: React.CSSProperties = {
              borderRadius: '16px',
              width: '100%',
            };

            const tabButtonFocusedStyle: React.CSSProperties = {
              ...tabButtonStyle,
              background: `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.primary}25 100%)`,
              border: `1px solid ${theme.colors.primary}40`,
            };

            const tabButtonInnerStyle: React.CSSProperties = {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              gap: '4px',
              minHeight: '50px',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              width: '100%',
              textAlign: 'center',
            };

            const tabLabelStyle: React.CSSProperties = {
              fontSize: '11px',
              fontWeight: 600,
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.medium,
              marginTop: '2px',
              transition: 'color 0.3s ease',
              textAlign: 'center',
              width: '100%',
            };

            const tabLabelFocusedStyle: React.CSSProperties = {
              ...tabLabelStyle,
              color: theme.colors.primary,
              fontFamily: theme.fonts.semibold,
            };

            return (
              <div key={tab.path} style={tabItemStyle}>
                <div style={isFocused ? tabButtonFocusedStyle : tabButtonStyle}>
                  <button
                    style={tabButtonInnerStyle}
                    onClick={() => navigate(tab.path)}
                    onMouseDown={(e) => {
                      e.currentTarget.style.opacity = '0.7';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <Icon
                      size={20}
                      color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
                      style={{ transition: 'color 0.3s ease, transform 0.3s ease', transform: isFocused ? 'scale(1.05)' : 'scale(1)' }}
                    />
                    <span style={isFocused ? tabLabelFocusedStyle : tabLabelStyle}>
                      {tab.label}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in CustomTabBar:', error);
    return (
      <div style={{ padding: '20px', background: '#FF0000', color: '#FFFFFF' }}>
        Tab Bar Error: {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }
}

function AppContent() {
  try {
    const { theme } = useTheme();
    
    const appContentStyle: React.CSSProperties = {
      height: '100vh',
      width: '100%',
      backgroundColor: theme.colors.background,
      background: theme.colors.background,
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', // Space for tab bar + iOS safe area
      position: 'relative',
      overflow: 'hidden',
    };

    return (
      <div style={appContentStyle}>
        <Routes>
          <Route path="/" element={<CheckInScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
        <CustomTabBar />
      </div>
    );
  } catch (error) {
    console.error('Error in AppContent:', error);
    return (
      <div style={{ padding: '50px', background: '#FF0000', color: '#FFFFFF', fontSize: '20px' }}>
        <h1>AppContent Error</h1>
        <p>{error instanceof Error ? error.message : String(error)}</p>
        <pre>{error instanceof Error ? error.stack : ''}</pre>
      </div>
    );
  }
}

function AppWithAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#000000',
        color: '#FFFFFF'
      }}>
        <div>Se încarcă...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default function App() {
  try {
    return (
      <ThemeProvider>
        <AuthProvider>
          <AppWithAuth />
        </AuthProvider>
      </ThemeProvider>
    );
  } catch (error) {
    console.error('Error in App:', error);
    return (
      <div style={{ padding: '50px', background: '#FF0000', color: '#FFFFFF', fontSize: '20px' }}>
        <h1>App Error</h1>
        <p>{error instanceof Error ? error.message : String(error)}</p>
        <pre>{error instanceof Error ? error.stack : ''}</pre>
      </div>
    );
  }
}
