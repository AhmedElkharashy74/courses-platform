// src/core/logger.ts
import { injectable } from 'tsyringe';

@injectable()
export class Logger {
  info(message: string, ...meta: any[]): void {
    console.log(`[INFO] ${message}`, ...meta);
  }

  error(message: string, ...meta: any[]): void {
    console.error(`[ERROR] ${message}`, ...meta);
  }

  warn(message: string, ...meta: any[]): void {
    console.warn(`[WARN] ${message}`, ...meta);
  }
}