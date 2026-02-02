import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { RoleRepository } from '@repos/role.repository';
import { CreateRoleDto } from '@dto/role/create-role.dto';
import { UpdateRoleDto } from '@dto/role/update-role.dto';
import { Types } from 'mongoose';
import { LoggerService } from '@services/logger.service';

/**
 * Roles service handling role-based access control (RBAC) operations
 */
@Injectable()
export class RolesService {
    constructor(
        private readonly roles: RoleRepository,
        private readonly logger: LoggerService,
    ) { }

    //#region Role Management

    /**
     * Creates a new role with optional permissions
     * @param dto - Role creation data including name and permission IDs
     * @returns Created role object
     * @throws ConflictException if role name already exists
     * @throws InternalServerErrorException on creation errors
     */
    async create(dto: CreateRoleDto) {
        try {
            if (await this.roles.findByName(dto.name)) {
                throw new ConflictException('Role already exists');
            }
            const permIds = (dto.permissions || []).map((p) => new Types.ObjectId(p));
            return this.roles.create({ name: dto.name, permissions: permIds });
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            if (error?.code === 11000) {
                throw new ConflictException('Role already exists');
            }
            this.logger.error(`Role creation failed: ${error.message}`, error.stack, 'RolesService');
            throw new InternalServerErrorException('Failed to create role');
        }
    }

    /**
     * Retrieves all roles with their permissions
     * @returns Array of all roles
     * @throws InternalServerErrorException on query errors
     */
    async list() {
        try {
            return this.roles.list();
        } catch (error) {
            this.logger.error(`Role list failed: ${error.message}`, error.stack, 'RolesService');
            throw new InternalServerErrorException('Failed to retrieve roles');
        }
    }

    /**
     * Updates an existing role
     * @param id - Role ID to update
     * @param dto - Update data (name and/or permissions)
     * @returns Updated role object
     * @throws NotFoundException if role not found
     * @throws InternalServerErrorException on update errors
     */
    async update(id: string, dto: UpdateRoleDto) {
        try {
            const data: any = { ...dto };

            if (dto.permissions) {
                data.permissions = dto.permissions.map((p) => new Types.ObjectId(p));
            }

            const role = await this.roles.updateById(id, data);
            if (!role) {
                throw new NotFoundException('Role not found');
            }
            return role;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Role update failed: ${error.message}`, error.stack, 'RolesService');
            throw new InternalServerErrorException('Failed to update role');
        }
    }

    /**
     * Deletes a role
     * @param id - Role ID to delete
     * @returns Success confirmation
     * @throws NotFoundException if role not found
     * @throws InternalServerErrorException on deletion errors
     */
    async delete(id: string) {
        try {
            const role = await this.roles.deleteById(id);
            if (!role) {
                throw new NotFoundException('Role not found');
            }
            return { ok: true };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Role deletion failed: ${error.message}`, error.stack, 'RolesService');
            throw new InternalServerErrorException('Failed to delete role');
        }
    }

    //#endregion

    //#region Permission Assignment

    /**
     * Sets permissions for a role (replaces existing)
     * @param roleId - Role ID to update
     * @param permissionIds - Array of permission IDs to assign
     * @returns Updated role with new permissions
     * @throws NotFoundException if role not found
     * @throws InternalServerErrorException on update errors
     */
    async setPermissions(roleId: string, permissionIds: string[]) {
        try {
            const permIds = permissionIds.map((p) => new Types.ObjectId(p));
            const role = await this.roles.updateById(roleId, { permissions: permIds });
            if (!role) {
                throw new NotFoundException('Role not found');
            }
            return role;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Set permissions failed: ${error.message}`, error.stack, 'RolesService');
            throw new InternalServerErrorException('Failed to set permissions');
        }
    }

    //#endregion
}
