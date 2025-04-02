import { AuthProfile } from './authProfile.dto';

export interface AuthResult {
    profile: AuthProfile;
    accessToken: string;
    refreshToken?: string;
  }