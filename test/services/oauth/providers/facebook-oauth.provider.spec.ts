<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
import {
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
<<<<<<< HEAD
} from '@nestjs/common';
import { FacebookOAuthProvider } from '@services/oauth/providers/facebook-oauth.provider';
import { LoggerService } from '@services/logger.service';
import { OAuthHttpClient } from '@services/oauth/utils/oauth-http.client';

jest.mock('@services/oauth/utils/oauth-http.client');

describe('FacebookOAuthProvider', () => {
=======
} from "@nestjs/common";
import { FacebookOAuthProvider } from "@services/oauth/providers/facebook-oauth.provider";
import { LoggerService } from "@services/logger.service";
import type { OAuthHttpClient } from "@services/oauth/utils/oauth-http.client";

jest.mock("@services/oauth/utils/oauth-http.client");

describe("FacebookOAuthProvider", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
  describe('verifyAndExtractProfile', () => {
    it('should verify token and extract profile', async () => {
      const appTokenData = { access_token: 'app-token-123' };
      const debugData = { data: { is_valid: true } };
      const profileData = {
        id: 'fb-user-id-123',
        name: 'John Doe',
        email: 'user@example.com',
=======
  describe("verifyAndExtractProfile", () => {
    it("should verify token and extract profile", async () => {
      const appTokenData = { access_token: "app-token-123" };
      const debugData = { data: { is_valid: true } };
      const profileData = {
        id: "fb-user-id-123",
        name: "John Doe",
        email: "user@example.com",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      mockHttpClient.get = jest
        .fn()
        .mockResolvedValueOnce(appTokenData) // App token
        .mockResolvedValueOnce(debugData) // Debug token
        .mockResolvedValueOnce(profileData); // User profile

<<<<<<< HEAD
      const result = await provider.verifyAndExtractProfile('user-access-token');

      expect(result).toEqual({
        email: 'user@example.com',
        name: 'John Doe',
        providerId: 'fb-user-id-123',
=======
      const result =
        await provider.verifyAndExtractProfile("user-access-token");

      expect(result).toEqual({
        email: "user@example.com",
        name: "John Doe",
        providerId: "fb-user-id-123",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      // Verify app token request
      expect(mockHttpClient.get).toHaveBeenNthCalledWith(
        1,
<<<<<<< HEAD
        'https://graph.facebook.com/oauth/access_token',
        expect.objectContaining({
          params: expect.objectContaining({
            grant_type: 'client_credentials',
=======
        "https://graph.facebook.com/oauth/access_token",
        expect.objectContaining({
          params: expect.objectContaining({
            grant_type: "client_credentials",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
          }),
        }),
      );

      // Verify debug token request
      expect(mockHttpClient.get).toHaveBeenNthCalledWith(
        2,
<<<<<<< HEAD
        'https://graph.facebook.com/debug_token',
        expect.objectContaining({
          params: {
            input_token: 'user-access-token',
            access_token: 'app-token-123',
=======
        "https://graph.facebook.com/debug_token",
        expect.objectContaining({
          params: {
            input_token: "user-access-token",
            access_token: "app-token-123",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
          },
        }),
      );

      // Verify profile request
      expect(mockHttpClient.get).toHaveBeenNthCalledWith(
        3,
<<<<<<< HEAD
        'https://graph.facebook.com/me',
        expect.objectContaining({
          params: {
            access_token: 'user-access-token',
            fields: 'id,name,email',
=======
        "https://graph.facebook.com/me",
        expect.objectContaining({
          params: {
            access_token: "user-access-token",
            fields: "id,name,email",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
          },
        }),
      );
    });

<<<<<<< HEAD
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
=======
    it("should throw InternalServerErrorException if app token missing", async () => {
      mockHttpClient.get = jest.fn().mockResolvedValue({});

      await expect(
        provider.verifyAndExtractProfile("user-token"),
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        provider.verifyAndExtractProfile("user-token"),
      ).rejects.toThrow("Failed to get Facebook app token");
    });

    it("should throw UnauthorizedException if token is invalid", async () => {
      mockHttpClient.get = jest
        .fn()
        .mockResolvedValueOnce({ access_token: "app-token" })
        .mockResolvedValueOnce({ data: { is_valid: false } });

      await expect(
        provider.verifyAndExtractProfile("invalid-token"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw BadRequestException if email is missing", async () => {
      mockHttpClient.get = jest
        .fn()
        .mockResolvedValueOnce({ access_token: "app-token" })
        .mockResolvedValueOnce({ data: { is_valid: true } })
        .mockResolvedValueOnce({ id: "123", name: "User" }); // No email

      const error = provider.verifyAndExtractProfile("token-without-email");

      await expect(error).rejects.toThrow(BadRequestException);
      await expect(error).rejects.toThrow("Email not provided by Facebook");
    });

    it("should handle API errors", async () => {
      mockHttpClient.get = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));

      await expect(provider.verifyAndExtractProfile("token")).rejects.toThrow(
        UnauthorizedException,
      );

      await expect(provider.verifyAndExtractProfile("token")).rejects.toThrow(
        "Facebook authentication failed",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });
});
<<<<<<< HEAD





=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
