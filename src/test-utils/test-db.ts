<<<<<<< HEAD
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
=======
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

let mongod: MongoMemoryServer;

/**
 * Setup test database with MongoDB Memory Server
 */
export const setupTestDB = async (): Promise<void> => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
};

/**
 * Close database connection and stop MongoDB Memory Server
 */
export const closeTestDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
};

/**
 * Clear all collections in the test database
 */
export const clearTestDB = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
