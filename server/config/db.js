const mongoose = require('mongoose');
const seedInitialData = require('./seeder');

let mongodInstance = null;

const connectDB = async () => {
  // 1. Try connecting to configured MongoDB Atlas / URI
  if (process.env.MONGODB_URI) {
    try {
      console.log('Connecting to MongoDB...');
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`MongoDB connected successfully: ${conn.connection.host}`);
      await seedInitialData();
      return;
    } catch (error) {
      console.warn(`Could not connect to external MongoDB: ${error.message}`);
    }
  }

  // 2. Fall back to in-memory MongoDB for local development if cloud DB is unreachable
  console.log('Falling back to local in-memory MongoDB...');
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    const _conn = await mongoose.connect(uri);
    console.log(`In-memory MongoDB running at: ${uri}`);
    await seedInitialData();
  } catch (err) {
    console.error(`Error initializing fallback MongoDB: ${err.message}`);
    process.exit(1);
  }
};

const cleanup = async () => {
  if (mongodInstance) {
    try {
      await mongodInstance.stop();
    } catch (err) {
      console.error('Error stopping in-memory MongoDB:', err.message);
    }
  }
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch (err) {
      console.error('Error disconnecting mongoose:', err.message);
    }
  }
};

process.once('SIGUSR2', async () => {
  await cleanup();
  process.kill(process.pid, 'SIGUSR2');
});
process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

module.exports = connectDB;
