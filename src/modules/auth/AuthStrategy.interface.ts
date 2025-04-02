import { Request } from 'express';
import { AuthResult } from './dtos/authResult.dto';
export interface IAuthStrategy {
    authenticate(request: Request): Promise<AuthResult>;
    getAuthUrl(): string;
  }