import { Body, Controller, Delete, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '@services/auth.service';
import { LoginDto } from '@dtos/login.dto';
import { RegisterDto } from '@dtos/register.dto';
import { RefreshTokenDto } from '@dtos/refresh-token.dto';
import { VerifyEmailDto } from '@dtos/verify-email.dto';
import { ResendVerificationDto } from '@dtos/resend-verification.dto';
import { ForgotPasswordDto } from '@dtos/forgot-password.dto';
import { ResetPasswordDto } from '@dtos/reset-password.dto';
import { getMillisecondsFromExpiry } from '@utils/helper';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) { }

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

  @Delete('account')
  async deleteAccount(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
    const result = await this.auth.deleteAccount(userId);
    return res.status(200).json(result);
  }
}
