import React, { useState, useEffect, useRef } from 'react';
import { usePersistentTimer } from '../hooks/usePersistentTimer';
import { saveCheckIn, clearActiveCheckIn, getActiveCheckIn, getAppSettings } from '../services/storageService';
import { CheckInRecord } from '../types/checkIn';
import { pushService } from '../services/pushService';
import { scheduleNotification, cancelScheduledNotification, scheduleRecurringNotifications } from '../services/notificationService';
import { useTheme } from '../contexts/ThemeContext';
import './CheckInScreen.css';

export default function CheckInScreen() {
  try {
    const { theme, isDark } = useTheme();
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

    const {
      seconds,
      isRunning,
      isCheckedIn,
      startCheckIn,
      pause,
      resume,
      reset,
      checkOut,
    } = usePersistentTimer();
    const [checkInStartTime, setCheckInStartTime] = useState<string | null>(null);
    const [notificationSent, setNotificationSent] = useState(false);
    const [targetHours, setTargetHours] = useState<number>(32400); // Default 9 hours
    const checkInIdRef = useRef<string | null>(null);
    const lastRecurringNotificationRef = useRef<number>(0);

    useEffect(() => {
      // Initialize push service
      pushService.initialize();
      pushService.requestPermission();
      
      // Load settings
      const loadSettings = async () => {
        try {
          const settings = await getAppSettings();
          setTargetHours(settings.targetHours);
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      };
      loadSettings();
    }, []);

    // Update checkInStartTime when isCheckedIn changes
    useEffect(() => {
      const loadState = async () => {
        if (isCheckedIn) {
          const savedState = await getActiveCheckIn();
          if (savedState) {
            setCheckInStartTime(savedState.startTime);
            
            // Re-schedule notification if check-in was restored from storage
            if (!checkInIdRef.current) {
              checkInIdRef.current = `checkin-${Date.now()}`;
              const startTimestamp = new Date(savedState.startTime).getTime();
              const now = Date.now();
              const elapsed = Math.floor((now - startTimestamp) / 1000) - (savedState.pausedDuration || 0);
              
              // Only schedule if we haven't reached target hours yet
              if (elapsed < targetHours) {
                await scheduleNotification(checkInIdRef.current, savedState.startTime, targetHours);
                console.log('[CheckInScreen] Restored check-in, scheduled notification for target hours');
              } else {
                // If past target hours, start recurring notifications immediately
                await scheduleRecurringNotifications(checkInIdRef.current, savedState.startTime, targetHours);
                // Mark target hours notification as sent
                setNotificationSent(true);
                // Set last recurring notification to avoid duplicate
                const minutesSinceTarget = Math.floor((elapsed - targetHours) / 60);
                lastRecurringNotificationRef.current = targetHours + (Math.floor(minutesSinceTarget / 5) * 5 * 60);
              }
            }
          }
        } else {
          setCheckInStartTime(null);
          checkInIdRef.current = null;
        }
      };
      
      loadState();
    }, [isCheckedIn, targetHours]);

    // Monitor timer for target hours notification and recurring notifications (fallback when app is open)
    useEffect(() => {
      if (isCheckedIn) {
        // First notification at target hours
        if (seconds >= targetHours && !notificationSent) {
          // Send notification when reaching target hours (only if app is open)
          const hours = Math.floor(targetHours / 3600);
          pushService.sendLocalNotification(`${hours} ore atinse!`, {
            body: `Ai făcut ${hours} ${hours === 1 ? 'oră' : 'ore'} de check-in!`,
            data: {
              url: '/',
            },
          });
          setNotificationSent(true);
          console.log('Notificare trimisă la target hours (app open):', seconds);
          
          // Start recurring notifications
          if (checkInIdRef.current && checkInStartTime) {
            scheduleRecurringNotifications(checkInIdRef.current, checkInStartTime, targetHours);
            lastRecurringNotificationRef.current = seconds;
          }
        }
        
        // Recurring notifications every 5 minutes after target hours
        if (seconds >= targetHours && seconds > lastRecurringNotificationRef.current) {
          const minutesSinceTarget = Math.floor((seconds - targetHours) / 60);
          // Send notification every 5 minutes
          if (minutesSinceTarget > 0 && minutesSinceTarget % 5 === 0) {
            const lastNotificationMinutes = Math.floor((lastRecurringNotificationRef.current - targetHours) / 60);
            // Only send if this is a new 5-minute mark
            if (lastNotificationMinutes < minutesSinceTarget) {
              pushService.sendLocalNotification('Done Work', {
                body: 'Ai făcut ' + formatTime(seconds) + ' de check-in!',
                data: {
                  url: '/',
                },
              });
              lastRecurringNotificationRef.current = seconds;
              console.log('Notificare recurentă "Done Work" (app open):', seconds);
            }
          }
        }
      }
    }, [seconds, isCheckedIn, notificationSent, checkInStartTime, targetHours]);

    const formatTime = (totalSeconds: number): string => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleCheckIn = async () => {
      startCheckIn();
      const startTime = new Date().toISOString();
      setCheckInStartTime(startTime);
      setNotificationSent(false);
      
      // Generate unique check-in ID
      checkInIdRef.current = `checkin-${Date.now()}`;
      
      // Schedule notification in Service Worker for background notifications
      await scheduleNotification(checkInIdRef.current, startTime, targetHours);
      console.log('[CheckInScreen] Scheduled notification for target hours');
    };

    const handleCheckOut = async () => {
      if (!isCheckedIn || !checkInStartTime) {
        window.alert('Eroare: Trebuie să faci check-in mai întâi!');
        return;
      }

      try {
        const endTime = new Date().toISOString();
        const record: CheckInRecord = {
          id: Date.now().toString(),
          startTime: checkInStartTime,
          endTime: endTime,
          duration: seconds,
          status: 'checked-out',
        };

        await saveCheckIn(record);
        
        window.alert('Succes: Check-out realizat cu succes!');
        
        // Send push notification
        await pushService.sendLocalNotification('Check-out realizat!', {
          body: `Durată: ${formatTime(seconds)}`,
          data: {
            url: '/',
          },
        });
        
        // Cancel scheduled notification
        if (checkInIdRef.current) {
          await cancelScheduledNotification(checkInIdRef.current);
          checkInIdRef.current = null;
        }
        
        // Clear saved state and reset
        await clearActiveCheckIn();
        setNotificationSent(false);
        lastRecurringNotificationRef.current = 0;
        checkOut();
      } catch (error) {
        window.alert('Eroare: Nu s-a putut salva check-out-ul');
        console.error(error);
      }
    };

    const isSmallScreen = screenHeight < 700;
    const timerFontSize = isSmallScreen ? 52 : screenWidth < 375 ? 60 : 72;

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
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      justifyContent: 'center',
      padding: '24px',
      paddingBottom: '100px',
      alignItems: 'center',
      minHeight: 'calc(100vh - 100px)',
    };

    const timerCardStyle: React.CSSProperties = {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: '24px',
      padding: '32px',
      width: '100%',
      maxWidth: '400px',
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: isDark ? `1px solid ${theme.colors.border}` : 'none',
    };

    const timerLabelStyle: React.CSSProperties = {
      fontSize: '11px',
      fontWeight: 600,
      color: theme.colors.textSecondary,
      letterSpacing: '1px',
      marginBottom: '12px',
      textTransform: 'uppercase',
      fontFamily: theme.fonts.medium,
    };

    const timerTextStyle: React.CSSProperties = {
      fontSize: `${timerFontSize}px`,
      fontWeight: 700,
      color: theme.colors.text,
      textAlign: 'center',
      letterSpacing: '-2px',
      fontFamily: theme.fonts.bold,
    };

    const buttonContainerStyle: React.CSSProperties = {
      width: '100%',
      maxWidth: '400px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    };

    const buttonStyle: React.CSSProperties = {
      width: '100%',
      padding: '16px 24px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: 'none',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    };

    const buttonTextStyle: React.CSSProperties = {
      color: isDark && theme.colors.primary === '#000000' ? '#FFFFFF' : (isDark ? theme.colors.background : '#FFFFFF'),
      fontSize: '17px',
      fontWeight: 700,
      fontFamily: theme.fonts.bold,
    };

    return (
      <div style={containerStyle}>
        <div style={contentContainerStyle}>
          <div style={timerCardStyle}>
            <div style={timerLabelStyle}>ELAPSED TIME</div>
            <div style={timerTextStyle}>{formatTime(seconds)}</div>
          </div>

          <div style={buttonContainerStyle}>
            {!isCheckedIn ? (
              <button
                style={buttonStyle}
                onClick={handleCheckIn}
                onMouseDown={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span style={buttonTextStyle}>Check-in</span>
              </button>
            ) : (
              <>
                {!isRunning ? (
                  <button
                    style={buttonStyle}
                    onClick={resume}
                    onMouseDown={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <span style={buttonTextStyle}>Reia</span>
                  </button>
                ) : (
                  <button
                    style={buttonStyle}
                    onClick={pause}
                    onMouseDown={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <span style={buttonTextStyle}>Pause</span>
                  </button>
                )}

                <button
                  style={buttonStyle}
                  onClick={handleCheckOut}
                  onMouseDown={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <span style={buttonTextStyle}>Check-out</span>
                </button>
              </>
            )}
          </div>

          {isCheckedIn && checkInStartTime && (
            <div style={{
              backgroundColor: theme.colors.cardBackground,
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '400px',
              marginTop: '24px',
              boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
              border: isDark ? `1px solid ${theme.colors.border}` : 'none',
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: theme.colors.textSecondary,
                letterSpacing: '1px',
                marginBottom: '20px',
                textTransform: 'uppercase',
                fontFamily: theme.fonts.medium,
              }}>CHECK-IN INFO</div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: theme.colors.textSecondary,
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  fontFamily: theme.fonts.medium,
                }}>Start Time</div>
                <div style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.semibold,
                }}>{new Date(checkInStartTime).toLocaleString('ro-RO')}</div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: theme.colors.textSecondary,
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  fontFamily: theme.fonts.medium,
                }}>Estimated Check-out</div>
                <div style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.semibold,
                }}>{(() => {
                  const startTime = new Date(checkInStartTime);
                  const estimatedCheckOut = new Date(startTime.getTime() + targetHours * 1000);
                  return estimatedCheckOut.toLocaleString('ro-RO');
                })()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in CheckInScreen:', error);
    return (
      <div style={{ padding: '50px', background: '#FF0000', color: '#FFFFFF', fontSize: '20px' }}>
        <h1>CheckInScreen Error</h1>
        <p>{error instanceof Error ? error.message : String(error)}</p>
        <pre>{error instanceof Error ? error.stack : ''}</pre>
      </div>
    );
  }
}
