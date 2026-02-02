import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { GoogleOAuthProvider } from '@services/oauth/providers/google-oauth.provider';
import { LoggerService } from '@services/logger.service';
import { OAuthHttpClient } from '@services/oauth/utils/oauth-http.client';

jest.mock('@services/oauth/utils/oauth-http.client');

describe('GoogleOAuthProvider', () => {
  let provider: GoogleOAuthProvider;
  let mockLogger: any;
  let mockHttpClient: jest.Mocked<OAuthHttpClient>;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: LoggerService, useValue: mockLogger }],
    }).compile();

    const logger = module.get<LoggerService>(LoggerService);
    provider = new GoogleOAuthProvider(logger);

    // Mock the http client
    mockHttpClient = (provider as any).httpClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyAndExtractProfile', () => {
    it('should verify ID token and extract profile', async () => {
      const tokenData = {
        email: 'user@example.com',
        name: 'John Doe',
        sub: 'google-id-123',
      };

      mockHttpClient.get = jest.fn().mockResolvedValue(tokenData);

      const result = await provider.verifyAndExtractProfile('valid-id-token');

      expect(result).toEqual({
        email: 'user@example.com',
        name: 'John Doe',
        providerId: 'google-id-123',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/tokeninfo',
        { params: { id_token: 'valid-id-token' } },
      );
    });

    it('should handle missing name', async () => {
      mockHttpClient.get = jest.fn().mockResolvedValue({
        email: 'user@example.com',
        sub: 'google-id-123',
      });

      const result = await provider.verifyAndExtractProfile('valid-id-token');

      expect(result.email).toBe('user@example.com');
      expect(result.name).toBeUndefined();
    });

    it('should throw BadRequestException if email is missing', async () => {
      mockHttpClient.get = jest.fn().mockResolvedValue({
        name: 'John Doe',
        sub: 'google-id-123',
      });

      await expect(
        provider.verifyAndExtractProfile('invalid-token'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        provider.verifyAndExtractProfile('invalid-token'),
      ).rejects.toThrow('Email not provided by Google');
    });

    it('should handle Google API errors', async () => {
      mockHttpClient.get = jest.fn().mockRejectedValue(new Error('Invalid token'));

      await expect(
        provider.verifyAndExtractProfile('bad-token'),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        provider.verifyAndExtractProfile('bad-token'),
      ).rejects.toThrow('Google authentication failed');
    });
  });

  describe('exchangeCodeForProfile', () => {
    it('should exchange code and get profile', async () => {
      const tokenData = { access_token: 'access-token-123' };
      const profileData = {
        email: 'user@example.com',
        name: 'Jane Doe',
        id: 'google-profile-456',
      };

      mockHttpClient.post = jest.fn().mockResolvedValue(tokenData);
      mockHttpClient.get = jest.fn().mockResolvedValue(profileData);

      const result = await provider.exchangeCodeForProfile('auth-code-123');

      expect(result).toEqual({
        email: 'user@example.com',
        name: 'Jane Doe',
        providerId: 'google-profile-456',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          code: 'auth-code-123',
          grant_type: 'authorization_code',
        }),
      );

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        expect.objectContaining({
          headers: { Authorization: 'Bearer access-token-123' },
        }),
      );
    });

    it('should throw BadRequestException if access token missing', async () => {
      mockHttpClient.post = jest.fn().mockResolvedValue({});

      await expect(provider.exchangeCodeForProfile('bad-code')).rejects.toThrow(
        BadRequestException,
      );

      await expect(provider.exchangeCodeForProfile('bad-code')).rejects.toThrow(
        'Access token not provided by Google',
      );
    });

    it('should throw BadRequestException if email missing in profile', async () => {
      mockHttpClient.post = jest.fn().mockResolvedValue({
        access_token: 'valid-token',
      });
      mockHttpClient.get = jest.fn().mockResolvedValue({
        name: 'User Name',
        id: '123',
      });

      await expect(provider.exchangeCodeForProfile('code')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle token exchange errors', async () => {
      mockHttpClient.post = jest.fn().mockRejectedValue(new Error('Invalid code'));

      await expect(provider.exchangeCodeForProfile('invalid-code')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});





