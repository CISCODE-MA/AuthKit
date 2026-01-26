import { Injectable } from '@nestjs/common';
import type { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '@repos/user.repository';
import { RegisterDto } from '@dtos/auth/register.dto';
import { LoginDto } from '@dtos/auth/login.dto';
import { MailService } from '@services/mail.service';
import { RoleRepository } from '@repos/role.repository';
import { generateUsernameFromName } from '@utils/helper';

type JwtExpiry = SignOptions['expiresIn'];

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UserRepository,
        private readonly mail: MailService,
        private readonly roles: RoleRepository,
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
        const user = await this.users.findByIdWithRolesAndPermissions(userId);
        if (!user) throw new Error('User not found.');

        const roles = (user.roles || []).map((r: any) => r._id.toString());
        const permissions = (user.roles || [])
            .flatMap((r: any) => (r.permissions || []).map((p: any) => p.name))
            .filter(Boolean);

        return { sub: user._id.toString(), roles, permissions };
    }

    private getEnv(name: string): string {
        const v = process.env[name];
        if (!v) throw new Error(`${name} is not set`);
        return v;
    }

    public async issueTokensForUser(userId: string) {
        const payload = await this.buildTokenPayload(userId);
        const accessToken = this.signAccessToken(payload);
        const refreshToken = this.signRefreshToken({ sub: userId, purpose: 'refresh' });
        return { accessToken, refreshToken };
    }


    async register(dto: RegisterDto) {
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

        const userRole = await this.roles.findByName('user');
        if (!userRole) throw new Error('Default role not seeded.');


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

        const emailToken = this.signEmailToken({ sub: user._id.toString(), purpose: 'verify' });
        await this.mail.sendVerificationEmail(user.email, emailToken);

        return { id: user._id, email: user.email };
    }

    async verifyEmail(token: string) {
        const decoded: any = jwt.verify(token, this.getEnv('JWT_EMAIL_SECRET'));
        if (decoded.purpose !== 'verify') throw new Error('Invalid token purpose.');

        const user = await this.users.findById(decoded.sub);
        if (!user) throw new Error('User not found.');
        if (user.isVerified) return { ok: true };

        user.isVerified = true;
        await user.save();
        return { ok: true };
    }

    async resendVerification(email: string) {
        const user = await this.users.findByEmail(email);
        if (!user || user.isVerified) return { ok: true };

        const emailToken = this.signEmailToken({ sub: user._id.toString(), purpose: 'verify' });
        await this.mail.sendVerificationEmail(user.email, emailToken);
        return { ok: true };
    }

    async login(dto: LoginDto) {
        const user = await this.users.findByEmailWithPassword(dto.email);
        if (!user) throw new Error('Invalid credentials.');
        if (user.isBanned) throw new Error('Account banned.');
        if (!user.isVerified) throw new Error('Email not verified.');

        const ok = await bcrypt.compare(dto.password, user.password as string);
        if (!ok) throw new Error('Invalid credentials.');

        const payload = await this.buildTokenPayload(user._id.toString());
        const accessToken = this.signAccessToken(payload);
        const refreshToken = this.signRefreshToken({ sub: user._id.toString(), purpose: 'refresh' });

        return { accessToken, refreshToken };
    }

    async refresh(refreshToken: string) {
        const decoded: any = jwt.verify(refreshToken, this.getEnv('JWT_REFRESH_SECRET'));
        if (decoded.purpose !== 'refresh') throw new Error('Invalid token purpose.');

        const user = await this.users.findById(decoded.sub);
        if (!user) throw new Error('User not found.');
        if (user.isBanned) throw new Error('Account banned.');
        if (!user.isVerified) throw new Error('Email not verified.');

        if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
            throw new Error('Token expired.');
        }

        const payload = await this.buildTokenPayload(user._id.toString());
        const accessToken = this.signAccessToken(payload);
        const newRefreshToken = this.signRefreshToken({ sub: user._id.toString(), purpose: 'refresh' });

        return { accessToken, refreshToken: newRefreshToken };
    }

    async forgotPassword(email: string) {
        const user = await this.users.findByEmail(email);
        if (!user) return { ok: true };

        const resetToken = this.signResetToken({ sub: user._id.toString(), purpose: 'reset' });
        await this.mail.sendPasswordResetEmail(user.email, resetToken);
        return { ok: true };
    }

    async resetPassword(token: string, newPassword: string) {
        const decoded: any = jwt.verify(token, this.getEnv('JWT_RESET_SECRET'));
        if (decoded.purpose !== 'reset') throw new Error('Invalid token purpose.');

        const user = await this.users.findById(decoded.sub);
        if (!user) throw new Error('User not found.');

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.passwordChangedAt = new Date();
        await user.save();

        return { ok: true };
    }

    async deleteAccount(userId: string) {
        await this.users.deleteById(userId);
        return { ok: true };
    }
}
