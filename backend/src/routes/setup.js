const express = require('express');
const { exec } = require('child_process');
const seed = require('../seed');

const router = express.Router();

// Database setup endpoint (for production deployment)
router.post('/database', async (req, res) => {
  try {
    console.log('🗄️ Starting database setup...');
    
    // Run database setup
    await seed();
    
    console.log('✅ Database setup completed successfully!');
    
    res.json({
      success: true,
      message: 'Database setup completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database setup failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check for setup
router.get('/health', (req, res) => {
  res.json({
    status: 'Setup service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;