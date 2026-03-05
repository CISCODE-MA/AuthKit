<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { AdminRoleService } from '@services/admin-role.service';
import { RoleRepository } from '@repos/role.repository';
import { LoggerService } from '@services/logger.service';

describe('AdminRoleService', () => {
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { AdminRoleService } from "@services/admin-role.service";
import { RoleRepository } from "@repos/role.repository";
import { LoggerService } from "@services/logger.service";

describe("AdminRoleService", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  let service: AdminRoleService;
  let mockRoleRepository: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockRoleRepository = {
      findByName: jest.fn(),
    };

    mockLogger = {
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRoleService,
        {
          provide: RoleRepository,
          useValue: mockRoleRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<AdminRoleService>(AdminRoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

<<<<<<< HEAD
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loadAdminRoleId', () => {
    it('should load and cache admin role ID successfully', async () => {
      const mockAdminRole = {
        _id: { toString: () => 'admin-role-id-123' },
        name: 'admin',
=======
  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("loadAdminRoleId", () => {
    it("should load and cache admin role ID successfully", async () => {
      const mockAdminRole = {
        _id: { toString: () => "admin-role-id-123" },
        name: "admin",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      mockRoleRepository.findByName.mockResolvedValue(mockAdminRole);

      const result = await service.loadAdminRoleId();

<<<<<<< HEAD
      expect(result).toBe('admin-role-id-123');
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith('admin');
      expect(mockRoleRepository.findByName).toHaveBeenCalledTimes(1);
    });

    it('should return cached admin role ID on subsequent calls', async () => {
      const mockAdminRole = {
        _id: { toString: () => 'admin-role-id-123' },
        name: 'admin',
=======
      expect(result).toBe("admin-role-id-123");
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith("admin");
      expect(mockRoleRepository.findByName).toHaveBeenCalledTimes(1);
    });

    it("should return cached admin role ID on subsequent calls", async () => {
      const mockAdminRole = {
        _id: { toString: () => "admin-role-id-123" },
        name: "admin",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      mockRoleRepository.findByName.mockResolvedValue(mockAdminRole);

      // First call
      const result1 = await service.loadAdminRoleId();
<<<<<<< HEAD
      expect(result1).toBe('admin-role-id-123');

      // Second call (should use cache)
      const result2 = await service.loadAdminRoleId();
      expect(result2).toBe('admin-role-id-123');
=======
      expect(result1).toBe("admin-role-id-123");

      // Second call (should use cache)
      const result2 = await service.loadAdminRoleId();
      expect(result2).toBe("admin-role-id-123");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      // Repository should only be called once
      expect(mockRoleRepository.findByName).toHaveBeenCalledTimes(1);
    });

<<<<<<< HEAD
    it('should throw InternalServerErrorException when admin role not found', async () => {
=======
    it("should throw InternalServerErrorException when admin role not found", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      mockRoleRepository.findByName.mockResolvedValue(null);

      await expect(service.loadAdminRoleId()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.loadAdminRoleId()).rejects.toThrow(
<<<<<<< HEAD
        'System configuration error',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Admin role not found - seed data may be missing',
        'AdminRoleService',
      );
    });

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed');
=======
        "System configuration error",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Admin role not found - seed data may be missing",
        "AdminRoleService",
      );
    });

    it("should handle repository errors gracefully", async () => {
      const error = new Error("Database connection failed");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      mockRoleRepository.findByName.mockRejectedValue(error);

      await expect(service.loadAdminRoleId()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.loadAdminRoleId()).rejects.toThrow(
<<<<<<< HEAD
        'Failed to verify admin permissions',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to load admin role: Database connection failed',
        expect.any(String),
        'AdminRoleService',
      );
    });

    it('should rethrow InternalServerErrorException without wrapping', async () => {
      const error = new InternalServerErrorException('Custom config error');
=======
        "Failed to verify admin permissions",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to load admin role: Database connection failed",
        expect.any(String),
        "AdminRoleService",
      );
    });

    it("should rethrow InternalServerErrorException without wrapping", async () => {
      const error = new InternalServerErrorException("Custom config error");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      mockRoleRepository.findByName.mockRejectedValue(error);

      await expect(service.loadAdminRoleId()).rejects.toThrow(error);
      await expect(service.loadAdminRoleId()).rejects.toThrow(
<<<<<<< HEAD
        'Custom config error',
=======
        "Custom config error",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });
});
<<<<<<< HEAD


=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
