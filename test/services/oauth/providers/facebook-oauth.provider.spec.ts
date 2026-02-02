import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FacebookOAuthProvider } from '@services/oauth/providers/facebook-oauth.provider';
import { LoggerService } from '@services/logger.service';
import { OAuthHttpClient } from '@services/oauth/utils/oauth-http.client';

jest.mock('@services/oauth/utils/oauth-http.client');

describe('FacebookOAuthProvider', () => {
  let provider: FacebookOAuthProvider;
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
    provider = new FacebookOAuthProvider(logger);

    mockHttpClient = (provider as any).httpClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyAndExtractProfile', () => {
    it('should verify token and extract profile', async () => {
      const appTokenData = { access_token: 'app-token-123' };
      const debugData = { data: { is_valid: true } };
      const profileData = {
        id: 'fb-user-id-123',
        name: 'John Doe',
        email: 'user@example.com',
      };

      mockHttpClient.get = jest
        .fn()
        .mockResolvedValueOnce(appTokenData) // App token
        .mockResolvedValueOnce(debugData) // Debug token
        .mockResolvedValueOnce(profileData); // User profile

      const result = await provider.verifyAndExtractProfile('user-access-token');

      expect(result).toEqual({
        email: 'user@example.com',
        name: 'John Doe',
        providerId: 'fb-user-id-123',
      });

      // Verify app token request
      expect(mockHttpClient.get).toHaveBeenNthCalledWith(
        1,
        'https://graph.facebook.com/oauth/access_token',
        expect.objectContaining({
          params: expect.objectContaining({
            grant_type: 'client_credentials',
          }),
        }),
      );

      // Verify debug token request
      expect(mockHttpClient.get).toHaveBeenNthCalledWith(
        2,
        'https://graph.facebook.com/debug_token',
        expect.objectContaining({
          params: {
            input_token: 'user-access-token',
            access_token: 'app-token-123',
          },
        }),
      );

      // Verify profile request
      expect(mockHttpClient.get).toHaveBeenNthCalledWith(
        3,
        'https://graph.facebook.com/me',
        expect.objectContaining({
          params: {
            access_token: 'user-access-token',
            fields: 'id,name,email',
          },
        }),
      );
    });

    it('should throw InternalServerErrorException if app token missing', async () => {
      mockHttpClient.get = jest.fn().mockResolvedValue({});

      await expect(
        provider.verifyAndExtractProfile('user-token'),
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        provider.verifyAndExtractProfile('user-token'),
      ).rejects.toThrow('Failed to get Facebook app token');
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      mockHttpClient.get = jest
        .fn()
        .mockResolvedValueOnce({ access_token: 'app-token' })
        .mockResolvedValueOnce({ data: { is_valid: false } });

      await expect(
        provider.verifyAndExtractProfile('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if email is missing', async () => {
      mockHttpClient.get = jest
        .fn()
        .mockResolvedValueOnce({ access_token: 'app-token' })
        .mockResolvedValueOnce({ data: { is_valid: true } })
        .mockResolvedValueOnce({ id: '123', name: 'User' }); // No email

      const error = provider.verifyAndExtractProfile('token-without-email');
      
      await expect(error).rejects.toThrow(BadRequestException);
      await expect(error).rejects.toThrow('Email not provided by Facebook');
    });

    it('should handle API errors', async () => {
      mockHttpClient.get = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(provider.verifyAndExtractProfile('token')).rejects.toThrow(
        UnauthorizedException,
      );

      await expect(provider.verifyAndExtractProfile('token')).rejects.toThrow(
        'Facebook authentication failed',
      );
    });
  });
});





