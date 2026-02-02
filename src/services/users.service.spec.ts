import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { LoggerService } from './logger.service';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

jest.mock('bcryptjs');
jest.mock('@utils/helper', () => ({
  generateUsernameFromName: jest.fn(
    (fname, lname) => `${fname}.${lname}`.toLowerCase(),
  ),
}));

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: any;
  let mockRoleRepository: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findByPhone: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    mockRoleRepository = {
      findByIds: jest.fn(),
    };

    mockLogger = {
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
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

    service = module.get<UsersService>(UsersService);

    // Default bcrypt mocks
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validDto: any = {
      email: 'test@example.com',
      fullname: { fname: 'John', lname: 'Doe' },
      username: 'johndoe',
      password: 'password123',
      phoneNumber: '+1234567890',
    };

    it('should create a user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue(null);

      const mockUser = {
        _id: new Types.ObjectId(),
        email: validDto.email,
      };
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(validDto);

      expect(result).toEqual({
        id: mockUser._id,
        email: mockUser.email,
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullname: validDto.fullname,
          username: validDto.username,
          email: validDto.email,
          password: 'hashed-password',
          isVerified: true,
          isBanned: false,
        }),
      );
    });

    it('should generate username from fullname if not provided', async () => {
      const dtoWithoutUsername = { ...validDto };
      delete dtoWithoutUsername.username;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        _id: new Types.ObjectId(),
        email: validDto.email,
      });

      await service.create(dtoWithoutUsername);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'john.doe',
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ _id: 'existing' });
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue(null);

      await expect(service.create(validDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(validDto)).rejects.toThrow(
        'An account with these credentials already exists',
      );
    });

    it('should throw ConflictException if username already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue({ _id: 'existing' });
      mockUserRepository.findByPhone.mockResolvedValue(null);

      await expect(service.create(validDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if phone already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue({ _id: 'existing' });

      await expect(service.create(validDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle bcrypt hashing errors', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue(null);

      (bcrypt.hash as jest.Mock).mockRejectedValue(
        new Error('Hashing failed'),
      );

      await expect(service.create(validDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.create(validDto)).rejects.toThrow(
        'User creation failed',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Password hashing failed: Hashing failed',
        expect.any(String),
        'UsersService',
      );
    });

    it('should handle duplicate key error (11000)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue(null);

      const duplicateError: any = new Error('Duplicate key');
      duplicateError.code = 11000;
      mockUserRepository.create.mockRejectedValue(duplicateError);

      await expect(service.create(validDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle unexpected errors', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue(null);

      mockUserRepository.create.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(service.create(validDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'User creation failed: Unexpected error',
        expect.any(String),
        'UsersService',
      );
    });
  });

  describe('list', () => {
    it('should return list of users with filter', async () => {
      const mockUsers = [
        { _id: '1', email: 'user1@example.com' },
        { _id: '2', email: 'user2@example.com' },
      ];

      mockUserRepository.list.mockResolvedValue(mockUsers);

      const filter = { email: 'user@example.com' };
      const result = await service.list(filter);

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.list).toHaveBeenCalledWith(filter);
    });

    it('should handle list errors', async () => {
      mockUserRepository.list.mockImplementation(() => {
        throw new Error('List failed');
      });

      await expect(service.list({})).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'User list failed: List failed',
        expect.any(String),
        'UsersService',
      );
    });
  });

  describe('setBan', () => {
    it('should ban a user successfully', async () => {
      const userId = new Types.ObjectId();
      const mockUser = {
        _id: userId,
        isBanned: true,
      };

      mockUserRepository.updateById.mockResolvedValue(mockUser);

      const result = await service.setBan(userId.toString(), true);

      expect(result).toEqual({
        id: mockUser._id,
        isBanned: true,
      });
      expect(mockUserRepository.updateById).toHaveBeenCalledWith(userId.toString(), {
        isBanned: true,
      });
    });

    it('should unban a user successfully', async () => {
      const userId = new Types.ObjectId();
      const mockUser = {
        _id: userId,
        isBanned: false,
      };

      mockUserRepository.updateById.mockResolvedValue(mockUser);

      const result = await service.setBan(userId.toString(), false);

      expect(result).toEqual({
        id: mockUser._id,
        isBanned: false,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.updateById.mockResolvedValue(null);

      await expect(service.setBan('non-existent', true)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.setBan('non-existent', true)).rejects.toThrow(
        'User not found',
      );
    });

    it('should handle update errors', async () => {
      mockUserRepository.updateById.mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(service.setBan('user-id', true)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.setBan('user-id', true)).rejects.toThrow(
        'Failed to update user ban status',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Set ban status failed: Update failed',
        expect.any(String),
        'UsersService',
      );
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      const userId = 'user-id-123';
      mockUserRepository.deleteById.mockResolvedValue({ _id: userId });

      const result = await service.delete(userId);

      expect(result).toEqual({ ok: true });
      expect(mockUserRepository.deleteById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.deleteById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete('non-existent')).rejects.toThrow(
        'User not found',
      );
    });

    it('should handle deletion errors', async () => {
      mockUserRepository.deleteById.mockRejectedValue(
        new Error('Delete failed'),
      );

      await expect(service.delete('user-id')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.delete('user-id')).rejects.toThrow(
        'Failed to delete user',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'User deletion failed: Delete failed',
        expect.any(String),
        'UsersService',
      );
    });
  });

  describe('updateRoles', () => {
    it('should update user roles successfully', async () => {
      const userId = new Types.ObjectId();
      const role1 = new Types.ObjectId();
      const role2 = new Types.ObjectId();
      const roleIds = [role1.toString(), role2.toString()];
      const existingRoles = [
        { _id: role1, name: 'Admin' },
        { _id: role2, name: 'User' },
      ];

      mockRoleRepository.findByIds.mockResolvedValue(existingRoles);

      const mockUser = {
        _id: userId,
        roles: [role1, role2],
      };

      mockUserRepository.updateById.mockResolvedValue(mockUser);

      const result = await service.updateRoles(userId.toString(), roleIds);

      expect(result).toEqual({
        id: mockUser._id,
        roles: mockUser.roles,
      });
      expect(mockRoleRepository.findByIds).toHaveBeenCalledWith(roleIds);
      expect(mockUserRepository.updateById).toHaveBeenCalledWith(userId.toString(), {
        roles: expect.any(Array),
      });
    });

    it('should throw NotFoundException if one or more roles not found', async () => {
      const role1 = new Types.ObjectId();
      const role2 = new Types.ObjectId();
      const role3 = new Types.ObjectId();
      const roleIds = [role1.toString(), role2.toString(), role3.toString()];
      mockRoleRepository.findByIds.mockResolvedValue([
        { _id: role1 },
        { _id: role2 },
        // Missing role3
      ]);

      await expect(service.updateRoles('user-id', roleIds)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateRoles('user-id', roleIds)).rejects.toThrow(
        'One or more roles not found',
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const role1 = new Types.ObjectId();
      const role2 = new Types.ObjectId();
      mockRoleRepository.findByIds.mockResolvedValue([
        { _id: role1 },
        { _id: role2 },
      ]);
      mockUserRepository.updateById.mockResolvedValue(null);

      await expect(
        service.updateRoles('non-existent', [role1.toString(), role2.toString()]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle update errors', async () => {
      const role1 = new Types.ObjectId();
      mockRoleRepository.findByIds.mockResolvedValue([{ _id: role1 }]);
      mockUserRepository.updateById.mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(service.updateRoles('user-id', [role1.toString()])).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Update user roles failed: Update failed',
        expect.any(String),
        'UsersService',
      );
    });
  });
});
