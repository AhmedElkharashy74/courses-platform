// oauth.strategy.ts
export interface OAuthStrategy {
    getAuthURL(): string;
    getUserData(code: string): Promise<{
      id: string;
      name: string;
      email?: string;
      picture?: string;
      provider: string;
      accessToken: string;
    }>;
  }