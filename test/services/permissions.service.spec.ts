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
<<<<<<< HEAD
} from '@nestjs/common';
import { Types } from 'mongoose';
import { PermissionsService } from '@services/permissions.service';
import { PermissionRepository } from '@repos/permission.repository';
import { LoggerService } from '@services/logger.service';

describe('PermissionsService', () => {
=======
} from "@nestjs/common";
import { Types } from "mongoose";
import { PermissionsService } from "@services/permissions.service";
import { PermissionRepository } from "@repos/permission.repository";
import { LoggerService } from "@services/logger.service";

describe("PermissionsService", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  let service: PermissionsService;
  let mockPermissionRepository: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockPermissionRepository = {
      findByName: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
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
        PermissionsService,
        { provide: PermissionRepository, useValue: mockPermissionRepository },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

<<<<<<< HEAD
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a permission successfully', async () => {
      const dto = { name: 'users:read', description: 'Read users' };
=======
  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a permission successfully", async () => {
      const dto = { name: "users:read", description: "Read users" };
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const expectedPermission = {
        _id: new Types.ObjectId(),
        ...dto,
      };

      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockResolvedValue(expectedPermission);

      const result = await service.create(dto);

      expect(result).toEqual(expectedPermission);
      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith(
        dto.name,
      );
      expect(mockPermissionRepository.create).toHaveBeenCalledWith(dto);
    });

<<<<<<< HEAD
    it('should throw ConflictException if permission already exists', async () => {
      const dto = { name: 'users:write' };
      mockPermissionRepository.findByName.mockResolvedValue({ name: 'users:write' });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Permission already exists',
      );
    });

    it('should handle duplicate key error (11000)', async () => {
      const dto = { name: 'users:write' };
      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation(() => {
        const error: any = new Error('Duplicate key');
=======
    it("should throw ConflictException if permission already exists", async () => {
      const dto = { name: "users:write" };
      mockPermissionRepository.findByName.mockResolvedValue({
        name: "users:write",
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        "Permission already exists",
      );
    });

    it("should handle duplicate key error (11000)", async () => {
      const dto = { name: "users:write" };
      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation(() => {
        const error: any = new Error("Duplicate key");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        error.code = 11000;
        throw error;
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

<<<<<<< HEAD
    it('should handle unexpected errors', async () => {
      const dto = { name: 'users:write' };
      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation(() => {
        throw new Error('DB error');
=======
    it("should handle unexpected errors", async () => {
      const dto = { name: "users:write" };
      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation(() => {
        throw new Error("DB error");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
<<<<<<< HEAD
        'Permission creation failed: DB error',
        expect.any(String),
        'PermissionsService',
=======
        "Permission creation failed: DB error",
        expect.any(String),
        "PermissionsService",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });

<<<<<<< HEAD
  describe('list', () => {
    it('should return list of permissions', async () => {
      const permissions = [
        { _id: new Types.ObjectId(), name: 'users:read' },
        { _id: new Types.ObjectId(), name: 'users:write' },
=======
  describe("list", () => {
    it("should return list of permissions", async () => {
      const permissions = [
        { _id: new Types.ObjectId(), name: "users:read" },
        { _id: new Types.ObjectId(), name: "users:write" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      ];
      mockPermissionRepository.list.mockResolvedValue(permissions);

      const result = await service.list();

      expect(result).toEqual(permissions);
      expect(mockPermissionRepository.list).toHaveBeenCalled();
    });

<<<<<<< HEAD
    it('should handle list errors', async () => {
      mockPermissionRepository.list.mockImplementation(() => {
        throw new Error('List failed');
=======
    it("should handle list errors", async () => {
      mockPermissionRepository.list.mockImplementation(() => {
        throw new Error("List failed");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      await expect(service.list()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
<<<<<<< HEAD
        'Permission list failed: List failed',
        expect.any(String),
        'PermissionsService',
=======
        "Permission list failed: List failed",
        expect.any(String),
        "PermissionsService",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });

<<<<<<< HEAD
  describe('update', () => {
    it('should update a permission successfully', async () => {
      const permId = new Types.ObjectId().toString();
      const dto = {
        name: 'users:manage',
        description: 'Full user management',
=======
  describe("update", () => {
    it("should update a permission successfully", async () => {
      const permId = new Types.ObjectId().toString();
      const dto = {
        name: "users:manage",
        description: "Full user management",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };
      const updatedPermission = {
        _id: new Types.ObjectId(permId),
        ...dto,
      };

      mockPermissionRepository.updateById.mockResolvedValue(updatedPermission);

      const result = await service.update(permId, dto);

      expect(result).toEqual(updatedPermission);
      expect(mockPermissionRepository.updateById).toHaveBeenCalledWith(
        permId,
        dto,
      );
    });

<<<<<<< HEAD
    it('should update permission name only', async () => {
      const permId = new Types.ObjectId().toString();
      const dto = { name: 'users:manage' };
=======
    it("should update permission name only", async () => {
      const permId = new Types.ObjectId().toString();
      const dto = { name: "users:manage" };
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const updatedPermission = {
        _id: new Types.ObjectId(permId),
        name: dto.name,
      };

      mockPermissionRepository.updateById.mockResolvedValue(updatedPermission);

      const result = await service.update(permId, dto);

      expect(result).toEqual(updatedPermission);
    });

<<<<<<< HEAD
    it('should throw NotFoundException if permission not found', async () => {
      const dto = { name: 'users:manage' };
      mockPermissionRepository.updateById.mockResolvedValue(null);

      await expect(service.update('non-existent', dto)).rejects.toThrow(
=======
    it("should throw NotFoundException if permission not found", async () => {
      const dto = { name: "users:manage" };
      mockPermissionRepository.updateById.mockResolvedValue(null);

      await expect(service.update("non-existent", dto)).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        NotFoundException,
      );
    });

<<<<<<< HEAD
    it('should handle update errors', async () => {
      const dto = { name: 'users:manage' };
      mockPermissionRepository.updateById.mockImplementation(() => {
        throw new Error('Update failed');
      });

      await expect(service.update('perm-id', dto)).rejects.toThrow(
=======
    it("should handle update errors", async () => {
      const dto = { name: "users:manage" };
      mockPermissionRepository.updateById.mockImplementation(() => {
        throw new Error("Update failed");
      });

      await expect(service.update("perm-id", dto)).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
<<<<<<< HEAD
        'Permission update failed: Update failed',
        expect.any(String),
        'PermissionsService',
=======
        "Permission update failed: Update failed",
        expect.any(String),
        "PermissionsService",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });

<<<<<<< HEAD
  describe('delete', () => {
    it('should delete a permission successfully', async () => {
      const permId = new Types.ObjectId().toString();
      const deletedPermission = {
        _id: new Types.ObjectId(permId),
        name: 'users:read',
=======
  describe("delete", () => {
    it("should delete a permission successfully", async () => {
      const permId = new Types.ObjectId().toString();
      const deletedPermission = {
        _id: new Types.ObjectId(permId),
        name: "users:read",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      mockPermissionRepository.deleteById.mockResolvedValue(deletedPermission);

      const result = await service.delete(permId);

      expect(result).toEqual({ ok: true });
      expect(mockPermissionRepository.deleteById).toHaveBeenCalledWith(permId);
    });

<<<<<<< HEAD
    it('should throw NotFoundException if permission not found', async () => {
      mockPermissionRepository.deleteById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
=======
    it("should throw NotFoundException if permission not found", async () => {
      mockPermissionRepository.deleteById.mockResolvedValue(null);

      await expect(service.delete("non-existent")).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        NotFoundException,
      );
    });

<<<<<<< HEAD
    it('should handle deletion errors', async () => {
      mockPermissionRepository.deleteById.mockImplementation(() => {
        throw new Error('Deletion failed');
      });

      await expect(service.delete('perm-id')).rejects.toThrow(
=======
    it("should handle deletion errors", async () => {
      mockPermissionRepository.deleteById.mockImplementation(() => {
        throw new Error("Deletion failed");
      });

      await expect(service.delete("perm-id")).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
<<<<<<< HEAD
        'Permission deletion failed: Deletion failed',
        expect.any(String),
        'PermissionsService',
=======
        "Permission deletion failed: Deletion failed",
        expect.any(String),
        "PermissionsService",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });
});
<<<<<<< HEAD


=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
