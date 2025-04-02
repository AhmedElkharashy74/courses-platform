import { injectable ,inject} from 'tsyringe';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { OAuthStrategy } from './strategies/oauth.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { UserService } from '../users/user.service';
// import { GoogleStrategy } from './strategies/google.strategy';
// import { FacebookStrategy } from './strategies/facebook.strategy';


dotenv.config();
@injectable()
export class AuthService {
  private strategyMap : { [key: string]: OAuthStrategy } ;
  constructor(
    @inject('GitHubStrategy') private gitHubStrategy: GitHubStrategy,
    @inject('GoogleStrategy') private googleStrategy: GoogleStrategy,
    @inject('FacebookStrategy') private facebookStrategy: FacebookStrategy,
    @inject('UserService') private userService: UserService
  ){
    this.strategyMap = {
      github : this.gitHubStrategy,
      google : this.googleStrategy,
      facebook : this.facebookStrategy
    }
  }

  getStrategy(provider:string){
      return this.strategyMap[provider];
  }

  async generateRefreshToken(user: any): Promise<string> { 
    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '7d' }
    );
    return refreshToken;
  }

  async generateAccessToken(user: any): Promise<string> {
    const accessToken = await jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );
    return accessToken;
  }

  async authenticate(accessToken : string){
    try {
      const user = await jwt.verify(accessToken, process.env.JWT_SECRET as string);
      return user ? true : false ;
    } catch (error) {
      console.error(error)
      return null;
    }
  }

  async refresh(refreshToken : string){
    try {
      const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
      if (user) {
        const newAccessToken = this.generateAccessToken(user);
        const newRefreshToken = this.generateRefreshToken(user);

        return {
          accessToken : newAccessToken,
          refreshToken : newRefreshToken
        };
      }
      return null;
    } catch (error) {
      console.error(error)
      return null;
    }
  }

  async logout(userId: string) {
    // Logic to invalidate the refresh token (e.g., remove it from the database)
    // This is a placeholder implementation
    console.log(`User with ID ${userId} logged out`);
  }

}