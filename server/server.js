const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const Challenge = require('./models/Challenge');
const seedData = require('./seed/seedData');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is completely empty
    const challengeCount = await Challenge.countDocuments();
    if (challengeCount === 0) {
      console.log('[Server] Database is empty. Automatically executing initial seed with Jharkhand dataset...');
      await seedData();
    } else {
      console.log(`[Server] Found ${challengeCount} existing challenges in database.`);
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`  SamadhanSetu Civic Platform Server`);
      console.log(`  Running on: http://localhost:${PORT}`);
      console.log(`  LAN / Phone Access: http://10.48.12.85:${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });

    const shutdown = async () => {
      console.log('[Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[Server] Failed to initialize:', err);
    process.exit(1);
  }
};

startServer();
