// src/app.ts
import express from 'express';
import { container } from './core/container';
import { errorHandler } from './core/middlewares/error.middleware';
import 'reflect-metadata';
import { AuthController } from './modules/auth/auth.controller';
import cookieParser from 'cookie-parser';
// import userRoutes from './modules/user/user.routes';
// import courseRoutes from './modules/course/course.routes';

const authController = container.resolve(AuthController);

export class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(cookieParser());
  }

  private configureRoutes(): void {
    this.express.use('/api/auth', authController.router);
    // this.express.use('/api/users', userRoutes);
    // this.express.use('/api/courses', courseRoutes);
  }

  private configureErrorHandling(): void {
    this.express.use(errorHandler);
  }
}