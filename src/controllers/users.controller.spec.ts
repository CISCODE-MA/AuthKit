import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { UsersController } from './users.controller';
import { UsersService } from '@services/users.service';
import { RegisterDto } from '@dto/auth/register.dto';
import { UpdateUserRolesDto } from '@dto/auth/update-user-role.dto';
import { AdminGuard } from '@guards/admin.guard';
import { AuthenticateGuard } from '@guards/authenticate.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let mockService: jest.Mocked<UsersService>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      list: jest.fn(),
      setBan: jest.fn(),
      delete: jest.fn(),
      updateRoles: jest.fn(),
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthenticateGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user and return 201', async () => {
      const dto: RegisterDto = {
        fullname: { fname: 'Test', lname: 'User' },
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };
      const created = {
        id: 'user-id',
        email: dto.email,
      };

      mockService.create.mockResolvedValue(created as any);

      await controller.create(dto, mockResponse as Response);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(created);
    });
  });

  describe('list', () => {
    it('should return all users with 200', async () => {
      const users = [
        { _id: 'u1', email: 'user1@test.com', username: 'user1', roles: [] },
        { _id: 'u2', email: 'user2@test.com', username: 'user2', roles: [] },
      ];

      mockService.list.mockResolvedValue(users as any);

      await controller.list({}, mockResponse as Response);

      expect(mockService.list).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });

    it('should filter users by email', async () => {
      const query = { email: 'test@example.com' };
      const users = [{ _id: 'u1', email: 'test@example.com', username: 'test', roles: [] }];

      mockService.list.mockResolvedValue(users as any);

      await controller.list(query, mockResponse as Response);

      expect(mockService.list).toHaveBeenCalledWith(query);
      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });

    it('should filter users by username', async () => {
      const query = { username: 'testuser' };
      const users = [{ _id: 'u1', email: 'test@test.com', username: 'testuser', roles: [] }];

      mockService.list.mockResolvedValue(users as any);

      await controller.list(query, mockResponse as Response);

      expect(mockService.list).toHaveBeenCalledWith(query);
      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });
  });

  describe('ban', () => {
    it('should ban a user and return 200', async () => {
      const bannedUser = {
        id: 'user-id',
        isBanned: true,
      };

      mockService.setBan.mockResolvedValue(bannedUser as any);

      await controller.ban('user-id', mockResponse as Response);

      expect(mockService.setBan).toHaveBeenCalledWith('user-id', true);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(bannedUser);
    });
  });

  describe('unban', () => {
    it('should unban a user and return 200', async () => {
      const unbannedUser = {
        id: 'user-id',
        isBanned: false,
      };

      mockService.setBan.mockResolvedValue(unbannedUser as any);

      await controller.unban('user-id', mockResponse as Response);

      expect(mockService.setBan).toHaveBeenCalledWith('user-id', false);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(unbannedUser);
    });
  });

  describe('delete', () => {
    it('should delete a user and return 200', async () => {
      const deleted = { ok: true };

      mockService.delete.mockResolvedValue(deleted as any);

      await controller.delete('user-id', mockResponse as Response);

      expect(mockService.delete).toHaveBeenCalledWith('user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(deleted);
    });
  });

  describe('updateRoles', () => {
    it('should update user roles and return 200', async () => {
      const dto: UpdateUserRolesDto = {
        roles: ['role-1', 'role-2'],
      };
      const updated = {
        id: 'user-id',
        roles: [] as any,
      };

      mockService.updateRoles.mockResolvedValue(updated as any);

      await controller.updateRoles('user-id', dto, mockResponse as Response);

      expect(mockService.updateRoles).toHaveBeenCalledWith('user-id', dto.roles);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updated);
    });
  });
});
