import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PermissionRepository } from '@repos/permission.repository';
import { CreatePermissionDto } from '@dto/permission/create-permission.dto';
import { UpdatePermissionDto } from '@dto/permission/update-permission.dto';
import { LoggerService } from '@services/logger.service';

@Injectable()
export class PermissionsService {
    constructor(
        private readonly perms: PermissionRepository,
        private readonly logger: LoggerService,
    ) { }

    async create(dto: CreatePermissionDto) {
        try {
            if (await this.perms.findByName(dto.name)) {
                throw new ConflictException('Permission already exists');
            }
            return this.perms.create(dto);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            if (error?.code === 11000) {
                throw new ConflictException('Permission already exists');
            }
            this.logger.error(`Permission creation failed: ${error.message}`, error.stack, 'PermissionsService');
            throw new InternalServerErrorException('Failed to create permission');
        }
    }

    async list() {
        try {
            return this.perms.list();
        } catch (error) {
            this.logger.error(`Permission list failed: ${error.message}`, error.stack, 'PermissionsService');
            throw new InternalServerErrorException('Failed to retrieve permissions');
        }
    }

    async update(id: string, dto: UpdatePermissionDto) {
        try {
            const perm = await this.perms.updateById(id, dto);
            if (!perm) {
                throw new NotFoundException('Permission not found');
            }
            return perm;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Permission update failed: ${error.message}`, error.stack, 'PermissionsService');
            throw new InternalServerErrorException('Failed to update permission');
        }
    }

    async delete(id: string) {
        try {
            const perm = await this.perms.deleteById(id);
            if (!perm) {
                throw new NotFoundException('Permission not found');
            }
            return { ok: true };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Permission deletion failed: ${error.message}`, error.stack, 'PermissionsService');
            throw new InternalServerErrorException('Failed to delete permission');
        }
    }
}
