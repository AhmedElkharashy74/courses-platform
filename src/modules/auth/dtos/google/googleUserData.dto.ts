export interface GoogleUserData {
    sub: string; // Google user ID
    name: string;
    email?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
  }