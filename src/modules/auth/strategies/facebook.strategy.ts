import { OAuthStrategy } from "./oauth.strategy";
import { injectable } from "tsyringe";
import axios from "axios";
import { URLSearchParams } from "url";

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookUserData {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

@injectable()
export class FacebookStrategy implements OAuthStrategy {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly apiVersion = "v19.0"; // Using latest stable API version
  private readonly authUrl: string;
  private readonly tokenUrl: string;
  private readonly userInfoUrl: string;

  constructor() {
    this.clientId = this.getEnvVar("FACEBOOK_CLIENT_ID");
    this.clientSecret = this.getEnvVar("FACEBOOK_SECRET");
    this.redirectUri = this.getEnvVar("FACEBOOK_REDIRECT_URI");
    
    this.authUrl = `https://www.facebook.com/${this.apiVersion}/dialog/oauth`;
    this.tokenUrl = `https://graph.facebook.com/${this.apiVersion}/oauth/access_token`;
    this.userInfoUrl = `https://graph.facebook.com/${this.apiVersion}/me`;
  }

  private getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing environment variable: ${name}`);
    return value;
  }

  getAuthURL(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "email,public_profile", // Add more scopes as needed
      state: this.generateStateToken(), // CSRF protection
      auth_type: "rerequest" // Forces re-requesting declined permissions
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  private generateStateToken(): string {
    return require("crypto").randomBytes(16).toString("hex");
  }

  async getUserData(code: string) {
    try {
      // 1. Exchange code for access token
      const tokenData = await this.exchangeCodeForToken(code);
      
      // 2. Fetch user profile with access token
      const userData = await this.fetchUserProfile(tokenData.access_token);
      
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        picture: userData.picture?.data.url,
        provider: "facebook",
        accessToken: tokenData.access_token
      };
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private async exchangeCodeForToken(code: string): Promise<FacebookTokenResponse> {
    const params = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code
    };

    const { data } = await axios.get<FacebookTokenResponse>(this.tokenUrl, { params });
    this.validateTokenResponse(data);
    return data;
  }

  private validateTokenResponse(response: FacebookTokenResponse) {
    if (!response.access_token) {
      throw new Error("Invalid token response: missing access_token");
    }
  }

  private async fetchUserProfile(accessToken: string): Promise<FacebookUserData> {
    const { data } = await axios.get<FacebookUserData>(this.userInfoUrl, {
      params: {
        fields: "id,name,email,picture.width(500)", // Get high-res profile picture
        access_token: accessToken
      }
    });
    return data;
  }

  private handleError(error: any): never {
    const fbError = error.response?.data?.error || {};
    const errorMessage = fbError.message || error.message;
    const errorType = fbError.type || "API_ERROR";
    const errorCode = fbError.code || error.response?.status;

    console.error("Facebook OAuth Error:", {
      message: errorMessage,
      type: errorType,
      code: errorCode,
      fbtrace_id: fbError.fbtrace_id
    });

    throw new Error(`Facebook authentication failed: ${errorMessage}`);
  }
}