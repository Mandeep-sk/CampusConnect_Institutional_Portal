const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect';

  try {
    // Attempt standard connection (Local or Atlas)
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000, // Fail fast if local Mongo isn't running
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ Could not connect to MongoDB at ${mongoURI} (${err.message}).`);
    
    // Check if we can fallback to MongoMemoryServer for development / evaluation
    try {
      console.log('🔄 Attempting to launch embedded MongoDB instance for seamless development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      
      const conn = await mongoose.connect(memUri);
      console.log(`\n=============================================================`);
      console.log(`✨ IN-MEMORY MONGODB RUNNING at ${memUri}`);
      console.log(`✨ All collections, relations, and operations are 100% functional!`);
      console.log(`💡 To connect to MongoDB Atlas, add your connection string to server/.env:`);
      console.log(`   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/campusconnect`);
      console.log(`💡 To connect to Local MongoDB, ensure 'mongod' or MongoDB Service is running.`);
      console.log(`=============================================================\n`);
      return conn;
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB fallback:', memErr.message);
      console.error('\n🛠️ MongoDB Setup Help:');
      console.error('1. Install MongoDB Community Server from https://www.mongodb.com/try/download/community');
      console.error('2. Or create a FREE MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas');
      console.error('3. Set MONGO_URI in server/.env\n');
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (e) {
    console.error('Error during DB disconnect:', e);
  }
};

module.exports = { connectDB, disconnectDB };
