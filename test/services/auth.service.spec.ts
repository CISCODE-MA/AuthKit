<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
<<<<<<< HEAD
} from '@nestjs/common';
import { AuthService } from '@services/auth.service';
import { PermissionRepository } from '@repos/permission.repository';
import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { MailService } from '@services/mail.service';
import { LoggerService } from '@services/logger.service';
=======
} from "@nestjs/common";
import { AuthService } from "@services/auth.service";
import { PermissionRepository } from "@repos/permission.repository";
import { UserRepository } from "@repos/user.repository";
import { RoleRepository } from "@repos/role.repository";
import { MailService } from "@services/mail.service";
import { LoggerService } from "@services/logger.service";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
import {
  createMockUser,
  createMockRole,
  createMockVerifiedUser,
<<<<<<< HEAD
} from '@test-utils/mock-factories';

describe('AuthService', () => {
=======
} from "@test-utils/mock-factories";

describe("AuthService", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  let service: AuthService;
  let userRepo: jest.Mocked<UserRepository>;
  let roleRepo: jest.Mocked<RoleRepository>;
  let permissionRepo: jest.Mocked<any>;
  let mailService: jest.Mocked<MailService>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
<<<<<<< HEAD

=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
    // Create mock implementations
    const mockUserRepo = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findByPhone: jest.fn(),
      findById: jest.fn(),
      findByIdWithRolesAndPermissions: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
    };

    const mockRoleRepo = {
      findByName: jest.fn(),
      findById: jest.fn(),
    };

    const mockPermissionRepo = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    const mockMailService = {
      sendVerificationEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    };

    const mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    // Setup environment variables for tests
<<<<<<< HEAD
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_EMAIL_SECRET = 'test-email-secret';
    process.env.JWT_RESET_SECRET = 'test-reset-secret';
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';
    process.env.JWT_EMAIL_TOKEN_EXPIRES_IN = '1d';
    process.env.JWT_RESET_TOKEN_EXPIRES_IN = '1h';
=======
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
    process.env.JWT_EMAIL_SECRET = "test-email-secret";
    process.env.JWT_RESET_SECRET = "test-reset-secret";
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = "15m";
    process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = "7d";
    process.env.JWT_EMAIL_TOKEN_EXPIRES_IN = "1d";
    process.env.JWT_RESET_TOKEN_EXPIRES_IN = "1h";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepo,
        },
        {
          provide: RoleRepository,
          useValue: mockRoleRepo,
        },
        {
          provide: PermissionRepository,
          useValue: mockPermissionRepo,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(UserRepository);
    roleRepo = module.get(RoleRepository);
    permissionRepo = module.get(PermissionRepository);
    mailService = module.get(MailService);
    loggerService = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

<<<<<<< HEAD
  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        password: 'password123',
=======
  describe("register", () => {
    it("should throw ConflictException if email already exists", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        fullname: { fname: "Test", lname: "User" },
        password: "password123",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      const existingUser = createMockUser({ email: dto.email });
      userRepo.findByEmail.mockResolvedValue(existingUser as any);
      userRepo.findByUsername.mockResolvedValue(null);
      userRepo.findByPhone.mockResolvedValue(null);

      // Act & Assert
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(userRepo.findByEmail).toHaveBeenCalledWith(dto.email);
    });

<<<<<<< HEAD
    it('should throw ConflictException if username already exists', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        username: 'testuser',
        password: 'password123',
=======
    it("should throw ConflictException if username already exists", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        fullname: { fname: "Test", lname: "User" },
        username: "testuser",
        password: "password123",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      const existingUser = createMockUser({ username: dto.username });
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.findByUsername.mockResolvedValue(existingUser as any);
      userRepo.findByPhone.mockResolvedValue(null);

      // Act & Assert
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

<<<<<<< HEAD
    it('should throw ConflictException if phone already exists', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        phoneNumber: '1234567890',
        password: 'password123',
=======
    it("should throw ConflictException if phone already exists", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        fullname: { fname: "Test", lname: "User" },
        phoneNumber: "1234567890",
        password: "password123",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      const existingUser = createMockUser({ phoneNumber: dto.phoneNumber });
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.findByUsername.mockResolvedValue(null);
      userRepo.findByPhone.mockResolvedValue(existingUser as any);

      // Act & Assert
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

<<<<<<< HEAD
    it('should throw InternalServerErrorException if user role does not exist', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        password: 'password123',
=======
    it("should throw InternalServerErrorException if user role does not exist", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        fullname: { fname: "Test", lname: "User" },
        password: "password123",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.findByUsername.mockResolvedValue(null);
      userRepo.findByPhone.mockResolvedValue(null);
      roleRepo.findByName.mockResolvedValue(null);

      // Act & Assert
      await expect(service.register(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
<<<<<<< HEAD
      expect(roleRepo.findByName).toHaveBeenCalledWith('user');
    });

    it('should successfully register a new user', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        password: 'password123',
      };

      const mockRole: any = createMockRole({ name: 'user' });
      const newUser = {
        ...createMockUser({ email: dto.email }),
        _id: 'new-user-id',
=======
      expect(roleRepo.findByName).toHaveBeenCalledWith("user");
    });

    it("should successfully register a new user", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        fullname: { fname: "Test", lname: "User" },
        password: "password123",
      };

      const mockRole: any = createMockRole({ name: "user" });
      const newUser = {
        ...createMockUser({ email: dto.email }),
        _id: "new-user-id",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        roles: [mockRole._id],
      };

      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.findByUsername.mockResolvedValue(null);
      userRepo.findByPhone.mockResolvedValue(null);
      roleRepo.findByName.mockResolvedValue(mockRole as any);
      userRepo.create.mockResolvedValue(newUser as any);
      mailService.sendVerificationEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.register(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.ok).toBe(true);
      expect(result.emailSent).toBe(true);
      expect(userRepo.create).toHaveBeenCalled();
      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
    });

<<<<<<< HEAD
    it('should continue if email sending fails', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        password: 'password123',
      };

      const mockRole: any = createMockRole({ name: 'user' });
      const newUser = {
        ...createMockUser({ email: dto.email }),
        _id: 'new-user-id',
=======
    it("should continue if email sending fails", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        fullname: { fname: "Test", lname: "User" },
        password: "password123",
      };

      const mockRole: any = createMockRole({ name: "user" });
      const newUser = {
        ...createMockUser({ email: dto.email }),
        _id: "new-user-id",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        roles: [mockRole._id],
      };

      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.findByUsername.mockResolvedValue(null);
      userRepo.findByPhone.mockResolvedValue(null);
      roleRepo.findByName.mockResolvedValue(mockRole as any);
      userRepo.create.mockResolvedValue(newUser as any);
      mailService.sendVerificationEmail.mockRejectedValue(
<<<<<<< HEAD
        new Error('Email service down'),
=======
        new Error("Email service down"),
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );

      // Act
      const result = await service.register(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.ok).toBe(true);
      expect(result.emailSent).toBe(false);
      expect(result.emailError).toBeDefined();
      expect(userRepo.create).toHaveBeenCalled();
    });

<<<<<<< HEAD
    it('should throw InternalServerErrorException on unexpected error', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        password: 'password123',
      };

      userRepo.findByEmail.mockRejectedValue(new Error('Database error'));
=======
    it("should throw InternalServerErrorException on unexpected error", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        fullname: { fname: "Test", lname: "User" },
        password: "password123",
      };

      userRepo.findByEmail.mockRejectedValue(new Error("Database error"));
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      // Act & Assert
      await expect(service.register(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

<<<<<<< HEAD
    it('should throw ConflictException on MongoDB duplicate key error', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        fullname: { fname: 'Test', lname: 'User' },
        password: 'password123',
      };

      const mockRole: any = createMockRole({ name: 'user' });
=======
    it("should throw ConflictException on MongoDB duplicate key error", async () => {
      // Arrange
      const dto = {
        email: "test@example.com",
        fullname: { fname: "Test", lname: "User" },
        password: "password123",
      };

      const mockRole: any = createMockRole({ name: "user" });
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.findByUsername.mockResolvedValue(null);
      userRepo.findByPhone.mockResolvedValue(null);
      roleRepo.findByName.mockResolvedValue(mockRole as any);

      // Simulate MongoDB duplicate key error (race condition)
<<<<<<< HEAD
      const mongoError: any = new Error('Duplicate key');
=======
      const mongoError: any = new Error("Duplicate key");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      mongoError.code = 11000;
      userRepo.create.mockRejectedValue(mongoError);

      // Act & Assert
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

<<<<<<< HEAD
  describe('getMe', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-id';
=======
  describe("getMe", () => {
    it("should throw NotFoundException if user does not exist", async () => {
      // Arrange
      const userId = "non-existent-id";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      userRepo.findByIdWithRolesAndPermissions.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getMe(userId)).rejects.toThrow(NotFoundException);
    });

<<<<<<< HEAD
    it('should throw ForbiddenException if user is banned', async () => {
=======
    it("should throw ForbiddenException if user is banned", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      // Arrange
      const mockUser: any = {
        ...createMockUser(),
        isBanned: true,
        toObject: () => mockUser,
      };

      userRepo.findByIdWithRolesAndPermissions.mockResolvedValue(mockUser);

      // Act & Assert
<<<<<<< HEAD
      await expect(service.getMe('mock-user-id')).rejects.toThrow(
=======
      await expect(service.getMe("mock-user-id")).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        ForbiddenException,
      );
    });

<<<<<<< HEAD
    it('should return user data without password', async () => {
      // Arrange
      const mockUser = createMockVerifiedUser({
        password: 'hashed-password',
=======
    it("should return user data without password", async () => {
      // Arrange
      const mockUser = createMockVerifiedUser({
        password: "hashed-password",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      // Mock toObject method
      const userWithToObject = {
        ...mockUser,
        toObject: () => mockUser,
      };

      userRepo.findByIdWithRolesAndPermissions.mockResolvedValue(
        userWithToObject as any,
      );

      // Act
<<<<<<< HEAD
      const result = await service.getMe('mock-user-id');
=======
      const result = await service.getMe("mock-user-id");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      // Assert
      expect(result).toBeDefined();
      expect(result.ok).toBe(true);
      expect(result.data).toBeDefined();
<<<<<<< HEAD
      expect(result.data).not.toHaveProperty('password');
      expect(result.data).not.toHaveProperty('passwordChangedAt');
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      // Arrange
      userRepo.findByIdWithRolesAndPermissions.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.getMe('mock-user-id')).rejects.toThrow(
=======
      expect(result.data).not.toHaveProperty("password");
      expect(result.data).not.toHaveProperty("passwordChangedAt");
    });

    it("should throw InternalServerErrorException on unexpected error", async () => {
      // Arrange
      userRepo.findByIdWithRolesAndPermissions.mockRejectedValue(
        new Error("Database error"),
      );

      // Act & Assert
      await expect(service.getMe("mock-user-id")).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        InternalServerErrorException,
      );
    });
  });

<<<<<<< HEAD
  describe('issueTokensForUser', () => {
    it('should generate access and refresh tokens', async () => {
      // Arrange
      const userId = 'mock-user-id';
      const mockRole = { _id: 'role-id', permissions: [] };
=======
  describe("issueTokensForUser", () => {
    it("should generate access and refresh tokens", async () => {
      // Arrange
      const userId = "mock-user-id";
      const mockRole = { _id: "role-id", permissions: [] };
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const mockUser: any = {
        ...createMockVerifiedUser(),
        _id: userId,
        roles: [mockRole._id],
      };
      const userWithToObject = {
        ...mockUser,
        toObject: () => mockUser,
      };
      userRepo.findById.mockResolvedValue(userWithToObject as any);
<<<<<<< HEAD
      userRepo.findByIdWithRolesAndPermissions.mockResolvedValue(userWithToObject as any);
=======
      userRepo.findByIdWithRolesAndPermissions.mockResolvedValue(
        userWithToObject as any,
      );
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      roleRepo.findByIds = jest.fn().mockResolvedValue([mockRole]);
      permissionRepo.findByIds.mockResolvedValue([]);

      // Act
      const result = await service.issueTokensForUser(userId);

      // Assert
<<<<<<< HEAD
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
    });

    it('should throw NotFoundException if user not found in buildTokenPayload', async () => {
=======
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
    });

    it("should throw NotFoundException if user not found in buildTokenPayload", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      // Arrange
      userRepo.findByIdWithRolesAndPermissions.mockResolvedValue(null);

      // Act & Assert
<<<<<<< HEAD
      await expect(service.issueTokensForUser('non-existent')).rejects.toThrow(
=======
      await expect(service.issueTokensForUser("non-existent")).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        NotFoundException,
      );
    });

<<<<<<< HEAD
    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      userRepo.findById.mockRejectedValue(new Error('Database connection lost'));

      // Act & Assert
      await expect(service.issueTokensForUser('user-id')).rejects.toThrow(
=======
    it("should throw InternalServerErrorException on database error", async () => {
      // Arrange
      userRepo.findById.mockRejectedValue(
        new Error("Database connection lost"),
      );

      // Act & Assert
      await expect(service.issueTokensForUser("user-id")).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        InternalServerErrorException,
      );
    });

<<<<<<< HEAD
    it('should handle missing environment variables', async () => {
=======
    it("should handle missing environment variables", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      // Arrange
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

<<<<<<< HEAD
      const mockRole = { _id: 'role-id', permissions: [] };
      const mockUser: any = {
        ...createMockVerifiedUser(),
        _id: 'user-id',
=======
      const mockRole = { _id: "role-id", permissions: [] };
      const mockUser: any = {
        ...createMockVerifiedUser(),
        _id: "user-id",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        roles: [mockRole._id],
      };
      const userWithToObject = {
        ...mockUser,
        toObject: () => mockUser,
      };
      userRepo.findById.mockResolvedValue(userWithToObject as any);
<<<<<<< HEAD
      userRepo.findByIdWithRolesAndPermissions.mockResolvedValue(userWithToObject as any);
=======
      userRepo.findByIdWithRolesAndPermissions.mockResolvedValue(
        userWithToObject as any,
      );
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      roleRepo.findByIds = jest.fn().mockResolvedValue([mockRole]);
      permissionRepo.findByIds.mockResolvedValue([]);

      // Act & Assert
<<<<<<< HEAD
      await expect(service.issueTokensForUser('user-id')).rejects.toThrow(
=======
      await expect(service.issueTokensForUser("user-id")).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        InternalServerErrorException,
      );

      // Cleanup
      process.env.JWT_SECRET = originalSecret;
    });
  });

<<<<<<< HEAD
  describe('login', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      // Arrange
      const dto = { email: 'test@example.com', password: 'password123' };
=======
  describe("login", () => {
    it("should throw UnauthorizedException if user does not exist", async () => {
      // Arrange
      const dto = { email: "test@example.com", password: "password123" };
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      userRepo.findByEmailWithPassword = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

<<<<<<< HEAD
    it('should throw ForbiddenException if user is banned', async () => {
      // Arrange
      const dto = { email: 'test@example.com', password: 'password123' };
      const bannedUser: any = createMockUser({
        isBanned: true,
        password: 'hashed',
      });
      userRepo.findByEmailWithPassword = jest.fn().mockResolvedValue(bannedUser);
=======
    it("should throw ForbiddenException if user is banned", async () => {
      // Arrange
      const dto = { email: "test@example.com", password: "password123" };
      const bannedUser: any = createMockUser({
        isBanned: true,
        password: "hashed",
      });
      userRepo.findByEmailWithPassword = jest
        .fn()
        .mockResolvedValue(bannedUser);
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      // Act & Assert
      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
      expect(userRepo.findByEmailWithPassword).toHaveBeenCalledWith(dto.email);
    });

<<<<<<< HEAD
    it('should throw ForbiddenException if email not verified', async () => {
      // Arrange
      const dto = { email: 'test@example.com', password: 'password123' };
      const unverifiedUser: any = createMockUser({
        isVerified: false,
        password: 'hashed',
=======
    it("should throw ForbiddenException if email not verified", async () => {
      // Arrange
      const dto = { email: "test@example.com", password: "password123" };
      const unverifiedUser: any = createMockUser({
        isVerified: false,
        password: "hashed",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });
      userRepo.findByEmailWithPassword = jest
        .fn()
        .mockResolvedValue(unverifiedUser);

      // Act & Assert
      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
    });

<<<<<<< HEAD
    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      const dto = { email: 'test@example.com', password: 'wrongpassword' };
      const user: any = createMockVerifiedUser({
        password: '$2a$10$validHashedPassword',
=======
    it("should throw UnauthorizedException if password is incorrect", async () => {
      // Arrange
      const dto = { email: "test@example.com", password: "wrongpassword" };
      const user: any = createMockVerifiedUser({
        password: "$2a$10$validHashedPassword",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });
      userRepo.findByEmailWithPassword = jest.fn().mockResolvedValue(user);

      // Act & Assert
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

<<<<<<< HEAD
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const dto = { email: 'test@example.com', password: 'password123' };
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockRole = { _id: 'role-id', permissions: [] };
      const user: any = {
        ...createMockVerifiedUser({
          _id: 'user-id',
=======
    it("should successfully login with valid credentials", async () => {
      // Arrange
      const dto = { email: "test@example.com", password: "password123" };
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("password123", 10);
      const mockRole = { _id: "role-id", permissions: [] };
      const user: any = {
        ...createMockVerifiedUser({
          _id: "user-id",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
          password: hashedPassword,
        }),
        roles: [mockRole._id],
      };
      userRepo.findByEmailWithPassword = jest.fn().mockResolvedValue(user);
      userRepo.findById.mockResolvedValue(user);
      userRepo.findByIdWithRolesAndPermissions = jest.fn().mockResolvedValue({
        ...user,
        toObject: () => user,
      });
      roleRepo.findByIds = jest.fn().mockResolvedValue([mockRole]);
      permissionRepo.findByIds.mockResolvedValue([]);

      // Act
      const result = await service.login(dto);

      // Assert
<<<<<<< HEAD
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email with valid token', async () => {
      // Arrange
      const userId = 'user-id';
      const token = require('jsonwebtoken').sign(
        { sub: userId, purpose: 'verify' },
        process.env.JWT_EMAIL_SECRET!,
        { expiresIn: '1d' },
=======
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
    });
  });

  describe("verifyEmail", () => {
    it("should successfully verify email with valid token", async () => {
      // Arrange
      const userId = "user-id";
      const token = require("jsonwebtoken").sign(
        { sub: userId, purpose: "verify" },
        process.env.JWT_EMAIL_SECRET!,
        { expiresIn: "1d" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );

      const user: any = {
        ...createMockUser({ isVerified: false }),
        save: jest.fn().mockResolvedValue(true),
      };
      userRepo.findById.mockResolvedValue(user);

      // Act
      const result = await service.verifyEmail(token);

      // Assert
      expect(result.ok).toBe(true);
<<<<<<< HEAD
      expect(result.message).toContain('verified successfully');
=======
      expect(result.message).toContain("verified successfully");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(user.save).toHaveBeenCalled();
      expect(user.isVerified).toBe(true);
    });

<<<<<<< HEAD
    it('should return success if email already verified', async () => {
      // Arrange
      const userId = 'user-id';
      const token = require('jsonwebtoken').sign(
        { sub: userId, purpose: 'verify' },
        process.env.JWT_EMAIL_SECRET!,
        { expiresIn: '1d' },
=======
    it("should return success if email already verified", async () => {
      // Arrange
      const userId = "user-id";
      const token = require("jsonwebtoken").sign(
        { sub: userId, purpose: "verify" },
        process.env.JWT_EMAIL_SECRET!,
        { expiresIn: "1d" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );

      const user: any = {
        ...createMockVerifiedUser(),
        save: jest.fn(),
      };
      userRepo.findById.mockResolvedValue(user);

      // Act
      const result = await service.verifyEmail(token);

      // Assert
      expect(result.ok).toBe(true);
<<<<<<< HEAD
      expect(result.message).toContain('already verified');
      expect(user.save).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for expired token', async () => {
      // Arrange
      const expiredToken = require('jsonwebtoken').sign(
        { sub: 'user-id', purpose: 'verify' },
        process.env.JWT_EMAIL_SECRET!,
        { expiresIn: '-1d' },
=======
      expect(result.message).toContain("already verified");
      expect(user.save).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException for expired token", async () => {
      // Arrange
      const expiredToken = require("jsonwebtoken").sign(
        { sub: "user-id", purpose: "verify" },
        process.env.JWT_EMAIL_SECRET!,
        { expiresIn: "-1d" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );

      // Act & Assert
      await expect(service.verifyEmail(expiredToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

<<<<<<< HEAD
    it('should throw BadRequestException for invalid purpose', async () => {
      // Arrange
      const token = require('jsonwebtoken').sign(
        { sub: 'user-id', purpose: 'wrong' },
=======
    it("should throw BadRequestException for invalid purpose", async () => {
      // Arrange
      const token = require("jsonwebtoken").sign(
        { sub: "user-id", purpose: "wrong" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        process.env.JWT_EMAIL_SECRET!,
      );

      // Act & Assert
      await expect(service.verifyEmail(token)).rejects.toThrow(
        BadRequestException,
      );
    });

<<<<<<< HEAD
    it('should throw UnauthorizedException for JsonWebTokenError', async () => {
      // Arrange
      const invalidToken = 'invalid.jwt.token';
=======
    it("should throw UnauthorizedException for JsonWebTokenError", async () => {
      // Arrange
      const invalidToken = "invalid.jwt.token";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      // Act & Assert
      await expect(service.verifyEmail(invalidToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

<<<<<<< HEAD
    it('should throw NotFoundException if user not found after token validation', async () => {
      // Arrange
      const userId = 'non-existent-id';
      const token = require('jsonwebtoken').sign(
        { sub: userId, purpose: 'verify' },
        process.env.JWT_EMAIL_SECRET!,
        { expiresIn: '1d' },
=======
    it("should throw NotFoundException if user not found after token validation", async () => {
      // Arrange
      const userId = "non-existent-id";
      const token = require("jsonwebtoken").sign(
        { sub: userId, purpose: "verify" },
        process.env.JWT_EMAIL_SECRET!,
        { expiresIn: "1d" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );

      userRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyEmail(token)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

<<<<<<< HEAD
  describe('resendVerification', () => {
    it('should send verification email for unverified user', async () => {
      // Arrange
      const email = 'test@example.com';
=======
  describe("resendVerification", () => {
    it("should send verification email for unverified user", async () => {
      // Arrange
      const email = "test@example.com";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const user: any = createMockUser({ email, isVerified: false });
      userRepo.findByEmail.mockResolvedValue(user);
      mailService.sendVerificationEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.resendVerification(email);

      // Assert
      expect(result.ok).toBe(true);
      expect(result.emailSent).toBe(true);
      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
    });

<<<<<<< HEAD
    it('should return generic message if user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
=======
    it("should return generic message if user not found", async () => {
      // Arrange
      const email = "nonexistent@example.com";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      userRepo.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.resendVerification(email);

      // Assert
      expect(result.ok).toBe(true);
<<<<<<< HEAD
      expect(result.message).toContain('If the email exists');
      expect(mailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should return generic message if user already verified', async () => {
      // Arrange
      const email = 'test@example.com';
=======
      expect(result.message).toContain("If the email exists");
      expect(mailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("should return generic message if user already verified", async () => {
      // Arrange
      const email = "test@example.com";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const user: any = createMockVerifiedUser({ email });
      userRepo.findByEmail.mockResolvedValue(user);

      // Act
      const result = await service.resendVerification(email);

      // Assert
      expect(result.ok).toBe(true);
      expect(mailService.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

<<<<<<< HEAD
  describe('refresh', () => {
    it('should generate new tokens with valid refresh token', async () => {
      // Arrange
      const userId = 'user-id';
      const refreshToken = require('jsonwebtoken').sign(
        { sub: userId, purpose: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' },
      );

      const mockRole = { _id: 'role-id', permissions: [] };
      const user: any = {
        ...createMockVerifiedUser({ _id: userId }),
        roles: [mockRole._id],
        passwordChangedAt: new Date('2026-01-01'),
=======
  describe("refresh", () => {
    it("should generate new tokens with valid refresh token", async () => {
      // Arrange
      const userId = "user-id";
      const refreshToken = require("jsonwebtoken").sign(
        { sub: userId, purpose: "refresh" },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" },
      );

      const mockRole = { _id: "role-id", permissions: [] };
      const user: any = {
        ...createMockVerifiedUser({ _id: userId }),
        roles: [mockRole._id],
        passwordChangedAt: new Date("2026-01-01"),
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };
      userRepo.findById.mockResolvedValue(user);
      userRepo.findByIdWithRolesAndPermissions = jest.fn().mockResolvedValue({
        ...user,
        toObject: () => user,
      });
      roleRepo.findByIds = jest.fn().mockResolvedValue([mockRole]);
      permissionRepo.findByIds.mockResolvedValue([]);

      // Act
      const result = await service.refresh(refreshToken);

      // Assert
<<<<<<< HEAD
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
    });

    it('should throw UnauthorizedException for expired token', async () => {
      // Arrange
      const expiredToken = require('jsonwebtoken').sign(
        { sub: 'user-id', purpose: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '-1d' },
=======
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
    });

    it("should throw UnauthorizedException for expired token", async () => {
      // Arrange
      const expiredToken = require("jsonwebtoken").sign(
        { sub: "user-id", purpose: "refresh" },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "-1d" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );

      // Act & Assert
      await expect(service.refresh(expiredToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

<<<<<<< HEAD
    it('should throw ForbiddenException if user is banned', async () => {
      // Arrange
      const userId = 'user-id';
      const refreshToken = require('jsonwebtoken').sign(
        { sub: userId, purpose: 'refresh' },
=======
    it("should throw ForbiddenException if user is banned", async () => {
      // Arrange
      const userId = "user-id";
      const refreshToken = require("jsonwebtoken").sign(
        { sub: userId, purpose: "refresh" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        process.env.JWT_REFRESH_SECRET!,
      );

      const bannedUser: any = createMockUser({ isBanned: true });
      userRepo.findById.mockResolvedValue(bannedUser);

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        ForbiddenException,
      );
    });

<<<<<<< HEAD
    it('should throw UnauthorizedException if token issued before password change', async () => {
      // Arrange
      const userId = 'user-id';
      const iat = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const refreshToken = require('jsonwebtoken').sign(
        { sub: userId, purpose: 'refresh', iat },
=======
    it("should throw UnauthorizedException if token issued before password change", async () => {
      // Arrange
      const userId = "user-id";
      const iat = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const refreshToken = require("jsonwebtoken").sign(
        { sub: userId, purpose: "refresh", iat },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        process.env.JWT_REFRESH_SECRET!,
      );

      const user: any = {
        ...createMockVerifiedUser(),
        passwordChangedAt: new Date(), // Changed just now (after token was issued)
      };
      userRepo.findById.mockResolvedValue(user);

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

<<<<<<< HEAD
  describe('forgotPassword', () => {
    it('should send password reset email for existing user', async () => {
      // Arrange
      const email = 'test@example.com';
=======
  describe("forgotPassword", () => {
    it("should send password reset email for existing user", async () => {
      // Arrange
      const email = "test@example.com";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const user: any = createMockUser({ email });
      userRepo.findByEmail.mockResolvedValue(user);
      mailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.forgotPassword(email);

      // Assert
      expect(result.ok).toBe(true);
      expect(result.emailSent).toBe(true);
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

<<<<<<< HEAD
    it('should return generic message if user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
=======
    it("should return generic message if user not found", async () => {
      // Arrange
      const email = "nonexistent@example.com";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      userRepo.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.forgotPassword(email);

      // Assert
      expect(result.ok).toBe(true);
<<<<<<< HEAD
      expect(result.message).toContain('If the email exists');
=======
      expect(result.message).toContain("If the email exists");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

<<<<<<< HEAD
  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      // Arrange
      const userId = 'user-id';
      const newPassword = 'newPassword123';
      const token = require('jsonwebtoken').sign(
        { sub: userId, purpose: 'reset' },
        process.env.JWT_RESET_SECRET!,
        { expiresIn: '1h' },
=======
  describe("resetPassword", () => {
    it("should successfully reset password with valid token", async () => {
      // Arrange
      const userId = "user-id";
      const newPassword = "newPassword123";
      const token = require("jsonwebtoken").sign(
        { sub: userId, purpose: "reset" },
        process.env.JWT_RESET_SECRET!,
        { expiresIn: "1h" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );

      const user: any = {
        ...createMockUser(),
        save: jest.fn().mockResolvedValue(true),
      };
      userRepo.findById.mockResolvedValue(user);

      // Act
      const result = await service.resetPassword(token, newPassword);

      // Assert
      expect(result.ok).toBe(true);
<<<<<<< HEAD
      expect(result.message).toContain('reset successfully');
=======
      expect(result.message).toContain("reset successfully");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(user.save).toHaveBeenCalled();
      expect(user.password).toBeDefined();
      expect(user.passwordChangedAt).toBeInstanceOf(Date);
    });

<<<<<<< HEAD
    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'non-existent';
      const newPassword = 'newPassword123';
      const token = require('jsonwebtoken').sign(
        { sub: userId, purpose: 'reset' },
=======
    it("should throw NotFoundException if user not found", async () => {
      // Arrange
      const userId = "non-existent";
      const newPassword = "newPassword123";
      const token = require("jsonwebtoken").sign(
        { sub: userId, purpose: "reset" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        process.env.JWT_RESET_SECRET!,
      );

      userRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        NotFoundException,
      );
    });

<<<<<<< HEAD
    it('should throw UnauthorizedException for expired token', async () => {
      // Arrange
      const expiredToken = require('jsonwebtoken').sign(
        { sub: 'user-id', purpose: 'reset' },
        process.env.JWT_RESET_SECRET!,
        { expiresIn: '-1h' },
=======
    it("should throw UnauthorizedException for expired token", async () => {
      // Arrange
      const expiredToken = require("jsonwebtoken").sign(
        { sub: "user-id", purpose: "reset" },
        process.env.JWT_RESET_SECRET!,
        { expiresIn: "-1h" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );

      // Act & Assert
      await expect(
<<<<<<< HEAD
        service.resetPassword(expiredToken, 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for invalid purpose', async () => {
      // Arrange
      const token = require('jsonwebtoken').sign(
        { sub: 'user-id', purpose: 'wrong' },
=======
        service.resetPassword(expiredToken, "newPassword"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw BadRequestException for invalid purpose", async () => {
      // Arrange
      const token = require("jsonwebtoken").sign(
        { sub: "user-id", purpose: "wrong" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        process.env.JWT_RESET_SECRET!,
      );

      // Act & Assert
<<<<<<< HEAD
      await expect(
        service.resetPassword(token, 'newPassword'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});


=======
      await expect(service.resetPassword(token, "newPassword")).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
