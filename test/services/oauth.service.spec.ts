<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OAuthService } from '@services/oauth.service';
import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { AuthService } from '@services/auth.service';
import { LoggerService } from '@services/logger.service';
import { GoogleOAuthProvider } from '@services/oauth/providers/google-oauth.provider';
import { MicrosoftOAuthProvider } from '@services/oauth/providers/microsoft-oauth.provider';
import { FacebookOAuthProvider } from '@services/oauth/providers/facebook-oauth.provider';

jest.mock('@services/oauth/providers/google-oauth.provider');
jest.mock('@services/oauth/providers/microsoft-oauth.provider');
jest.mock('@services/oauth/providers/facebook-oauth.provider');

describe('OAuthService', () => {
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { Types } from "mongoose";
import { OAuthService } from "@services/oauth.service";
import { UserRepository } from "@repos/user.repository";
import { RoleRepository } from "@repos/role.repository";
import { AuthService } from "@services/auth.service";
import { LoggerService } from "@services/logger.service";
import type { GoogleOAuthProvider } from "@services/oauth/providers/google-oauth.provider";
import type { MicrosoftOAuthProvider } from "@services/oauth/providers/microsoft-oauth.provider";
import type { FacebookOAuthProvider } from "@services/oauth/providers/facebook-oauth.provider";

jest.mock("@services/oauth/providers/google-oauth.provider");
jest.mock("@services/oauth/providers/microsoft-oauth.provider");
jest.mock("@services/oauth/providers/facebook-oauth.provider");

describe("OAuthService", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
<<<<<<< HEAD
        name: 'user',
=======
        name: "user",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      }),
    };

    mockAuthService = {
      issueTokensForUser: jest.fn().mockResolvedValue({
<<<<<<< HEAD
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
=======
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
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
=======
  describe("loginWithGoogleIdToken", () => {
    it("should authenticate existing user with Google", async () => {
      const profile = {
        email: "user@example.com",
        name: "John Doe",
        providerId: "google-123",
      };
      const existingUser = {
        _id: new Types.ObjectId(),
        email: "user@example.com",
      };

      mockGoogleProvider.verifyAndExtractProfile = jest
        .fn()
        .mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      const result = await service.loginWithGoogleIdToken("google-id-token");

      expect(result).toEqual({
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
      });

      expect(mockGoogleProvider.verifyAndExtractProfile).toHaveBeenCalledWith(
        "google-id-token",
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "user@example.com",
      );
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(mockAuthService.issueTokensForUser).toHaveBeenCalledWith(
        existingUser._id.toString(),
      );
    });

<<<<<<< HEAD
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
=======
    it("should create new user if not found", async () => {
      const profile = {
        email: "newuser@example.com",
        name: "Jane Doe",
      };
      const newUser = {
        _id: new Types.ObjectId(),
        email: "newuser@example.com",
      };

      mockGoogleProvider.verifyAndExtractProfile = jest
        .fn()
        .mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(newUser);

      const result = await service.loginWithGoogleIdToken("google-id-token");

      expect(result).toEqual({
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
<<<<<<< HEAD
          email: 'newuser@example.com',
          fullname: { fname: 'Jane', lname: 'Doe' },
          username: 'newuser',
=======
          email: "newuser@example.com",
          fullname: { fname: "Jane", lname: "Doe" },
          username: "newuser",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
          roles: [defaultRoleId],
          isVerified: true,
        }),
      );
    });
  });

<<<<<<< HEAD
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
=======
  describe("loginWithGoogleCode", () => {
    it("should exchange code and authenticate user", async () => {
      const profile = {
        email: "user@example.com",
        name: "John Doe",
      };
      const user = { _id: new Types.ObjectId(), email: "user@example.com" };

      mockGoogleProvider.exchangeCodeForProfile = jest
        .fn()
        .mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.loginWithGoogleCode("auth-code-123");

      expect(result).toEqual({
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
      });

      expect(mockGoogleProvider.exchangeCodeForProfile).toHaveBeenCalledWith(
        "auth-code-123",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });

<<<<<<< HEAD
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
=======
  describe("loginWithMicrosoft", () => {
    it("should authenticate user with Microsoft", async () => {
      const profile = {
        email: "user@company.com",
        name: "John Smith",
      };
      const user = { _id: new Types.ObjectId(), email: "user@company.com" };

      mockMicrosoftProvider.verifyAndExtractProfile = jest
        .fn()
        .mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.loginWithMicrosoft("ms-id-token");

      expect(result).toEqual({
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
      });

      expect(
        mockMicrosoftProvider.verifyAndExtractProfile,
      ).toHaveBeenCalledWith("ms-id-token");
    });
  });

  describe("loginWithFacebook", () => {
    it("should authenticate user with Facebook", async () => {
      const profile = {
        email: "user@facebook.com",
        name: "Jane Doe",
      };
      const user = { _id: new Types.ObjectId(), email: "user@facebook.com" };

      mockFacebookProvider.verifyAndExtractProfile = jest
        .fn()
        .mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.loginWithFacebook("fb-access-token");

      expect(result).toEqual({
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
      });

      expect(mockFacebookProvider.verifyAndExtractProfile).toHaveBeenCalledWith(
        "fb-access-token",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });

<<<<<<< HEAD
  describe('findOrCreateOAuthUser (public)', () => {
    it('should find or create user from email and name', async () => {
      const user = { _id: new Types.ObjectId(), email: 'user@test.com' };
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.findOrCreateOAuthUser('user@test.com', 'Test User');

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
=======
  describe("findOrCreateOAuthUser (public)", () => {
    it("should find or create user from email and name", async () => {
      const user = { _id: new Types.ObjectId(), email: "user@test.com" };
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.findOrCreateOAuthUser(
        "user@test.com",
        "Test User",
      );

      expect(result).toEqual({
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });
    });
  });

<<<<<<< HEAD
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
=======
  describe("User creation edge cases", () => {
    it("should handle single name (no space)", async () => {
      const profile = { email: "user@test.com", name: "John" };
      const newUser = { _id: new Types.ObjectId(), email: "user@test.com" };

      mockGoogleProvider.verifyAndExtractProfile = jest
        .fn()
        .mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(newUser);

      await service.loginWithGoogleIdToken("token");

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullname: { fname: "John", lname: "OAuth" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        }),
      );
    });

<<<<<<< HEAD
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
=======
    it("should handle missing name", async () => {
      const profile = { email: "user@test.com" };
      const newUser = { _id: new Types.ObjectId(), email: "user@test.com" };

      mockGoogleProvider.verifyAndExtractProfile = jest
        .fn()
        .mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(newUser);

      await service.loginWithGoogleIdToken("token");

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullname: { fname: "User", lname: "OAuth" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        }),
      );
    });

<<<<<<< HEAD
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
=======
    it("should handle duplicate key error (race condition)", async () => {
      const profile = { email: "user@test.com", name: "User" };
      const existingUser = {
        _id: new Types.ObjectId(),
        email: "user@test.com",
      };

      mockGoogleProvider.verifyAndExtractProfile = jest
        .fn()
        .mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValueOnce(null); // First check: not found

      const duplicateError: any = new Error("Duplicate key");
      duplicateError.code = 11000;
      mockUserRepository.create.mockRejectedValue(duplicateError);

      // Retry finds the user
      mockUserRepository.findByEmail.mockResolvedValueOnce(existingUser);

      const result = await service.loginWithGoogleIdToken("token");

      expect(result).toEqual({
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(2);
    });

<<<<<<< HEAD
    it('should throw InternalServerErrorException on unexpected errors', async () => {
      const profile = { email: 'user@test.com' };

      mockGoogleProvider.verifyAndExtractProfile = jest.fn().mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.loginWithGoogleIdToken('token')).rejects.toThrow(
=======
    it("should throw InternalServerErrorException on unexpected errors", async () => {
      const profile = { email: "user@test.com" };

      mockGoogleProvider.verifyAndExtractProfile = jest
        .fn()
        .mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockRejectedValue(new Error("Database error"));

      await expect(service.loginWithGoogleIdToken("token")).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
<<<<<<< HEAD
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
=======
        expect.stringContaining("OAuth user creation/login failed"),
        expect.any(String),
        "OAuthService",
      );
    });

    it("should throw InternalServerErrorException if default role not found", async () => {
      const profile = { email: "user@test.com", name: "User" };

      mockGoogleProvider.verifyAndExtractProfile = jest
        .fn()
        .mockResolvedValue(profile);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByName.mockResolvedValue(null); // No default role

      await expect(service.loginWithGoogleIdToken("token")).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        InternalServerErrorException,
      );
    });
  });
});
<<<<<<< HEAD


=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
