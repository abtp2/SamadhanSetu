const mongoose = require('mongoose');
const dns = require('dns');

// On Windows, local ISP DNS often fails on SRV queries for mongodb+srv://
// Fallback to reliable public DNS resolvers if default fails
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not permitted
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.error('========================================================================');
    console.error('[DB Error] MONGODB_URI is not set in server/.env!');
    console.error('Please add your MongoDB Atlas connection string to server/.env:');
    console.error('MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/samadhansetu?retryWrites=true&w=majority');
    console.error('========================================================================');
    process.exit(1);
  }

  try {
    const maskedUri = uri.replace(/\/\/[^@]*@/, '//***:***@');
    console.log(`[DB] Connecting to MongoDB Atlas: ${maskedUri}`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('[DB] Connected successfully to MongoDB Atlas!');
  } catch (error) {
    console.error('[DB] Failed to connect to MongoDB Atlas:', error.message);
    console.error('Hint: Verify your MongoDB Atlas username, password, and ensure your IP is whitelisted (0.0.0.0/0) in Atlas Network Access.');
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[DB] Disconnected from MongoDB Atlas.');
  } catch (err) {
    console.error('[DB] Error during disconnection:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
