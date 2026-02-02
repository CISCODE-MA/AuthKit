import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from '@services/auth.service';
import { OAuthService } from '@services/oauth.service';
import { AuthenticateGuard } from '@guards/authenticate.guard';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let authService: jest.Mocked<AuthService>;
  let oauthService: jest.Mocked<OAuthService>;

  beforeEach(async () => {
    // Create mock services
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyEmail: jest.fn(),
      resendVerification: jest.fn(),
      refresh: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      getMe: jest.fn(),
    };

    const mockOAuthService = {
      authenticateWithGoogle: jest.fn(),
      authenticateWithMicrosoft: jest.fn(),
      authenticateWithFacebook: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: OAuthService,
          useValue: mockOAuthService,
        },
      ],
    })
      .overrideGuard(AuthenticateGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get(AuthService);
    oauthService = moduleFixture.get(OAuthService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 201 and user data on successful registration', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        password: 'password123',
      };

      const expectedResult: any = {
        ok: true,
        id: 'new-user-id',
        email: dto.email,
        emailSent: true,
      };

      authService.register.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });

    it('should return 400 for invalid input data', async () => {
      // Arrange
      const invalidDto = {
        email: 'invalid-email',
        // Missing fullname and password
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 409 if email already exists', async () => {
      // Arrange
      const dto = {
        email: 'existing@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        password: 'password123',
      };

      const error = new Error('Email already exists');
      (error as any).status = 409;
      authService.register.mockRejectedValue(error);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(dto)
        .expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 with tokens on successful login', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      authService.login.mockResolvedValue(expectedTokens);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(dto)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      (error as any).status = 401;
      authService.login.mockRejectedValue(error);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(dto)
        .expect(401);
    });

    it('should return 403 if email not verified', async () => {
      // Arrange
      const dto = {
        email: 'unverified@example.com',
        password: 'password123',
      };

      const error = new Error('Email not verified');
      (error as any).status = 403;
      authService.login.mockRejectedValue(error);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(dto)
        .expect(403);
    });

    it('should set httpOnly cookie with refresh token', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      authService.login.mockResolvedValue(expectedTokens);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(dto)
        .expect(200);

      // Assert
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=');
      expect(cookies[0]).toContain('HttpOnly');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should return 200 on successful email verification', async () => {
      // Arrange
      const dto = {
        token: 'valid-verification-token',
      };

      const expectedResult = {
        ok: true,
        message: 'Email verified successfully',
      };

      authService.verifyEmail.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(authService.verifyEmail).toHaveBeenCalledWith(dto.token);
    });

    it('should return 401 for invalid token', async () => {
      // Arrange
      const dto = {
        token: 'invalid-token',
      };

      const error = new Error('Invalid verification token');
      (error as any).status = 401;
      authService.verifyEmail.mockRejectedValue(error);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send(dto)
        .expect(401);
    });

    it('should return 401 for expired token', async () => {
      // Arrange
      const dto = {
        token: 'expired-token',
      };

      const error = new Error('Token expired');
      (error as any).status = 401;
      authService.verifyEmail.mockRejectedValue(error);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send(dto)
        .expect(401);
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    it('should redirect to frontend with success on valid token', async () => {
      // Arrange
      const token = 'valid-verification-token';
      const expectedResult = {
        ok: true,
        message: 'Email verified successfully',
      };

      authService.verifyEmail.mockResolvedValue(expectedResult);
      process.env.FRONTEND_URL = 'http://localhost:3000';

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/auth/verify-email/${token}`)
        .expect(302);

      expect(response.headers.location).toContain('email-verified');
      expect(response.headers.location).toContain('success=true');
      expect(authService.verifyEmail).toHaveBeenCalledWith(token);
    });

    it('should redirect to frontend with error on invalid token', async () => {
      // Arrange
      const token = 'invalid-token';
      authService.verifyEmail.mockRejectedValue(
        new Error('Invalid verification token'),
      );
      process.env.FRONTEND_URL = 'http://localhost:3000';

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/auth/verify-email/${token}`)
        .expect(302);

      expect(response.headers.location).toContain('email-verified');
      expect(response.headers.location).toContain('success=false');
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    it('should return 200 on successful resend', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
      };

      const expectedResult = {
        ok: true,
        message: 'Verification email sent',
        emailSent: true,
      };

      authService.resendVerification.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/auth/resend-verification')
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(authService.resendVerification).toHaveBeenCalledWith(dto.email);
    });

    it('should return generic success message even if user not found', async () => {
      // Arrange
      const dto = {
        email: 'nonexistent@example.com',
      };

      const expectedResult = {
        ok: true,
        message: 'If the email exists and is unverified, a verification email has been sent',
      };

      authService.resendVerification.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/auth/resend-verification')
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should return 200 with new tokens on valid refresh token', async () => {
      // Arrange
      const dto = {
        refreshToken: 'valid-refresh-token',
      };

      const expectedTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authService.refresh.mockResolvedValue(expectedTokens);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh-token')
        .send(dto)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(authService.refresh).toHaveBeenCalledWith(dto.refreshToken);
    });

    it('should accept refresh token from cookie', async () => {
      // Arrange
      const refreshToken = 'cookie-refresh-token';

      const expectedTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authService.refresh.mockResolvedValue(expectedTokens);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh-token')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(authService.refresh).toHaveBeenCalledWith(refreshToken);
    });

    it('should return 401 if no refresh token provided', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh-token')
        .send({})
        .expect(401);

      expect(response.body.message).toContain('Refresh token missing');
    });

    it('should return 401 for invalid refresh token', async () => {
      // Arrange
      const dto = {
        refreshToken: 'invalid-token',
      };

      const error = new Error('Invalid refresh token');
      (error as any).status = 401;
      authService.refresh.mockRejectedValue(error);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/refresh-token')
        .send(dto)
        .expect(401);
    });

    it('should return 401 for expired refresh token', async () => {
      // Arrange
      const dto = {
        refreshToken: 'expired-token',
      };

      const error = new Error('Refresh token expired');
      (error as any).status = 401;
      authService.refresh.mockRejectedValue(error);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/refresh-token')
        .send(dto)
        .expect(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return 200 on successful request', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
      };

      const expectedResult = {
        ok: true,
        message: 'Password reset email sent',
        emailSent: true,
      };

      authService.forgotPassword.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(authService.forgotPassword).toHaveBeenCalledWith(dto.email);
    });

    it('should return generic success message even if user not found', async () => {
      // Arrange
      const dto = {
        email: 'nonexistent@example.com',
      };

      const expectedResult = {
        ok: true,
        message: 'If the email exists, a password reset link has been sent',
      };

      authService.forgotPassword.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should return 200 on successful password reset', async () => {
      // Arrange
      const dto = {
        token: 'valid-reset-token',
        newPassword: 'newPassword123',
      };

      const expectedResult = {
        ok: true,
        message: 'Password reset successfully',
      };

      authService.resetPassword.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        dto.token,
        dto.newPassword,
      );
    });

    it('should return 401 for invalid reset token', async () => {
      // Arrange
      const dto = {
        token: 'invalid-token',
        newPassword: 'newPassword123',
      };

      const error = new Error('Invalid reset token');
      (error as any).status = 401;
      authService.resetPassword.mockRejectedValue(error);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send(dto)
        .expect(401);
    });

    it('should return 401 for expired reset token', async () => {
      // Arrange
      const dto = {
        token: 'expired-token',
        newPassword: 'newPassword123',
      };

      const error = new Error('Reset token expired');
      (error as any).status = 401;
      authService.resetPassword.mockRejectedValue(error);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send(dto)
        .expect(401);
    });

    it('should return 400 for weak password', async () => {
      // Arrange
      const dto = {
        token: 'valid-reset-token',
        newPassword: '123', // Too short
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send(dto)
        .expect(400);
    });
  });
});
