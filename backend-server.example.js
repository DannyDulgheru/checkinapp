// Simple Express.js Backend Server for Cloud Sync
// Run with: node backend-server.example.js
// Or use: npm install express cors body-parser && node backend-server.example.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory storage (for production, use a database like MongoDB, PostgreSQL, etc.)
const dataStore = new Map();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// POST /sync - Save data
app.post('/checkin/sync', (req, res) => {
  try {
    const { deviceId, data, lastSync } = req.body;
    
    if (!deviceId || !data) {
      return res.status(400).json({ error: 'Missing deviceId or data' });
    }

    // Store data with device ID as key
    dataStore.set(deviceId, {
      data,
      lastSync: lastSync || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`[Sync] Data saved for device: ${deviceId}`);
    
    res.json({
      success: true,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Sync] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /sync - Load data
app.get('/checkin/sync', (req, res) => {
  try {
    const { deviceId } = req.query;
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Missing deviceId' });
    }

    const stored = dataStore.get(deviceId);
    
    if (!stored) {
      return res.status(404).json({ error: 'No data found' });
    }

    console.log(`[Sync] Data loaded for device: ${deviceId}`);
    
    res.json({
      data: stored.data,
      lastSync: stored.lastSync,
    });
  } catch (error) {
    console.error('[Sync] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /settings - Save settings
app.post('/checkin/settings', (req, res) => {
  try {
    const { deviceId, settings } = req.body;
    
    if (!deviceId || !settings) {
      return res.status(400).json({ error: 'Missing deviceId or settings' });
    }

    const stored = dataStore.get(deviceId) || { data: {}, lastSync: new Date().toISOString() };
    stored.data.settings = settings;
    stored.updatedAt = new Date().toISOString();
    dataStore.set(deviceId, stored);

    res.json({ success: true });
  } catch (error) {
    console.error('[Settings] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Check-in Cloud Sync Server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/checkin`);
});

