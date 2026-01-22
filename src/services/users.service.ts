import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@repos/user.repository';
import { RegisterDto } from '@dtos/auth/register.dto';

@Injectable()
export class UsersService {
    constructor(private readonly users: UserRepository) { }

    async create(dto: RegisterDto) {
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
            password: hashed,
            roles: [], // default role can be assigned here later
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



}
