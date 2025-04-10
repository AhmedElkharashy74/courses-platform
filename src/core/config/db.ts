import mongoose, { Connection } from 'mongoose';
import { injectable, inject } from 'tsyringe';
import dotenv from 'dotenv';
import { Logger } from '../logger';

dotenv.config();

@injectable()
export class MongoConnection {
  private connection: Connection | null = null;

  constructor(@inject("Logger") private logger: Logger) {}

  async connect(): Promise<void> {
    if (this.connection) return;

    try {
      const db = await mongoose.connect(process.env.MONGO_URI!, {
        bufferCommands: false,
      });

      this.connection = db.connection;
      this.logger.info('✅ MongoDB connected');

      this.connection.on('error', (err) => {
        this.logger.error('MongoDB connection error:', err);
      });

      this.connection.on('disconnected', () => {
        this.logger.warn('⚠️ MongoDB disconnected. Retrying...');
        this.reconnect();
      });

    } catch (error) {
      this.logger.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  private async reconnect(): Promise<void> {
    setTimeout(() => this.connect(), 5000); // Retry after 5 seconds
  }
}
