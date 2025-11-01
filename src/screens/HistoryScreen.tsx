import React, { useState, useEffect } from 'react';
import { getCheckInHistory, clearHistory } from '../services/storageService';
import { CheckInRecord } from '../types/checkIn';
import '../styles/HistoryScreen.css';

export default function HistoryScreen() {
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
    if (window.confirm('Ești sigur că vrei să ștergi tot istoricul?')) {
      (async () => {
        try {
          await clearHistory();
          setHistory([]);
          window.alert('Istoricul a fost șters!');
        } catch (error) {
          window.alert('Nu s-a putut șterge istoricul');
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

  return (
    <div className="history-container">
      <div className="history-header">
        {history.length > 0 && (
          <button
            className="clear-button"
            onClick={handleClearHistory}
          >
            Șterge Istoricul
          </button>
        )}
        <button
          className="refresh-button"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Se reînnoiește...' : 'Reîmprospătează'}
        </button>
      </div>
      
      {history.length === 0 ? (
        <div className="empty-container">
          <p className="empty-text">Nu există înregistrări</p>
          <p className="empty-subtext">
            Fă check-in pentru a începe să înregistrezi sesiunile
          </p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <div className="item-header">
                <div className="item-date-container">
                  <span className="item-date">{formatDate(item.startTime)}</span>
                </div>
                <span
                  className={`status-badge ${
                    item.status === 'checked-out'
                      ? 'checked-out-badge'
                      : 'checked-in-badge'
                  }`}
                >
                  {item.status === 'checked-out' ? 'Check-out' : 'Check-in'}
                </span>
              </div>
              <div className="item-times">
                <div className="time-row">
                  <span className="time-label">Check-in:</span>
                  <span className="time-value">{formatTime(item.startTime)}</span>
                </div>
                {item.status === 'checked-out' && (
                  <div className="time-row">
                    <span className="time-label">Check-out:</span>
                    <span className="time-value">{formatTime(getEndTime(item))}</span>
                  </div>
                )}
              </div>
              <div className="item-details">
                <span className="duration-label">Durată:</span>
                <span className="duration-value">{formatDuration(item.duration)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
