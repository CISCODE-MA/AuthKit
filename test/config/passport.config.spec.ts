<<<<<<< HEAD
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
=======
import { registerOAuthStrategies } from "@config/passport.config";
import type { OAuthService } from "@services/oauth.service";
import passport from "passport";

jest.mock("passport", () => ({
  use: jest.fn(),
}));

jest.mock("passport-azure-ad-oauth2");
jest.mock("passport-google-oauth20");
jest.mock("passport-facebook");
jest.mock("axios");

describe("PassportConfig", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
  describe('registerOAuthStrategies', () => {
    it('should be defined', () => {
      expect(registerOAuthStrategies).toBeDefined();
      expect(typeof registerOAuthStrategies).toBe('function');
    });

    it('should call without errors when no env vars are set', () => {
=======
  describe("registerOAuthStrategies", () => {
    it("should be defined", () => {
      expect(registerOAuthStrategies).toBeDefined();
      expect(typeof registerOAuthStrategies).toBe("function");
    });

    it("should call without errors when no env vars are set", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(() => registerOAuthStrategies(mockOAuthService)).not.toThrow();
      expect(passport.use).not.toHaveBeenCalled();
    });

<<<<<<< HEAD
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
=======
    it("should register Microsoft strategy when env vars are present", () => {
      process.env.MICROSOFT_CLIENT_ID = "test-client-id";
      process.env.MICROSOFT_CLIENT_SECRET = "test-secret";
      process.env.MICROSOFT_CALLBACK_URL = "http://localhost/callback";

      registerOAuthStrategies(mockOAuthService);

      expect(passport.use).toHaveBeenCalledWith(
        "azure_ad_oauth2",
        expect.anything(),
      );
    });

    it("should register Google strategy when env vars are present", () => {
      process.env.GOOGLE_CLIENT_ID = "test-google-id";
      process.env.GOOGLE_CLIENT_SECRET = "test-google-secret";
      process.env.GOOGLE_CALLBACK_URL = "http://localhost/google/callback";

      registerOAuthStrategies(mockOAuthService);

      expect(passport.use).toHaveBeenCalledWith("google", expect.anything());
    });

    it("should register Facebook strategy when env vars are present", () => {
      process.env.FB_CLIENT_ID = "test-fb-id";
      process.env.FB_CLIENT_SECRET = "test-fb-secret";
      process.env.FB_CALLBACK_URL = "http://localhost/facebook/callback";

      registerOAuthStrategies(mockOAuthService);

      expect(passport.use).toHaveBeenCalledWith("facebook", expect.anything());
    });

    it("should register multiple strategies when all env vars are present", () => {
      process.env.MICROSOFT_CLIENT_ID = "ms-id";
      process.env.MICROSOFT_CLIENT_SECRET = "ms-secret";
      process.env.MICROSOFT_CALLBACK_URL = "http://localhost/ms/callback";
      process.env.GOOGLE_CLIENT_ID = "google-id";
      process.env.GOOGLE_CLIENT_SECRET = "google-secret";
      process.env.GOOGLE_CALLBACK_URL = "http://localhost/google/callback";
      process.env.FB_CLIENT_ID = "fb-id";
      process.env.FB_CLIENT_SECRET = "fb-secret";
      process.env.FB_CALLBACK_URL = "http://localhost/fb/callback";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      registerOAuthStrategies(mockOAuthService);

      expect(passport.use).toHaveBeenCalledTimes(3);
    });
  });
});
<<<<<<< HEAD


=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
