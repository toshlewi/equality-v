import mongoose from 'mongoose';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection | undefined> | null;
  } | undefined;
}

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO')));
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async (retries = 3) => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true,
    };

    cached.promise = (async () => {
      for (let i = 0; i < retries; i++) {
        try {
          const connection = await mongoose.connect(MONGODB_URI, opts);
          console.log('MongoDB connected successfully');
          return connection.connection;
        } catch (error) {
          console.error(`MongoDB connection attempt ${i + 1} failed:`, error);
          
          // If this is the last attempt, throw the error
          if (i === retries - 1) {
            cached.promise = null;
            throw error;
          }
          
          // Wait before retrying with exponential backoff
          const delay = 1000 * (i + 1); // 1s, 2s, 3s...
          console.log(`Retrying MongoDB connection in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    })();
  }

  try {
    const conn = await cached.promise;
    if (!conn) {
      throw new Error('MongoDB connection failed');
    }
    cached.conn = conn;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

// Graceful shutdown
export const disconnectDB = async () => {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('MongoDB disconnected');
  }
};

export default connectDB;
