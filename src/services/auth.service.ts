import { Injectable, ConflictException, UnauthorizedException, NotFoundException, InternalServerErrorException, ForbiddenException, BadRequestException } from '@nestjs/common';
import type { SignOptions } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '@repos/user.repository';
import { RegisterDto } from '@dto/auth/register.dto';
import { LoginDto } from '@dto/auth/login.dto';
import { MailService } from '@services/mail.service';
import { RoleRepository } from '@repos/role.repository';
import { PermissionRepository } from '@repos/permission.repository';
import { generateUsernameFromName } from '@utils/helper';
import { LoggerService } from '@services/logger.service';
import { hashPassword, verifyPassword } from '@utils/password.util';

type JwtExpiry = SignOptions['expiresIn'];

/**
 * Authentication service handling user registration, login, email verification,
 * password reset, and token management
 */
@Injectable()
export class AuthService {
    constructor(
        private readonly users: UserRepository,
        private readonly mail: MailService,
        private readonly roles: RoleRepository,
        private readonly perms: PermissionRepository,
        private readonly logger: LoggerService,
    ) { }

    //#region Token Management

    /**
     * Resolves JWT expiry time from environment or uses fallback
     * @param value - Environment variable value
     * @param fallback - Default expiry time
     * @returns JWT expiry time
     */
    private resolveExpiry(value: string | undefined, fallback: JwtExpiry): JwtExpiry {
        return (value || fallback) as JwtExpiry;
    }

    /**
     * Signs an access token with user payload
     * @param payload - Token payload containing user data
     * @returns Signed JWT access token
     */
    private signAccessToken(payload: any) {
        const expiresIn = this.resolveExpiry(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN, '15m');
        return jwt.sign(payload, this.getEnv('JWT_SECRET'), { expiresIn });
    }

    /**
     * Signs a refresh token for token renewal
     * @param payload - Token payload with user ID
     * @returns Signed JWT refresh token
     */
    private signRefreshToken(payload: any) {
        const expiresIn = this.resolveExpiry(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN, '7d');
        return jwt.sign(payload, this.getEnv('JWT_REFRESH_SECRET'), { expiresIn });
    }

    /**
     * Signs an email verification token
     * @param payload - Token payload with user data
     * @returns Signed JWT email token
     */
    private signEmailToken(payload: any) {
        const expiresIn = this.resolveExpiry(process.env.JWT_EMAIL_TOKEN_EXPIRES_IN, '1d');

        return jwt.sign(payload, this.getEnv('JWT_EMAIL_SECRET'), { expiresIn });
    }

    /**
     * Signs a password reset token
     * @param payload - Token payload with user data
     * @returns Signed JWT reset token
     */
    private signResetToken(payload: any) {
        const expiresIn = this.resolveExpiry(process.env.JWT_RESET_TOKEN_EXPIRES_IN, '1h');
        return jwt.sign(payload, this.getEnv('JWT_RESET_SECRET'), { expiresIn });
    }

    /**
     * Builds JWT payload with user roles and permissions
     * @param userId - User identifier
     * @returns Token payload with user data
     * @throws NotFoundException if user not found
     * @throws InternalServerErrorException on database errors
     */
    private async buildTokenPayload(userId: string) {
        try {
            // Get user with raw role IDs
            const user = await this.users.findById(userId);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            console.log('[DEBUG] User found, querying roles...');

            // Manually query roles by IDs
            const roleIds = user.roles || [];
            const roles = await this.roles.findByIds(roleIds.map(id => id.toString()));
            
            console.log('[DEBUG] Roles from DB:', roles);

            // Extract role names
            const roleNames = roles.map(r => r.name).filter(Boolean);
            
            // Extract all permission IDs from all roles
            const permissionIds = roles.flatMap(role => {
                if (!role.permissions || role.permissions.length === 0) return [];
                return role.permissions.map((p: any) => p.toString ? p.toString() : p);
            }).filter(Boolean);
            
            console.log('[DEBUG] Permission IDs:', permissionIds);

            // Query permissions by IDs to get names
            const permissionObjects = await this.perms.findByIds([...new Set(permissionIds)]);
            const permissions = permissionObjects.map(p => p.name).filter(Boolean);

            console.log('[DEBUG] Final roles:', roleNames, 'permissions:', permissions);

            return { sub: user._id.toString(), roles: roleNames, permissions };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Failed to build token payload: ${error.message}`, error.stack, 'AuthService');
            throw new InternalServerErrorException('Failed to generate authentication token');
        }
    }

    /**
     * Gets environment variable or throws error if missing
     * @param name - Environment variable name
     * @returns Environment variable value
     * @throws InternalServerErrorException if variable not set
     */
    private getEnv(name: string): string {
        const v = process.env[name];
        if (!v) {
            this.logger.error(`Environment variable ${name} is not set`, 'AuthService');
            throw new InternalServerErrorException('Server configuration error');
        }
        return v;
    }

    /**
     * Issues access and refresh tokens for authenticated user
     * @param userId - User identifier
     * @returns Access and refresh tokens
     */
    public async issueTokensForUser(userId: string) {
        const payload = await this.buildTokenPayload(userId);
        const accessToken = this.signAccessToken(payload);
        const refreshToken = this.signRefreshToken({ sub: userId, purpose: 'refresh' });
        return { accessToken, refreshToken };
    }

    //#endregion

    //#region User Profile

    /**
     * Gets authenticated user profile
     * @param userId - User identifier from JWT
     * @returns User profile without sensitive data
     * @throws NotFoundException if user not found
     * @throws ForbiddenException if account banned
     */
    async getMe(userId: string) {
        try {
            const user = await this.users.findByIdWithRolesAndPermissions(userId);

            if (!user) {
                throw new NotFoundException('User not found');
            }

            if (user.isBanned) {
                throw new ForbiddenException('Account has been banned. Please contact support');
            }

            // Return user data without sensitive information
            const userObject = user.toObject ? user.toObject() : user;
            const { password, passwordChangedAt, ...safeUser } = userObject as any;

            return {
                ok: true,
                data: safeUser
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }

            this.logger.error(`Get profile failed: ${error.message}`, error.stack, 'AuthService');
            throw new InternalServerErrorException('Failed to retrieve profile');
        }
    }

    //#endregion

    //#region Registration

    /**
     * Registers a new user account
     * @param dto - Registration data including email, password, name
     * @returns Registration result with user ID and email status
     * @throws ConflictException if email/username/phone already exists
     * @throws InternalServerErrorException on system errors
     */
    async register(dto: RegisterDto) {
        try {
            // Generate username from fname-lname if not provided
            if (!dto.username || dto.username.trim() === '') {
                dto.username = generateUsernameFromName(dto.fullname.fname, dto.fullname.lname);
            }

            // Check for existing user (use generic message to prevent enumeration)
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
                this.logger.error(`Password hashing failed: ${error.message}`, error.stack, 'AuthService');
                throw new InternalServerErrorException('Registration failed');
            }

            // Get default role
            const userRole = await this.roles.findByName('user');
            if (!userRole) {
                this.logger.error('Default user role not found - seed data may be missing', 'AuthService');
                throw new InternalServerErrorException('System configuration error');
            }

            // Create user
            const user = await this.users.create({
                fullname: dto.fullname,
                username: dto.username,
                email: dto.email,
                phoneNumber: dto.phoneNumber,
                avatar: dto.avatar,
                jobTitle: dto.jobTitle,
                company: dto.company,
                password: hashed,
                roles: [userRole._id],
                isVerified: false,
                isBanned: false,
                passwordChangedAt: new Date()
            });

            // Send verification email (don't let email failures crash registration)
            let emailSent = true;
            let emailError: string | undefined;
            try {
                const emailToken = this.signEmailToken({ sub: user._id.toString(), purpose: 'verify' });
                await this.mail.sendVerificationEmail(user.email, emailToken);
            } catch (error) {
                emailSent = false;
                emailError = error.message || 'Failed to send verification email';
                this.logger.error(`Failed to send verification email: ${error.message}`, error.stack, 'AuthService');
                // Continue - user is created, they can resend verification
            }

            return {
                ok: true,
                id: user._id,
                email: user.email,
                emailSent,
                ...(emailError && { emailError, emailHint: 'User created successfully. You can resend verification email later.' })
            };
        } catch (error) {
            // Re-throw HTTP exceptions
            if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
                throw error;
            }

            // Handle MongoDB duplicate key error (race condition)
            if (error?.code === 11000) {
                throw new ConflictException('An account with these credentials already exists');
            }

            this.logger.error(`Registration failed: ${error.message}`, error.stack, 'AuthService');
            throw new InternalServerErrorException('Registration failed. Please try again');
        }
    }

    //#endregion

    //#region Email Verification

    /**
     * Verifies user email with token
     * @param token - Email verification JWT token
     * @returns Verification success message
     * @throws BadRequestException if token is invalid
     * @throws NotFoundException if user not found
     * @throws UnauthorizedException if token expired or malformed
     * @throws InternalServerErrorException on system errors
     */
    async verifyEmail(token: string) {
        try {
            const decoded: any = jwt.verify(token, this.getEnv('JWT_EMAIL_SECRET'));

            if (decoded.purpose !== 'verify') {
                throw new BadRequestException('Invalid verification token');
            }

            const user = await this.users.findById(decoded.sub);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            if (user.isVerified) {
                return { ok: true, message: 'Email already verified' };
            }

            user.isVerified = true;
            await user.save();

            return { ok: true, message: 'Email verified successfully' };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }

            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Verification token has expired');
            }

            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid verification token');
            }

            this.logger.error(`Email verification failed: ${error.message}`, error.stack, 'AuthService');
            throw new InternalServerErrorException('Email verification failed');
        }
    }

    /**
     * Resends email verification token to user
     * @param email - User email address
     * @returns Success message (always succeeds to prevent enumeration)
     * @throws InternalServerErrorException on system errors
     */
    async resendVerification(email: string) {
        try {
            const user = await this.users.findByEmail(email);

            // Return success even if user not found (prevent email enumeration)
            if (!user || user.isVerified) {
                return { ok: true, message: 'If the email exists and is unverified, a verification email has been sent' };
            }

            const emailToken = this.signEmailToken({ sub: user._id.toString(), purpose: 'verify' });

            try {
                await this.mail.sendVerificationEmail(user.email, emailToken);
                return { ok: true, message: 'Verification email sent successfully', emailSent: true };
            } catch (emailError) {
                // Log the actual error but return generic message
                this.logger.error(`Failed to send verification email: ${emailError.message}`, emailError.stack, 'AuthService');
                return {
                    ok: false,
                    message: 'Failed to send verification email',
                    emailSent: false,
                    error: emailError.message || 'Email service error'
                };
            }
        } catch (error) {
            this.logger.error(`Resend verification failed: ${error.message}`, error.stack, 'AuthService');
            // Return error details for debugging
            return {
                ok: false,
                message: 'Failed to resend verification email',
                error: error.message
            };
        }
    }

    //#endregion

    //#region Login & Authentication

    /**
     * Authenticates a user and issues access tokens
     * @param dto - Login credentials (email + password)
     * @returns Access and refresh tokens
     * @throws UnauthorizedException if credentials are invalid or user is banned
     * @throws InternalServerErrorException on system errors
     */
    async login(dto: LoginDto) {
        try {
            const user = await this.users.findByEmailWithPassword(dto.email);

            // Use generic message to prevent user enumeration
            if (!user) {
                throw new UnauthorizedException('Invalid email or password');
            }

            if (user.isBanned) {
                throw new ForbiddenException('Account has been banned. Please contact support');
            }

            if (!user.isVerified) {
                throw new ForbiddenException('Email not verified. Please check your inbox');
            }

            const passwordMatch = await verifyPassword(dto.password, user.password as string);
            if (!passwordMatch) {
                throw new UnauthorizedException('Invalid email or password');
            }

            const payload = await this.buildTokenPayload(user._id.toString());
            const accessToken = this.signAccessToken(payload);
            const refreshToken = this.signRefreshToken({ sub: user._id.toString(), purpose: 'refresh' });

            return { accessToken, refreshToken };
        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
                throw error;
            }

            this.logger.error(`Login failed: ${error.message}`, error.stack, 'AuthService');
            throw new InternalServerErrorException('Login failed. Please try again');
        }
    }

    //#endregion

    //#region Token Refresh

    /**
     * Issues new access and refresh tokens using a valid refresh token
     * @param refreshToken - Valid refresh JWT token
     * @returns New access and refresh token pair
     * @throws UnauthorizedException if token is invalid, expired, or wrong type
     * @throws ForbiddenException if user is banned
     * @throws InternalServerErrorException on system errors
     */
    async refresh(refreshToken: string) {
        try {
            const decoded: any = jwt.verify(refreshToken, this.getEnv('JWT_REFRESH_SECRET'));

            if (decoded.purpose !== 'refresh') {
                throw new UnauthorizedException('Invalid token type');
            }

            const user = await this.users.findById(decoded.sub);
            if (!user) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            if (user.isBanned) {
                throw new ForbiddenException('Account has been banned');
            }

            if (!user.isVerified) {
                throw new ForbiddenException('Email not verified');
            }

            // Check if token was issued before password change
            if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
                throw new UnauthorizedException('Token expired due to password change');
            }

            const payload = await this.buildTokenPayload(user._id.toString());
            const accessToken = this.signAccessToken(payload);
            const newRefreshToken = this.signRefreshToken({ sub: user._id.toString(), purpose: 'refresh' });

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
                throw error;
            }

            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Refresh token has expired');
            }

            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid refresh token');
            }

            this.logger.error(`Token refresh failed: ${error.message}`, error.stack, 'AuthService');
            throw new InternalServerErrorException('Token refresh failed');
        }
    }

    //#endregion

    //#region Password Reset

    /**
     * Initiates password reset process by sending reset email
     * @param email - User email address
     * @returns Success message (always succeeds to prevent enumeration)
     * @throws InternalServerErrorException on critical system errors
     */
    async forgotPassword(email: string) {
        try {
            const user = await this.users.findByEmail(email);

            // Always return success to prevent email enumeration (in production)
            if (!user) {
                return { ok: true, message: 'If the email exists, a password reset link has been sent' };
            }

            const resetToken = this.signResetToken({ sub: user._id.toString(), purpose: 'reset' });

            try {
                await this.mail.sendPasswordResetEmail(user.email, resetToken);
                return { ok: true, message: 'Password reset link sent successfully', emailSent: true };
            } catch (emailError) {
                // Log the actual error but return generic message for security
                this.logger.error(`Failed to send reset email: ${emailError.message}`, emailError.stack, 'AuthService');

                // In development, return error details; in production, hide for security
                if (process.env.NODE_ENV === 'development') {
                    return {
                        ok: false,
                        message: 'Failed to send password reset email',
                        emailSent: false,
                        error: emailError.message
                    };
                }
                return { ok: true, message: 'If the email exists, a password reset link has been sent' };
            }
        } catch (error) {
            this.logger.error(`Forgot password failed: ${error.message}`, error.stack, 'AuthService');

            // In development, return error; in production, hide for security
            if (process.env.NODE_ENV === 'development') {
                return { ok: false, message: 'Failed to process password reset', error: error.message };
            }
            return { ok: true, message: 'If the email exists, a password reset link has been sent' };
        }
    }

    /**
     * Resets user password using reset token
     * @param token - Password reset JWT token
     * @param newPassword - New password to set
     * @returns Success confirmation
     * @throws BadRequestException if token purpose is invalid
     * @throws NotFoundException if user not found
     * @throws UnauthorizedException if token expired or malformed
     * @throws InternalServerErrorException on system errors
     */
    async resetPassword(token: string, newPassword: string) {
        try {
            const decoded: any = jwt.verify(token, this.getEnv('JWT_RESET_SECRET'));

            if (decoded.purpose !== 'reset') {
                throw new BadRequestException('Invalid reset token');
            }

            const user = await this.users.findById(decoded.sub);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Hash new password
            let hashedPassword: string;
            try {
                hashedPassword = await hashPassword(newPassword);
            } catch (error) {
                this.logger.error(`Password hashing failed: ${error.message}`, error.stack, 'AuthService');
                throw new InternalServerErrorException('Password reset failed');
            }

            user.password = hashedPassword;
            user.passwordChangedAt = new Date();
            await user.save();

            return { ok: true, message: 'Password reset successfully' };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            }

            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Reset token has expired');
            }

            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid reset token');
            }

            this.logger.error(`Password reset failed: ${error.message}`, error.stack, 'AuthService');
            throw new InternalServerErrorException('Password reset failed');
        }
    }

    //#endregion

    //#region Account Management

    /**
     * Permanently deletes a user account
     * @param userId - ID of user account to delete
     * @returns Success confirmation
     * @throws NotFoundException if user not found
     * @throws InternalServerErrorException on deletion errors
     */
    async deleteAccount(userId: string) {
        try {
            const user = await this.users.deleteById(userId);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return { ok: true, message: 'Account deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Account deletion failed: ${error.message}`, error.stack, 'AuthService');
            throw new InternalServerErrorException('Account deletion failed');
        }
    }

    //#endregion
}
