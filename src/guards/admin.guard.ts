<<<<<<< HEAD
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AdminRoleService } from '@services/admin-role.service';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private readonly adminRole: AdminRoleService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];

        const adminRoleId = await this.adminRole.loadAdminRoleId();
        if (roles.includes(adminRoleId)) return true;

        res.status(403).json({ message: 'Forbidden: admin required.' });
        return false;
    }
=======
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AdminRoleService } from "@services/admin-role.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly adminRole: AdminRoleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];

    const adminRoleId = await this.adminRole.loadAdminRoleId();
    if (roles.includes(adminRoleId)) return true;

    res.status(403).json({ message: "Forbidden: admin required." });
    return false;
  }
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}
