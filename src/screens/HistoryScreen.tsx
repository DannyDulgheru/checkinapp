import React, { useState, useEffect } from 'react';
import { getCheckInHistory, clearHistory, deleteCheckIn } from '../services/storageService';
import { CheckInRecord } from '../types/checkIn';
import { useTheme } from '../contexts/ThemeContext';
import { IoTrashOutline, IoRefresh, IoRefreshOutline } from 'react-icons/io5';
import './HistoryScreen.css';

export default function HistoryScreen() {
  try {
    const { theme, isDark } = useTheme();
    const [history, setHistory] = useState<CheckInRecord[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = async () => {
      try {
        const data = await getCheckInHistory();
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
    }, []);

    const onRefresh = async () => {
      setRefreshing(true);
      await loadHistory();
      setRefreshing(false);
    };

    const handleClearHistory = () => {
      if (window.confirm('Confirmă: Ești sigur că vrei să ștergi tot istoricul?')) {
        (async () => {
          try {
            await clearHistory();
            setHistory([]);
            window.alert('Succes: Istoricul a fost șters!');
          } catch (error) {
            window.alert('Eroare: Nu s-a putut șterge istoricul');
          }
        })();
      }
    };

    const handleDeleteItem = (id: string, startTime: string) => {
      if (window.confirm(`Confirmă: Ești sigur că vrei să ștergi această înregistrare de la ${new Date(startTime).toLocaleString('ro-RO')}?`)) {
        (async () => {
          try {
            await deleteCheckIn(id);
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
      backgroundColor: theme.colors.background,
      paddingTop: 'max(20px, env(safe-area-inset-top))', // iOS notch support
      minHeight: '100vh',
      minHeight: '-webkit-fill-available' as any, // iOS Safari
      width: '100%',
    };

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      paddingBottom: '16px',
    };

    const titleStyle: React.CSSProperties = {
      fontSize: '32px',
      fontWeight: 700,
      color: theme.colors.text,
      letterSpacing: '-0.5px',
      fontFamily: theme.fonts.bold,
    };

    const headerButtonsStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      gap: '12px',
    };

    const actionButtonStyle: React.CSSProperties = {
      width: '40px',
      height: '40px',
      borderRadius: '20px',
      backgroundColor: theme.colors.cardBackground,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.08)',
      border: isDark ? `1px solid ${theme.colors.border}` : 'none',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    };

    const listStyle: React.CSSProperties = {
      flex: 1,
      padding: '0 24px',
      overflowY: 'auto',
      width: '100%',
    };

    const listContentStyle: React.CSSProperties = {
      paddingBottom: '100px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    };

    const historyItemStyle: React.CSSProperties = {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: '24px',
      padding: '24px',
      boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: isDark ? `1px solid ${theme.colors.border}` : 'none',
    };

    const itemHeaderStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px',
    };

    const itemHeaderLeftStyle: React.CSSProperties = {
      flex: 1,
    };

    const itemHeaderRightStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '12px',
    };

    const itemLabelStyle: React.CSSProperties = {
      fontSize: '11px',
      fontWeight: 600,
      color: theme.colors.textSecondary,
      letterSpacing: '1px',
      marginBottom: '6px',
      textTransform: 'uppercase',
      fontFamily: theme.fonts.medium,
    };

    const itemDateStyle: React.CSSProperties = {
      fontSize: '20px',
      fontWeight: 700,
      color: theme.colors.text,
      letterSpacing: '-0.5px',
      fontFamily: theme.fonts.bold,
    };

    const statusBadgeStyle: React.CSSProperties = {
      padding: '8px 16px',
      borderRadius: '20px',
    };

    const badgeTextStyle: React.CSSProperties = {
      fontSize: '11px',
      fontWeight: 700,
      color: '#FFFFFF',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      fontFamily: theme.fonts.bold,
    };

    const itemInfoStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: 0,
    };

    const infoRowStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    };

    const infoLabelStyle: React.CSSProperties = {
      fontSize: '14px',
      fontWeight: 600,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.regular,
    };

    const infoValueStyle: React.CSSProperties = {
      fontSize: '16px',
      fontWeight: 600,
      color: theme.colors.text,
      fontFamily: theme.fonts.semibold,
    };

    const deleteButtonStyle: React.CSSProperties = {
      width: '36px',
      height: '36px',
      borderRadius: '18px',
      backgroundColor: theme.colors.cardBackground,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.08)',
      border: isDark ? `1px solid ${theme.colors.border}` : 'none',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    };

    const emptyContainerStyle: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px',
    };

    const emptyTextStyle: React.CSSProperties = {
      fontSize: '28px',
      fontWeight: 700,
      color: theme.colors.text,
      marginBottom: '12px',
      letterSpacing: '-0.5px',
      textAlign: 'center',
      fontFamily: theme.fonts.bold,
    };

    const emptySubtextStyle: React.CSSProperties = {
      fontSize: '16px',
      color: theme.colors.textSecondary,
      maxWidth: '300px',
      lineHeight: '24px',
      textAlign: 'center',
      fontFamily: theme.fonts.regular,
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
                onMouseDown={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
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
              {history.map((item) => (
                <div key={item.id} style={historyItemStyle}>
                  <div style={itemHeaderStyle}>
                    <div style={itemHeaderLeftStyle}>
                      <div style={itemLabelStyle}>DATE</div>
                      <div style={itemDateStyle}>{formatDate(item.startTime)}</div>
                    </div>
                    <div style={itemHeaderRightStyle}>
                      <div style={{
                        ...statusBadgeStyle,
                        backgroundColor: item.status === 'checked-out' ? theme.colors.primary : '#34C759',
                      }}>
                        <span style={badgeTextStyle}>
                          {item.status === 'checked-out' ? 'COMPLETED' : 'ACTIVE'}
                        </span>
                      </div>
                      <button
                        style={deleteButtonStyle}
                        onClick={() => handleDeleteItem(item.id, item.startTime)}
                        onMouseDown={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <IoTrashOutline size={18} color={theme.colors.error} />
                      </button>
                    </div>
                  </div>
                  <div style={itemInfoStyle}>
                    <div style={infoRowStyle}>
                      <span style={infoLabelStyle}>Check-in:</span>
                      <span style={infoValueStyle}>{formatTime(item.startTime)}</span>
                    </div>
                    {item.status === 'checked-out' && (
                      <div style={infoRowStyle}>
                        <span style={infoLabelStyle}>Check-out:</span>
                        <span style={infoValueStyle}>{formatTime(getEndTime(item))}</span>
                      </div>
                    )}
                    <div style={infoRowStyle}>
                      <span style={infoLabelStyle}>Duration:</span>
                      <span style={infoValueStyle}>{formatDuration(item.duration)}</span>
                    </div>
                  </div>
                </div>
              ))}
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
