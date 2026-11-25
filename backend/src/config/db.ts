import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env.ts';

let memoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  let uri = env.mongoUri;

  if (!uri) {
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'meridian_job_portal',
      },
    });
    uri = memoryServer.getUri();
    console.log('[DB] Booted embedded MongoDB instance');
  }

  await mongoose.connect(uri, {
    autoIndex: true,
  });

  console.log(`[DB] Connected to MongoDB (${mongoose.connection.name})`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
