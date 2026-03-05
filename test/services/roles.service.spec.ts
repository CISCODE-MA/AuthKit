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
import { RolesService } from '@services/roles.service';
import { RoleRepository } from '@repos/role.repository';
import { LoggerService } from '@services/logger.service';

describe('RolesService', () => {
=======
} from "@nestjs/common";
import { Types } from "mongoose";
import { RolesService } from "@services/roles.service";
import { RoleRepository } from "@repos/role.repository";
import { LoggerService } from "@services/logger.service";

describe("RolesService", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a role successfully', async () => {
      const dto = {
        name: 'Manager',
=======
  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a role successfully", async () => {
      const dto = {
        name: "Manager",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
    it('should create a role without permissions', async () => {
      const dto = { name: 'Viewer' };
=======
    it("should create a role without permissions", async () => {
      const dto = { name: "Viewer" };
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
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
=======
    it("should throw ConflictException if role already exists", async () => {
      const dto = { name: "Admin" };
      mockRoleRepository.findByName.mockResolvedValue({ name: "Admin" });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow("Role already exists");
    });

    it("should handle duplicate key error (11000)", async () => {
      const dto = { name: "Admin" };
      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockImplementation(() => {
        const error: any = new Error("Duplicate key");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        error.code = 11000;
        throw error;
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

<<<<<<< HEAD
    it('should handle unexpected errors', async () => {
      const dto = { name: 'Admin' };
      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockImplementation(() => {
        throw new Error('DB error');
=======
    it("should handle unexpected errors", async () => {
      const dto = { name: "Admin" };
      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockImplementation(() => {
        throw new Error("DB error");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
<<<<<<< HEAD
        'Role creation failed: DB error',
        expect.any(String),
        'RolesService',
=======
        "Role creation failed: DB error",
        expect.any(String),
        "RolesService",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });

<<<<<<< HEAD
  describe('list', () => {
    it('should return list of roles', async () => {
      const roles = [
        { _id: new Types.ObjectId(), name: 'Admin' },
        { _id: new Types.ObjectId(), name: 'User' },
=======
  describe("list", () => {
    it("should return list of roles", async () => {
      const roles = [
        { _id: new Types.ObjectId(), name: "Admin" },
        { _id: new Types.ObjectId(), name: "User" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      ];
      mockRoleRepository.list.mockResolvedValue(roles);

      const result = await service.list();

      expect(result).toEqual(roles);
      expect(mockRoleRepository.list).toHaveBeenCalled();
    });

<<<<<<< HEAD
    it('should handle list errors', async () => {
      mockRoleRepository.list.mockImplementation(() => {
        throw new Error('List failed');
=======
    it("should handle list errors", async () => {
      mockRoleRepository.list.mockImplementation(() => {
        throw new Error("List failed");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      await expect(service.list()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
<<<<<<< HEAD
        'Role list failed: List failed',
        expect.any(String),
        'RolesService',
=======
        "Role list failed: List failed",
        expect.any(String),
        "RolesService",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });

<<<<<<< HEAD
  describe('update', () => {
    it('should update a role successfully', async () => {
      const roleId = new Types.ObjectId().toString();
      const dto = {
        name: 'Updated Role',
=======
  describe("update", () => {
    it("should update a role successfully", async () => {
      const roleId = new Types.ObjectId().toString();
      const dto = {
        name: "Updated Role",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
    it('should update role name only', async () => {
      const roleId = new Types.ObjectId().toString();
      const dto = { name: 'Updated Role' };
=======
    it("should update role name only", async () => {
      const roleId = new Types.ObjectId().toString();
      const dto = { name: "Updated Role" };
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const updatedRole = {
        _id: new Types.ObjectId(roleId),
        name: dto.name,
      };

      mockRoleRepository.updateById.mockResolvedValue(updatedRole);

      const result = await service.update(roleId, dto);

      expect(result).toEqual(updatedRole);
      expect(mockRoleRepository.updateById).toHaveBeenCalledWith(roleId, dto);
    });

<<<<<<< HEAD
    it('should throw NotFoundException if role not found', async () => {
      const dto = { name: 'Updated' };
      mockRoleRepository.updateById.mockResolvedValue(null);

      await expect(service.update('non-existent', dto)).rejects.toThrow(
=======
    it("should throw NotFoundException if role not found", async () => {
      const dto = { name: "Updated" };
      mockRoleRepository.updateById.mockResolvedValue(null);

      await expect(service.update("non-existent", dto)).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        NotFoundException,
      );
    });

<<<<<<< HEAD
    it('should handle update errors', async () => {
      const dto = { name: 'Updated' };
      mockRoleRepository.updateById.mockImplementation(() => {
        throw new Error('Update failed');
      });

      await expect(service.update('role-id', dto)).rejects.toThrow(
=======
    it("should handle update errors", async () => {
      const dto = { name: "Updated" };
      mockRoleRepository.updateById.mockImplementation(() => {
        throw new Error("Update failed");
      });

      await expect(service.update("role-id", dto)).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
<<<<<<< HEAD
        'Role update failed: Update failed',
        expect.any(String),
        'RolesService',
=======
        "Role update failed: Update failed",
        expect.any(String),
        "RolesService",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });

<<<<<<< HEAD
  describe('delete', () => {
    it('should delete a role successfully', async () => {
      const roleId = new Types.ObjectId().toString();
      const deletedRole = { _id: new Types.ObjectId(roleId), name: 'Admin' };
=======
  describe("delete", () => {
    it("should delete a role successfully", async () => {
      const roleId = new Types.ObjectId().toString();
      const deletedRole = { _id: new Types.ObjectId(roleId), name: "Admin" };
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      mockRoleRepository.deleteById.mockResolvedValue(deletedRole);

      const result = await service.delete(roleId);

      expect(result).toEqual({ ok: true });
      expect(mockRoleRepository.deleteById).toHaveBeenCalledWith(roleId);
    });

<<<<<<< HEAD
    it('should throw NotFoundException if role not found', async () => {
      mockRoleRepository.deleteById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
=======
    it("should throw NotFoundException if role not found", async () => {
      mockRoleRepository.deleteById.mockResolvedValue(null);

      await expect(service.delete("non-existent")).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        NotFoundException,
      );
    });

<<<<<<< HEAD
    it('should handle deletion errors', async () => {
      mockRoleRepository.deleteById.mockImplementation(() => {
        throw new Error('Deletion failed');
      });

      await expect(service.delete('role-id')).rejects.toThrow(
=======
    it("should handle deletion errors", async () => {
      mockRoleRepository.deleteById.mockImplementation(() => {
        throw new Error("Deletion failed");
      });

      await expect(service.delete("role-id")).rejects.toThrow(
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
<<<<<<< HEAD
        'Role deletion failed: Deletion failed',
        expect.any(String),
        'RolesService',
=======
        "Role deletion failed: Deletion failed",
        expect.any(String),
        "RolesService",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });

<<<<<<< HEAD
  describe('setPermissions', () => {
    it('should set permissions successfully', async () => {
=======
  describe("setPermissions", () => {
    it("should set permissions successfully", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const roleId = new Types.ObjectId().toString();
      const perm1 = new Types.ObjectId();
      const perm2 = new Types.ObjectId();
      const permissionIds = [perm1.toString(), perm2.toString()];

      const updatedRole = {
        _id: new Types.ObjectId(roleId),
<<<<<<< HEAD
        name: 'Admin',
=======
        name: "Admin",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        permissions: [perm1, perm2],
      };

      mockRoleRepository.updateById.mockResolvedValue(updatedRole);

      const result = await service.setPermissions(roleId, permissionIds);

      expect(result).toEqual(updatedRole);
      expect(mockRoleRepository.updateById).toHaveBeenCalledWith(roleId, {
        permissions: expect.any(Array),
      });
    });

<<<<<<< HEAD
    it('should throw NotFoundException if role not found', async () => {
=======
    it("should throw NotFoundException if role not found", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const permId = new Types.ObjectId();
      mockRoleRepository.updateById.mockResolvedValue(null);

      await expect(
<<<<<<< HEAD
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
=======
        service.setPermissions("non-existent", [permId.toString()]),
      ).rejects.toThrow(NotFoundException);
    });

    it("should handle set permissions errors", async () => {
      const permId = new Types.ObjectId();
      mockRoleRepository.updateById.mockImplementation(() => {
        throw new Error("Update failed");
      });

      await expect(
        service.setPermissions("role-id", [permId.toString()]),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Set permissions failed: Update failed",
        expect.any(String),
        "RolesService",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
    });
  });
});
<<<<<<< HEAD


=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
