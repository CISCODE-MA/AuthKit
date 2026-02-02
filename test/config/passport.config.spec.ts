import { registerOAuthStrategies } from '@config/passport.config';
import { OAuthService } from '@services/oauth.service';
import passport from 'passport';

jest.mock('passport', () => ({
  use: jest.fn(),
}));

jest.mock('passport-azure-ad-oauth2');
jest.mock('passport-google-oauth20');
jest.mock('passport-facebook');
jest.mock('axios');

describe('PassportConfig', () => {
  let mockOAuthService: jest.Mocked<OAuthService>;

  beforeEach(() => {
    mockOAuthService = {
      findOrCreateOAuthUser: jest.fn(),
    } as any;

    jest.clearAllMocks();
    delete process.env.MICROSOFT_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.FB_CLIENT_ID;
  });

  describe('registerOAuthStrategies', () => {
    it('should be defined', () => {
      expect(registerOAuthStrategies).toBeDefined();
      expect(typeof registerOAuthStrategies).toBe('function');
    });

    it('should call without errors when no env vars are set', () => {
      expect(() => registerOAuthStrategies(mockOAuthService)).not.toThrow();
      expect(passport.use).not.toHaveBeenCalled();
    });

    it('should register Microsoft strategy when env vars are present', () => {
      process.env.MICROSOFT_CLIENT_ID = 'test-client-id';
      process.env.MICROSOFT_CLIENT_SECRET = 'test-secret';
      process.env.MICROSOFT_CALLBACK_URL = 'http://localhost/callback';

      registerOAuthStrategies(mockOAuthService);

      expect(passport.use).toHaveBeenCalledWith('azure_ad_oauth2', expect.anything());
    });

    it('should register Google strategy when env vars are present', () => {
      process.env.GOOGLE_CLIENT_ID = 'test-google-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
      process.env.GOOGLE_CALLBACK_URL = 'http://localhost/google/callback';

      registerOAuthStrategies(mockOAuthService);

      expect(passport.use).toHaveBeenCalledWith('google', expect.anything());
    });

    it('should register Facebook strategy when env vars are present', () => {
      process.env.FB_CLIENT_ID = 'test-fb-id';
      process.env.FB_CLIENT_SECRET = 'test-fb-secret';
      process.env.FB_CALLBACK_URL = 'http://localhost/facebook/callback';

      registerOAuthStrategies(mockOAuthService);

      expect(passport.use).toHaveBeenCalledWith('facebook', expect.anything());
    });

    it('should register multiple strategies when all env vars are present', () => {
      process.env.MICROSOFT_CLIENT_ID = 'ms-id';
      process.env.MICROSOFT_CLIENT_SECRET = 'ms-secret';
      process.env.MICROSOFT_CALLBACK_URL = 'http://localhost/ms/callback';
      process.env.GOOGLE_CLIENT_ID = 'google-id';
      process.env.GOOGLE_CLIENT_SECRET = 'google-secret';
      process.env.GOOGLE_CALLBACK_URL = 'http://localhost/google/callback';
      process.env.FB_CLIENT_ID = 'fb-id';
      process.env.FB_CLIENT_SECRET = 'fb-secret';
      process.env.FB_CALLBACK_URL = 'http://localhost/fb/callback';

      registerOAuthStrategies(mockOAuthService);

      expect(passport.use).toHaveBeenCalledTimes(3);
    });
  });
});


