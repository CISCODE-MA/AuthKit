import { Injectable } from '@nestjs/common';
import { RoleRepository } from '@repos/role.repository';
import { CreateRoleDto } from '@dtos/role/create-role.dto';
import { UpdateRoleDto } from '@dtos/role/update-role.dto';

@Injectable()
export class RolesService {
    constructor(private readonly roles: RoleRepository) { }

    async create(dto: CreateRoleDto) {
        if (await this.roles.findByName(dto.name)) throw new Error('Role already exists.');
        return this.roles.create({ name: dto.name, permissions: dto.permissions || [] });
    }

    async list() {
        return this.roles.list();
    }

    async update(id: string, dto: UpdateRoleDto) {
        const role = await this.roles.updateById(id, dto);
        if (!role) throw new Error('Role not found.');
        return role;
    }

    async delete(id: string) {
        const role = await this.roles.deleteById(id);
        if (!role) throw new Error('Role not found.');
        return { ok: true };
    }
}
