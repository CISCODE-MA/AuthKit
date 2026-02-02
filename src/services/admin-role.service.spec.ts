import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { AdminRoleService } from './admin-role.service';
import { RoleRepository } from '@repos/role.repository';
import { LoggerService } from './logger.service';

describe('AdminRoleService', () => {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loadAdminRoleId', () => {
    it('should load and cache admin role ID successfully', async () => {
      const mockAdminRole = {
        _id: { toString: () => 'admin-role-id-123' },
        name: 'admin',
      };

      mockRoleRepository.findByName.mockResolvedValue(mockAdminRole);

      const result = await service.loadAdminRoleId();

      expect(result).toBe('admin-role-id-123');
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith('admin');
      expect(mockRoleRepository.findByName).toHaveBeenCalledTimes(1);
    });

    it('should return cached admin role ID on subsequent calls', async () => {
      const mockAdminRole = {
        _id: { toString: () => 'admin-role-id-123' },
        name: 'admin',
      };

      mockRoleRepository.findByName.mockResolvedValue(mockAdminRole);

      // First call
      const result1 = await service.loadAdminRoleId();
      expect(result1).toBe('admin-role-id-123');

      // Second call (should use cache)
      const result2 = await service.loadAdminRoleId();
      expect(result2).toBe('admin-role-id-123');

      // Repository should only be called once
      expect(mockRoleRepository.findByName).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when admin role not found', async () => {
      mockRoleRepository.findByName.mockResolvedValue(null);

      await expect(service.loadAdminRoleId()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.loadAdminRoleId()).rejects.toThrow(
        'System configuration error',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Admin role not found - seed data may be missing',
        'AdminRoleService',
      );
    });

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockRoleRepository.findByName.mockRejectedValue(error);

      await expect(service.loadAdminRoleId()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.loadAdminRoleId()).rejects.toThrow(
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
      mockRoleRepository.findByName.mockRejectedValue(error);

      await expect(service.loadAdminRoleId()).rejects.toThrow(error);
      await expect(service.loadAdminRoleId()).rejects.toThrow(
        'Custom config error',
      );
    });
  });
});
