import { Injectable } from '@nestjs/common';
import { RoleRepository } from '@repos/role.repository';
import { CreateRoleDto } from '@dtos/role/create-role.dto';
import { UpdateRoleDto } from '@dtos/role/update-role.dto';
import { Types } from 'mongoose';

@Injectable()
export class RolesService {
    constructor(private readonly roles: RoleRepository) { }

    async create(dto: CreateRoleDto) {
        if (await this.roles.findByName(dto.name)) throw new Error('Role already exists.');
        const permIds = (dto.permissions || []).map((p) => new Types.ObjectId(p));
        return this.roles.create({ name: dto.name, permissions: permIds });

    }

    async list() {
        return this.roles.list();
    }

    async update(id: string, dto: UpdateRoleDto) {
        const data: any = { ...dto };

        if (dto.permissions) {
            data.permissions = dto.permissions.map((p) => new Types.ObjectId(p));
        }

        const role = await this.roles.updateById(id, data);
        if (!role) throw new Error('Role not found.');
        return role;
    }


    async delete(id: string) {
        const role = await this.roles.deleteById(id);
        if (!role) throw new Error('Role not found.');
        return { ok: true };
    }

    async setPermissions(roleId: string, permissionIds: string[]) {
        const permIds = permissionIds.map((p) => new Types.ObjectId(p));
        const role = await this.roles.updateById(roleId, { permissions: permIds });
        if (!role) throw new Error('Role not found.');
        return role;


    }

}
