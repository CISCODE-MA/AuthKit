import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@repos/user.repository';
import { LoggerService } from '@services/logger.service';

@Injectable()
export class AuthenticateGuard implements CanActivate {
  constructor(
    private readonly users: UserRepository,
    private readonly logger: LoggerService,
  ) { }

  private getEnv(name: string): string {
    const v = process.env[name];
    if (!v) {
      this.logger.error(`Environment variable ${name} is not set`, 'AuthenticateGuard');
      throw new InternalServerErrorException('Server configuration error');
    }
    return v;
  }


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, this.getEnv('JWT_SECRET'));
      const user = await this.users.findById(decoded.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.isVerified) {
        throw new ForbiddenException('Email not verified. Please check your inbox');
      }

      if (user.isBanned) {
        throw new ForbiddenException('Account has been banned. Please contact support');
      }

      // Check if token was issued before password change
      if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
        throw new UnauthorizedException('Token expired due to password change. Please login again');
      }

      req.user = decoded;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid access token');
      }

      if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not yet valid');
      }

      this.logger.error(`Authentication failed: ${error.message}`, error.stack, 'AuthenticateGuard');
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
