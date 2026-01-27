import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { RegisterDto } from '@dtos/auth/register.dto';
import { Types } from 'mongoose';
import { generateUsernameFromName } from '@utils/helper';
import { LoggerService } from '@services/logger.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly users: UserRepository,
        private readonly rolesRepo: RoleRepository,
        private readonly logger: LoggerService,
    ) { }

    async create(dto: RegisterDto) {
        try {
            // Generate username from fname-lname if not provided
            if (!dto.username || dto.username.trim() === '') {
                dto.username = generateUsernameFromName(dto.fullname.fname, dto.fullname.lname);
            }

            // Check for existing user
            const [existingEmail, existingUsername, existingPhone] = await Promise.all([
                this.users.findByEmail(dto.email),
                this.users.findByUsername(dto.username),
                dto.phoneNumber ? this.users.findByPhone(dto.phoneNumber) : null,
            ]);

            if (existingEmail || existingUsername || existingPhone) {
                throw new ConflictException('An account with these credentials already exists');
            }

            // Hash password
            let hashed: string;
            try {
                const salt = await bcrypt.genSalt(10);
                hashed = await bcrypt.hash(dto.password, salt);
            } catch (error) {
                this.logger.error(`Password hashing failed: ${error.message}`, error.stack, 'UsersService');
                throw new InternalServerErrorException('User creation failed');
            }

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
        } catch (error) {
            if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
                throw error;
            }

            if (error?.code === 11000) {
                throw new ConflictException('An account with these credentials already exists');
            }

            this.logger.error(`User creation failed: ${error.message}`, error.stack, 'UsersService');
            throw new InternalServerErrorException('User creation failed');
        }
    }

    async list(filter: { email?: string; username?: string }) {
        try {
            return this.users.list(filter);
        } catch (error) {
            this.logger.error(`User list failed: ${error.message}`, error.stack, 'UsersService');
            throw new InternalServerErrorException('Failed to retrieve users');
        }
    }

    async setBan(id: string, banned: boolean) {
        try {
            const user = await this.users.updateById(id, { isBanned: banned });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return { id: user._id, isBanned: user.isBanned };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Set ban status failed: ${error.message}`, error.stack, 'UsersService');
            throw new InternalServerErrorException('Failed to update user ban status');
        }
    }

    async delete(id: string) {
        try {
            const user = await this.users.deleteById(id);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return { ok: true };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`User deletion failed: ${error.message}`, error.stack, 'UsersService');
            throw new InternalServerErrorException('Failed to delete user');
        }
    }

    async updateRoles(id: string, roles: string[]) {
        try {
            const existing = await this.rolesRepo.findByIds(roles);
            if (existing.length !== roles.length) {
                throw new NotFoundException('One or more roles not found');
            }

            const roleIds = roles.map((r) => new Types.ObjectId(r));
            const user = await this.users.updateById(id, { roles: roleIds });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return { id: user._id, roles: user.roles };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Update user roles failed: ${error.message}`, error.stack, 'UsersService');
            throw new InternalServerErrorException('Failed to update user roles');
        }
    }

}
