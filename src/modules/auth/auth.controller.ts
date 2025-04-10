import { Request, Response, Router } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { AuthService } from './auth.service';
import  GitHubStrategy  from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';


@autoInjectable()
export class AuthController {
  public router: Router = Router();

  constructor(
    private authService: AuthService,
    @inject('GitHubStrategy') private gitHubStrategy: GitHubStrategy,
    @inject('GoogleStrategy') private googleStrategy: GoogleStrategy,
    @inject('FacebookStrategy') private facebookStrategy: FacebookStrategy,
  ) {
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get('/github', this.redirectToProvider('github'));
    this.router.get('/github/callback', this.handleCallback('github'));
    this.router.get('/google', this.redirectToProvider('google'));
    this.router.get('/google/callback', this.handleCallback('google'));
    this.router.get('/facebook', this.redirectToProvider('facebook'));
    this.router.get('/facebook/callback', this.handleCallback('facebook'));
  }

  // Redirect the user to the provider for authentication
  private redirectToProvider(provider: string) {
    return (req: Request, res: Response, next: Function): any => {
      if (!provider) {
        return res.status(400).json({ error: 'Provider is required' });
      }
      
      const strategy = this.authService.getStrategy(provider);
      const authUrl = strategy.getAuthURL();
      
      if (authUrl) {
        res.redirect(authUrl);
      } else {
        res.status(400).json({ error: 'Invalid provider' });
      }
    };
  }

  // Handle the callback after user is authenticated by the provider
  private handleCallback(provider: string) {
    return async (req: Request, res: Response, next: Function): Promise<any> => {
      if (!provider) {
        return res.status(400).json({ error: 'Provider is required' });
      }

      const strategy = this.authService.getStrategy(provider);
      const code = req.query.code;
      
      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      try {
        const userData = await strategy.getUserData(code as string);
        const accessToken = await this.authService.generateAccessToken(userData);
        const refreshToken = await this.authService.generateRefreshToken(userData);
        if (userData) {
          await this.authService.createUserIfNotExist(userData);
          res.status(200).json({
            accessToken,
            refreshToken
          });
        } else {
          res.status(400).json({ error: 'Invalid code' });
        }
      } catch (error : any) {
        console.log(error)
        res.status(500).json({ error: 'Error retrieving user data' });
      }
    };
  }
}
