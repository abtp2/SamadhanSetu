const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const Challenge = require('./models/Challenge');
const User = require('./models/User');
const seedData = require('./seed/seedData');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database has no users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database has no users. Executing seed...');
      await seedData();
    } else {
      console.log(`[Server] Found ${userCount} existing users in database.`);
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
