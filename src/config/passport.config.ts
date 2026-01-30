import passport from 'passport';
import { Strategy as AzureStrategy } from 'passport-azure-ad-oauth2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { OAuthService } from '@infrastructure/oauth.service';
import axios from 'axios';

export const registerOAuthStrategies = (
  oauth: OAuthService
) => {
  // Microsoft
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET && process.env.MICROSOFT_CALLBACK_URL) {
    passport.use(
      'azure_ad_oauth2',
      new AzureStrategy(
        {
          clientID: process.env.MICROSOFT_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
          callbackURL: process.env.MICROSOFT_CALLBACK_URL,
          resource: 'https://graph.microsoft.com',
          tenant: process.env.MICROSOFT_TENANT_ID || 'common'
        },
        async (accessToken: any, _rt: any, _params: any, _profile: any, done: any) => {
          try {
            const me = await axios.get('https://graph.microsoft.com/v1.0/me', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            const email = me.data?.mail || me.data?.userPrincipalName;
            const name = me.data?.displayName;

            if (!email) return done(null, false);

            const { accessToken: appToken, refreshToken } =
              await oauth.findOrCreateOAuthUser(email, name);

            return done(null, { accessToken: appToken, refreshToken });
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  // Google
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
    passport.use(
      'google',
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (_at: any, _rt: any, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(null, false);
            const { accessToken, refreshToken } = await oauth.findOrCreateOAuthUser(email, profile.displayName);
            return done(null, { accessToken, refreshToken });
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  // Facebook
  if (process.env.FB_CLIENT_ID && process.env.FB_CLIENT_SECRET && process.env.FB_CALLBACK_URL) {
    passport.use(
      'facebook',
      new FacebookStrategy(
        {
          clientID: process.env.FB_CLIENT_ID,
          clientSecret: process.env.FB_CLIENT_SECRET,
          callbackURL: process.env.FB_CALLBACK_URL,
          profileFields: ['id', 'displayName', 'emails'],
        },
        async (_at: any, _rt: any, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(null, false);
            const { accessToken, refreshToken } = await oauth.findOrCreateOAuthUser(email, profile.displayName);
            return done(null, { accessToken, refreshToken });
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }
};

export default passport;
