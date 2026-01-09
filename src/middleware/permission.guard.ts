import { CanActivate, ExecutionContext, Injectable, mixin } from '@nestjs/common';
import Role from '../models/role.model';

export const hasPermission = (requiredPermission: string) => {
  @Injectable()
  class PermissionGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      try {
        const { tenantId, roleIds, roles, permissions } = req.user || {};
        const tokenPermissions = Array.isArray(permissions) ? permissions : [];

        if (tokenPermissions.includes(requiredPermission)) {
          return true;
        }

        let resolvedPermissions: string[] = [];
        if (Array.isArray(roleIds) && roleIds.length > 0) {
          const roleDocs = await Role.find({ _id: { $in: roleIds }, tenantId });
          resolvedPermissions = roleDocs.flatMap((role: any) => role.permissions);
        } else if (Array.isArray(roles) && roles.length > 0 && tenantId) {
          const roleDocs = await Role.find({ name: { $in: roles }, tenantId });
          resolvedPermissions = roleDocs.flatMap((role: any) => role.permissions);
        }

        if (resolvedPermissions.includes(requiredPermission)) {
          return true;
        }

        res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        return false;
      } catch (error) {
        res.status(500).json({ error: 'Authorization error' });
        return false;
      }
    }
  }

  return mixin(PermissionGuard);
};
