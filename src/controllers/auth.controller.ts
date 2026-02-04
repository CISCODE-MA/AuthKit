import { Body, Controller, Delete, Get, Next, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { AuthService } from '@services/auth.service';
import { LoginDto } from '@dto/auth/login.dto';
import { RegisterDto } from '@dto/auth/register.dto';
import { RefreshTokenDto } from '@dto/auth/refresh-token.dto';
import { VerifyEmailDto } from '@dto/auth/verify-email.dto';
import { ResendVerificationDto } from '@dto/auth/resend-verification.dto';
import { ForgotPasswordDto } from '@dto/auth/forgot-password.dto';
import { ResetPasswordDto } from '@dto/auth/reset-password.dto';
import { getMillisecondsFromExpiry } from '@utils/helper';
import { OAuthService } from '@services/oauth.service';
import passport from '@config/passport.config';
import { AuthenticateGuard } from '@guards/authenticate.guard';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly oauth: OAuthService) { }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully. Verification email sent.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const result = await this.auth.register(dto);
    return res.status(201).json(result);
  }

  @ApiOperation({ summary: 'Verify user email (POST)' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto, @Res() res: Response) {
    const result = await this.auth.verifyEmail(dto.token);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Verify user email (GET - from email link)' })
  @ApiParam({ name: 'token', description: 'Email verification JWT token' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with success/failure message.' })
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

  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email resent successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Email already verified.' })
  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto, @Res() res: Response) {
    const result = await this.auth.resendVerification(dto.email);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful. Returns access and refresh tokens.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified.' })
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

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
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

  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Res() res: Response) {
    const result = await this.auth.forgotPassword(dto.email);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token.' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Res() res: Response) {
    const result = await this.auth.resetPassword(dto.token, dto.newPassword);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - token missing or invalid.' })
  @Get('me')
  @UseGuards(AuthenticateGuard)
  async getMe(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
    const result = await this.auth.getMe(userId);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Delete current user account' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Account deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - token missing or invalid.' })
  @Delete('account')
  @UseGuards(AuthenticateGuard)
  async deleteAccount(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
    const result = await this.auth.deleteAccount(userId);
    return res.status(200).json(result);
  }

  // Mobile exchange
  @ApiOperation({ summary: 'Login with Microsoft ID token (mobile)' })
  @ApiBody({ schema: { properties: { idToken: { type: 'string', example: 'eyJ...' } } } })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 400, description: 'Invalid ID token.' })
  @Post('oauth/microsoft')
  async microsoftExchange(@Body() body: { idToken: string }, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.oauth.loginWithMicrosoft(body.idToken);
    return res.status(200).json({ accessToken, refreshToken });
  }

  @ApiOperation({ summary: 'Login with Google (mobile - ID token or authorization code)' })
  @ApiBody({ schema: { properties: { idToken: { type: 'string' }, code: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 400, description: 'Invalid token or code.' })
  @Post('oauth/google')
  async googleExchange(@Body() body: { idToken?: string; code?: string }, @Res() res: Response) {
    const result = body.idToken
      ? await this.oauth.loginWithGoogleIdToken(body.idToken)
      : await this.oauth.loginWithGoogleCode(body.code as string);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Login with Facebook access token (mobile)' })
  @ApiBody({ schema: { properties: { accessToken: { type: 'string', example: 'EAABw...' } } } })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 400, description: 'Invalid access token.' })
  @Post('oauth/facebook')
  async facebookExchange(@Body() body: { accessToken: string }, @Res() res: Response) {
    const result = await this.oauth.loginWithFacebook(body.accessToken);
    return res.status(200).json(result);
  }

  // Web redirect
  @ApiOperation({ summary: 'Initiate Google OAuth login (web redirect flow)' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth consent screen.' })
  @Get('google')
  googleLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
  }

  @ApiOperation({ summary: 'Google OAuth callback (web redirect flow)' })
  @ApiResponse({ status: 200, description: 'Returns access and refresh tokens.' })
  @ApiResponse({ status: 400, description: 'Google authentication failed.' })
  @Get('google/callback')
  googleCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('google', { session: false }, (err: any, data: any) => {
      if (err || !data) return res.status(400).json({ message: 'Google auth failed.' });
      return res.status(200).json(data);
    })(req, res, next);
  }

  @ApiOperation({ summary: 'Initiate Microsoft OAuth login (web redirect flow)' })
  @ApiResponse({ status: 302, description: 'Redirects to Microsoft OAuth consent screen.' })
  @Get('microsoft')
  microsoftLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    return passport.authenticate('azure_ad_oauth2', {
      session: false,
      scope: ['openid', 'profile', 'email', 'User.Read'],
    })(req, res, next);
  }

  @ApiOperation({ summary: 'Microsoft OAuth callback (web redirect flow)' })
  @ApiResponse({ status: 200, description: 'Returns access and refresh tokens.' })
  @ApiResponse({ status: 400, description: 'Microsoft authentication failed.' })
  @Get('microsoft/callback')
  microsoftCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('azure_ad_oauth2', { session: false }, (err: any, data: any) => {
      if (err) return res.status(400).json({ message: 'Microsoft auth failed', error: err?.message || err });
      if (!data) return res.status(400).json({ message: 'Microsoft auth failed', error: 'No data returned' });
      return res.status(200).json(data);
    })(req, res, next);

  }

  @ApiOperation({ summary: 'Initiate Facebook OAuth login (web redirect flow)' })
  @ApiResponse({ status: 302, description: 'Redirects to Facebook OAuth consent screen.' })
  @Get('facebook')
  facebookLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    return passport.authenticate('facebook', { scope: ['email'], session: false })(req, res, next);
  }

  @ApiOperation({ summary: 'Facebook OAuth callback (web redirect flow)' })
  @ApiResponse({ status: 200, description: 'Returns access and refresh tokens.' })
  @ApiResponse({ status: 400, description: 'Facebook authentication failed.' })
  @Get('facebook/callback')
  facebookCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('facebook', { session: false }, (err: any, data: any) => {
      if (err || !data) return res.status(400).json({ message: 'Facebook auth failed.' });
      return res.status(200).json(data);
    })(req, res, next);
  }
}
