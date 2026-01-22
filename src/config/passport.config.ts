import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as AzureStrategy } from 'passport-azure-ad-oauth2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import bcrypt from 'bcryptjs';
import { decode as jwtDecode } from 'jsonwebtoken';
import { User } from '../models/user.model';
import 'dotenv/config';

const MAX_FAILED = parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS || '', 10) || 3;
const LOCK_TIME_MIN = parseInt(process.env.ACCOUNT_LOCK_TIME_MINUTES || '', 10) || 15;
const LOCK_TIME_MS = LOCK_TIME_MIN * 60 * 1000;

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', passReqToCallback: true },
    async (req: any, email: string, password: string, done: any) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'Incorrect email.' });

        if (user.lockUntil && user.lockUntil > Date.now()) {
          return done(null, false, { message: `Account locked until ${new Date(user.lockUntil).toLocaleString()}.` });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          user.failedLoginAttempts += 1;
          if (user.failedLoginAttempts >= MAX_FAILED) user.lockUntil = Date.now() + LOCK_TIME_MS;
          await user.save();
          return done(null, false, { message: 'Incorrect password.' });
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new AzureStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL,
    },
    async (_at: any, _rt: any, params: any, _profile: any, done: any) => {
      try {
        const decoded: any = jwtDecode(params.id_token);
        const microsoftId = decoded.oid;
        const email = decoded.preferred_username;
        const name = decoded.name;
        let user = await User.findOne({ $or: [{ microsoftId }, { email }] });
        if (!user) {
          user = new User({ email, name, microsoftId, roles: [], status: 'active' });
          await user.save();
        } else {
          let changed = false;
          if (!user.microsoftId) { user.microsoftId = microsoftId; changed = true; }
          if (changed) await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  'azure_ad_oauth2_client',
  new AzureStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID_CLIENT || process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET_CLIENT || process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL_CLIENT,
    },
    async (_at: any, _rt: any, params: any, _profile: any, done: any) => {
      try {
        const decoded: any = jwtDecode(params.id_token);
        const microsoftId = decoded.oid;
        const email = decoded.preferred_username;
        const name = decoded.name;

        let client = await User.findOne({ $or: [{ microsoftId }, { email }] });
        if (!client) {
          client = new User({ email, name, microsoftId, roles: [] });
          await client.save();
        } else if (!client.microsoftId) {
          client.microsoftId = microsoftId;
          await client.save();
        }
        return done(null, client);
      } catch (err) {
        return done(err);
      }
    }
  )
);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL_USER) {
  passport.use(
    'google-user',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL_USER
      },
      async (_at: any, _rt: any, profile: any, done: any) => {
        try {
          const email = profile.emails && profile.emails[0]?.value;
          if (!email) return done(null, false);

          let user = await User.findOne({ email });
          if (!user) {
            user = new User({
              email,
              name: profile.displayName,
              googleId: profile.id,
              roles: [],
              status: 'active'
            });
            await user.save();
          } else {
            let changed = false;
            if (!user.googleId) { user.googleId = profile.id; changed = true; }
            if (changed) await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL_CLIENT) {
  passport.use(
    'google-client',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL_CLIENT
      },
      async (_at: any, _rt: any, profile: any, done: any) => {
        try {
          const email = profile.emails && profile.emails[0]?.value;
          if (!email) return done(null, false);

          let client = await User.findOne({ email });
          if (!client) {
            client = new User({
              email,
              name: profile.displayName,
              googleId: profile.id,
              roles: []
            });
            await client.save();
          } else if (!client.googleId) {
            client.googleId = profile.id;
            await client.save();
          }
          return done(null, client);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

if (process.env.FB_CLIENT_ID && process.env.FB_CLIENT_SECRET && process.env.FB_CALLBACK_URL_USER) {
  passport.use(
    'facebook-user',
    new FacebookStrategy(
      {
        clientID: process.env.FB_CLIENT_ID,
        clientSecret: process.env.FB_CLIENT_SECRET,
        callbackURL: process.env.FB_CALLBACK_URL_USER,
        profileFields: ['id', 'displayName', 'emails']
      },
      async (_at: any, _rt: any, profile: any, done: any) => {
        try {
          const email = profile.emails && profile.emails[0]?.value;
          if (!email) return done(null, false);

          let user = await User.findOne({ email });
          if (!user) {
            user = new User({
              email,
              name: profile.displayName,
              facebookId: profile.id,
              roles: [],
              status: 'active'
            });
            await user.save();
          } else {
            let changed = false;
            if (!user.facebookId) { user.facebookId = profile.id; changed = true; }
            if (changed) await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

if (process.env.FB_CLIENT_ID && process.env.FB_CLIENT_SECRET && process.env.FB_CALLBACK_URL_CLIENT) {
  passport.use(
    'facebook-client',
    new FacebookStrategy(
      {
        clientID: process.env.FB_CLIENT_ID,
        clientSecret: process.env.FB_CLIENT_SECRET,
        callbackURL: process.env.FB_CALLBACK_URL_CLIENT,
        profileFields: ['id', 'displayName', 'emails']
      },
      async (_at: any, _rt: any, profile: any, done: any) => {
        try {
          const email = profile.emails && profile.emails[0]?.value;
          if (!email) return done(null, false);

          let client = await User.findOne({ email });
          if (!client) {
            client = new User({
              email,
              name: profile.displayName,
              facebookId: profile.id,
              roles: []
            });
            await client.save();
          } else if (!client.facebookId) {
            client.facebookId = profile.id;
            await client.save();
          }
          return done(null, client);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

passport.serializeUser((principal: any, done: any) => done(null, principal.id));
passport.deserializeUser(async (id: string, done: any) => {
  try {
    let principal = await User.findById(id);
    if (!principal) principal = await User.findById(id);
    done(null, principal);
  } catch (err) {
    done(err);
  }
});

export default passport;
