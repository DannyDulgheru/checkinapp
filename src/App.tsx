import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import CheckInScreen from './screens/CheckInScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
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
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingBottom: 'calc(10px + env(safe-area-inset-bottom))', // iOS safe area for home indicator
      backgroundColor: theme.colors.tabBarBackground,
      borderTop: isDark ? `1px solid ${theme.colors.tabBarBorder}` : 'none',
      boxShadow: isDark ? '0 -2px 8px rgba(0, 0, 0, 0.3)' : '0 -2px 8px rgba(0, 0, 0, 0.08)',
      zIndex: 1000,
    };

    const tabBarContentStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: theme.colors.tabBarBackground,
      borderRadius: '20px',
      padding: '6px 4px',
      gap: '4px',
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
              backgroundColor: theme.colors.primary,
            };

            const tabButtonInnerStyle: React.CSSProperties = {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 12px',
              gap: '4px',
              minHeight: '52px',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              transition: 'opacity 0.2s',
            };

            const tabLabelStyle: React.CSSProperties = {
              fontSize: '11px',
              fontWeight: 600,
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.medium,
              marginTop: '2px',
            };

            const tabLabelFocusedStyle: React.CSSProperties = {
              ...tabLabelStyle,
              color: isDark && theme.colors.primary === '#000000' ? '#FFFFFF' : (isDark ? theme.colors.background : '#FFFFFF'),
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
                      size={22}
                      color={isFocused ? (isDark && theme.colors.primary === '#000000' ? '#FFFFFF' : (isDark ? theme.colors.background : '#FFFFFF')) : theme.colors.textSecondary}
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
      minHeight: '100vh',
      minHeight: '-webkit-fill-available' as any, // iOS Safari
      width: '100%',
      backgroundColor: theme.colors.background,
      paddingBottom: 'calc(100px + env(safe-area-inset-bottom))', // Space for tab bar + iOS safe area
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

export default function App() {
  try {
    return (
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
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
