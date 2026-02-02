import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { RegisterDto } from '@dto/auth/register.dto';
import { Types } from 'mongoose';
import { generateUsernameFromName } from '@utils/helper';
import { LoggerService } from '@services/logger.service';
import { hashPassword } from '@utils/password.util';

/**
 * Users service handling user management operations
 */
@Injectable()
export class UsersService {
    constructor(
        private readonly users: UserRepository,
        private readonly rolesRepo: RoleRepository,
        private readonly logger: LoggerService,
    ) { }

    //#region User Management

    /**
     * Creates a new user account
     * @param dto - User registration data
     * @returns Created user object
     * @throws ConflictException if email/username/phone already exists
     * @throws InternalServerErrorException on creation errors
     */
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
                hashed = await hashPassword(dto.password);
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

    //#endregion

    //#region Query Operations

    /**
     * Lists users based on filter criteria
     * @param filter - Filter object with email and/or username
     * @returns Array of users matching the filter
     * @throws InternalServerErrorException on query errors
     */
    async list(filter: { email?: string; username?: string }) {
        try {
            return this.users.list(filter);
        } catch (error) {
            this.logger.error(`User list failed: ${error.message}`, error.stack, 'UsersService');
            throw new InternalServerErrorException('Failed to retrieve users');
        }
    }

    //#endregion

    //#region User Status Management

    /**
     * Sets or removes ban status for a user
     * @param id - User ID
     * @param banned - True to ban, false to unban
     * @returns Updated user ID and ban status
     * @throws NotFoundException if user not found
     * @throws InternalServerErrorException on update errors
     */
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

    /**
     * Deletes a user account
     * @param id - User ID to delete
     * @returns Success confirmation object
     * @throws NotFoundException if user not found
     * @throws InternalServerErrorException on deletion errors
     */
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

    //#endregion

    //#region Role Management

    /**
     * Updates user role assignments
     * @param id - User ID
     * @param roles - Array of role IDs to assign
     * @returns Updated user ID and roles
     * @throws NotFoundException if user or any role not found
     * @throws InternalServerErrorException on update errors
     */
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

    //#endregion
}
