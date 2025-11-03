import React, { useState, useEffect } from 'react';
import { getAppSettings, saveSettings, AppSettings } from '../services/storageService';
import { pushService } from '../services/pushService';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { IoCheckmarkCircle, IoNotificationsOutline, IoCheckmark, IoInformationCircleOutline } from 'react-icons/io5';
import RealtimeDatabaseTest from '../components/RealtimeDatabaseTest';
import './SettingsScreen.css';

export default function SettingsScreen() {
  try {
    const { theme, isDark, accentColor, setAccentColor } = useTheme();
    const { user, signOut } = useAuth();
    const userId = user?.uid || '';
    const [settings, setSettings] = useState<AppSettings>({
      targetHours: 32400,
      notificationsEnabled: false,
    });
    const [hours, setHours] = useState('9');
    const [notificationPermission, setNotificationPermission] = useState<string>('default');
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);

    useEffect(() => {
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
        setScreenHeight(window.innerHeight);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
      if (userId) {
        loadSettings();
      }
      checkNotificationPermission();
    }, [userId]);

    const loadSettings = async () => {
      if (!userId) return;
      try {
        const loadedSettings = await getAppSettings(userId);
        setSettings(loadedSettings);
        setHours((loadedSettings.targetHours / 3600).toString());
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    const checkNotificationPermission = async () => {
      try {
        if ('Notification' in window) {
          const permission = Notification.permission;
          setNotificationPermission(permission);
          setSettings(prev => ({ ...prev, notificationsEnabled: permission === 'granted' }));
        }
      } catch (error) {
        console.error('Error checking notification permission:', error);
      }
    };

    const handleRequestNotificationPermission = async () => {
      try {
        const permission = await pushService.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted' && userId) {
          setSettings(prev => ({ ...prev, notificationsEnabled: true }));
          await saveSettings(userId, { ...settings, notificationsEnabled: true });
          window.alert('Succes: Permisiunile pentru notificări au fost acordate!');
        } else {
          window.alert(
            'Permisiune refuzată: Nu poți primi notificări fără permisiune. Poți activa permisiunile în setările browserului.'
          );
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        window.alert('Eroare: Nu s-a putut solicita permisiunea pentru notificări');
      }
    };

    const handleSaveHours = async () => {
      const hoursNum = parseFloat(hours);
      if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 24) {
        window.alert('Eroare: Te rog introdu un număr valid între 0.1 și 24 ore');
        return;
      }

      if (!userId) return;
      const targetSeconds = Math.floor(hoursNum * 3600);
      const newSettings = { ...settings, targetHours: targetSeconds };
      
      try {
        await saveSettings(userId, newSettings);
        setSettings(newSettings);
        window.alert(`Succes: Orele țintă au fost setate la ${hoursNum} ${hoursNum === 1 ? 'oră' : 'ore'}`);
      } catch (error) {
        window.alert('Eroare: Nu s-au putut salva setările');
      }
    };

    const accentColors = [
      '#007AFF', '#5856D6', '#34C759', '#FF3B30', '#FF9500',
      '#FF2D92', '#5AC8FA', '#AF52DE', '#FF6B35', '#00C896'
    ];

    const handleAccentColorChange = (color: string) => {
      setAccentColor(color);
    };

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDark ? '#000000' : theme.colors.background,
      background: isDark 
        ? '#000000'
        : `radial-gradient(ellipse at top, ${theme.colors.primary}05 0%, ${theme.colors.background} 50%)`,
      paddingTop: `max(${screenHeight < 700 ? '16px' : '20px'}, env(safe-area-inset-top))`,
      height: '100vh',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
    };

    const contentContainerStyle: React.CSSProperties = {
      padding: screenWidth < 375 ? '12px' : '16px',
      paddingBottom: 'calc(130px + env(safe-area-inset-bottom, 0px))',
      display: 'flex',
      flexDirection: 'column',
      gap: screenHeight < 700 ? '14px' : '16px',
      overflowY: 'auto',
      overflowX: 'hidden',
      height: '100%',
      WebkitOverflowScrolling: 'touch',
    };

    const sectionStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: screenHeight < 700 ? '10px' : '12px',
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: screenWidth < 375 ? '24px' : screenWidth < 768 ? '28px' : '32px',
      fontWeight: 800,
      background: isDark 
        ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
        : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary}AA 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: screenWidth < 375 ? '-0.5px' : '-1px',
      fontFamily: theme.fonts.bold,
      lineHeight: '1.2',
      marginBottom: screenHeight < 700 ? '8px' : '10px',
    };

    const settingCardStyle: React.CSSProperties = {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: screenWidth < 375 ? '20px' : '24px',
      padding: screenHeight < 700 ? '16px' : '18px',
      boxShadow: isDark 
        ? '0 4px 16px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)'
        : '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.05)',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    };

    const settingInfoStyle: React.CSSProperties = {
      marginBottom: screenHeight < 700 ? '14px' : '16px',
    };

    const settingLabelStyle: React.CSSProperties = {
      fontSize: screenWidth < 375 ? '15px' : '16px',
      fontWeight: 700,
      color: theme.colors.text,
      marginBottom: '6px',
      letterSpacing: '-0.3px',
      fontFamily: theme.fonts.bold,
    };

    const settingDescriptionStyle: React.CSSProperties = {
      fontSize: screenWidth < 375 ? '12px' : '13px',
      color: theme.colors.textSecondary,
      lineHeight: screenHeight < 700 ? '18px' : '20px',
      marginBottom: screenHeight < 700 ? '12px' : '14px',
      fontFamily: theme.fonts.regular,
    };

    const permissionStatusStyle: React.CSSProperties = {
      fontSize: '13px',
      color: theme.colors.textSecondary,
      marginTop: '4px',
      fontFamily: theme.fonts.regular,
    };

    const permissionButtonStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
      borderRadius: screenWidth < 375 ? '16px' : '18px',
      padding: screenHeight < 700 ? '14px 24px' : '16px 28px',
      gap: '10px',
      boxShadow: isDark 
        ? `0 6px 20px ${theme.colors.primary}40, 0 3px 10px rgba(0, 0, 0, 0.3)`
        : `0 6px 20px ${theme.colors.primary}30, 0 3px 10px rgba(0, 0, 0, 0.1)`,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    };

    const permissionButtonActiveStyle: React.CSSProperties = {
      ...permissionButtonStyle,
      background: `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}DD 100%)`,
      boxShadow: isDark 
        ? `0 8px 24px ${theme.colors.success}40, 0 4px 12px rgba(0, 0, 0, 0.3)`
        : `0 8px 24px ${theme.colors.success}30, 0 4px 12px rgba(0, 0, 0, 0.1)`,
    };

    const permissionButtonTextStyle: React.CSSProperties = {
      fontSize: screenWidth < 375 ? '15px' : '16px',
      fontWeight: 700,
      color: '#FFFFFF',
      fontFamily: theme.fonts.bold,
      letterSpacing: '0.3px',
      position: 'relative',
      zIndex: 1,
    };

    const permissionButtonTextActiveStyle: React.CSSProperties = {
      ...permissionButtonTextStyle,
      color: '#FFFFFF',
    };

    const hoursInputContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '12px',
    };

    const hoursInputStyle: React.CSSProperties = {
      flex: 1,
      background: isDark 
        ? `linear-gradient(135deg, ${theme.colors.cardBackground} 0%, ${theme.colors.cardBackground}EE 100%)`
        : `linear-gradient(135deg, ${theme.colors.cardBackground} 0%, ${theme.colors.cardBackground}FF 100%)`,
      borderRadius: '20px',
      padding: '16px 20px',
      fontSize: '20px',
      fontWeight: 700,
      color: theme.colors.text,
      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
      fontFamily: theme.fonts.mono,
      textAlign: 'center',
      minWidth: '100px',
      boxShadow: isDark 
        ? '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.05)'
        : '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(0, 0, 0, 0.03)',
      transition: 'all 0.3s ease',
    };

    const hoursLabelStyle: React.CSSProperties = {
      fontSize: '16px',
      fontWeight: 600,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.regular,
    };

    const saveButtonStyle: React.CSSProperties = {
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
      borderRadius: '20px',
      padding: '16px 28px',
      boxShadow: isDark 
        ? `0 8px 24px ${theme.colors.primary}40, 0 4px 12px rgba(0, 0, 0, 0.3)`
        : `0 8px 24px ${theme.colors.primary}30, 0 4px 12px rgba(0, 0, 0, 0.1)`,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    };

    const saveButtonTextStyle: React.CSSProperties = {
      color: '#FFFFFF',
      fontSize: '17px',
      fontWeight: 700,
      fontFamily: theme.fonts.bold,
      letterSpacing: '0.5px',
      position: 'relative',
      zIndex: 1,
    };

    const buttonStyle: React.CSSProperties = {
      ...permissionButtonStyle,
      background: `linear-gradient(135deg, ${theme.colors.error || '#FF3B30'} 0%, ${theme.colors.error || '#FF3B30'}DD 100%)`,
      boxShadow: isDark 
        ? `0 6px 20px ${theme.colors.error || '#FF3B30'}40, 0 3px 10px rgba(0, 0, 0, 0.3)`
        : `0 6px 20px ${theme.colors.error || '#FF3B30'}30, 0 3px 10px rgba(0, 0, 0, 0.1)`,
    };

    const buttonTextStyle: React.CSSProperties = {
      ...permissionButtonTextStyle,
      zIndex: 1,
    };

    const infoCardStyle: React.CSSProperties = {
      background: isDark 
        ? `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.cardBackground}EE 100%)`
        : `linear-gradient(135deg, ${theme.colors.primary}10 0%, ${theme.colors.cardBackground}FF 100%)`,
      borderRadius: '28px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'row',
      gap: '16px',
      alignItems: 'flex-start',
      boxShadow: isDark 
        ? '0 12px 40px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)'
        : '0 12px 40px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08)',
      border: isDark ? `1px solid ${theme.colors.primary}30` : `1px solid ${theme.colors.primary}20`,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    };

    const infoTextStyle: React.CSSProperties = {
      flex: 1,
      fontSize: '14px',
      color: theme.colors.textSecondary,
      lineHeight: '20px',
      fontFamily: theme.fonts.regular,
    };

    const colorPickerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '8px',
    };

    const colorOptionStyle: React.CSSProperties = {
      width: screenWidth < 375 ? '48px' : '52px',
      height: screenWidth < 375 ? '48px' : '52px',
      borderRadius: screenWidth < 375 ? '24px' : '26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '3px solid transparent',
      boxShadow: isDark 
        ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)'
        : '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    };

    const colorOptionActiveStyle: React.CSSProperties = {
      ...colorOptionStyle,
      borderColor: theme.colors.text,
      transform: 'scale(1.1)',
      boxShadow: isDark 
        ? `0 6px 20px ${accentColor}60, 0 4px 12px rgba(0, 0, 0, 0.4)`
        : `0 6px 20px ${accentColor}50, 0 4px 12px rgba(0, 0, 0, 0.2)`,
    };

    return (
      <div style={containerStyle}>
        <div style={contentContainerStyle}>
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>ACCENT COLOR</div>
            <div style={settingCardStyle}>
              <div style={settingInfoStyle}>
                <div style={settingLabelStyle}>Alege Culoarea Accent</div>
                <div style={settingDescriptionStyle}>
                  Selectează culoarea accentului pentru interfață
                </div>
              </div>
              <div style={colorPickerStyle}>
                {accentColors.map((color) => (
                  <button
                    key={color}
                    style={{
                      ...(accentColor === color ? colorOptionActiveStyle : colorOptionStyle),
                      backgroundColor: color,
                    }}
                    onClick={() => handleAccentColorChange(color)}
                    onMouseDown={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {accentColor === color && (
                      <IoCheckmark size={20} color="#FFFFFF" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>NOTIFICATIONS</div>
            <div style={settingCardStyle}>
              <div style={settingInfoStyle}>
                <div style={settingLabelStyle}>Permisiuni Notificări</div>
                <div style={settingDescriptionStyle}>
                  Activează permisiunile pentru a primi notificări când ai făcut orele țintă
                </div>
                <div style={permissionStatusStyle}>
                  Status: {
                    notificationPermission === 'granted' ? '✓ Acordate' :
                    notificationPermission === 'denied' ? '✗ Refuzate' :
                    '? Nedeterminat'
                  }
                </div>
              </div>
              <button
                style={notificationPermission === 'granted' ? permissionButtonActiveStyle : permissionButtonStyle}
                onClick={handleRequestNotificationPermission}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.96)';
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {notificationPermission === 'granted' ? (
                  <IoCheckmarkCircle size={24} color="#ffffff" />
                ) : (
                  <IoNotificationsOutline size={24} color={isDark && theme.colors.primary === '#000000' ? '#FFFFFF' : theme.colors.primary} />
                )}
                <span style={notificationPermission === 'granted' ? permissionButtonTextActiveStyle : permissionButtonTextStyle}>
                  {notificationPermission === 'granted' ? 'Active' : 'Activează'}
                </span>
              </button>
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>TARGET HOURS</div>
            <div style={settingCardStyle}>
              <div style={settingInfoStyle}>
                <div style={settingLabelStyle}>Număr de Ore</div>
                <div style={settingDescriptionStyle}>
                  Setează câte ore vrei să lucrezi înainte de a primi notificarea (1-24 ore)
                </div>
              </div>
              <div style={hoursInputContainerStyle}>
                <input
                  type="number"
                  style={hoursInputStyle}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="9"
                />
                <span style={hoursLabelStyle}>ore</span>
                <button
                  style={saveButtonStyle}
                  onClick={handleSaveHours}
                  onMouseDown={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <span style={saveButtonTextStyle}>Salvează</span>
                </button>
              </div>
            </div>
          </div>

          <div style={infoCardStyle}>
            <IoInformationCircleOutline size={20} color={theme.colors.textSecondary} />
            <span style={infoTextStyle}>
              Notifications will be sent when you reach the target hours. After that, you'll receive notifications every 5 minutes.
            </span>
          </div>

          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>ACCOUNT</div>
            <div style={settingCardStyle}>
              <div style={settingInfoStyle}>
                <div style={settingLabelStyle}>Cont Google</div>
                <div style={settingDescriptionStyle}>
                  {user?.email || 'Utilizator neconectat'}
                </div>
              </div>
              <button
                style={buttonStyle}
                onClick={async () => {
                  if (window.confirm('Ești sigur că vrei să te deconectezi?')) {
                    try {
                      await signOut();
                    } catch (error) {
                      console.error('Error signing out:', error);
                      window.alert('Eroare la deconectare');
                    }
                  }
                }}
                onMouseDown={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span style={buttonTextStyle}>Deconectează-te</span>
              </button>
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>FIREBASE TEST</div>
            <div style={settingCardStyle}>
              <RealtimeDatabaseTest />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in SettingsScreen:', error);
    return (
      <div style={{ padding: '50px', background: '#FF0000', color: '#FFFFFF', fontSize: '20px' }}>
        <h1>SettingsScreen Error</h1>
        <p>{error instanceof Error ? error.message : String(error)}</p>
        <pre>{error instanceof Error ? error.stack : ''}</pre>
      </div>
    );
  }
}
