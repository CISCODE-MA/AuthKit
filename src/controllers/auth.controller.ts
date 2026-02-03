import { Body, Controller, Delete, Get, Next, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthService } from '@services/auth.service';
import { LoginDto } from '@dtos/auth/login.dto';
import { RegisterDto } from '@dtos/auth/register.dto';
import { RefreshTokenDto } from '@dtos/auth/refresh-token.dto';
import { VerifyEmailDto } from '@dtos/auth/verify-email.dto';
import { ResendVerificationDto } from '@dtos/auth/resend-verification.dto';
import { ForgotPasswordDto } from '@dtos/auth/forgot-password.dto';
import { ResetPasswordDto } from '@dtos/auth/reset-password.dto';
import { getMillisecondsFromExpiry } from '@utils/helper';
import { OAuthService } from '@services/oauth.service';
import passport from '@config/passport.config';
import { AuthenticateGuard } from '@middleware/authenticate.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly oauth: OAuthService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const result = await this.auth.register(dto);
    return res.status(201).json(result);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto, @Res() res: Response) {
    const result = await this.auth.verifyEmail(dto.token);
    return res.status(200).json(result);
  }

  @Get('verify-email/:token')
  async verifyEmailGet(@Param('token') token: string, @Res() res: Response) {
    try {
      const result = await this.auth.verifyEmail(token);
      // Redirect to frontend with success
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/email-verified?success=true&message=${encodeURIComponent(result.message)}`);
    } catch (error) {
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMsg = error.message || 'Email verification failed';
      return res.redirect(`${frontendUrl}/email-verified?success=false&message=${encodeURIComponent(errorMsg)}`);
    }
  }

  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto, @Res() res: Response) {
    const result = await this.auth.resendVerification(dto.email);
    return res.status(200).json(result);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.auth.login(dto);
    const refreshTTL = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: getMillisecondsFromExpiry(refreshTTL),
    });

    return res.status(200).json({ accessToken, refreshToken });
  }

  @Post('refresh-token')
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res() res: Response) {
    const token = dto.refreshToken || (req as any).cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token missing.' });

    const { accessToken, refreshToken } = await this.auth.refresh(token);
    const refreshTTL = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: getMillisecondsFromExpiry(refreshTTL),
    });

    return res.status(200).json({ accessToken, refreshToken });
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Res() res: Response) {
    const result = await this.auth.forgotPassword(dto.email);
    return res.status(200).json(result);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Res() res: Response) {
    const result = await this.auth.resetPassword(dto.token, dto.newPassword);
    return res.status(200).json(result);
  }

  @Get('me')
  @UseGuards(AuthenticateGuard)
  async getMe(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
    const result = await this.auth.getMe(userId);
    return res.status(200).json(result);
  }

  @Delete('account')
  @UseGuards(AuthenticateGuard)
  async deleteAccount(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
    const result = await this.auth.deleteAccount(userId);
    return res.status(200).json(result);
  }

  // Mobile exchange
  @Post('oauth/microsoft')
  async microsoftExchange(@Body() body: { idToken: string }, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.oauth.loginWithMicrosoft(body.idToken);
    return res.status(200).json({ accessToken, refreshToken });
  }

  @Post('oauth/google')
  async googleExchange(@Body() body: { idToken?: string; code?: string }, @Res() res: Response) {
    const result = body.idToken
      ? await this.oauth.loginWithGoogleIdToken(body.idToken)
      : await this.oauth.loginWithGoogleCode(body.code as string);
    return res.status(200).json(result);
  }

  @Post('oauth/facebook')
  async facebookExchange(@Body() body: { accessToken: string }, @Res() res: Response) {
    const result = await this.oauth.loginWithFacebook(body.accessToken);
    return res.status(200).json(result);
  }

  // Web redirect
  @Get('google')
  googleLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
  }

  @Get('google/callback')
  googleCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('google', { session: false }, (err: any, data: any) => {
      if (err || !data) return res.status(400).json({ message: 'Google auth failed.' });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const tokenParams = new URLSearchParams({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return res.redirect(`${frontendUrl}/oauth/google/callback?${tokenParams.toString()}`);
    })(req, res, next);
  }

  @Get('microsoft')
  microsoftLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    return passport.authenticate('azure_ad_oauth2', {
      session: false,
      scope: ['openid', 'profile', 'email', 'User.Read'],
    })(req, res, next);
  }

  @Get('microsoft/callback')
  microsoftCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('azure_ad_oauth2', { session: false }, (err: any, data: any) => {
      if (err) return res.status(400).json({ message: 'Microsoft auth failed', error: err?.message || err });
      if (!data) return res.status(400).json({ message: 'Microsoft auth failed', error: 'No data returned' });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const tokenParams = new URLSearchParams({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return res.redirect(`${frontendUrl}/oauth/microsoft/callback?${tokenParams.toString()}`);
    })(req, res, next);

  }

  @Get('facebook')
  facebookLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    return passport.authenticate('facebook', { scope: ['email'], session: false })(req, res, next);
  }

  @Get('facebook/callback')
  facebookCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('facebook', { session: false }, (err: any, data: any) => {
      if (err || !data) return res.status(400).json({ message: 'Facebook auth failed.' });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const tokenParams = new URLSearchParams({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return res.redirect(`${frontendUrl}/oauth/facebook/callback?${tokenParams.toString()}`);
    })(req, res, next);
  }
}
