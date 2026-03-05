<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext, ValidationPipe, ConflictException, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AuthController } from '@controllers/auth.controller';
import { AuthService } from '@services/auth.service';
import { OAuthService } from '@services/oauth.service';
import { AuthenticateGuard } from '@guards/authenticate.guard';

describe('AuthController (Integration)', () => {
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import {
  ExecutionContext,
  ValidationPipe,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import request from "supertest";
import cookieParser from "cookie-parser";
import { AuthController } from "@controllers/auth.controller";
import { AuthService } from "@services/auth.service";
import { OAuthService } from "@services/oauth.service";
import { AuthenticateGuard } from "@guards/authenticate.guard";

describe("AuthController (Integration)", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
<<<<<<< HEAD
    
    // Add cookie-parser middleware for handling cookies
    app.use(cookieParser());
    
=======

    // Add cookie-parser middleware for handling cookies
    app.use(cookieParser());

>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
    // Add global validation pipe for DTO validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
<<<<<<< HEAD
    
=======

>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
    await app.init();

    authService = moduleFixture.get(AuthService);
    oauthService = moduleFixture.get(OAuthService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

<<<<<<< HEAD
  describe('POST /api/auth/register', () => {
    it('should return 201 and user data on successful registration', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        password: 'password123',
=======
  describe("POST /api/auth/register", () => {
    it("should return 201 and user data on successful registration", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        fullname: { fname: "Test", lname: "User" },
        password: "password123",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      const expectedResult: any = {
        ok: true,
<<<<<<< HEAD
        id: 'new-user-id',
=======
        id: "new-user-id",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        email: dto.email,
        emailSent: true,
      };

      authService.register.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
<<<<<<< HEAD
        .post('/api/auth/register')
=======
        .post("/api/auth/register")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(201);

      expect(response.body).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });

<<<<<<< HEAD
    it('should return 400 for invalid input data', async () => {
      // Arrange
      const invalidDto = {
        email: 'invalid-email',
=======
    it("should return 400 for invalid input data", async () => {
      // Arrange
      const invalidDto = {
        email: "invalid-email",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        // Missing fullname and password
      };

      // Act & Assert
      await request(app.getHttpServer())
<<<<<<< HEAD
        .post('/api/auth/register')
=======
        .post("/api/auth/register")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(invalidDto)
        .expect(400);
    });

<<<<<<< HEAD
    it('should return 409 if email already exists', async () => {
      // Arrange
      const dto = {
        email: 'existing@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        password: 'password123',
      };

      authService.register.mockRejectedValue(new ConflictException('Email already exists'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/register')
=======
    it("should return 409 if email already exists", async () => {
      // Arrange
      const dto = {
        email: "existing@example.com",
        fullname: { fname: "Test", lname: "User" },
        password: "password123",
      };

      authService.register.mockRejectedValue(
        new ConflictException("Email already exists"),
      );

      // Act & Assert
      await request(app.getHttpServer())
        .post("/api/auth/register")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(409);
    });
  });

<<<<<<< HEAD
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
=======
  describe("POST /api/auth/login", () => {
    it("should return 200 with tokens on successful login", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        password: "password123",
      };

      const expectedTokens = {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      authService.login.mockResolvedValue(expectedTokens);

      // Act & Assert
      const response = await request(app.getHttpServer())
<<<<<<< HEAD
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

      authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/login')
=======
        .post("/api/auth/login")
        .send(dto)
        .expect(200);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it("should return 401 for invalid credentials", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      authService.login.mockRejectedValue(
        new UnauthorizedException("Invalid credentials"),
      );

      // Act & Assert
      await request(app.getHttpServer())
        .post("/api/auth/login")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(401);
    });

<<<<<<< HEAD
    it('should return 403 if email not verified', async () => {
      // Arrange
      const dto = {
        email: 'unverified@example.com',
        password: 'password123',
      };

      authService.login.mockRejectedValue(new ForbiddenException('Email not verified'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/login')
=======
    it("should return 403 if email not verified", async () => {
      // Arrange
      const dto = {
        email: "unverified@example.com",
        password: "password123",
      };

      authService.login.mockRejectedValue(
        new ForbiddenException("Email not verified"),
      );

      // Act & Assert
      await request(app.getHttpServer())
        .post("/api/auth/login")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(403);
    });

<<<<<<< HEAD
    it('should set httpOnly cookie with refresh token', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
=======
    it("should set httpOnly cookie with refresh token", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        password: "password123",
      };

      const expectedTokens = {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      authService.login.mockResolvedValue(expectedTokens);

      // Act
      const response = await request(app.getHttpServer())
<<<<<<< HEAD
        .post('/api/auth/login')
=======
        .post("/api/auth/login")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(200);

      // Assert
<<<<<<< HEAD
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
=======
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain("refreshToken=");
      expect(cookies[0]).toContain("HttpOnly");
    });
  });

  describe("POST /api/auth/verify-email", () => {
    it("should return 200 on successful email verification", async () => {
      // Arrange
      const dto = {
        token: "valid-verification-token",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      const expectedResult = {
        ok: true,
<<<<<<< HEAD
        message: 'Email verified successfully',
=======
        message: "Email verified successfully",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      authService.verifyEmail.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
<<<<<<< HEAD
        .post('/api/auth/verify-email')
=======
        .post("/api/auth/verify-email")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(authService.verifyEmail).toHaveBeenCalledWith(dto.token);
    });

<<<<<<< HEAD
    it('should return 401 for invalid token', async () => {
      // Arrange
      const dto = {
        token: 'invalid-token',
      };

      authService.verifyEmail.mockRejectedValue(new UnauthorizedException('Invalid verification token'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
=======
    it("should return 401 for invalid token", async () => {
      // Arrange
      const dto = {
        token: "invalid-token",
      };

      authService.verifyEmail.mockRejectedValue(
        new UnauthorizedException("Invalid verification token"),
      );

      // Act & Assert
      await request(app.getHttpServer())
        .post("/api/auth/verify-email")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(401);
    });

<<<<<<< HEAD
    it('should return 401 for expired token', async () => {
      // Arrange
      const dto = {
        token: 'expired-token',
      };

      authService.verifyEmail.mockRejectedValue(new UnauthorizedException('Token expired'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
=======
    it("should return 401 for expired token", async () => {
      // Arrange
      const dto = {
        token: "expired-token",
      };

      authService.verifyEmail.mockRejectedValue(
        new UnauthorizedException("Token expired"),
      );

      // Act & Assert
      await request(app.getHttpServer())
        .post("/api/auth/verify-email")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(401);
    });
  });

<<<<<<< HEAD
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
=======
  describe("GET /api/auth/verify-email/:token", () => {
    it("should redirect to frontend with success on valid token", async () => {
      // Arrange
      const token = "valid-verification-token";
      const expectedResult = {
        ok: true,
        message: "Email verified successfully",
      };

      authService.verifyEmail.mockResolvedValue(expectedResult);
      process.env.FRONTEND_URL = "http://localhost:3000";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/auth/verify-email/${token}`)
        .expect(302);

<<<<<<< HEAD
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
=======
      expect(response.headers.location).toContain("email-verified");
      expect(response.headers.location).toContain("success=true");
      expect(authService.verifyEmail).toHaveBeenCalledWith(token);
    });

    it("should redirect to frontend with error on invalid token", async () => {
      // Arrange
      const token = "invalid-token";
      authService.verifyEmail.mockRejectedValue(
        new Error("Invalid verification token"),
      );
      process.env.FRONTEND_URL = "http://localhost:3000";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/auth/verify-email/${token}`)
        .expect(302);

<<<<<<< HEAD
      expect(response.headers.location).toContain('email-verified');
      expect(response.headers.location).toContain('success=false');
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    it('should return 200 on successful resend', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
=======
      expect(response.headers.location).toContain("email-verified");
      expect(response.headers.location).toContain("success=false");
    });
  });

  describe("POST /api/auth/resend-verification", () => {
    it("should return 200 on successful resend", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      const expectedResult = {
        ok: true,
<<<<<<< HEAD
        message: 'Verification email sent',
=======
        message: "Verification email sent",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        emailSent: true,
      };

      authService.resendVerification.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
<<<<<<< HEAD
        .post('/api/auth/resend-verification')
=======
        .post("/api/auth/resend-verification")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(authService.resendVerification).toHaveBeenCalledWith(dto.email);
    });

<<<<<<< HEAD
    it('should return generic success message even if user not found', async () => {
      // Arrange
      const dto = {
        email: 'nonexistent@example.com',
=======
    it("should return generic success message even if user not found", async () => {
      // Arrange
      const dto = {
        email: "nonexistent@example.com",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      const expectedResult = {
        ok: true,
<<<<<<< HEAD
        message: 'If the email exists and is unverified, a verification email has been sent',
=======
        message:
          "If the email exists and is unverified, a verification email has been sent",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      authService.resendVerification.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
<<<<<<< HEAD
        .post('/api/auth/resend-verification')
=======
        .post("/api/auth/resend-verification")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
    });
  });

<<<<<<< HEAD
  describe('POST /api/auth/refresh-token', () => {
    it('should return 200 with new tokens on valid refresh token', async () => {
      // Arrange
      const dto = {
        refreshToken: 'valid-refresh-token',
      };

      const expectedTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
=======
  describe("POST /api/auth/refresh-token", () => {
    it("should return 200 with new tokens on valid refresh token", async () => {
      // Arrange
      const dto = {
        refreshToken: "valid-refresh-token",
      };

      const expectedTokens = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      authService.refresh.mockResolvedValue(expectedTokens);

      // Act & Assert
      const response = await request(app.getHttpServer())
<<<<<<< HEAD
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
=======
        .post("/api/auth/refresh-token")
        .send(dto)
        .expect(200);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(authService.refresh).toHaveBeenCalledWith(dto.refreshToken);
    });

    it("should accept refresh token from cookie", async () => {
      // Arrange
      const refreshToken = "cookie-refresh-token";

      const expectedTokens = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      authService.refresh.mockResolvedValue(expectedTokens);

      // Act & Assert
      const response = await request(app.getHttpServer())
<<<<<<< HEAD
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

      authService.refresh.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/refresh-token')
=======
        .post("/api/auth/refresh-token")
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(200);

      expect(response.body).toHaveProperty("accessToken");
      expect(authService.refresh).toHaveBeenCalledWith(refreshToken);
    });

    it("should return 401 if no refresh token provided", async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post("/api/auth/refresh-token")
        .send({})
        .expect(401);

      expect(response.body.message).toContain("Refresh token missing");
    });

    it("should return 401 for invalid refresh token", async () => {
      // Arrange
      const dto = {
        refreshToken: "invalid-token",
      };

      authService.refresh.mockRejectedValue(
        new UnauthorizedException("Invalid refresh token"),
      );

      // Act & Assert
      await request(app.getHttpServer())
        .post("/api/auth/refresh-token")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(401);
    });

<<<<<<< HEAD
    it('should return 401 for expired refresh token', async () => {
      // Arrange
      const dto = {
        refreshToken: 'expired-token',
      };

      authService.refresh.mockRejectedValue(new UnauthorizedException('Refresh token expired'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/refresh-token')
=======
    it("should return 401 for expired refresh token", async () => {
      // Arrange
      const dto = {
        refreshToken: "expired-token",
      };

      authService.refresh.mockRejectedValue(
        new UnauthorizedException("Refresh token expired"),
      );

      // Act & Assert
      await request(app.getHttpServer())
        .post("/api/auth/refresh-token")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(401);
    });
  });

<<<<<<< HEAD
  describe('POST /api/auth/forgot-password', () => {
    it('should return 200 on successful request', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
=======
  describe("POST /api/auth/forgot-password", () => {
    it("should return 200 on successful request", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      const expectedResult = {
        ok: true,
<<<<<<< HEAD
        message: 'Password reset email sent',
=======
        message: "Password reset email sent",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        emailSent: true,
      };

      authService.forgotPassword.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
<<<<<<< HEAD
        .post('/api/auth/forgot-password')
=======
        .post("/api/auth/forgot-password")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(authService.forgotPassword).toHaveBeenCalledWith(dto.email);
    });

<<<<<<< HEAD
    it('should return generic success message even if user not found', async () => {
      // Arrange
      const dto = {
        email: 'nonexistent@example.com',
=======
    it("should return generic success message even if user not found", async () => {
      // Arrange
      const dto = {
        email: "nonexistent@example.com",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      const expectedResult = {
        ok: true,
<<<<<<< HEAD
        message: 'If the email exists, a password reset link has been sent',
=======
        message: "If the email exists, a password reset link has been sent",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      authService.forgotPassword.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
<<<<<<< HEAD
        .post('/api/auth/forgot-password')
=======
        .post("/api/auth/forgot-password")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
    });
  });

<<<<<<< HEAD
  describe('POST /api/auth/reset-password', () => {
    it('should return 200 on successful password reset', async () => {
      // Arrange
      const dto = {
        token: 'valid-reset-token',
        newPassword: 'newPassword123',
=======
  describe("POST /api/auth/reset-password", () => {
    it("should return 200 on successful password reset", async () => {
      // Arrange
      const dto = {
        token: "valid-reset-token",
        newPassword: "newPassword123",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      const expectedResult = {
        ok: true,
<<<<<<< HEAD
        message: 'Password reset successfully',
=======
        message: "Password reset successfully",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      authService.resetPassword.mockResolvedValue(expectedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
<<<<<<< HEAD
        .post('/api/auth/reset-password')
=======
        .post("/api/auth/reset-password")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        dto.token,
        dto.newPassword,
      );
    });

<<<<<<< HEAD
    it('should return 401 for invalid reset token', async () => {
      // Arrange
      const dto = {
        token: 'invalid-token',
        newPassword: 'newPassword123',
      };

      authService.resetPassword.mockRejectedValue(new UnauthorizedException('Invalid reset token'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
=======
    it("should return 401 for invalid reset token", async () => {
      // Arrange
      const dto = {
        token: "invalid-token",
        newPassword: "newPassword123",
      };

      authService.resetPassword.mockRejectedValue(
        new UnauthorizedException("Invalid reset token"),
      );

      // Act & Assert
      await request(app.getHttpServer())
        .post("/api/auth/reset-password")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(401);
    });

<<<<<<< HEAD
    it('should return 401 for expired reset token', async () => {
      // Arrange
      const dto = {
        token: 'expired-token',
        newPassword: 'newPassword123',
      };

      authService.resetPassword.mockRejectedValue(new UnauthorizedException('Reset token expired'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
=======
    it("should return 401 for expired reset token", async () => {
      // Arrange
      const dto = {
        token: "expired-token",
        newPassword: "newPassword123",
      };

      authService.resetPassword.mockRejectedValue(
        new UnauthorizedException("Reset token expired"),
      );

      // Act & Assert
      await request(app.getHttpServer())
        .post("/api/auth/reset-password")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(401);
    });

<<<<<<< HEAD
    it('should return 400 for weak password', async () => {
      // Arrange
      const dto = {
        token: 'valid-reset-token',
        newPassword: '123', // Too short
=======
    it("should return 400 for weak password", async () => {
      // Arrange
      const dto = {
        token: "valid-reset-token",
        newPassword: "123", // Too short
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      // Act & Assert
      await request(app.getHttpServer())
<<<<<<< HEAD
        .post('/api/auth/reset-password')
=======
        .post("/api/auth/reset-password")
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        .send(dto)
        .expect(400);
    });
  });
});
<<<<<<< HEAD


=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
