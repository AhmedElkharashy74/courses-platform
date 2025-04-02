// src/server.ts
import 'reflect-metadata';
import http from 'http';
import { container, initializeDB } from './core/container';
import { Logger } from './core/logger';
import { App } from './app';

class Server {
  private server: http.Server;
  private port: number;
  private logger: Logger;

  constructor(private app: App) {
    this.port = this.normalizePort(process.env.PORT || '3000');
    this.logger = container.resolve(Logger);
    this.server = http.createServer(app.express);
  }

  public async start(): Promise<void> {
    try {
      // 1. Initialize all database connections
      await initializeDB();

      // 2. Start HTTP server
      this.server.listen(this.port);
      this.server.on('error', this.onError.bind(this));
      this.server.on('listening', this.onListening.bind(this));

      // 3. Register graceful shutdown
    //   this.registerSignalHandlers();
    } catch (error) {
      this.logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private normalizePort(val: string): number {
    const port = parseInt(val, 10);
    if (isNaN(port)) return 3000;
    if (port >= 0) return port;
    return 3000;
  }

  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;

    switch (error.code) {
      case 'EACCES':
        this.logger.error(`Port ${this.port} requires elevated privileges`);
        process.exit(1);
      case 'EADDRINUSE':
        this.logger.error(`Port ${this.port} is already in use`);
        process.exit(1);
      default:
        throw error;
    }
  }

  private onListening(): void {
    const addr = this.server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    this.logger.info(`Server listening on ${bind} in ${process.env.NODE_ENV} mode`);
  }


}

// Bootstrap the application
(async () => {
  const app = container.resolve(App);
  const server = new Server(app);
  await server.start();
})();