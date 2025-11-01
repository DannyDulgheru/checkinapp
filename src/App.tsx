import React, { useState } from 'react';
import CheckInScreen from './screens/CheckInScreen';
import HistoryScreen from './screens/HistoryScreen';
import './styles/App.css';

type Tab = 'checkin' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('checkin');

  return (
    <div className="app-container">
      <div className="app-content">
        {activeTab === 'checkin' && <CheckInScreen />}
        {activeTab === 'history' && <HistoryScreen />}
      </div>
      
      <div className="tab-bar">
        <button
          className={`tab-button ${activeTab === 'checkin' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkin')}
        >
          <span className="tab-icon">⏰</span>
          <span className="tab-label">Check-in</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="tab-icon">📋</span>
          <span className="tab-label">Istoric</span>
        </button>
      </div>
    </div>
  );
}

