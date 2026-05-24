const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Placeholder for MongoDB connection
// mongoose.connect('mongodb://localhost:27017/nexus_ai', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nexus AI Backend is running' });
});

// Mock Route for Dashboard Analytics
app.get('/api/analytics/summary', (req, res) => {
  res.json({
    activeIncidents: 1248,
    predictedThreats: 84,
    aiConfidence: 94.2,
    officersDeployed: 342
  });
});

// Mock Route for FIR Generation
app.post('/api/fir/generate', (req, res) => {
  const { incidentDetails } = req.body;
  // In a real scenario, this would call the Python ML service to format the FIR
  res.json({
    status: 'success',
    message: 'AI FIR generated successfully',
    firData: {
      sectionsApplied: ['IPC 379', 'IT Act 66C'],
      summary: incidentDetails
    }
  });
});

// Proxy route for AI Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const mlResponse = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await mlResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Error connecting to ML service:', error);
    res.status(500).json({ reply: 'Error connecting to Nexus AI ML Service.' });
  }
});

// Proxy route for Anomalies
app.get('/api/anomalies', async (req, res) => {
  try {
    const mlResponse = await fetch('http://localhost:8000/api/detect-anomalies');
    const data = await mlResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Error connecting to ML service:', error);
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
});

// Dummy route for map data (since MongoDB isn't active here)
app.get('/api/map-data', (req, res) => {
  const dummyData = [
    { id: 1, lat: 19.0760, lng: 72.8777, type: 'Theft', intensity: 0.8 },
    { id: 2, lat: 19.0800, lng: 72.8800, type: 'Cybercrime', intensity: 0.9 },
    { id: 3, lat: 19.0600, lng: 72.8900, type: 'Murder', intensity: 1.0 },
    { id: 4, lat: 19.0500, lng: 72.8600, type: 'Women Safety', intensity: 0.7 },
  ];
  res.json(dummyData);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
