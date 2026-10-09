import { Controller, Get, Post, Param, Public, Req, Res, type Request, type Response } from 'lowcode-server';
import { GeneralResult } from '../framework';
import { authEnabled, isAuthenticated, isThrottled, login, logout } from '../framework/auth';

/** Admin sign-in */
@Public()
@Controller('/auth')
export default class AuthController {
  /** Exchange the admin password for a session cookie */
  @Post('/login')
  login(@Req req: Request, @Res res: Response, @Param('password') password: string) {
    if (isThrottled(req)) {
      res.status(429);
      return GeneralResult.fail(429, 'Too many failed attempts. Try again later.');
    }
    if (!login(req, res, password)) {
      res.status(401);
      return GeneralResult.fail(401, 'Incorrect password');
    }
    return GeneralResult.success({ authenticated: true });
  }

  /** End the session */
  @Post('/logout')
  logout(@Req req: Request, @Res res: Response) {
    logout(req, res);
    return GeneralResult.success({ authenticated: false });
  }

  /** Whether the caller is signed in, and whether sign-in is required at all */
  @Get('/me')
  me(@Req req: Request) {
    return GeneralResult.success({ authenticated: isAuthenticated(req), required: authEnabled });
  }
}
