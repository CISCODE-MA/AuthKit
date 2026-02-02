import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OAuthErrorHandler } from './oauth-error.handler';
import { LoggerService } from '@services/logger.service';

describe('OAuthErrorHandler', () => {
  let handler: OAuthErrorHandler;
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
    handler = new OAuthErrorHandler(logger);
  });

  describe('handleProviderError', () => {
    it('should rethrow UnauthorizedException', () => {
      const error = new UnauthorizedException('Invalid token');

      expect(() =>
        handler.handleProviderError(error, 'Google', 'token verification'),
      ).toThrow(UnauthorizedException);
    });

    it('should rethrow BadRequestException', () => {
      const error = new BadRequestException('Missing email');

      expect(() =>
        handler.handleProviderError(error, 'Microsoft', 'profile fetch'),
      ).toThrow(BadRequestException);
    });

    it('should rethrow InternalServerErrorException', () => {
      const error = new InternalServerErrorException('Service unavailable');

      expect(() =>
        handler.handleProviderError(error, 'Facebook', 'token validation'),
      ).toThrow(InternalServerErrorException);
    });

    it('should wrap unknown errors as UnauthorizedException', () => {
      const error = new Error('Network error');

      expect(() =>
        handler.handleProviderError(error, 'Google', 'authentication'),
      ).toThrow(UnauthorizedException);

      expect(() =>
        handler.handleProviderError(error, 'Google', 'authentication'),
      ).toThrow('Google authentication failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Google authentication failed: Network error',
        expect.any(String),
        'OAuthErrorHandler',
      );
    });

    it('should log error details', () => {
      const error = new Error('Custom error');

      try {
        handler.handleProviderError(error, 'Microsoft', 'login');
      } catch (e) {
        // Expected
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Microsoft login failed: Custom error',
        expect.any(String),
        'OAuthErrorHandler',
      );
    });
  });

  describe('validateRequiredField', () => {
    it('should not throw if field has value', () => {
      expect(() =>
        handler.validateRequiredField('user@example.com', 'Email', 'Google'),
      ).not.toThrow();

      expect(() =>
        handler.validateRequiredField('John Doe', 'Name', 'Microsoft'),
      ).not.toThrow();
    });

    it('should throw BadRequestException if field is null', () => {
      expect(() =>
        handler.validateRequiredField(null, 'Email', 'Google'),
      ).toThrow(BadRequestException);

      expect(() =>
        handler.validateRequiredField(null, 'Email', 'Google'),
      ).toThrow('Email not provided by Google');
    });

    it('should throw BadRequestException if field is undefined', () => {
      expect(() =>
        handler.validateRequiredField(undefined, 'Access token', 'Facebook'),
      ).toThrow(BadRequestException);

      expect(() =>
        handler.validateRequiredField(undefined, 'Access token', 'Facebook'),
      ).toThrow('Access token not provided by Facebook');
    });

    it('should throw BadRequestException if field is empty string', () => {
      expect(() =>
        handler.validateRequiredField('', 'Email', 'Microsoft'),
      ).toThrow(BadRequestException);
    });

    it('should accept non-empty values', () => {
      expect(() =>
        handler.validateRequiredField('0', 'ID', 'Provider'),
      ).not.toThrow();

      expect(() =>
        handler.validateRequiredField(false, 'Flag', 'Provider'),
      ).toThrow(); // false is falsy
    });
  });
});
