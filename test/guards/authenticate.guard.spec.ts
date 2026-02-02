import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { AuthenticateGuard } from '@guards/authenticate.guard';
import { UserRepository } from '@repos/user.repository';
import { LoggerService } from '@services/logger.service';

jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthenticateGuard', () => {
  let guard: AuthenticateGuard;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockLogger: jest.Mocked<LoggerService>;

  const mockExecutionContext = (authHeader?: string) => {
    const request = {
      headers: authHeader ? { authorization: authHeader } : {},
      user: undefined as any,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';

    mockUserRepo = {
      findById: jest.fn(),
    } as any;

    mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticateGuard,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    guard = module.get<AuthenticateGuard>(AuthenticateGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.JWT_SECRET;
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException if no Authorization header', async () => {
      const context = mockExecutionContext();

      const error = guard.canActivate(context);
      await expect(error).rejects.toThrow(UnauthorizedException);
      await expect(error).rejects.toThrow('Missing or invalid Authorization header');
    });

    it('should throw UnauthorizedException if Authorization header does not start with Bearer', async () => {
      const context = mockExecutionContext('Basic token123');

      const error = guard.canActivate(context);
      await expect(error).rejects.toThrow(UnauthorizedException);
      await expect(error).rejects.toThrow('Missing or invalid Authorization header');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const context = mockExecutionContext('Bearer valid-token');
      mockedJwt.verify.mockReturnValue({ sub: 'user-id' } as any);
      mockUserRepo.findById.mockResolvedValue(null);

      const error = guard.canActivate(context);
      await expect(error).rejects.toThrow(UnauthorizedException);
      await expect(error).rejects.toThrow('User not found');
    });

    it('should throw ForbiddenException if email not verified', async () => {
      const context = mockExecutionContext('Bearer valid-token');
      mockedJwt.verify.mockReturnValue({ sub: 'user-id' } as any);
      mockUserRepo.findById.mockResolvedValue({
        _id: 'user-id',
        isVerified: false,
        isBanned: false,
      } as any);

      const error = guard.canActivate(context);
      await expect(error).rejects.toThrow(ForbiddenException);
      await expect(error).rejects.toThrow('Email not verified');
    });

    it('should throw ForbiddenException if user is banned', async () => {
      const context = mockExecutionContext('Bearer valid-token');
      mockedJwt.verify.mockReturnValue({ sub: 'user-id' } as any);
      mockUserRepo.findById.mockResolvedValue({
        _id: 'user-id',
        isVerified: true,
        isBanned: true,
      } as any);

      const error = guard.canActivate(context);
      await expect(error).rejects.toThrow(ForbiddenException);
      await expect(error).rejects.toThrow('Account has been banned');
    });

    it('should throw UnauthorizedException if token issued before password change', async () => {
      const context = mockExecutionContext('Bearer valid-token');
      const passwordChangedAt = new Date('2025-01-01');
      const tokenIssuedAt = Math.floor(new Date('2024-12-01').getTime() / 1000);

      mockedJwt.verify.mockReturnValue({ sub: 'user-id', iat: tokenIssuedAt } as any);
      mockUserRepo.findById.mockResolvedValue({
        _id: 'user-id',
        isVerified: true,
        isBanned: false,
        passwordChangedAt,
      } as any);

      const error = guard.canActivate(context);
      await expect(error).rejects.toThrow(UnauthorizedException);
      await expect(error).rejects.toThrow('Token expired due to password change');
    });

    it('should return true and attach user to request if valid token', async () => {
      const context = mockExecutionContext('Bearer valid-token');
      const decoded = { sub: 'user-id', email: 'user@test.com' };

      mockedJwt.verify.mockReturnValue(decoded as any);
      mockUserRepo.findById.mockResolvedValue({
        _id: 'user-id',
        isVerified: true,
        isBanned: false,
      } as any);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(context.switchToHttp().getRequest().user).toEqual(decoded);
    });

    it('should throw UnauthorizedException if token expired', async () => {
      const context = mockExecutionContext('Bearer expired-token');
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      mockedJwt.verify.mockImplementation(() => {
        throw error;
      });

      const result = guard.canActivate(context);
      await expect(result).rejects.toThrow(UnauthorizedException);
      await expect(result).rejects.toThrow('Access token has expired');
    });

    it('should throw UnauthorizedException if token invalid', async () => {
      const context = mockExecutionContext('Bearer invalid-token');
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      mockedJwt.verify.mockImplementation(() => {
        throw error;
      });

      const result = guard.canActivate(context);
      await expect(result).rejects.toThrow(UnauthorizedException);
      await expect(result).rejects.toThrow('Invalid access token');
    });

    it('should throw UnauthorizedException if token not yet valid', async () => {
      const context = mockExecutionContext('Bearer future-token');
      const error = new Error('Token not yet valid');
      error.name = 'NotBeforeError';
      mockedJwt.verify.mockImplementation(() => {
        throw error;
      });

      const result = guard.canActivate(context);
      await expect(result).rejects.toThrow(UnauthorizedException);
      await expect(result).rejects.toThrow('Token not yet valid');
    });

    it('should throw UnauthorizedException and log error for unknown errors', async () => {
      const context = mockExecutionContext('Bearer token');
      const error = new Error('Unknown error');
      mockedJwt.verify.mockImplementation(() => {
        throw error;
      });

      const result = guard.canActivate(context);
      await expect(result).rejects.toThrow(UnauthorizedException);
      await expect(result).rejects.toThrow('Authentication failed');
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Authentication failed'),
        expect.any(String),
        'AuthenticateGuard',
      );
    });

    it('should throw InternalServerErrorException if JWT_SECRET not set', async () => {
      delete process.env.JWT_SECRET;
      const context = mockExecutionContext('Bearer token');
      
      // getEnv throws InternalServerErrorException, but it's NOT in the canActivate catch
      // because it's thrown BEFORE jwt.verify, so it propagates directly
      await expect(guard.canActivate(context)).rejects.toThrow(InternalServerErrorException);
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Environment variable JWT_SECRET is not set',
        'AuthenticateGuard',
      );
    });
  });
});


