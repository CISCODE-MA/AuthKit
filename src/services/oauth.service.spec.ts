import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OAuthService } from './oauth.service';
import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';
import { GoogleOAuthProvider } from './oauth/providers/google-oauth.provider';
import { MicrosoftOAuthProvider } from './oauth/providers/microsoft-oauth.provider';
import { FacebookOAuthProvider } from './oauth/providers/facebook-oauth.provider';

jest.mock('./oauth/providers/google-oauth.provider');
jest.mock('./oauth/providers/microsoft-oauth.provider');
jest.mock('./oauth/providers/facebook-oauth.provider');

describe('OAuthService', () => {
  let service: OAuthService;
  let mockUserRepository: any;
  let mockRoleRepository: any;
  let mockAuthService: any;
  let mockLogger: any;
  let mockGoogleProvider: jest.Mocked<GoogleOAuthProvider>;
  let mockMicrosoftProvider: jest.Mocked<MicrosoftOAuthProvider>;
  let mockFacebookProvider: jest.Mocked<FacebookOAuthProvider>;

  const defaultRoleId = new Types.ObjectId();

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    mockRoleRepository = {
      findByName: jest.fn().mockResolvedValue({
        _id: defaultRoleId,
        name: 'user',
      }),
    };

    mockAuthService = {
      issueTokensForUser: jest.fn().mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      }),
    };

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: AuthService, useValue: mockAuthService },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);

    // Get mocked providers
    mockGoogleProvider = (service as any).googleProvider;
    mockMicrosoftProvider = (service as any).microsoftProvider;
    mockFacebookProvider = (service as any).facebookProvider;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loginWithGoogleIdToken', () => {
    it('should authenticate existing user with Google', async () => {
      const profile = {
        email: 'user@example.com',
        name: 'John Doe',
        providerId: 'google-123',
      };
      const existingUser = {
        _id: new Types.ObjectId(),
        email: 'user@example.com',
      };

      mockGoogleProvider.verifyAndExtractProfile = jest.fn().mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      const result = await service.loginWithGoogleIdToken('google-id-token');

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });

      expect(mockGoogleProvider.verifyAndExtractProfile).toHaveBeenCalledWith(
        'google-id-token',
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockAuthService.issueTokensForUser).toHaveBeenCalledWith(
        existingUser._id.toString(),
      );
    });

    it('should create new user if not found', async () => {
      const profile = {
        email: 'newuser@example.com',
        name: 'Jane Doe',
      };
      const newUser = {
        _id: new Types.ObjectId(),
        email: 'newuser@example.com',
      };

      mockGoogleProvider.verifyAndExtractProfile = jest.fn().mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(newUser);

      const result = await service.loginWithGoogleIdToken('google-id-token');

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'newuser@example.com',
          fullname: { fname: 'Jane', lname: 'Doe' },
          username: 'newuser',
          roles: [defaultRoleId],
          isVerified: true,
        }),
      );
    });
  });

  describe('loginWithGoogleCode', () => {
    it('should exchange code and authenticate user', async () => {
      const profile = {
        email: 'user@example.com',
        name: 'John Doe',
      };
      const user = { _id: new Types.ObjectId(), email: 'user@example.com' };

      mockGoogleProvider.exchangeCodeForProfile = jest.fn().mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.loginWithGoogleCode('auth-code-123');

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });

      expect(mockGoogleProvider.exchangeCodeForProfile).toHaveBeenCalledWith(
        'auth-code-123',
      );
    });
  });

  describe('loginWithMicrosoft', () => {
    it('should authenticate user with Microsoft', async () => {
      const profile = {
        email: 'user@company.com',
        name: 'John Smith',
      };
      const user = { _id: new Types.ObjectId(), email: 'user@company.com' };

      mockMicrosoftProvider.verifyAndExtractProfile = jest.fn().mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.loginWithMicrosoft('ms-id-token');

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });

      expect(mockMicrosoftProvider.verifyAndExtractProfile).toHaveBeenCalledWith(
        'ms-id-token',
      );
    });
  });

  describe('loginWithFacebook', () => {
    it('should authenticate user with Facebook', async () => {
      const profile = {
        email: 'user@facebook.com',
        name: 'Jane Doe',
      };
      const user = { _id: new Types.ObjectId(), email: 'user@facebook.com' };

      mockFacebookProvider.verifyAndExtractProfile = jest.fn().mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.loginWithFacebook('fb-access-token');

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });

      expect(mockFacebookProvider.verifyAndExtractProfile).toHaveBeenCalledWith(
        'fb-access-token',
      );
    });
  });

  describe('findOrCreateOAuthUser (public)', () => {
    it('should find or create user from email and name', async () => {
      const user = { _id: new Types.ObjectId(), email: 'user@test.com' };
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.findOrCreateOAuthUser('user@test.com', 'Test User');

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });
    });
  });

  describe('User creation edge cases', () => {
    it('should handle single name (no space)', async () => {
      const profile = { email: 'user@test.com', name: 'John' };
      const newUser = { _id: new Types.ObjectId(), email: 'user@test.com' };

      mockGoogleProvider.verifyAndExtractProfile = jest.fn().mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(newUser);

      await service.loginWithGoogleIdToken('token');

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullname: { fname: 'John', lname: 'OAuth' },
        }),
      );
    });

    it('should handle missing name', async () => {
      const profile = { email: 'user@test.com' };
      const newUser = { _id: new Types.ObjectId(), email: 'user@test.com' };

      mockGoogleProvider.verifyAndExtractProfile = jest.fn().mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(newUser);

      await service.loginWithGoogleIdToken('token');

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullname: { fname: 'User', lname: 'OAuth' },
        }),
      );
    });

    it('should handle duplicate key error (race condition)', async () => {
      const profile = { email: 'user@test.com', name: 'User' };
      const existingUser = { _id: new Types.ObjectId(), email: 'user@test.com' };

      mockGoogleProvider.verifyAndExtractProfile = jest.fn().mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValueOnce(null); // First check: not found

      const duplicateError: any = new Error('Duplicate key');
      duplicateError.code = 11000;
      mockUserRepository.create.mockRejectedValue(duplicateError);
      
      // Retry finds the user
      mockUserRepository.findByEmail.mockResolvedValueOnce(existingUser);

      const result = await service.loginWithGoogleIdToken('token');

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(2);
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      const profile = { email: 'user@test.com' };

      mockGoogleProvider.verifyAndExtractProfile = jest.fn().mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.loginWithGoogleIdToken('token')).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('OAuth user creation/login failed'),
        expect.any(String),
        'OAuthService',
      );
    });

    it('should throw InternalServerErrorException if default role not found', async () => {
      const profile = { email: 'user@test.com', name: 'User' };

      mockGoogleProvider.verifyAndExtractProfile = jest.fn().mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByName.mockResolvedValue(null); // No default role

      await expect(service.loginWithGoogleIdToken('token')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
