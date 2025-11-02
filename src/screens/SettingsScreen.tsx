import React, { useState, useEffect } from 'react';
import { getAppSettings, saveSettings, AppSettings } from '../services/storageService';
import { pushService } from '../services/pushService';
import { useTheme } from '../contexts/ThemeContext';
import { IoSunny, IoMoon, IoPhonePortrait, IoCheckmarkCircle, IoNotificationsOutline, IoCheckmark, IoInformationCircleOutline } from 'react-icons/io5';
import './SettingsScreen.css';

export default function SettingsScreen() {
  try {
    const { theme, isDark, accentColor, themeMode, setThemeMode, setAccentColor } = useTheme();
    const [settings, setSettings] = useState<AppSettings>({
      targetHours: 32400,
      notificationsEnabled: false,
    });
    const [hours, setHours] = useState('9');
    const [notificationPermission, setNotificationPermission] = useState<string>('default');

    useEffect(() => {
      loadSettings();
      checkNotificationPermission();
    }, []);

    const loadSettings = async () => {
      try {
        const loadedSettings = await getAppSettings();
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
        
        if (permission === 'granted') {
          setSettings(prev => ({ ...prev, notificationsEnabled: true }));
          await saveSettings({ ...settings, notificationsEnabled: true });
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

      const targetSeconds = Math.floor(hoursNum * 3600);
      const newSettings = { ...settings, targetHours: targetSeconds };
      
      try {
        await saveSettings(newSettings);
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

    const handleThemeModeChange = (mode: 'light' | 'dark' | 'auto') => {
      setThemeMode(mode);
    };

    const handleAccentColorChange = (color: string) => {
      setAccentColor(color);
    };

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.colors.background,
      paddingTop: 'max(20px, env(safe-area-inset-top))', // iOS notch support
      minHeight: '100vh',
      minHeight: '-webkit-fill-available' as any, // iOS Safari
      width: '100%',
    };

    const contentContainerStyle: React.CSSProperties = {
      padding: '24px',
      paddingBottom: '100px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    };

    const sectionStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: '32px',
      fontWeight: 700,
      color: theme.colors.text,
      letterSpacing: '-0.5px',
      fontFamily: theme.fonts.bold,
    };

    const settingCardStyle: React.CSSProperties = {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: '24px',
      padding: '24px',
      boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: isDark ? `1px solid ${theme.colors.border}` : 'none',
    };

    const settingInfoStyle: React.CSSProperties = {
      marginBottom: '20px',
    };

    const settingLabelStyle: React.CSSProperties = {
      fontSize: '17px',
      fontWeight: 700,
      color: theme.colors.text,
      marginBottom: '8px',
      letterSpacing: '-0.3px',
      fontFamily: theme.fonts.bold,
    };

    const settingDescriptionStyle: React.CSSProperties = {
      fontSize: '14px',
      color: theme.colors.textSecondary,
      lineHeight: '20px',
      marginBottom: '16px',
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
      backgroundColor: theme.colors.primary,
      borderRadius: '16px',
      padding: '14px 24px',
      gap: '8px',
      boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: 'none',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    };

    const permissionButtonActiveStyle: React.CSSProperties = {
      ...permissionButtonStyle,
      backgroundColor: theme.colors.success,
    };

    const permissionButtonTextStyle: React.CSSProperties = {
      fontSize: '16px',
      fontWeight: 700,
      color: isDark && theme.colors.primary === '#000000' ? '#FFFFFF' : (isDark ? theme.colors.background : '#FFFFFF'),
      fontFamily: theme.fonts.bold,
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
      backgroundColor: theme.colors.cardBackground,
      borderRadius: '16px',
      padding: '14px 16px',
      fontSize: '18px',
      fontWeight: 600,
      color: theme.colors.text,
      border: `1px solid ${theme.colors.border}`,
      fontFamily: theme.fonts.mono,
      textAlign: 'center',
      minWidth: '80px',
    };

    const hoursLabelStyle: React.CSSProperties = {
      fontSize: '16px',
      fontWeight: 600,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.regular,
    };

    const saveButtonStyle: React.CSSProperties = {
      backgroundColor: theme.colors.primary,
      borderRadius: '16px',
      padding: '14px 24px',
      boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: 'none',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    };

    const saveButtonTextStyle: React.CSSProperties = {
      color: isDark && theme.colors.primary === '#000000' ? '#FFFFFF' : (isDark ? theme.colors.background : '#FFFFFF'),
      fontSize: '16px',
      fontWeight: 700,
      fontFamily: theme.fonts.bold,
    };

    const infoCardStyle: React.CSSProperties = {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: '24px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'row',
      gap: '12px',
      alignItems: 'flex-start',
      boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: isDark ? `1px solid ${theme.colors.border}` : 'none',
    };

    const infoTextStyle: React.CSSProperties = {
      flex: 1,
      fontSize: '14px',
      color: theme.colors.textSecondary,
      lineHeight: '20px',
      fontFamily: theme.fonts.regular,
    };

    const themeOptionsStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      gap: '12px',
      marginTop: '8px',
    };

    const themeOptionStyle: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 16px',
      borderRadius: '20px',
      backgroundColor: theme.colors.backgroundSecondary,
      border: '2px solid transparent',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    };

    const themeOptionActiveStyle: React.CSSProperties = {
      ...themeOptionStyle,
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    };

    const themeOptionTextStyle: React.CSSProperties = {
      fontSize: '14px',
      fontWeight: 600,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.medium,
    };

    const themeOptionTextActiveStyle: React.CSSProperties = {
      ...themeOptionTextStyle,
      color: '#FFFFFF',
      fontFamily: theme.fonts.semibold,
    };

    const colorPickerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '8px',
    };

    const colorOptionStyle: React.CSSProperties = {
      width: '48px',
      height: '48px',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '3px solid transparent',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    };

    const colorOptionActiveStyle: React.CSSProperties = {
      ...colorOptionStyle,
      borderColor: theme.colors.text,
      transform: 'scale(1.1)',
    };

    return (
      <div style={containerStyle}>
        <div style={contentContainerStyle}>
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>APPEARANCE</div>
            <div style={settingCardStyle}>
              <div style={settingInfoStyle}>
                <div style={settingLabelStyle}>Temă</div>
                <div style={settingDescriptionStyle}>
                  Alege modul de afișare: deschis, închis sau automat bazat pe setările browserului
                </div>
              </div>
              <div style={themeOptionsStyle}>
                <button
                  style={themeMode === 'light' ? themeOptionActiveStyle : themeOptionStyle}
                  onClick={() => handleThemeModeChange('light')}
                  onMouseDown={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <IoSunny size={20} color={themeMode === 'light' ? theme.colors.primary : theme.colors.textSecondary} />
                  <span style={themeMode === 'light' ? themeOptionTextActiveStyle : themeOptionTextStyle}>
                    Deschis
                  </span>
                </button>
                <button
                  style={themeMode === 'dark' ? themeOptionActiveStyle : themeOptionStyle}
                  onClick={() => handleThemeModeChange('dark')}
                  onMouseDown={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <IoMoon size={20} color={themeMode === 'dark' ? theme.colors.primary : theme.colors.textSecondary} />
                  <span style={themeMode === 'dark' ? themeOptionTextActiveStyle : themeOptionTextStyle}>
                    Închis
                  </span>
                </button>
                <button
                  style={themeMode === 'auto' ? themeOptionActiveStyle : themeOptionStyle}
                  onClick={() => handleThemeModeChange('auto')}
                  onMouseDown={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <IoPhonePortrait size={20} color={themeMode === 'auto' ? theme.colors.primary : theme.colors.textSecondary} />
                  <span style={themeMode === 'auto' ? themeOptionTextActiveStyle : themeOptionTextStyle}>
                    Automat
                  </span>
                </button>
              </div>
            </div>
          </div>

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
                onMouseDown={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
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
