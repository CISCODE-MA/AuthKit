import { Injectable, ConflictException, UnauthorizedException, NotFoundException, InternalServerErrorException, ForbiddenException, BadRequestException } from '@nestjs/common';
import type { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '@repos/user.repository';
import { RegisterDto } from '@dtos/auth/register.dto';
import { LoginDto } from '@dtos/auth/login.dto';
import { MailService } from '@services/mail.service';
import { RoleRepository } from '@repos/role.repository';
import { generateUsernameFromName } from '@utils/helper';
import { LoggerService } from '@services/logger.service';

type JwtExpiry = SignOptions['expiresIn'];

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UserRepository,
        private readonly mail: MailService,
        private readonly roles: RoleRepository,
        private readonly logger: LoggerService,
    ) { }

    private resolveExpiry(value: string | undefined, fallback: JwtExpiry): JwtExpiry {
        return (value || fallback) as JwtExpiry;
    }

    private signAccessToken(payload: any) {
        const expiresIn = this.resolveExpiry(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN, '15m');
        return jwt.sign(payload, this.getEnv('JWT_SECRET'), { expiresIn });
    }

    private signRefreshToken(payload: any) {
        const expiresIn = this.resolveExpiry(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN, '7d');
        return jwt.sign(payload, this.getEnv('JWT_REFRESH_SECRET'), { expiresIn });
    }

    private signEmailToken(payload: any) {
        const expiresIn = this.resolveExpiry(process.env.JWT_EMAIL_TOKEN_EXPIRES_IN, '1d');

        return jwt.sign(payload, this.getEnv('JWT_EMAIL_SECRET'), { expiresIn });
    }

    private signResetToken(payload: any) {
        const expiresIn = this.resolveExpiry(process.env.JWT_RESET_TOKEN_EXPIRES_IN, '1h');
        return jwt.sign(payload, this.getEnv('JWT_RESET_SECRET'), { expiresIn });
    }

    private async buildTokenPayload(userId: string) {
        try {
            const user = await this.users.findByIdWithRolesAndPermissions(userId);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const roles = (user.roles || []).map((r: any) => r._id.toString());
            const permissions = (user.roles || [])
                .flatMap((r: any) => (r.permissions || []).map((p: any) => p.name))
                .filter(Boolean);

            return { sub: user._id.toString(), roles, permissions };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Failed to build token payload: ${error.message}`, error.stack, 'AuthService');
            throw new InternalServerErrorException('Failed to generate authentication token');
        }
    }

    private getEnv(name: string): string {
        const v = process.env[name];
        if (!v) {
            this.logger.error(`Environment variable ${name} is not set`, 'AuthService');
            throw new InternalServerErrorException('Server configuration error');
        }
        return v;
    }

    public async issueTokensForUser(userId: string) {
        const payload = await this.buildTokenPayload(userId);
        const accessToken = this.signAccessToken(payload);
        const refreshToken = this.signRefreshToken({ sub: userId, purpose: 'refresh' });
        return { accessToken, refreshToken };
    }


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
                const salt = await bcrypt.genSalt(10);
                hashed = await bcrypt.hash(dto.password, salt);
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
            try {
                const emailToken = this.signEmailToken({ sub: user._id.toString(), purpose: 'verify' });
                await this.mail.sendVerificationEmail(user.email, emailToken);
            } catch (error) {
                this.logger.error(`Failed to send verification email: ${error.message}`, error.stack, 'AuthService');
                // Continue - user is created, they can resend verification
            }

            return { id: user._id, email: user.email };
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

    async resendVerification(email: string) {
        try {
            const user = await this.users.findByEmail(email);

            // Return success even if user not found (prevent email enumeration)
            if (!user || user.isVerified) {
                return { ok: true, message: 'If the email exists and is unverified, a verification email has been sent' };
            }

            const emailToken = this.signEmailToken({ sub: user._id.toString(), purpose: 'verify' });
            await this.mail.sendVerificationEmail(user.email, emailToken);

            return { ok: true, message: 'Verification email sent successfully' };
        } catch (error) {
            this.logger.error(`Resend verification failed: ${error.message}`, error.stack, 'AuthService');
            // Return success to prevent email enumeration
            return { ok: true, message: 'If the email exists and is unverified, a verification email has been sent' };
        }
    }

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

            const passwordMatch = await bcrypt.compare(dto.password, user.password as string);
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

    async forgotPassword(email: string) {
        try {
            const user = await this.users.findByEmail(email);

            // Always return success to prevent email enumeration
            if (!user) {
                return { ok: true, message: 'If the email exists, a password reset link has been sent' };
            }

            const resetToken = this.signResetToken({ sub: user._id.toString(), purpose: 'reset' });
            await this.mail.sendPasswordResetEmail(user.email, resetToken);

            return { ok: true, message: 'Password reset link sent successfully' };
        } catch (error) {
            this.logger.error(`Forgot password failed: ${error.message}`, error.stack, 'AuthService');
            // Return success to prevent email enumeration
            return { ok: true, message: 'If the email exists, a password reset link has been sent' };
        }
    }

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
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(newPassword, salt);
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
}
