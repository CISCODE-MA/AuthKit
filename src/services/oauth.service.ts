import { Injectable } from '@nestjs/common';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { AuthService } from '@services/auth.service';

@Injectable()
export class OAuthService {
    private msJwks = jwksClient({
        jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
    });

    constructor(
        private readonly users: UserRepository,
        private readonly roles: RoleRepository,
        private readonly auth: AuthService
    ) { }

    private async getDefaultRoleId() {
        const role = await this.roles.findByName('user');
        if (!role) throw new Error('Default role not seeded.');
        return role._id;
    }

    private verifyMicrosoftIdToken(idToken: string) {
        return new Promise<any>((resolve, reject) => {
            const getKey = (header: any, cb: (err: any, key?: string) => void) => {
                this.msJwks
                    .getSigningKey(header.kid)
                    .then((k) => cb(null, k.getPublicKey()))
                    .catch(cb);
            };

            jwt.verify(
                idToken,
                getKey as any,
                { algorithms: ['RS256'], audience: process.env.MICROSOFT_CLIENT_ID },
                (err, payload) => (err ? reject(err) : resolve(payload))
            );
        });
    }

    async loginWithMicrosoft(idToken: string) {
        const ms: any = await this.verifyMicrosoftIdToken(idToken);
        const email = ms.preferred_username || ms.email;
        if (!email) throw new Error('Email missing');

        return this.findOrCreateOAuthUser(email, ms.name);
    }

    async loginWithGoogleIdToken(idToken: string) {
        const verifyResp = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
            params: { id_token: idToken },
        });
        const email = verifyResp.data?.email;
        if (!email) throw new Error('Email missing');

        return this.findOrCreateOAuthUser(email, verifyResp.data?.name);
    }

    async loginWithGoogleCode(code: string) {
        const tokenResp = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: 'postmessage',
            grant_type: 'authorization_code',
        });

        const { access_token } = tokenResp.data || {};
        if (!access_token) throw new Error('Failed to exchange code');

        const profileResp = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const email = profileResp.data?.email;
        if (!email) throw new Error('Email missing');

        return this.findOrCreateOAuthUser(email, profileResp.data?.name);
    }

    async loginWithFacebook(accessToken: string) {
        const appTokenResp = await axios.get('https://graph.facebook.com/oauth/access_token', {
            params: {
                client_id: process.env.FB_CLIENT_ID,
                client_secret: process.env.FB_CLIENT_SECRET,
                grant_type: 'client_credentials',
            },
        });

        const appAccessToken = appTokenResp.data?.access_token;
        const debug = await axios.get('https://graph.facebook.com/debug_token', {
            params: { input_token: accessToken, access_token: appAccessToken },
        });

        if (!debug.data?.data?.is_valid) throw new Error('Invalid Facebook token');

        const me = await axios.get('https://graph.facebook.com/me', {
            params: { access_token: accessToken, fields: 'id,name,email' },
        });

        const email = me.data?.email;
        if (!email) throw new Error('Email missing');

        return this.findOrCreateOAuthUser(email, me.data?.name);
    }

    async findOrCreateOAuthUser(email: string, name?: string) {
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
    }
}
