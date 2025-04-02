import { OAuthStrategy } from "./oauth.strategy";
import { injectable } from "tsyringe";
import axios from "axios";
import dotenv from "dotenv";
import { GitHubTokenResponse } from "../dtos/github/githubTokenResponse.dto";
import { GitHubEmail } from "../dtos/github/githubEmail.dto";
import { GitHubUserData } from "../dtos/github/githubUserData.dto";
dotenv.config();





@injectable()
export class GitHubStrategy implements OAuthStrategy {
  private readonly clientId = process.env.GITHUB_CLIENT_ID as string;
  private readonly clientSecret = process.env.GITHUB_SECRET as string;
  private readonly redirectUri = process.env.GITHUB_REDIRECT_URI as string;
  private readonly tokenUrl = "https://github.com/login/oauth/access_token";
  private readonly apiUrl = "https://api.github.com/user";

  getAuthURL(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'user:email',
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async getUserData(code: string) {
    try {
      // 1. Exchange code for access token
      const { data: tokenData } = await axios.post<GitHubTokenResponse>(
        this.tokenUrl,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      // 2. Fetch user profile
      const { data: userData } = await axios.get<GitHubUserData>(
        this.apiUrl,
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      );

      // 3. Get primary email if not returned in profile
      let email = userData.email;
      if (!email) {
        const { data: emails } = await axios.get<GitHubEmail[]>(
          `${this.apiUrl}/emails`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          }
        );
        const primaryEmail = emails.find(e => e.primary && e.verified);
        email = primaryEmail?.email;
      }

      return {
        id: userData.id.toString(), // Convert to string to match interface
        name: userData.name || userData.login,
        email,
        picture: userData.avatar_url,
        provider: "github",
        accessToken: tokenData.access_token,
      };

    } catch (error: any) {
      const errorMessage = error.response?.data?.error_description || 
                          error.response?.data?.message || 
                          error.message;
      console.error("GitHub OAuth error:", errorMessage);
      throw new Error(`GitHub authentication failed: ${errorMessage}`);
    }
  }
}

export default GitHubStrategy;