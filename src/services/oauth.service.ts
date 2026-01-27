import { Injectable, UnauthorizedException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { AuthService } from '@services/auth.service';
import { LoggerService } from '@services/logger.service';

@Injectable()
export class OAuthService {
    private msJwks = jwksClient({
        jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
    });

    // Configure axios with timeout
    private axiosConfig = {
        timeout: 10000, // 10 seconds
    };

    constructor(
        private readonly users: UserRepository,
        private readonly roles: RoleRepository,
        private readonly auth: AuthService,
        private readonly logger: LoggerService,
    ) { }

    private async getDefaultRoleId() {
        const role = await this.roles.findByName('user');
        if (!role) {
            this.logger.error('Default user role not found - seed data missing', 'OAuthService');
            throw new InternalServerErrorException('System configuration error');
        }
        return role._id;
    }

    private verifyMicrosoftIdToken(idToken: string) {
        return new Promise<any>((resolve, reject) => {
            const getKey = (header: any, cb: (err: any, key?: string) => void) => {
                this.msJwks
                    .getSigningKey(header.kid)
                    .then((k) => cb(null, k.getPublicKey()))
                    .catch((err) => {
                        this.logger.error(`Failed to get Microsoft signing key: ${err.message}`, err.stack, 'OAuthService');
                        cb(err);
                    });
            };

            jwt.verify(
                idToken,
                getKey as any,
                { algorithms: ['RS256'], audience: process.env.MICROSOFT_CLIENT_ID },
                (err, payload) => {
                    if (err) {
                        this.logger.error(`Microsoft token verification failed: ${err.message}`, err.stack, 'OAuthService');
                        reject(new UnauthorizedException('Invalid Microsoft token'));
                    } else {
                        resolve(payload);
                    }
                }
            );
        });
    }

    async loginWithMicrosoft(idToken: string) {
        try {
            const ms: any = await this.verifyMicrosoftIdToken(idToken);
            const email = ms.preferred_username || ms.email;

            if (!email) {
                throw new BadRequestException('Email not provided by Microsoft');
            }

            return this.findOrCreateOAuthUser(email, ms.name);
        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Microsoft login failed: ${error.message}`, error.stack, 'OAuthService');
            throw new UnauthorizedException('Microsoft authentication failed');
        }
    }

    async loginWithGoogleIdToken(idToken: string) {
        try {
            const verifyResp = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
                params: { id_token: idToken },
                ...this.axiosConfig,
            });

            const email = verifyResp.data?.email;
            if (!email) {
                throw new BadRequestException('Email not provided by Google');
            }

            return this.findOrCreateOAuthUser(email, verifyResp.data?.name);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            const axiosError = error as AxiosError;
            if (axiosError.code === 'ECONNABORTED') {
                this.logger.error('Google API timeout', axiosError.stack, 'OAuthService');
                throw new InternalServerErrorException('Authentication service timeout');
            }

            this.logger.error(`Google ID token login failed: ${error.message}`, error.stack, 'OAuthService');
            throw new UnauthorizedException('Google authentication failed');
        }
    }

    async loginWithGoogleCode(code: string) {
        try {
            const tokenResp = await axios.post('https://oauth2.googleapis.com/token', {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: 'postmessage',
                grant_type: 'authorization_code',
            }, this.axiosConfig);

            const { access_token } = tokenResp.data || {};
            if (!access_token) {
                throw new BadRequestException('Failed to exchange authorization code');
            }

            const profileResp = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
                ...this.axiosConfig,
            });

            const email = profileResp.data?.email;
            if (!email) {
                throw new BadRequestException('Email not provided by Google');
            }

            return this.findOrCreateOAuthUser(email, profileResp.data?.name);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            const axiosError = error as AxiosError;
            if (axiosError.code === 'ECONNABORTED') {
                this.logger.error('Google API timeout', axiosError.stack, 'OAuthService');
                throw new InternalServerErrorException('Authentication service timeout');
            }

            this.logger.error(`Google code exchange failed: ${error.message}`, error.stack, 'OAuthService');
            throw new UnauthorizedException('Google authentication failed');
        }
    }

    async loginWithFacebook(accessToken: string) {
        try {
            const appTokenResp = await axios.get('https://graph.facebook.com/oauth/access_token', {
                params: {
                    client_id: process.env.FB_CLIENT_ID,
                    client_secret: process.env.FB_CLIENT_SECRET,
                    grant_type: 'client_credentials',
                },
                ...this.axiosConfig,
            });

            const appAccessToken = appTokenResp.data?.access_token;
            if (!appAccessToken) {
                throw new InternalServerErrorException('Failed to get Facebook app token');
            }

            const debug = await axios.get('https://graph.facebook.com/debug_token', {
                params: { input_token: accessToken, access_token: appAccessToken },
                ...this.axiosConfig,
            });

            if (!debug.data?.data?.is_valid) {
                throw new UnauthorizedException('Invalid Facebook access token');
            }

            const me = await axios.get('https://graph.facebook.com/me', {
                params: { access_token: accessToken, fields: 'id,name,email' },
                ...this.axiosConfig,
            });

            const email = me.data?.email;
            if (!email) {
                throw new BadRequestException('Email not provided by Facebook');
            }

            return this.findOrCreateOAuthUser(email, me.data?.name);
        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
                throw error;
            }

            const axiosError = error as AxiosError;
            if (axiosError.code === 'ECONNABORTED') {
                this.logger.error('Facebook API timeout', axiosError.stack, 'OAuthService');
                throw new InternalServerErrorException('Authentication service timeout');
            }

            this.logger.error(`Facebook login failed: ${error.message}`, error.stack, 'OAuthService');
            throw new UnauthorizedException('Facebook authentication failed');
        }
    }

    async findOrCreateOAuthUser(email: string, name?: string) {
        try {
            let user = await this.users.findByEmail(email);

            if (!user) {
                const [fname, ...rest] = (name || 'User OAuth').split(' ');
                const lname = rest.join(' ') || 'OAuth';

                const defaultRoleId = await this.getDefaultRoleId();

                user = await this.users.create({
                    fullname: { fname, lname },
                    username: email.split('@')[0],
                    email,
                    roles: [defaultRoleId],
                    isVerified: true,
                    isBanned: false,
                    passwordChangedAt: new Date()
                });
            }

            const { accessToken, refreshToken } = await this.auth.issueTokensForUser(user._id.toString());
            return { accessToken, refreshToken };
        } catch (error) {
            if (error?.code === 11000) {
                // Race condition - user was created between check and insert, retry once
                try {
                    const user = await this.users.findByEmail(email);
                    if (user) {
                        const { accessToken, refreshToken } = await this.auth.issueTokensForUser(user._id.toString());
                        return { accessToken, refreshToken };
                    }
                } catch (retryError) {
                    this.logger.error(`OAuth user retry failed: ${retryError.message}`, retryError.stack, 'OAuthService');
                }
            }

            this.logger.error(`OAuth user creation/login failed: ${error.message}`, error.stack, 'OAuthService');
            throw new InternalServerErrorException('Authentication failed');
        }
    }
}
