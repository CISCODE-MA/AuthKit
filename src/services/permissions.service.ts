import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '@repos/permission.repository';
import { CreatePermissionDto } from '@dtos/permission/create-permission.dto';
import { UpdatePermissionDto } from '@dtos/permission/update-permission.dto';

@Injectable()
export class PermissionsService {
    constructor(private readonly perms: PermissionRepository) { }

    async create(dto: CreatePermissionDto) {
        if (await this.perms.findByName(dto.name)) throw new Error('Permission already exists.');
        return this.perms.create(dto);
    }

    async list() {
        return this.perms.list();
    }

    async update(id: string, dto: UpdatePermissionDto) {
        const perm = await this.perms.updateById(id, dto);
        if (!perm) throw new Error('Permission not found.');
        return perm;
    }

    async delete(id: string) {
        const perm = await this.perms.deleteById(id);
        if (!perm) throw new Error('Permission not found.');
        return { ok: true };
    }
}
