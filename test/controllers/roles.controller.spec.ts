import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { RolesController } from '@controllers/roles.controller';
import { RolesService } from '@services/roles.service';
import { CreateRoleDto } from '@dto/role/create-role.dto';
import { UpdateRoleDto, UpdateRolePermissionsDto } from '@dto/role/update-role.dto';
import { AdminGuard } from '@guards/admin.guard';
import { AuthenticateGuard } from '@guards/authenticate.guard';

describe('RolesController', () => {
  let controller: RolesController;
  let mockService: jest.Mocked<RolesService>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      setPermissions: jest.fn(),
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useValue: mockService }],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthenticateGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RolesController>(RolesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a role and return 201', async () => {
      const dto: CreateRoleDto = {
        name: 'editor',
      };
      const created = { _id: 'role-id', ...dto, permissions: [] };

      mockService.create.mockResolvedValue(created as any);

      await controller.create(dto, mockResponse as Response);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(created);
    });
  });

  describe('list', () => {
    it('should return all roles with 200', async () => {
      const roles = [
        { _id: 'r1', name: 'admin', permissions: [] },
        { _id: 'r2', name: 'user', permissions: [] },
      ];

      mockService.list.mockResolvedValue(roles as any);

      await controller.list(mockResponse as Response);

      expect(mockService.list).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(roles);
    });
  });

  describe('update', () => {
    it('should update a role and return 200', async () => {
      const dto: UpdateRoleDto = {
        name: 'editor-updated',
      };
      const updated = {
        _id: 'role-id',
        name: 'editor-updated',
        permissions: [],
      };

      mockService.update.mockResolvedValue(updated as any);

      await controller.update('role-id', dto, mockResponse as Response);

      expect(mockService.update).toHaveBeenCalledWith('role-id', dto);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updated);
    });
  });

  describe('delete', () => {
    it('should delete a role and return 200', async () => {
      const deleted = { ok: true };

      mockService.delete.mockResolvedValue(deleted as any);

      await controller.delete('role-id', mockResponse as Response);

      expect(mockService.delete).toHaveBeenCalledWith('role-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(deleted);
    });
  });

  describe('setPermissions', () => {
    it('should update role permissions and return 200', async () => {
      const dto: UpdateRolePermissionsDto = {
        permissions: ['perm-1', 'perm-2'],
      };
      const updated = {
        _id: 'role-id',
        name: 'editor',
        permissions: ['perm-1', 'perm-2'],
      };

      mockService.setPermissions.mockResolvedValue(updated as any);

      await controller.setPermissions('role-id', dto, mockResponse as Response);

      expect(mockService.setPermissions).toHaveBeenCalledWith('role-id', dto.permissions);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updated);
    });
  });
});


