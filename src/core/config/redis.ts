// src/core/database/redis.connection.ts
import Redis, { Redis as RedisClient } from 'ioredis';
import { injectable } from 'tsyringe';

@injectable()
export class RedisConnection {
  private client: RedisClient;
  private isConnected = false;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      lazyConnect: true // We'll manage connection manually
    });

    this.initialize();
  }

  private async initialize() {
    try {
      await this.client.connect();
      this.isConnected = true;
      console.log('✅ Redis connected');
    } catch (err) {
      console.error('Redis connection failed:', err);
      throw err;
    }
  }

  getClient(): RedisClient {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    return this.client;
  }
}