<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from '@services/seed.service';
import { RoleRepository } from '@repos/role.repository';
import { PermissionRepository } from '@repos/permission.repository';
import { Types } from 'mongoose';

describe('SeedService', () => {
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { SeedService } from "@services/seed.service";
import { RoleRepository } from "@repos/role.repository";
import { PermissionRepository } from "@repos/permission.repository";
import { Types } from "mongoose";

describe("SeedService", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
<<<<<<< HEAD
    jest.spyOn(console, 'log').mockImplementation();
=======
    jest.spyOn(console, "log").mockImplementation();
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

<<<<<<< HEAD
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDefaults', () => {
    it('should create all default permissions when none exist', async () => {
=======
  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("seedDefaults", () => {
    it("should create all default permissions when none exist", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
<<<<<<< HEAD
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
=======
        name: "users:manage",
      });
      expect(mockPermissionRepository.create).toHaveBeenCalledWith({
        name: "roles:manage",
      });
      expect(mockPermissionRepository.create).toHaveBeenCalledWith({
        name: "permissions:manage",
      });

      expect(result).toHaveProperty("adminRoleId");
      expect(result).toHaveProperty("userRoleId");
      expect(typeof result.adminRoleId).toBe("string");
      expect(typeof result.userRoleId).toBe("string");
    });

    it("should use existing permissions instead of creating new ones", async () => {
      // Arrange
      const existingPermissions = [
        { _id: new Types.ObjectId(), name: "users:manage" },
        { _id: new Types.ObjectId(), name: "roles:manage" },
        { _id: new Types.ObjectId(), name: "permissions:manage" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
    it('should create admin role with all permissions when not exists', async () => {
=======
    it("should create admin role with all permissions when not exists", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
<<<<<<< HEAD
        if (dto.name === 'admin') {
          return {
            _id: adminRoleId,
            name: 'admin',
=======
        if (dto.name === "admin") {
          return {
            _id: adminRoleId,
            name: "admin",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
            permissions: dto.permissions,
          };
        }
        return {
          _id: userRoleId,
<<<<<<< HEAD
          name: 'user',
=======
          name: "user",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
          permissions: dto.permissions,
        };
      });

      // Act
      await service.seedDefaults();

      // Assert
      expect(mockRoleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
<<<<<<< HEAD
          name: 'admin',
=======
          name: "admin",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
          permissions: expect.any(Array),
        }),
      );

      // Verify admin role has permissions
      const adminCall = mockRoleRepository.create.mock.calls.find(
<<<<<<< HEAD
        (call) => call[0].name === 'admin',
=======
        (call) => call[0].name === "admin",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      );
      expect(adminCall[0].permissions).toHaveLength(3);
    });

<<<<<<< HEAD
    it('should create user role with no permissions when not exists', async () => {
=======
    it("should create user role with no permissions when not exists", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
<<<<<<< HEAD
          name: 'user',
=======
          name: "user",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
          permissions: [],
        }),
      );
    });

<<<<<<< HEAD
    it('should use existing admin role if already exists', async () => {
      // Arrange
      const existingAdminRole = {
        _id: new Types.ObjectId(),
        name: 'admin',
=======
    it("should use existing admin role if already exists", async () => {
      // Arrange
      const existingAdminRole = {
        _id: new Types.ObjectId(),
        name: "admin",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        permissions: [],
      };

      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
      }));

      mockRoleRepository.findByName.mockImplementation((name) => {
<<<<<<< HEAD
        if (name === 'admin') return existingAdminRole;
=======
        if (name === "admin") return existingAdminRole;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
<<<<<<< HEAD
        expect.objectContaining({ name: 'user' }),
      );
    });

    it('should use existing user role if already exists', async () => {
      // Arrange
      const existingUserRole = {
        _id: new Types.ObjectId(),
        name: 'user',
=======
        expect.objectContaining({ name: "user" }),
      );
    });

    it("should use existing user role if already exists", async () => {
      // Arrange
      const existingUserRole = {
        _id: new Types.ObjectId(),
        name: "user",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        permissions: [],
      };

      mockPermissionRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.create.mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        name: dto.name,
      }));

      mockRoleRepository.findByName.mockImplementation((name) => {
<<<<<<< HEAD
        if (name === 'user') return existingUserRole;
=======
        if (name === "user") return existingUserRole;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
    it('should return both role IDs after successful seeding', async () => {
=======
    it("should return both role IDs after successful seeding", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
<<<<<<< HEAD
        if (dto.name === 'admin') {
          return { _id: adminRoleId, name: 'admin', permissions: [] };
        }
        return { _id: userRoleId, name: 'user', permissions: [] };
=======
        if (dto.name === "admin") {
          return { _id: adminRoleId, name: "admin", permissions: [] };
        }
        return { _id: userRoleId, name: "user", permissions: [] };
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      // Act
      const result = await service.seedDefaults();

      // Assert
      expect(result).toEqual({
        adminRoleId: adminRoleId.toString(),
        userRoleId: userRoleId.toString(),
      });
    });

<<<<<<< HEAD
    it('should log the seeded role IDs to console', async () => {
=======
    it("should log the seeded role IDs to console", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
<<<<<<< HEAD
        if (dto.name === 'admin') {
          return { _id: adminRoleId, name: 'admin', permissions: [] };
        }
        return { _id: userRoleId, name: 'user', permissions: [] };
=======
        if (dto.name === "admin") {
          return { _id: adminRoleId, name: "admin", permissions: [] };
        }
        return { _id: userRoleId, name: "user", permissions: [] };
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      // Act
      await service.seedDefaults();

      // Assert
      expect(console.log).toHaveBeenCalledWith(
<<<<<<< HEAD
        '[AuthKit] Seeded roles:',
=======
        "[AuthKit] Seeded roles:",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        expect.objectContaining({
          adminRoleId: adminRoleId.toString(),
          userRoleId: userRoleId.toString(),
        }),
      );
    });
  });
});
<<<<<<< HEAD


=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
