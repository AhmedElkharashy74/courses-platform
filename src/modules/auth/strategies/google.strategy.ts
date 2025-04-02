import { OAuthStrategy } from "./oauth.strategy";
import { injectable } from "tsyringe";
import axios from "axios";
import dotenv from "dotenv";
import { URLSearchParams } from "url";
import { GoogleTokenResponse } from "../dtos/google/googleTokenResponse.dto";
import { GoogleUserData } from "../dtos/google/googleUserData.dto";

dotenv.config();




@injectable()
export class GoogleStrategy implements OAuthStrategy {
  private readonly clientId = process.env.GOOGLE_CLIENT_ID as string;
  private readonly clientSecret = process.env.GOOGLE_SECRET as string;
  private readonly redirectUri = process.env.GOOGLE_REDIRECT_URI as string;
  private readonly tokenUrl = "https://oauth2.googleapis.com/token";
  private readonly authUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  private readonly userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";

  getAuthURL(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "openid profile email",
      access_type: "offline",
      prompt: "consent",
    });
    return `${this.authUrl}?${params.toString()}`;
  }

  async getUserData(code: string) {
    try {
      // 1. Exchange code for tokens
      const { data: tokenData } = await axios.post<GoogleTokenResponse>(
        this.tokenUrl,
        new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: "authorization_code",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // 2. Fetch user info
      const { data: userData } = await axios.get<GoogleUserData>(
        this.userInfoUrl,
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      );

      return {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        provider: "google",
        accessToken: tokenData.access_token,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error_description || 
                         error.response?.data?.error || 
                         error.message;
      console.error("Google OAuth error:", errorMessage);
      throw new Error(`Google authentication failed: ${errorMessage}`);
    }
  }
}