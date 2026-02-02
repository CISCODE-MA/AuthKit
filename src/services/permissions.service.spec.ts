import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { PermissionsService } from './permissions.service';
import { PermissionRepository } from '@repos/permission.repository';
import { LoggerService } from './logger.service';

describe('PermissionsService', () => {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a permission successfully', async () => {
      const dto = { name: 'users:read', description: 'Read users' };
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
        error.code = 11000;
        throw error;
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should handle unexpected errors', async () => {
      const dto = { name: 'users:write' };
      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Permission creation failed: DB error',
        expect.any(String),
        'PermissionsService',
      );
    });
  });

  describe('list', () => {
    it('should return list of permissions', async () => {
      const permissions = [
        { _id: new Types.ObjectId(), name: 'users:read' },
        { _id: new Types.ObjectId(), name: 'users:write' },
      ];
      mockPermissionRepository.list.mockResolvedValue(permissions);

      const result = await service.list();

      expect(result).toEqual(permissions);
      expect(mockPermissionRepository.list).toHaveBeenCalled();
    });

    it('should handle list errors', async () => {
      mockPermissionRepository.list.mockImplementation(() => {
        throw new Error('List failed');
      });

      await expect(service.list()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Permission list failed: List failed',
        expect.any(String),
        'PermissionsService',
      );
    });
  });

  describe('update', () => {
    it('should update a permission successfully', async () => {
      const permId = new Types.ObjectId().toString();
      const dto = {
        name: 'users:manage',
        description: 'Full user management',
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

    it('should update permission name only', async () => {
      const permId = new Types.ObjectId().toString();
      const dto = { name: 'users:manage' };
      const updatedPermission = {
        _id: new Types.ObjectId(permId),
        name: dto.name,
      };

      mockPermissionRepository.updateById.mockResolvedValue(updatedPermission);

      const result = await service.update(permId, dto);

      expect(result).toEqual(updatedPermission);
    });

    it('should throw NotFoundException if permission not found', async () => {
      const dto = { name: 'users:manage' };
      mockPermissionRepository.updateById.mockResolvedValue(null);

      await expect(service.update('non-existent', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle update errors', async () => {
      const dto = { name: 'users:manage' };
      mockPermissionRepository.updateById.mockImplementation(() => {
        throw new Error('Update failed');
      });

      await expect(service.update('perm-id', dto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Permission update failed: Update failed',
        expect.any(String),
        'PermissionsService',
      );
    });
  });

  describe('delete', () => {
    it('should delete a permission successfully', async () => {
      const permId = new Types.ObjectId().toString();
      const deletedPermission = {
        _id: new Types.ObjectId(permId),
        name: 'users:read',
      };

      mockPermissionRepository.deleteById.mockResolvedValue(deletedPermission);

      const result = await service.delete(permId);

      expect(result).toEqual({ ok: true });
      expect(mockPermissionRepository.deleteById).toHaveBeenCalledWith(permId);
    });

    it('should throw NotFoundException if permission not found', async () => {
      mockPermissionRepository.deleteById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle deletion errors', async () => {
      mockPermissionRepository.deleteById.mockImplementation(() => {
        throw new Error('Deletion failed');
      });

      await expect(service.delete('perm-id')).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Permission deletion failed: Deletion failed',
        expect.any(String),
        'PermissionsService',
      );
    });
  });
});
