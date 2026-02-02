import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { RolesService } from '@services/roles.service';
import { RoleRepository } from '@repos/role.repository';
import { LoggerService } from '@services/logger.service';

describe('RolesService', () => {
  let service: RolesService;
  let mockRoleRepository: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockRoleRepository = {
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
        RolesService,
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a role successfully', async () => {
      const dto = {
        name: 'Manager',
        permissions: [new Types.ObjectId().toString()],
      };
      const expectedRole = {
        _id: new Types.ObjectId(),
        name: dto.name,
        permissions: dto.permissions.map((p) => new Types.ObjectId(p)),
      };

      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockResolvedValue(expectedRole);

      const result = await service.create(dto);

      expect(result).toEqual(expectedRole);
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(dto.name);
      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        permissions: expect.any(Array),
      });
    });

    it('should create a role without permissions', async () => {
      const dto = { name: 'Viewer' };
      const expectedRole = {
        _id: new Types.ObjectId(),
        name: dto.name,
        permissions: [],
      };

      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockResolvedValue(expectedRole);

      const result = await service.create(dto);

      expect(result).toEqual(expectedRole);
      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        permissions: [],
      });
    });

    it('should throw ConflictException if role already exists', async () => {
      const dto = { name: 'Admin' };
      mockRoleRepository.findByName.mockResolvedValue({ name: 'Admin' });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow('Role already exists');
    });

    it('should handle duplicate key error (11000)', async () => {
      const dto = { name: 'Admin' };
      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockImplementation(() => {
        const error: any = new Error('Duplicate key');
        error.code = 11000;
        throw error;
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should handle unexpected errors', async () => {
      const dto = { name: 'Admin' };
      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Role creation failed: DB error',
        expect.any(String),
        'RolesService',
      );
    });
  });

  describe('list', () => {
    it('should return list of roles', async () => {
      const roles = [
        { _id: new Types.ObjectId(), name: 'Admin' },
        { _id: new Types.ObjectId(), name: 'User' },
      ];
      mockRoleRepository.list.mockResolvedValue(roles);

      const result = await service.list();

      expect(result).toEqual(roles);
      expect(mockRoleRepository.list).toHaveBeenCalled();
    });

    it('should handle list errors', async () => {
      mockRoleRepository.list.mockImplementation(() => {
        throw new Error('List failed');
      });

      await expect(service.list()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Role list failed: List failed',
        expect.any(String),
        'RolesService',
      );
    });
  });

  describe('update', () => {
    it('should update a role successfully', async () => {
      const roleId = new Types.ObjectId().toString();
      const dto = {
        name: 'Updated Role',
        permissions: [new Types.ObjectId().toString()],
      };
      const updatedRole = {
        _id: new Types.ObjectId(roleId),
        name: dto.name,
        permissions: dto.permissions.map((p) => new Types.ObjectId(p)),
      };

      mockRoleRepository.updateById.mockResolvedValue(updatedRole);

      const result = await service.update(roleId, dto);

      expect(result).toEqual(updatedRole);
      expect(mockRoleRepository.updateById).toHaveBeenCalledWith(
        roleId,
        expect.objectContaining({
          name: dto.name,
          permissions: expect.any(Array),
        }),
      );
    });

    it('should update role name only', async () => {
      const roleId = new Types.ObjectId().toString();
      const dto = { name: 'Updated Role' };
      const updatedRole = {
        _id: new Types.ObjectId(roleId),
        name: dto.name,
      };

      mockRoleRepository.updateById.mockResolvedValue(updatedRole);

      const result = await service.update(roleId, dto);

      expect(result).toEqual(updatedRole);
      expect(mockRoleRepository.updateById).toHaveBeenCalledWith(roleId, dto);
    });

    it('should throw NotFoundException if role not found', async () => {
      const dto = { name: 'Updated' };
      mockRoleRepository.updateById.mockResolvedValue(null);

      await expect(service.update('non-existent', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle update errors', async () => {
      const dto = { name: 'Updated' };
      mockRoleRepository.updateById.mockImplementation(() => {
        throw new Error('Update failed');
      });

      await expect(service.update('role-id', dto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Role update failed: Update failed',
        expect.any(String),
        'RolesService',
      );
    });
  });

  describe('delete', () => {
    it('should delete a role successfully', async () => {
      const roleId = new Types.ObjectId().toString();
      const deletedRole = { _id: new Types.ObjectId(roleId), name: 'Admin' };

      mockRoleRepository.deleteById.mockResolvedValue(deletedRole);

      const result = await service.delete(roleId);

      expect(result).toEqual({ ok: true });
      expect(mockRoleRepository.deleteById).toHaveBeenCalledWith(roleId);
    });

    it('should throw NotFoundException if role not found', async () => {
      mockRoleRepository.deleteById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle deletion errors', async () => {
      mockRoleRepository.deleteById.mockImplementation(() => {
        throw new Error('Deletion failed');
      });

      await expect(service.delete('role-id')).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Role deletion failed: Deletion failed',
        expect.any(String),
        'RolesService',
      );
    });
  });

  describe('setPermissions', () => {
    it('should set permissions successfully', async () => {
      const roleId = new Types.ObjectId().toString();
      const perm1 = new Types.ObjectId();
      const perm2 = new Types.ObjectId();
      const permissionIds = [perm1.toString(), perm2.toString()];

      const updatedRole = {
        _id: new Types.ObjectId(roleId),
        name: 'Admin',
        permissions: [perm1, perm2],
      };

      mockRoleRepository.updateById.mockResolvedValue(updatedRole);

      const result = await service.setPermissions(roleId, permissionIds);

      expect(result).toEqual(updatedRole);
      expect(mockRoleRepository.updateById).toHaveBeenCalledWith(roleId, {
        permissions: expect.any(Array),
      });
    });

    it('should throw NotFoundException if role not found', async () => {
      const permId = new Types.ObjectId();
      mockRoleRepository.updateById.mockResolvedValue(null);

      await expect(
        service.setPermissions('non-existent', [permId.toString()]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle set permissions errors', async () => {
      const permId = new Types.ObjectId();
      mockRoleRepository.updateById.mockImplementation(() => {
        throw new Error('Update failed');
      });

      await expect(
        service.setPermissions('role-id', [permId.toString()]),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Set permissions failed: Update failed',
        expect.any(String),
        'RolesService',
      );
    });
  });
});


