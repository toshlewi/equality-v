import mongoose from 'mongoose';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
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

export const connectDB = async () => {
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

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose.connection;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
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
