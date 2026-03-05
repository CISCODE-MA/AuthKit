<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AuthService } from '@services/auth.service';
import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { PermissionRepository } from '@repos/permission.repository';
import { MailService } from '@services/mail.service';
import { LoggerService } from '@services/logger.service';

describe('RBAC Integration - Login & JWT with Roles/Permissions', () => {
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import * as jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { AuthService } from "@services/auth.service";
import { UserRepository } from "@repos/user.repository";
import { RoleRepository } from "@repos/role.repository";
import { PermissionRepository } from "@repos/permission.repository";
import { MailService } from "@services/mail.service";
import { LoggerService } from "@services/logger.service";

describe("RBAC Integration - Login & JWT with Roles/Permissions", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  let authService: AuthService;
  let userRepo: jest.Mocked<UserRepository>;
  let roleRepo: jest.Mocked<RoleRepository>;
  let permRepo: jest.Mocked<PermissionRepository>;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    // Create mock implementations
    const mockUserRepo = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findByUsername: jest.fn(),
      findByPhone: jest.fn(),
      findById: jest.fn(),
      findByIdWithRolesAndPermissions: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateById: jest.fn(),
      save: jest.fn(),
      deleteById: jest.fn(),
      list: jest.fn(),
    };

    const mockRoleRepo = {
      findByName: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateById: jest.fn(),
    };

    const mockPermissionRepo = {
      findByName: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateById: jest.fn(),
    };

    const mockMailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue({}),
      sendPasswordResetEmail: jest.fn().mockResolvedValue({}),
    };

    const mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    // Setup environment variables for tests
<<<<<<< HEAD
    process.env.JWT_SECRET = 'test-secret-key-12345';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-12345';
    process.env.JWT_EMAIL_SECRET = 'test-email-secret-key-12345';
    process.env.JWT_RESET_SECRET = 'test-reset-secret-key-12345';
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';
    process.env.JWT_EMAIL_TOKEN_EXPIRES_IN = '1d';
    process.env.JWT_RESET_TOKEN_EXPIRES_IN = '1h';
=======
    process.env.JWT_SECRET = "test-secret-key-12345";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key-12345";
    process.env.JWT_EMAIL_SECRET = "test-email-secret-key-12345";
    process.env.JWT_RESET_SECRET = "test-reset-secret-key-12345";
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

    authService = module.get<AuthService>(AuthService);
    userRepo = module.get(UserRepository) as jest.Mocked<UserRepository>;
    roleRepo = module.get(RoleRepository) as jest.Mocked<RoleRepository>;
<<<<<<< HEAD
    permRepo = module.get(PermissionRepository) as jest.Mocked<PermissionRepository>;
=======
    permRepo = module.get(
      PermissionRepository,
    ) as jest.Mocked<PermissionRepository>;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
    mailService = module.get(MailService) as jest.Mocked<MailService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TEST 1: Login with user that has NO roles
   * Expected: JWT should have empty roles array
   */
<<<<<<< HEAD
  describe('Login - User without roles', () => {
    it('should return empty roles/permissions in JWT when user has no roles', async () => {
=======
  describe("Login - User without roles", () => {
    it("should return empty roles/permissions in JWT when user has no roles", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      // Arrange
      const userId = new Types.ObjectId().toString();
      const userWithNoRoles = {
        _id: userId,
<<<<<<< HEAD
        email: 'user@example.com',
        password: '$2a$10$validHashedPassword',
=======
        email: "user@example.com",
        password: "$2a$10$validHashedPassword",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        isVerified: true,
        isBanned: false,
        roles: [], // NO ROLES
      };

      userRepo.findById.mockResolvedValue(userWithNoRoles as any);
      roleRepo.findByIds.mockResolvedValue([]);
      permRepo.findByIds.mockResolvedValue([]);

      // Act
      const { accessToken } = await authService.issueTokensForUser(userId);

      // Decode JWT
      const decoded = jwt.decode(accessToken) as any;

      // Assert
      expect(decoded.sub).toBe(userId);
      expect(Array.isArray(decoded.roles)).toBe(true);
      expect(decoded.roles).toHaveLength(0);
      expect(Array.isArray(decoded.permissions)).toBe(true);
      expect(decoded.permissions).toHaveLength(0);
    });
  });

  /**
   * TEST 2: Login with user that has ADMIN role with permissions
   * Expected: JWT should include role name and all permissions from that role
   */
<<<<<<< HEAD
  describe('Login - Admin user with roles and permissions', () => {
    it('should include role names and permissions in JWT when user has admin role', async () => {
=======
  describe("Login - Admin user with roles and permissions", () => {
    it("should include role names and permissions in JWT when user has admin role", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      // Arrange
      const userId = new Types.ObjectId().toString();
      const adminRoleId = new Types.ObjectId();

      // Mock permissions
      const readPermId = new Types.ObjectId();
      const writePermId = new Types.ObjectId();
      const deletePermId = new Types.ObjectId();

      // Mock admin role with permission IDs
      const adminRole = {
        _id: adminRoleId,
<<<<<<< HEAD
        name: 'admin',
=======
        name: "admin",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        permissions: [readPermId, writePermId, deletePermId],
      };

      // Mock user with admin role ID
      const adminUser = {
        _id: userId,
<<<<<<< HEAD
        email: 'admin@example.com',
        password: '$2a$10$validHashedPassword',
=======
        email: "admin@example.com",
        password: "$2a$10$validHashedPassword",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        isVerified: true,
        isBanned: false,
        roles: [adminRoleId],
      };

      // Mock permission objects
      const permissionObjects = [
<<<<<<< HEAD
        { _id: readPermId, name: 'users:read' },
        { _id: writePermId, name: 'users:write' },
        { _id: deletePermId, name: 'users:delete' },
=======
        { _id: readPermId, name: "users:read" },
        { _id: writePermId, name: "users:write" },
        { _id: deletePermId, name: "users:delete" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      ];

      userRepo.findById.mockResolvedValue(adminUser as any);
      roleRepo.findByIds.mockResolvedValue([adminRole] as any);
      permRepo.findByIds.mockResolvedValue(permissionObjects as any);

      // Act
      const { accessToken } = await authService.issueTokensForUser(userId);

      // Decode JWT
      const decoded = jwt.decode(accessToken) as any;

      // Assert
      expect(decoded.sub).toBe(userId);
<<<<<<< HEAD
      
      // Check roles
      expect(Array.isArray(decoded.roles)).toBe(true);
      expect(decoded.roles).toContain('admin');
=======

      // Check roles
      expect(Array.isArray(decoded.roles)).toBe(true);
      expect(decoded.roles).toContain("admin");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(decoded.roles).toHaveLength(1);

      // Check permissions
      expect(Array.isArray(decoded.permissions)).toBe(true);
<<<<<<< HEAD
      expect(decoded.permissions).toContain('users:read');
      expect(decoded.permissions).toContain('users:write');
      expect(decoded.permissions).toContain('users:delete');
=======
      expect(decoded.permissions).toContain("users:read");
      expect(decoded.permissions).toContain("users:write");
      expect(decoded.permissions).toContain("users:delete");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(decoded.permissions).toHaveLength(3);
    });
  });

  /**
   * TEST 3: Login with user that has multiple roles
   * Expected: JWT should include all role names and all permissions from all roles
   */
<<<<<<< HEAD
  describe('Login - User with multiple roles', () => {
    it('should include all role names and permissions from multiple roles in JWT', async () => {
=======
  describe("Login - User with multiple roles", () => {
    it("should include all role names and permissions from multiple roles in JWT", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      // Arrange
      const userId = new Types.ObjectId().toString();
      const editorRoleId = new Types.ObjectId();
      const moderatorRoleId = new Types.ObjectId();

      // Mock permission IDs
      const articlesReadPermId = new Types.ObjectId();
      const articlesWritePermId = new Types.ObjectId();
      const articlesDeletePermId = new Types.ObjectId();

      // Mock roles with permission IDs
      const editorRole = {
        _id: editorRoleId,
<<<<<<< HEAD
        name: 'editor',
=======
        name: "editor",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        permissions: [articlesReadPermId, articlesWritePermId],
      };

      const moderatorRole = {
        _id: moderatorRoleId,
<<<<<<< HEAD
        name: 'moderator',
=======
        name: "moderator",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        permissions: [articlesReadPermId, articlesDeletePermId],
      };

      // Mock user with multiple roles
      const userWithMultipleRoles = {
        _id: userId,
<<<<<<< HEAD
        email: 'user@example.com',
        password: '$2a$10$validHashedPassword',
=======
        email: "user@example.com",
        password: "$2a$10$validHashedPassword",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        isVerified: true,
        isBanned: false,
        roles: [editorRoleId, moderatorRoleId],
      };

      // Mock permission objects
      const permissionObjects = [
<<<<<<< HEAD
        { _id: articlesReadPermId, name: 'articles:read' },
        { _id: articlesWritePermId, name: 'articles:write' },
        { _id: articlesDeletePermId, name: 'articles:delete' },
=======
        { _id: articlesReadPermId, name: "articles:read" },
        { _id: articlesWritePermId, name: "articles:write" },
        { _id: articlesDeletePermId, name: "articles:delete" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      ];

      userRepo.findById.mockResolvedValue(userWithMultipleRoles as any);
      roleRepo.findByIds.mockResolvedValue([editorRole, moderatorRole] as any);
      permRepo.findByIds.mockResolvedValue(permissionObjects as any);

      // Act
      const { accessToken } = await authService.issueTokensForUser(userId);

      // Decode JWT
      const decoded = jwt.decode(accessToken) as any;

      // Assert
      expect(decoded.sub).toBe(userId);

      // Check roles
      expect(Array.isArray(decoded.roles)).toBe(true);
<<<<<<< HEAD
      expect(decoded.roles).toContain('editor');
      expect(decoded.roles).toContain('moderator');
=======
      expect(decoded.roles).toContain("editor");
      expect(decoded.roles).toContain("moderator");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(decoded.roles).toHaveLength(2);

      // Check permissions (should include unique permissions from all roles)
      expect(Array.isArray(decoded.permissions)).toBe(true);
<<<<<<< HEAD
      expect(decoded.permissions).toContain('articles:read');
      expect(decoded.permissions).toContain('articles:write');
      expect(decoded.permissions).toContain('articles:delete');
=======
      expect(decoded.permissions).toContain("articles:read");
      expect(decoded.permissions).toContain("articles:write");
      expect(decoded.permissions).toContain("articles:delete");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      // Should have 3 unique permissions (articles:read appears in both but counted once)
      expect(decoded.permissions).toHaveLength(3);
    });
  });

  /**
   * TEST 4: JWT structure validation
   * Expected: JWT should have correct structure with all required claims
   */
<<<<<<< HEAD
  describe('JWT Structure', () => {
    it('should have correct JWT structure with required claims', async () => {
=======
  describe("JWT Structure", () => {
    it("should have correct JWT structure with required claims", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      // Arrange
      const userId = new Types.ObjectId().toString();
      const user = {
        _id: userId,
<<<<<<< HEAD
        email: 'test@example.com',
        password: '$2a$10$validHashedPassword',
=======
        email: "test@example.com",
        password: "$2a$10$validHashedPassword",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        isVerified: true,
        isBanned: false,
        roles: [],
      };

      userRepo.findById.mockResolvedValue(user as any);
      roleRepo.findByIds.mockResolvedValue([]);
      permRepo.findByIds.mockResolvedValue([]);

      // Act
      const { accessToken } = await authService.issueTokensForUser(userId);

      // Decode JWT header and payload
<<<<<<< HEAD
      const [header, payload, signature] = accessToken.split('.');
      const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString());
      const decodedPayload = jwt.decode(accessToken) as any;

      // Assert header
      expect(decodedHeader.alg).toBe('HS256');
      expect(decodedHeader.typ).toBe('JWT');

      // Assert payload
      expect(decodedPayload.sub).toBe(userId);
      expect(typeof decodedPayload.roles).toBe('object');
      expect(typeof decodedPayload.permissions).toBe('object');
      expect(typeof decodedPayload.iat).toBe('number'); // issued at
      expect(typeof decodedPayload.exp).toBe('number'); // expiration
=======
      const [header, payload, signature] = accessToken.split(".");
      const decodedHeader = JSON.parse(
        Buffer.from(header, "base64").toString(),
      );
      const decodedPayload = jwt.decode(accessToken) as any;

      // Assert header
      expect(decodedHeader.alg).toBe("HS256");
      expect(decodedHeader.typ).toBe("JWT");

      // Assert payload
      expect(decodedPayload.sub).toBe(userId);
      expect(typeof decodedPayload.roles).toBe("object");
      expect(typeof decodedPayload.permissions).toBe("object");
      expect(typeof decodedPayload.iat).toBe("number"); // issued at
      expect(typeof decodedPayload.exp).toBe("number"); // expiration
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
    });
  });

  /**
   * TEST 5: User role update - when user gets new role after login
   * Expected: New JWT should reflect updated roles
   */
<<<<<<< HEAD
  describe('JWT Update - When user role changes', () => {
    it('should return different roles/permissions in new JWT after user role change', async () => {
=======
  describe("JWT Update - When user role changes", () => {
    it("should return different roles/permissions in new JWT after user role change", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      // Arrange
      const userId = new Types.ObjectId().toString();

      // First JWT - user with no roles
      const userNoRoles = {
        _id: userId,
<<<<<<< HEAD
        email: 'test@example.com',
        password: '$2a$10$validHashedPassword',
=======
        email: "test@example.com",
        password: "$2a$10$validHashedPassword",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        isVerified: true,
        isBanned: false,
        roles: [],
      };

      userRepo.findById.mockResolvedValue(userNoRoles as any);
      roleRepo.findByIds.mockResolvedValue([]);
      permRepo.findByIds.mockResolvedValue([]);

      const firstToken = (await authService.issueTokensForUser(userId))
        .accessToken;
      const firstDecoded = jwt.decode(firstToken) as any;

      // User gets admin role assigned
      const adminRoleId = new Types.ObjectId();
      const readPermId = new Types.ObjectId();
      const writePermId = new Types.ObjectId();

      const adminRole = {
        _id: adminRoleId,
<<<<<<< HEAD
        name: 'admin',
=======
        name: "admin",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        permissions: [readPermId, writePermId],
      };

      const userWithRole = {
        _id: userId,
<<<<<<< HEAD
        email: 'test@example.com',
        password: '$2a$10$validHashedPassword',
=======
        email: "test@example.com",
        password: "$2a$10$validHashedPassword",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        isVerified: true,
        isBanned: false,
        roles: [adminRoleId],
      };

      const permissionObjects = [
<<<<<<< HEAD
        { _id: readPermId, name: 'users:read' },
        { _id: writePermId, name: 'users:write' },
=======
        { _id: readPermId, name: "users:read" },
        { _id: writePermId, name: "users:write" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      ];

      userRepo.findById.mockResolvedValue(userWithRole as any);
      roleRepo.findByIds.mockResolvedValue([adminRole] as any);
      permRepo.findByIds.mockResolvedValue(permissionObjects as any);

      // Second JWT - user with admin role
      const secondToken = (await authService.issueTokensForUser(userId))
        .accessToken;
      const secondDecoded = jwt.decode(secondToken) as any;

      // Assert
      expect(firstDecoded.roles).toHaveLength(0);
      expect(firstDecoded.permissions).toHaveLength(0);

      expect(secondDecoded.roles).toHaveLength(1);
<<<<<<< HEAD
      expect(secondDecoded.roles).toContain('admin');
      expect(secondDecoded.permissions).toHaveLength(2);
      expect(secondDecoded.permissions).toContain('users:read');
      expect(secondDecoded.permissions).toContain('users:write');
=======
      expect(secondDecoded.roles).toContain("admin");
      expect(secondDecoded.permissions).toHaveLength(2);
      expect(secondDecoded.permissions).toContain("users:read");
      expect(secondDecoded.permissions).toContain("users:write");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
    });
  });
});
