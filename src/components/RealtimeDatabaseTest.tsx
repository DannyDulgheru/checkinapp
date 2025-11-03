import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { db, firebaseInitialized } from '../services/firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp?: string;
}

export default function RealtimeDatabaseTest() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastTestData, setLastTestData] = useState<any>(null);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  const addResult = (name: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, {
      name,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearResults = () => {
    setTestResults([]);
    setLastTestData(null);
  };

  const runTests = async () => {
    setIsRunning(true);
    clearResults();
    
    const userId = user?.uid;
    if (!userId) {
      addResult('Authentication Check', 'error', 'User not authenticated');
      setIsRunning(false);
      return;
    }

    // Test 1: Check Firebase Initialization
    addResult('Firebase Initialization', 'pending', 'Checking...');
    if (!firebaseInitialized) {
      addResult('Firebase Initialization', 'error', 'Firebase is not initialized');
      setIsRunning(false);
      return;
    }
    if (!db) {
      addResult('Firebase Initialization', 'error', 'Firestore Database is not initialized. Enable it in Firebase Console.');
      setIsRunning(false);
      return;
    }
    addResult('Firebase Initialization', 'success', 'Firestore Database is initialized');

    // Test 2: Check Database Reference
    addResult('Database Reference', 'pending', 'Creating reference...');
    try {
      const testDocRef = doc(db, 'checkinData', `${userId}_test`);
      addResult('Database Reference', 'success', 'Firestore document reference created successfully');
      
      // Test 3: Write Operation
      addResult('Write Operation', 'pending', 'Writing test data...');
      const testData = {
        test: true,
        timestamp: serverTimestamp(),
        message: 'Test data from Firestore test',
        value: Math.random()
      };
      
      await setDoc(testDocRef, testData);
      addResult('Write Operation', 'success', 'Data written successfully');
      
      // Test 4: Read Operation
      addResult('Read Operation', 'pending', 'Reading test data...');
      const docSnapshot = await getDoc(testDocRef);
      
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setLastTestData(data);
        addResult('Read Operation', 'success', `Data read successfully: ${JSON.stringify(data)}`);
      } else {
        addResult('Read Operation', 'error', 'Data not found after write');
      }

      // Test 5: Real-time Subscription
      addResult('Real-time Subscription', 'pending', 'Setting up subscription...');
      let subscriptionSuccess = false;
      
      const unsubscribe = onSnapshot(testDocRef, (snapshot) => {
        if (!subscriptionSuccess) {
          subscriptionSuccess = true;
          setSubscriptionActive(true);
          addResult('Real-time Subscription', 'success', 'Subscription active - receiving real-time updates');
        }
        
        if (snapshot.exists()) {
          setLastTestData(snapshot.data());
        }
      }, (error) => {
        addResult('Real-time Subscription', 'error', `Subscription error: ${error.message}`);
        setSubscriptionActive(false);
      });

      // Wait a bit for subscription to establish
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 6: Update Data (trigger subscription)
      addResult('Update Trigger', 'pending', 'Updating data to trigger subscription...');
      await updateDoc(testDocRef, {
        updateTrigger: true,
        updatedAt: serverTimestamp(),
        newValue: Math.random()
      });
      
      // Wait for subscription to receive update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (subscriptionSuccess) {
        addResult('Update Trigger', 'success', 'Subscription received update');
      } else {
        addResult('Update Trigger', 'error', 'Subscription did not receive update');
      }

      // Test 7: Cleanup
      addResult('Cleanup', 'pending', 'Cleaning up test data...');
      await deleteDoc(testDocRef);
      unsubscribe();
      setSubscriptionActive(false);
      addResult('Cleanup', 'success', 'Test data removed and subscription closed');

      // Test 8: Test Timer Path
      addResult('Timer Path Test', 'pending', 'Testing timer path...');
      const userDocRef = doc(db, 'checkinData', userId);
      try {
        await setDoc(userDocRef, {
          timer: {
            test: true,
            timestamp: serverTimestamp()
          },
          updatedAt: serverTimestamp()
        }, { merge: true });
        const timerSnapshot = await getDoc(userDocRef);
        if (timerSnapshot.exists() && timerSnapshot.data().timer) {
          await updateDoc(userDocRef, {
            timer: null,
            updatedAt: serverTimestamp()
          });
          addResult('Timer Path Test', 'success', 'Timer path is writable');
        } else {
          addResult('Timer Path Test', 'error', 'Timer path write failed');
        }
      } catch (error: any) {
        addResult('Timer Path Test', 'error', `Timer path error: ${error.message} (Code: ${error.code})`);
      }

      // Test 9: Test History Path
      addResult('History Path Test', 'pending', 'Testing history path...');
      try {
        await setDoc(userDocRef, {
          history: {
            test123: {
              test: true,
              timestamp: serverTimestamp()
            }
          },
          updatedAt: serverTimestamp()
        }, { merge: true });
        const historySnapshot = await getDoc(userDocRef);
        if (historySnapshot.exists() && historySnapshot.data().history) {
          const history = historySnapshot.data().history || {};
          delete history.test123;
          await updateDoc(userDocRef, {
            history: history,
            updatedAt: serverTimestamp()
          });
          addResult('History Path Test', 'success', 'History path is writable');
        } else {
          addResult('History Path Test', 'error', 'History path write failed');
        }
      } catch (error: any) {
        addResult('History Path Test', 'error', `History path error: ${error.message} (Code: ${error.code})`);
      }

      // Test 10: Test Settings Path
      addResult('Settings Path Test', 'pending', 'Testing settings path...');
      try {
        await setDoc(userDocRef, {
          settings: {
            test: true,
            timestamp: serverTimestamp()
          },
          updatedAt: serverTimestamp()
        }, { merge: true });
        const settingsSnapshot = await getDoc(userDocRef);
        if (settingsSnapshot.exists() && settingsSnapshot.data().settings) {
          await updateDoc(userDocRef, {
            settings: null,
            updatedAt: serverTimestamp()
          });
          addResult('Settings Path Test', 'success', 'Settings path is writable');
        } else {
          addResult('Settings Path Test', 'error', 'Settings path write failed');
        }
      } catch (error: any) {
        addResult('Settings Path Test', 'error', `Settings path error: ${error.message} (Code: ${error.code})`);
      }

    } catch (error: any) {
      console.error('[Test] Error:', error);
      const errorMessage = error.message || String(error);
      const errorCode = error.code || 'unknown';
      
      addResult('Database Operation', 'error', `Error: ${errorMessage} (Code: ${errorCode})`);
      
      if (errorCode === 'permission-denied' || errorCode === 'PERMISSION_DENIED') {
        addResult('Permission Check', 'error', 'Permission denied! Check Firestore Security Rules. Make sure rules allow authenticated users to write.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to get document')) {
        addResult('Network Error', 'error', 'Network error. Check Firebase Console to ensure Firestore is enabled and rules are set correctly.');
      }
    }

    setIsRunning(false);
  };

  const containerStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: isDark ? '#000000' : theme.colors.background,
    minHeight: '100vh',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: isDark 
      ? '0 4px 16px rgba(0, 0, 0, 0.5)'
      : '0 4px 16px rgba(0, 0, 0, 0.1)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: theme.colors.text,
    marginBottom: '16px',
    fontFamily: theme.fonts.bold,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: theme.fonts.bold,
    cursor: isRunning ? 'not-allowed' : 'pointer',
    opacity: isRunning ? 0.7 : 1,
    marginRight: '12px',
    marginBottom: '12px',
  };

  const resultStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '8px',
    fontSize: '14px',
    fontFamily: theme.fonts.medium,
  };

  const successStyle: React.CSSProperties = {
    ...resultStyle,
    backgroundColor: isDark ? 'rgba(52, 168, 83, 0.2)' : 'rgba(52, 168, 83, 0.1)',
    border: `1px solid ${isDark ? 'rgba(52, 168, 83, 0.4)' : 'rgba(52, 168, 83, 0.2)'}`,
    color: '#34A853',
  };

  const errorStyle: React.CSSProperties = {
    ...resultStyle,
    backgroundColor: isDark ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 68, 68, 0.1)',
    border: `1px solid ${isDark ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255, 68, 68, 0.2)'}`,
    color: '#FF4444',
  };

  const pendingStyle: React.CSSProperties = {
    ...resultStyle,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
    color: theme.colors.textSecondary,
  };

  const infoStyle: React.CSSProperties = {
    fontSize: '12px',
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    marginTop: '8px',
  };

  const dataStyle: React.CSSProperties = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    padding: '12px',
    borderRadius: '8px',
    marginTop: '12px',
    fontSize: '12px',
    fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Firebase Firestore Test</h2>
        
        {!user && (
          <div style={errorStyle}>
            ⚠️ You must be logged in to run tests
          </div>
        )}

        {user && (
          <>
            <div style={infoStyle}>
              User ID: {user.uid}<br />
              Email: {user.email}<br />
              Firebase Initialized: {firebaseInitialized ? '✅' : '❌'}<br />
              Firestore DB Available: {db ? '✅' : '❌'}
            </div>

            <div style={{
              ...infoStyle,
              marginTop: '12px',
              padding: '12px',
              backgroundColor: isDark ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)',
              border: `1px solid ${isDark ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 193, 7, 0.2)'}`,
              borderRadius: '8px',
            }}>
              <strong>ℹ️ Note:</strong> Using Firestore instead of Realtime Database. No COEP issues!
            </div>

            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <button
                style={buttonStyle}
                onClick={runTests}
                disabled={isRunning}
              >
                {isRunning ? 'Running Tests...' : 'Run Tests'}
              </button>
              <button
                style={{ ...buttonStyle, background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', color: theme.colors.text }}
                onClick={clearResults}
                disabled={isRunning}
              >
                Clear Results
              </button>
            </div>

            {testResults.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text, marginBottom: '12px' }}>
                  Test Results:
                </h3>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    style={
                      result.status === 'success'
                        ? successStyle
                        : result.status === 'error'
                        ? errorStyle
                        : pendingStyle
                    }
                  >
                    <strong>{result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳'}</strong>{' '}
                    <strong>{result.name}:</strong> {result.message}
                    {result.timestamp && (
                      <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '8px' }}>
                        ({result.timestamp})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {lastTestData && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text, marginBottom: '12px' }}>
                  Last Received Data:
                </h3>
                <div style={dataStyle}>
                  {JSON.stringify(lastTestData, null, 2)}
                </div>
              </div>
            )}

            {subscriptionActive && (
              <div style={{ ...successStyle, marginTop: '16px' }}>
                🔔 Real-time subscription is active
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

