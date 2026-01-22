import { Injectable } from '@nestjs/common';
import { RoleRepository } from '@repos/role.repository';

@Injectable()
export class AdminRoleService {
    private adminRoleId?: string;

    constructor(private readonly roles: RoleRepository) { }

    async loadAdminRoleId() {
        if (this.adminRoleId) return this.adminRoleId;
        const admin = await this.roles.findByName('admin');
        if (!admin) throw new Error('Admin role not seeded.');
        this.adminRoleId = admin._id.toString();
        return this.adminRoleId;
    }
}
