import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RoleRepository } from '@repos/role.repository';
import { LoggerService } from '@services/logger.service';

@Injectable()
export class AdminRoleService {
    private adminRoleId?: string;

    constructor(
        private readonly roles: RoleRepository,
        private readonly logger: LoggerService,
    ) { }

    async loadAdminRoleId() {
        try {
            if (this.adminRoleId) return this.adminRoleId;

            const admin = await this.roles.findByName('admin');
            if (!admin) {
                this.logger.error('Admin role not found - seed data may be missing', 'AdminRoleService');
                throw new InternalServerErrorException('System configuration error');
            }

            this.adminRoleId = admin._id.toString();
            return this.adminRoleId;
        } catch (error) {
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`Failed to load admin role: ${error.message}`, error.stack, 'AdminRoleService');
            throw new InternalServerErrorException('Failed to verify admin permissions');
        }
    }
}
