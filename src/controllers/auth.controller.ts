import { Controller, Get, Next, Post, Req, Res } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import passport from '../config/passport.config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import jwksClient from 'jwks-rsa';
import axios from 'axios';
import User from '../models/user.model';
import Client from '../models/client.model';
import Role from '../models/role.model';
import { getMillisecondsFromExpiry } from '../utils/helper';

const TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common';
const MSAL_MOBILE_CLIENT_ID = process.env.MSAL_MOBILE_CLIENT_ID;

const msJwks = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

function verifyMicrosoftIdToken(idToken: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const getKey = (header: any, cb: (err: any, key?: string) => void) => {
      msJwks
        .getSigningKey(header.kid)
        .then((k) => cb(null, k.getPublicKey()))
        .catch(cb);
    };

    jwt.verify(
      idToken,
      getKey as any,
      { algorithms: ['RS256'], audience: MSAL_MOBILE_CLIENT_ID },
      (err, payload) => (err ? reject(err) : resolve(payload))
    );
  });
}

@Controller('api/auth')
export class AuthController {
  private async issueTokensAndRespond(principal: any, res: Response) {
    const roleDocs = await Role.find({ _id: { $in: principal.roles } })
      .select('name permissions -_id')
      .lean();

    const roles = roleDocs.map((r: any) => r.name);
    const permissions = Array.from(new Set(roleDocs.flatMap((r: any) => r.permissions)));

    const accessTTL = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
    const refreshTTL = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';

    const payload = {
      id: principal._id,
      email: principal.email,
      tenantId: principal.tenantId,
      roles,
      permissions,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: accessTTL });
    const refreshToken = jwt.sign({ id: principal._id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: refreshTTL });

    principal.refreshToken = refreshToken;
    try {
      await principal.save();
    } catch (e) {
      console.error('Error saving refreshToken:', e);
    }

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: getMillisecondsFromExpiry(refreshTTL),
    });

    return res.status(200).json({ accessToken, refreshToken });
  }

  private async respondWebOrMobile(req: Request, res: Response, principal: any) {
    const roleDocs = await Role.find({ _id: { $in: principal.roles } })
      .select('name permissions -_id')
      .lean();

    const roles = roleDocs.map((r: any) => r.name);
    const permissions = Array.from(new Set(roleDocs.flatMap((r: any) => r.permissions)));

    const accessTTL = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
    const refreshTTL = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';

    const payload = {
      id: principal._id,
      email: principal.email,
      tenantId: principal.tenantId,
      roles,
      permissions,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: accessTTL });
    const refreshToken = jwt.sign({ id: principal._id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: refreshTTL });

    principal.refreshToken = refreshToken;
    try {
      await principal.save();
    } catch (e) {
      console.error('Saving refreshToken failed:', e);
    }

    let mobileRedirect: string | undefined;
    if (req.query.state) {
      try {
        const decoded = JSON.parse(Buffer.from(req.query.state as string, 'base64url').toString('utf8'));
        mobileRedirect = decoded.redirect;
      } catch (_) {
        // ignore
      }
    }

    if (mobileRedirect) {
      const url = new URL(mobileRedirect);
      url.searchParams.set('accessToken', accessToken);
      url.searchParams.set('refreshToken', refreshToken);
      return res.redirect(302, url.toString());
    }

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: getMillisecondsFromExpiry(refreshTTL),
    });

    return res.status(200).json({ accessToken, refreshToken });
  }

  @Post('clients/register')
  async registerClient(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password, name, roles = [] } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }
      if (await Client.findOne({ email })) {
        return res.status(409).json({ message: 'Email already in use.' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const client = new Client({ email, password: hashed, name, roles });
      await client.save();
      return res.status(201).json({
        id: client._id,
        email: client.email,
        name: client.name,
        roles: client.roles,
      });
    } catch (err) {
      console.error('registerClient error:', err);
      return res.status(500).json({ message: 'Server error.' });
    }
  }

  @Post('clients/login')
  async clientLogin(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }
      const client = await Client.findOne({ email })
        .select('+password')
        .populate('roles', 'name permissions');
      if (!client) {
        return res.status(400).json({ message: 'Incorrect email.' });
      }
      const match = await bcrypt.compare(password, client.password);
      if (!match) {
        return res.status(400).json({ message: 'Incorrect password.' });
      }

      return this.issueTokensAndRespond(client, res);
    } catch (err) {
      console.error('clientLogin error:', err);
      return res.status(500).json({ message: 'Server error.' });
    }
  }

  @Post('login')
  localLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    return passport.authenticate('local', { session: false }, async (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: info?.message || 'Invalid credentials.' });

      try {
        return this.issueTokensAndRespond(user, res);
      } catch (e) {
        console.error('localLogin error:', e);
        return res.status(500).json({ message: 'Server error.' });
      }
    })(req, res, next);
  }

  @Get('microsoft')
  microsoftLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const redirect = req.query.redirect as string | undefined;
    const state = redirect ? Buffer.from(JSON.stringify({ redirect }), 'utf8').toString('base64url') : undefined;

    return passport.authenticate('azure_ad_oauth2', {
      session: false,
      state,
    })(req, res, next);
  }

  @Get('microsoft/callback')
  microsoftCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('azure_ad_oauth2', { session: false }, async (err: any, user: any) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: 'Microsoft authentication failed.' });
      return this.respondWebOrMobile(req, res, user);
    })(req, res, next);
  }

  @Post('microsoft/exchange')
  async microsoftExchange(@Req() req: Request, @Res() res: Response) {
    try {
      if (!MSAL_MOBILE_CLIENT_ID) {
        console.error('MSAL_MOBILE_CLIENT_ID is not set in environment.');
        return res.status(500).json({ message: 'Server misconfiguration.' });
      }

      const { idToken } = req.body || {};
      if (!idToken) {
        return res.status(400).json({ message: 'idToken is required.' });
      }

      let ms: any;
      try {
        ms = await verifyMicrosoftIdToken(idToken);
      } catch (e: any) {
        console.error('ID token verify failed:', e.message || e);
        return res.status(401).json({ message: 'Invalid Microsoft ID token.' });
      }

      const email = ms.preferred_username || ms.email;
      const name = ms.name;
      const tid = ms.tid;

      if (TENANT_ID && TENANT_ID !== 'common' && tid && tid !== TENANT_ID) {
        return res.status(401).json({ message: 'Tenant mismatch.' });
      }
      if (!email) {
        return res.status(400).json({ message: 'Email claim missing in Microsoft ID token.' });
      }

      const microsoftId = ms.oid || ms.sub;
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          name,
          tenantId: tid || TENANT_ID,
          microsoftId,
          roles: [],
          status: 'active',
        });
        await user.save();
      } else {
        let changed = false;
        if (!user.microsoftId) { user.microsoftId = microsoftId; changed = true; }
        if (!user.tenantId) { user.tenantId = tid || TENANT_ID; changed = true; }
        if (changed) await user.save();
      }

      return this.issueTokensAndRespond(user, res);
    } catch (e) {
      console.error('microsoftExchange error:', e);
      return res.status(500).json({ message: 'Server error.' });
    }
  }

  @Get('google')
  googleUserLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const redirect = req.query.redirect as string | undefined;
    const state = redirect ? Buffer.from(JSON.stringify({ redirect }), 'utf8').toString('base64url') : undefined;
    return passport.authenticate('google-user', { session: false, scope: ['profile', 'email'], state })(req, res, next);
  }

  @Get('google/callback')
  googleUserCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('google-user', { session: false }, async (err: any, user: any) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: 'Google authentication failed.' });
      return this.respondWebOrMobile(req, res, user);
    })(req, res, next);
  }

  @Get('client/google')
  googleClientLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const redirect = req.query.redirect as string | undefined;
    const state = redirect ? Buffer.from(JSON.stringify({ redirect }), 'utf8').toString('base64url') : undefined;
    return passport.authenticate('google-client', { session: false, scope: ['profile', 'email'], state })(req, res, next);
  }

  @Get('client/google/callback')
  googleClientCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('google-client', { session: false }, async (err: any, client: any) => {
      if (err) return next(err);
      if (!client) return res.status(400).json({ message: 'Google authentication failed.' });
      return this.respondWebOrMobile(req, res, client);
    })(req, res, next);
  }

  @Post('google/exchange')
  async googleExchange(@Req() req: Request, @Res() res: Response) {
    try {
      let { code, idToken, type = 'user', tenantId } = req.body || {};
      if (!['user', 'client'].includes(type)) {
        return res.status(400).json({ message: 'invalid type; must be "user" or "client"' });
      }

      let resolvedTenantId: string | undefined;
      if (type === 'user') {
        resolvedTenantId = tenantId || process.env.DEFAULT_TENANT_ID;
        if (!resolvedTenantId) {
          return res.status(400).json({ message: 'tenantId is required for user login.' });
        }
      }

      let email: string | undefined;
      let name: string | undefined;
      let googleId: string | undefined;

      if (code) {
        const tokenResp = await axios.post('https://oauth2.googleapis.com/token', {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: 'postmessage',
          grant_type: 'authorization_code',
        });

        const { access_token } = tokenResp.data || {};
        if (!access_token) {
          return res.status(401).json({ message: 'Failed to exchange code with Google.' });
        }

        const profileResp = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        email = profileResp.data?.email;
        name = profileResp.data?.name || profileResp.data?.given_name || '';
        googleId = profileResp.data?.id;
      } else if (idToken) {
        const verifyResp = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
          params: { id_token: idToken },
        });
        email = verifyResp.data?.email;
        name = verifyResp.data?.name || '';
        googleId = verifyResp.data?.sub;
      } else {
        return res.status(400).json({ message: 'code or idToken is required' });
      }

      if (!email) return res.status(400).json({ message: 'Google profile missing email.' });

      const Model: any = type === 'user' ? User : Client;

      let principal = await Model.findOne({ $or: [{ email }, { googleId }] });
      if (!principal) {
        principal = new Model(
          type === 'user'
            ? { email, name, googleId, tenantId: resolvedTenantId, roles: [], status: 'active' }
            : { email, name, googleId, roles: [] }
        );
        await principal.save();
      } else if (!principal.googleId) {
        principal.googleId = googleId;
        if (type === 'user' && !principal.tenantId) principal.tenantId = resolvedTenantId;
        await principal.save();
      }

      const roleDocs = await Role.find({ _id: { $in: principal.roles } })
        .select('name permissions -_id').lean();
      const roles = roleDocs.map((r: any) => r.name);
      const permissions = Array.from(new Set(roleDocs.flatMap((r: any) => r.permissions)));
      const accessTTL = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
      const refreshTTL = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';

      const payload = { id: principal._id, email: principal.email, tenantId: principal.tenantId, roles, permissions };
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: accessTTL });
      const refreshToken = jwt.sign({ id: principal._id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: refreshTTL });

      principal.refreshToken = refreshToken;
      try { await principal.save(); } catch (e) { console.error('Saving refreshToken failed:', e); }

      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: getMillisecondsFromExpiry(refreshTTL),
      });

      return res.status(200).json({ accessToken, refreshToken });
    } catch (err: any) {
      console.error('googleExchange error:', err?.response?.data || err.message || err);
      return res.status(500).json({ message: 'Server error during Google exchange.' });
    }
  }

  @Get('facebook')
  facebookUserLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const redirect = req.query.redirect as string | undefined;
    const state = redirect ? Buffer.from(JSON.stringify({ redirect }), 'utf8').toString('base64url') : undefined;
    return passport.authenticate('facebook-user', { session: false, scope: ['email'], state })(req, res, next);
  }

  @Get('facebook/callback')
  facebookUserCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('facebook-user', { session: false }, async (err: any, user: any) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: 'Facebook authentication failed.' });
      return this.respondWebOrMobile(req, res, user);
    })(req, res, next);
  }

  @Get('client/facebook')
  facebookClientLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const redirect = req.query.redirect as string | undefined;
    const state = redirect ? Buffer.from(JSON.stringify({ redirect }), 'utf8').toString('base64url') : undefined;
    return passport.authenticate('facebook-client', { session: false, scope: ['email'], state })(req, res, next);
  }

  @Get('client/facebook/callback')
  facebookClientCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('facebook-client', { session: false }, async (err: any, client: any) => {
      if (err) return next(err);
      if (!client) return res.status(400).json({ message: 'Facebook authentication failed.' });
      return this.respondWebOrMobile(req, res, client);
    })(req, res, next);
  }

  @Get('client/microsoft')
  microsoftClientLogin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const redirect = req.query.redirect as string | undefined;
    const state = redirect ? Buffer.from(JSON.stringify({ redirect }), 'utf8').toString('base64url') : undefined;
    return passport.authenticate('azure_ad_oauth2_client', { session: false, state })(req, res, next);
  }

  @Get('client/microsoft/callback')
  microsoftClientCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    passport.authenticate('azure_ad_oauth2_client', { session: false }, async (err: any, client: any) => {
      if (err) return next(err);
      if (!client) return res.status(400).json({ message: 'Microsoft authentication failed.' });
      return this.respondWebOrMobile(req, res, client);
    })(req, res, next);
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = (req as any).cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token missing.' });
      }

      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
      } catch (err: any) {
        const msg = err.name === 'TokenExpiredError' ? 'Refresh token expired.' : 'Invalid refresh token.';
        return res.status(401).json({ message: msg });
      }

      let principal = await User.findById(decoded.id);
      let principalType = 'user';
      if (!principal) {
        principal = await Client.findById(decoded.id);
        principalType = 'client';
      }
      if (!principal) return res.status(401).json({ message: 'Account not found.' });

      if (principal.refreshToken !== refreshToken) {
        return res.status(401).json({ message: 'Refresh token mismatch.' });
      }

      const roleDocs = await Role.find({ _id: { $in: principal.roles } })
        .select('name permissions -_id').lean();
      const roles = roleDocs.map((r: any) => r.name);
      const permissions = Array.from(new Set(roleDocs.flatMap((r: any) => r.permissions)));

      const payload = {
        id: principal._id,
        email: principal.email,
        tenantId: principal.tenantId,
        roles,
        permissions,
      };

      const accessTokenExpiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: accessTokenExpiresIn });

      return res.status(200).json({ accessToken, type: principalType });
    } catch (error) {
      console.error('[Refresh] Unexpected error:', error);
      return res.status(500).json({ message: 'Server error during token refresh.' });
    }
  }
}
