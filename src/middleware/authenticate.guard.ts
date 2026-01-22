import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@repos/user.repository';

@Injectable()
export class AuthenticateGuard implements CanActivate {
  constructor(private readonly users: UserRepository) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Missing or invalid Authorization header.' });
      return false;
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      const user = await this.users.findById(decoded.sub);

      if (!user) {
        res.status(401).json({ message: 'User not found.' });
        return false;
      }
      if (!user.isVerified) {
        res.status(403).json({ message: 'Email not verified.' });
        return false;
      }
      if (user.isBanned) {
        res.status(403).json({ message: 'Account banned.' });
        return false;
      }
      if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
        res.status(401).json({ message: 'Token expired.' });
        return false;
      }

      req.user = decoded;
      return true;
    } catch {
      res.status(401).json({ message: 'Invalid access token.' });
      return false;
    }
  }
}
