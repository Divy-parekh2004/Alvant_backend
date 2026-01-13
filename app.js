require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); // ✅ app MUST be created first
const PORT = process.env.PORT || 5000;

// avoid Mongoose strictQuery deprecation warning
mongoose.set('strictQuery', false);

// ✅ MIDDLEWARE (ORDER MATTERS)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ROUTES
const contactRouter = require('./routes/contact');
const registerRouter = require('./routes/register');
const adminRouter = require('./routes/admin');

app.use('/api/contact', contactRouter);
app.use('/api/register', registerRouter);
app.use('/api/admin', adminRouter);

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    status: 'ok',
    database: dbStates[dbStatus] || 'unknown',
    connected: dbStatus === 1
  });
});

// ✅ 404 HANDLER - Return JSON for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', path: req.path });
});

// ✅ ERROR HANDLER - Ensure all errors return JSON
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (req.path.startsWith('/api')) {
    res.status(err.status || 500).json({ 
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  } else {
    next(err);
  }
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  if (!process.env.MONGODB_URI) {
    console.error('⚠️ MONGODB_URI not found in .env');
    return;
  }

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB error:', err.message));
});


export default app;