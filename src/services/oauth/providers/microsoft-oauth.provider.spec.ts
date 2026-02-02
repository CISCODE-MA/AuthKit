import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { MicrosoftOAuthProvider } from './microsoft-oauth.provider';
import { LoggerService } from '@services/logger.service';

jest.mock('jsonwebtoken');
jest.mock('jwks-rsa', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getSigningKey: jest.fn(),
  })),
}));

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('MicrosoftOAuthProvider', () => {
  let provider: MicrosoftOAuthProvider;
  let mockLogger: any;

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
    provider = new MicrosoftOAuthProvider(logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyAndExtractProfile', () => {
    it('should verify token and extract profile with preferred_username', async () => {
      const payload = {
        preferred_username: 'user@company.com',
        name: 'John Doe',
        oid: 'ms-object-id-123',
      };

      mockedJwt.verify.mockImplementation((token, getKey, options, callback: any) => {
        callback(null, payload);
        return undefined as any;
      });

      const result = await provider.verifyAndExtractProfile('ms-id-token');

      expect(result).toEqual({
        email: 'user@company.com',
        name: 'John Doe',
        providerId: 'ms-object-id-123',
      });
    });

    it('should extract profile with email field if preferred_username missing', async () => {
      const payload = {
        email: 'user@outlook.com',
        name: 'Jane Smith',
        sub: 'ms-subject-456',
      };

      mockedJwt.verify.mockImplementation((token, getKey, options, callback: any) => {
        callback(null, payload);
        return undefined as any;
      });

      const result = await provider.verifyAndExtractProfile('ms-id-token');

      expect(result).toEqual({
        email: 'user@outlook.com',
        name: 'Jane Smith',
        providerId: 'ms-subject-456',
      });
    });

    it('should throw BadRequestException if email is missing', async () => {
      const payload = {
        name: 'John Doe',
        oid: 'ms-object-id',
      };

      mockedJwt.verify.mockImplementation((token, getKey, options, callback: any) => {
        callback(null, payload);
        return undefined as any;
      });

      await expect(
        provider.verifyAndExtractProfile('token-without-email'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        provider.verifyAndExtractProfile('token-without-email'),
      ).rejects.toThrow('Email not provided by Microsoft');
    });

    it('should handle token verification errors', async () => {
      mockedJwt.verify.mockImplementation((token, getKey, options, callback: any) => {
        callback(new Error('Invalid signature'), null);
        return undefined as any;
      });

      await expect(provider.verifyAndExtractProfile('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );

      await expect(provider.verifyAndExtractProfile('invalid-token')).rejects.toThrow(
        'Microsoft authentication failed',
      );
    });

    it('should log verification errors', async () => {
      const verificationError = new Error('Token expired');

      mockedJwt.verify.mockImplementation((token, getKey, options, callback: any) => {
        callback(verificationError, null);
        return undefined as any;
      });

      try {
        await provider.verifyAndExtractProfile('expired-token');
      } catch (e) {
        // Expected
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Microsoft token verification failed'),
        expect.any(String),
        'MicrosoftOAuthProvider',
      );
    });

    it('should use oid or sub as providerId', async () => {
      const payloadWithOid = {
        email: 'user@test.com',
        name: 'User',
        oid: 'object-id-123',
        sub: 'subject-456',
      };

      mockedJwt.verify.mockImplementation((token, getKey, options, callback: any) => {
        callback(null, payloadWithOid);
        return undefined as any;
      });

      const result = await provider.verifyAndExtractProfile('token');

      expect(result.providerId).toBe('object-id-123'); // oid has priority
    });
  });
});
