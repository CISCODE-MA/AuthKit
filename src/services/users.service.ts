import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { RegisterDto } from '@dtos/auth/register.dto';
import { Types } from 'mongoose';
import { generateUsernameFromName } from '@utils/helper';

@Injectable()
export class UsersService {
    constructor(
        private readonly users: UserRepository,
        private readonly rolesRepo: RoleRepository
    ) { }

    async create(dto: RegisterDto) {
        // Generate username from fname-lname if not provided
        if (!dto.username || dto.username.trim() === '') {
            dto.username = generateUsernameFromName(dto.fullname.fname, dto.fullname.lname);
        }

        if (await this.users.findByEmail(dto.email)) throw new Error('Email already in use.');
        if (await this.users.findByUsername(dto.username)) throw new Error('Username already in use.');
        if (dto.phoneNumber && (await this.users.findByPhone(dto.phoneNumber))) {
            throw new Error('Phone already in use.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(dto.password, salt);

        const user = await this.users.create({
            fullname: dto.fullname,
            username: dto.username,
            email: dto.email,
            phoneNumber: dto.phoneNumber,
            avatar: dto.avatar,
            jobTitle: dto.jobTitle,
            company: dto.company,
            password: hashed,
            roles: [],
            isVerified: true,
            isBanned: false,
            passwordChangedAt: new Date()
        });

        return { id: user._id, email: user.email };
    }

    async list(filter: { email?: string; username?: string }) {
        return this.users.list(filter);
    }

    async setBan(id: string, banned: boolean) {
        const user = await this.users.updateById(id, { isBanned: banned });
        if (!user) throw new Error('User not found.');
        return { id: user._id, isBanned: user.isBanned };
    }

    async delete(id: string) {
        const user = await this.users.deleteById(id);
        if (!user) throw new Error('User not found.');
        return { ok: true };
    }

    async updateRoles(id: string, roles: string[]) {
        const existing = await this.rolesRepo.findByIds(roles);
        if (existing.length !== roles.length) throw new Error('One or more roles not found.');

        const roleIds = roles.map((r) => new Types.ObjectId(r));
        const user = await this.users.updateById(id, { roles: roleIds });
        if (!user) throw new Error('User not found.');
        return { id: user._id, roles: user.roles };
    }

}
