// src/core/database/mongo.connection.ts
import { Connection, createConnection} from 'mongoose';
import { injectable } from 'tsyringe';
import dotenv from 'dotenv';
import { Logger } from '../logger'; // Assuming you have a logger utility

dotenv.config();


@injectable()
export class MongoConnection {
  private connection: Connection | null = null;

  async connect(): Promise<Connection> {
    if (!this.connection) {
      // 1. Create a new connection (not mongoose singleton)
      this.connection = await createConnection(process.env.MONGO_URI!, {
        bufferCommands: false, // Optional settings
      });
      
      console.log('✅ MongoDB connected');
      
      // 2. Event listeners
      this.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
    }
    return this.connection;
  }
}