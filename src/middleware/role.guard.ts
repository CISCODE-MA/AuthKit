import { CanActivate, ExecutionContext, Injectable, mixin } from '@nestjs/common';

export const hasRole = (requiredRoleId: string) => {
  @Injectable()
  class RoleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];

      if (roles.includes(requiredRoleId)) return true;

      res.status(403).json({ message: 'Forbidden: role required.' });
      return false;
    }
  }

  return mixin(RoleGuard);
};
