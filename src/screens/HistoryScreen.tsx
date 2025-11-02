import React, { useState, useEffect } from 'react';
import { getCheckInHistory, clearHistory, deleteCheckIn } from '../services/storageService';
import { CheckInRecord } from '../types/checkIn';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { IoTrashOutline, IoRefresh, IoRefreshOutline } from 'react-icons/io5';
import './HistoryScreen.css';

export default function HistoryScreen() {
  try {
    const { theme, isDark } = useTheme();
    const { user } = useAuth();
    const userId = user?.uid || '';
    const [history, setHistory] = useState<CheckInRecord[]>([]);
    const [refreshing, setRefreshing] = useState(false);
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

    const loadHistory = async () => {
      if (!userId) return;
      try {
        const data = await getCheckInHistory(userId);
        // Sort by start time, newest first
        const sorted = data.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setHistory(sorted);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };

    useEffect(() => {
      loadHistory();
    }, [userId]);

    const onRefresh = async () => {
      setRefreshing(true);
      await loadHistory();
      setRefreshing(false);
    };

    const handleClearHistory = () => {
      if (!userId) return;
      if (window.confirm('Confirmă: Ești sigur că vrei să ștergi tot istoricul?')) {
        (async () => {
          try {
            await clearHistory(userId);
            setHistory([]);
            window.alert('Succes: Istoricul a fost șters!');
          } catch (error) {
            window.alert('Eroare: Nu s-a putut șterge istoricul');
          }
        })();
      }
    };

    const handleDeleteItem = (id: string, startTime: string) => {
      if (!userId) return;
      if (window.confirm(`Confirmă: Ești sigur că vrei să ștergi această înregistrare de la ${new Date(startTime).toLocaleString('ro-RO')}?`)) {
        (async () => {
          try {
            await deleteCheckIn(userId, id);
            await loadHistory();
            window.alert('Succes: Înregistrarea a fost ștearsă!');
          } catch (error) {
            window.alert('Eroare: Nu s-a putut șterge înregistrarea');
          }
        })();
      }
    };

    const formatDuration = (totalSeconds: number): string => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    const formatTime = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const getEndTime = (item: CheckInRecord): string => {
      if (item.endTime) {
        return item.endTime;
      }
      // Calculate end time from startTime + duration
      const startDate = new Date(item.startTime);
      const endDate = new Date(startDate.getTime() + item.duration * 1000);
      return endDate.toISOString();
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

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: screenWidth < 375 ? '16px' : '20px',
      paddingBottom: screenHeight < 700 ? '12px' : '16px',
      flexShrink: 0,
    };

    const titleStyle: React.CSSProperties = {
      fontSize: screenWidth < 375 ? '28px' : screenWidth < 768 ? '32px' : '36px',
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
    };

    const headerButtonsStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      gap: '12px',
    };

    const actionButtonStyle: React.CSSProperties = {
      width: screenWidth < 375 ? '40px' : '44px',
      height: screenWidth < 375 ? '40px' : '44px',
      borderRadius: screenWidth < 375 ? '20px' : '22px',
      background: isDark 
        ? `linear-gradient(135deg, ${theme.colors.cardBackground} 0%, ${theme.colors.cardBackground}EE 100%)`
        : `linear-gradient(135deg, ${theme.colors.cardBackground} 0%, ${theme.colors.cardBackground}FF 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: isDark 
        ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)'
        : '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
      backdropFilter: 'blur(10px) saturate(180%)',
      WebkitBackdropFilter: 'blur(10px) saturate(180%)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const listStyle: React.CSSProperties = {
      flex: 1,
      padding: screenWidth < 375 ? '0 16px' : '0 20px',
      overflowY: 'auto',
      overflowX: 'hidden',
      width: '100%',
      minHeight: 0,
      WebkitOverflowScrolling: 'touch',
    };

    const listContentStyle: React.CSSProperties = {
      paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))',
      paddingTop: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: screenHeight < 700 ? '12px' : '14px',
    };

    const historyItemStyle: React.CSSProperties = {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: '20px',
      padding: screenHeight < 700 ? '16px' : '20px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: screenHeight < 700 ? '12px' : '14px',
    };

    const itemTopRowStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px',
    };

    const itemDateContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      flex: 1,
    };

    const itemDateStyle: React.CSSProperties = {
      fontSize: screenWidth < 375 ? '18px' : '20px',
      fontWeight: 700,
      color: theme.colors.text,
      letterSpacing: '-0.5px',
      fontFamily: theme.fonts.bold,
      lineHeight: '1.2',
    };

    const itemDayStyle: React.CSSProperties = {
      fontSize: screenWidth < 375 ? '12px' : '13px',
      fontWeight: 500,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.regular,
      opacity: 0.7,
    };

    const statusBadgeStyle: React.CSSProperties = {
      padding: '8px 16px',
      borderRadius: '16px',
      fontSize: '11px',
      fontWeight: 700,
      color: '#FFFFFF',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      fontFamily: theme.fonts.bold,
      transition: 'transform 0.2s ease',
      alignSelf: 'flex-start',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      minHeight: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const itemInfoGridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
      gap: screenWidth < 375 ? '12px' : '16px',
      paddingTop: '12px',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    };

    const infoItemStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      alignItems: 'flex-start',
    };

    const infoLabelStyle: React.CSSProperties = {
      fontSize: '11px',
      fontWeight: 600,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.medium,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      opacity: 0.7,
    };

    const infoValueStyle: React.CSSProperties = {
      fontSize: screenWidth < 375 ? '16px' : '18px',
      fontWeight: 700,
      color: theme.colors.text,
      fontFamily: theme.fonts.bold,
      lineHeight: '1.3',
    };

    const deleteButtonStyle: React.CSSProperties = {
      padding: '8px 16px',
      borderRadius: '16px',
      backgroundColor: 'rgba(255, 69, 58, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(255, 69, 58, 0.2)',
      border: '1px solid rgba(255, 69, 58, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      flexShrink: 0,
      minHeight: '32px',
      height: '32px',
    };

    const emptyContainerStyle: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px',
    };

    const emptyTextStyle: React.CSSProperties = {
      fontSize: screenWidth < 375 ? '26px' : screenWidth < 768 ? '30px' : '32px',
      fontWeight: 800,
      background: isDark 
        ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
        : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary}AA 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: screenHeight < 700 ? '12px' : '16px',
      letterSpacing: '-1px',
      textAlign: 'center',
      fontFamily: theme.fonts.bold,
    };

    const emptySubtextStyle: React.CSSProperties = {
      fontSize: screenWidth < 375 ? '15px' : '16px',
      color: theme.colors.textSecondary,
      maxWidth: screenWidth < 375 ? '280px' : '320px',
      lineHeight: screenHeight < 700 ? '22px' : '24px',
      textAlign: 'center',
      fontFamily: theme.fonts.regular,
      opacity: 0.8,
    };

    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={titleStyle}>Your History ({history.length})</div>
          <div style={headerButtonsStyle}>
            {history.length > 0 && (
              <button
                style={actionButtonStyle}
                onClick={handleClearHistory}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
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
                <IoTrashOutline size={18} color={theme.colors.text} />
              </button>
            )}
            <button
              style={actionButtonStyle}
              onClick={onRefresh}
              disabled={refreshing}
              onMouseDown={(e) => !refreshing && (e.currentTarget.style.opacity = '0.9')}
              onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
            >
              {refreshing ? (
                <IoRefresh size={18} color={theme.colors.text} />
              ) : (
                <IoRefreshOutline size={18} color={theme.colors.text} />
              )}
            </button>
          </div>
        </div>
        
        {history.length === 0 ? (
          <div style={emptyContainerStyle}>
            <div style={emptyTextStyle}>No Records</div>
            <div style={emptySubtextStyle}>
              Make a check-in to start recording sessions
            </div>
          </div>
        ) : (
          <div style={listStyle}>
            <div style={listContentStyle}>
              {history.map((item) => {
                const startDate = new Date(item.startTime);
                const dayNames = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
                const dayName = dayNames[startDate.getDay()];
                
                return (
                  <div key={item.id} style={historyItemStyle}>
                    <div style={itemTopRowStyle}>
                      <div style={itemDateContainerStyle}>
                        <div style={itemDateStyle}>{formatDate(item.startTime)}</div>
                        <div style={itemDayStyle}>{dayName}</div>
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '12px',
                      }}>
                        <div style={{
                          ...statusBadgeStyle,
                          backgroundColor: item.status === 'checked-out' ? theme.colors.primary : '#34C759',
                        }}>
                          {item.status === 'checked-out' ? 'Completat' : 'Activ'}
                        </div>
                        <button
                          style={deleteButtonStyle}
                          onClick={() => handleDeleteItem(item.id, item.startTime)}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'scale(0.95)';
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
                          <IoTrashOutline size={screenWidth < 375 ? 18 : 20} color={theme.colors.error} />
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      ...itemInfoGridStyle,
                      gridTemplateColumns: item.status === 'checked-out' 
                        ? 'repeat(3, 1fr)' 
                        : 'repeat(2, 1fr)',
                    }}>
                      <div style={infoItemStyle}>
                        <div style={infoLabelStyle}>Check-in</div>
                        <div style={infoValueStyle}>{formatTime(item.startTime)}</div>
                      </div>
                      {item.status === 'checked-out' && (
                        <div style={infoItemStyle}>
                          <div style={infoLabelStyle}>Check-out</div>
                          <div style={infoValueStyle}>{formatTime(getEndTime(item))}</div>
                        </div>
                      )}
                      <div style={infoItemStyle}>
                        <div style={infoLabelStyle}>Durată</div>
                        <div style={infoValueStyle}>{formatDuration(item.duration)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in HistoryScreen:', error);
    return (
      <div style={{ padding: '50px', background: '#FF0000', color: '#FFFFFF', fontSize: '20px' }}>
        <h1>HistoryScreen Error</h1>
        <p>{error instanceof Error ? error.message : String(error)}</p>
        <pre>{error instanceof Error ? error.stack : ''}</pre>
      </div>
    );
  }
}
