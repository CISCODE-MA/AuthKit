import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { RoleRepository } from '@repos/role.repository';
import { PermissionRepository } from '@repos/permission.repository';
import { Types } from 'mongoose';

describe('SeedService', () => {
  let service: SeedService;
  let mockRoleRepository: any;
  let mockPermissionRepository: any;

  beforeEach(async () => {
    mockRoleRepository = {
      findByName: jest.fn(),
      create: jest.fn(),
    };

    mockPermissionRepository = {
      findByName: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: RoleRepository,
          useValue: mockRoleRepository,
        },
        {
          provide: PermissionRepository,
          useValue: mockPermissionRepository,
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);

    // Mock console.log to keep test output clean
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDefaults', () => {
    it('should create all default permissions when none exist', async () => {
      // Arrange
      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
      }));

      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
        permissions: dto.permissions,
      }));

      // Act
      const result = await service.seedDefaults();

      // Assert
      expect(mockPermissionRepository.create).toHaveBeenCalledTimes(3);
      expect(mockPermissionRepository.create).toHaveBeenCalledWith({
        name: 'users:manage',
      });
      expect(mockPermissionRepository.create).toHaveBeenCalledWith({
        name: 'roles:manage',
      });
      expect(mockPermissionRepository.create).toHaveBeenCalledWith({
        name: 'permissions:manage',
      });

      expect(result).toHaveProperty('adminRoleId');
      expect(result).toHaveProperty('userRoleId');
      expect(typeof result.adminRoleId).toBe('string');
      expect(typeof result.userRoleId).toBe('string');
    });

    it('should use existing permissions instead of creating new ones', async () => {
      // Arrange
      const existingPermissions = [
        { _id: new Types.ObjectId(), name: 'users:manage' },
        { _id: new Types.ObjectId(), name: 'roles:manage' },
        { _id: new Types.ObjectId(), name: 'permissions:manage' },
      ];

      mockPermissionRepository.findByName.mockImplementation((name) => {
        return existingPermissions.find((p) => p.name === name);
      });

      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
        permissions: dto.permissions,
      }));

      // Act
      await service.seedDefaults();

      // Assert
      expect(mockPermissionRepository.findByName).toHaveBeenCalledTimes(3);
      expect(mockPermissionRepository.create).not.toHaveBeenCalled();
    });

    it('should create admin role with all permissions when not exists', async () => {
      // Arrange
      const permissionIds = [
        new Types.ObjectId(),
        new Types.ObjectId(),
        new Types.ObjectId(),
      ];

      let createCallCount = 0;
      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation((dto) => {
        const id = permissionIds[createCallCount++];
        return {
          _id: id,
          name: dto.name,
        };
      });

      mockRoleRepository.findByName.mockResolvedValue(null);
      const adminRoleId = new Types.ObjectId();
      const userRoleId = new Types.ObjectId();

      mockRoleRepository.create.mockImplementation((dto) => {
        if (dto.name === 'admin') {
          return {
            _id: adminRoleId,
            name: 'admin',
            permissions: dto.permissions,
          };
        }
        return {
          _id: userRoleId,
          name: 'user',
          permissions: dto.permissions,
        };
      });

      // Act
      await service.seedDefaults();

      // Assert
      expect(mockRoleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'admin',
          permissions: expect.any(Array),
        }),
      );

      // Verify admin role has permissions
      const adminCall = mockRoleRepository.create.mock.calls.find(
        (call) => call[0].name === 'admin',
      );
      expect(adminCall[0].permissions).toHaveLength(3);
    });

    it('should create user role with no permissions when not exists', async () => {
      // Arrange
      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
      }));

      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
        permissions: dto.permissions,
      }));

      // Act
      await service.seedDefaults();

      // Assert
      expect(mockRoleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'user',
          permissions: [],
        }),
      );
    });

    it('should use existing admin role if already exists', async () => {
      // Arrange
      const existingAdminRole = {
        _id: new Types.ObjectId(),
        name: 'admin',
        permissions: [],
      };

      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
      }));

      mockRoleRepository.findByName.mockImplementation((name) => {
        if (name === 'admin') return existingAdminRole;
        return null;
      });

      mockRoleRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
        permissions: dto.permissions,
      }));

      // Act
      const result = await service.seedDefaults();

      // Assert
      expect(result.adminRoleId).toBe(existingAdminRole._id.toString());
      // Admin role already exists, so create should only be called once for user role
      expect(mockRoleRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRoleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'user' }),
      );
    });

    it('should use existing user role if already exists', async () => {
      // Arrange
      const existingUserRole = {
        _id: new Types.ObjectId(),
        name: 'user',
        permissions: [],
      };

      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
      }));

      mockRoleRepository.findByName.mockImplementation((name) => {
        if (name === 'user') return existingUserRole;
        return null;
      });

      mockRoleRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
        permissions: dto.permissions,
      }));

      // Act
      const result = await service.seedDefaults();

      // Assert
      expect(result.userRoleId).toBe(existingUserRole._id.toString());
    });

    it('should return both role IDs after successful seeding', async () => {
      // Arrange
      const adminRoleId = new Types.ObjectId();
      const userRoleId = new Types.ObjectId();

      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
      }));

      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockImplementation((dto) => {
        if (dto.name === 'admin') {
          return { _id: adminRoleId, name: 'admin', permissions: [] };
        }
        return { _id: userRoleId, name: 'user', permissions: [] };
      });

      // Act
      const result = await service.seedDefaults();

      // Assert
      expect(result).toEqual({
        adminRoleId: adminRoleId.toString(),
        userRoleId: userRoleId.toString(),
      });
    });

    it('should log the seeded role IDs to console', async () => {
      // Arrange
      const adminRoleId = new Types.ObjectId();
      const userRoleId = new Types.ObjectId();

      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
      }));

      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockImplementation((dto) => {
        if (dto.name === 'admin') {
          return { _id: adminRoleId, name: 'admin', permissions: [] };
        }
        return { _id: userRoleId, name: 'user', permissions: [] };
      });

      // Act
      await service.seedDefaults();

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        '[AuthKit] Seeded roles:',
        expect.objectContaining({
          adminRoleId: adminRoleId.toString(),
          userRoleId: userRoleId.toString(),
        }),
      );
    });
  });
});
