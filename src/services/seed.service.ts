import { Injectable } from '@nestjs/common';
import { RoleRepository } from '@repos/role.repository';
import { PermissionRepository } from '@repos/permission.repository';
import { ObjectId, Types } from 'mongoose';

@Injectable()
export class SeedService {
    constructor(
        private readonly roles: RoleRepository,
        private readonly perms: PermissionRepository
    ) { }

    async seedDefaults() {
        const permNames = ['users:manage', 'roles:manage', 'permissions:manage'];

        const permIds: string[] = [];
        for (const name of permNames) {
            let p = await this.perms.findByName(name);
            if (!p) p = await this.perms.create({ name });
            permIds.push(p._id.toString());
        }

        let admin = await this.roles.findByName('admin');
        const permissions = permIds.map((p) => new Types.ObjectId(p));
        if (!admin) admin = await this.roles.create({ name: 'admin', permissions: permissions });

        let user = await this.roles.findByName('user');
        if (!user) user = await this.roles.create({ name: 'user', permissions: [] });

        return {
            adminRoleId: admin._id.toString(),
            userRoleId: user._id.toString()
        };
    }
}
