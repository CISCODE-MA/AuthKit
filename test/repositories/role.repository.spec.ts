<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RoleRepository } from '@repos/role.repository';
import { Role } from '@entities/role.entity';
import { Model, Types } from 'mongoose';

describe('RoleRepository', () => {
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { RoleRepository } from "@repos/role.repository";
import { Role } from "@entities/role.entity";
import { Model, Types } from "mongoose";

describe("RoleRepository", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  let repository: RoleRepository;
  let model: any;

  const mockRole = {
<<<<<<< HEAD
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'admin',
    permissions: [],
  };


=======
    _id: new Types.ObjectId("507f1f77bcf86cd799439011"),
    name: "admin",
    permissions: [],
  };

>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  beforeEach(async () => {
    // Helper to create a full mongoose chainable mock (populate, lean, exec)
    function createChainMock(finalValue: any) {
      // .lean() returns chain, .exec() resolves to finalValue
      const chain: any = {};
      chain.exec = jest.fn().mockResolvedValue(finalValue);
      chain.lean = jest.fn(() => chain);
      chain.populate = jest.fn(() => chain);
      return chain;
    }

    const mockModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    // By default, return a Promise for direct calls, chain for populate/lean
    mockModel.find.mockImplementation((...args) => {
      return Promise.resolve([]);
    });
    mockModel.findById.mockImplementation((...args) => Promise.resolve(null));
    mockModel.findOne.mockImplementation((...args) => Promise.resolve(null));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleRepository,
        {
          provide: getModelToken(Role.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<RoleRepository>(RoleRepository);
    model = module.get(getModelToken(Role.name));
    // Expose chain helper for use in tests
    (repository as any)._createChainMock = createChainMock;
  });

<<<<<<< HEAD
  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      model.create.mockResolvedValue(mockRole);

      const result = await repository.create({ name: 'admin' });

      expect(model.create).toHaveBeenCalledWith({ name: 'admin' });
=======
  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("create", () => {
    it("should create a new role", async () => {
      model.create.mockResolvedValue(mockRole);

      const result = await repository.create({ name: "admin" });

      expect(model.create).toHaveBeenCalledWith({ name: "admin" });
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(result).toEqual(mockRole);
    });
  });

<<<<<<< HEAD
  describe('findById', () => {
    it('should find role by id', async () => {
=======
  describe("findById", () => {
    it("should find role by id", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      model.findById.mockResolvedValue(mockRole);

      const result = await repository.findById(mockRole._id);

      expect(model.findById).toHaveBeenCalledWith(mockRole._id);
      expect(result).toEqual(mockRole);
    });

<<<<<<< HEAD
    it('should accept string id', async () => {
=======
    it("should accept string id", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      model.findById.mockResolvedValue(mockRole);

      await repository.findById(mockRole._id.toString());

      expect(model.findById).toHaveBeenCalledWith(mockRole._id.toString());
    });
  });

<<<<<<< HEAD
  describe('findByName', () => {
    it('should find role by name', async () => {
      model.findOne.mockResolvedValue(mockRole);

      const result = await repository.findByName('admin');

      expect(model.findOne).toHaveBeenCalledWith({ name: 'admin' });
=======
  describe("findByName", () => {
    it("should find role by name", async () => {
      model.findOne.mockResolvedValue(mockRole);

      const result = await repository.findByName("admin");

      expect(model.findOne).toHaveBeenCalledWith({ name: "admin" });
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(result).toEqual(mockRole);
    });
  });

<<<<<<< HEAD
  describe('list', () => {
    it('should return all roles with populated permissions', async () => {
=======
  describe("list", () => {
    it("should return all roles with populated permissions", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const roles = [mockRole];
      const chain = (repository as any)._createChainMock(roles);
      model.find.mockReturnValue(chain);

      const resultPromise = repository.list();

      expect(model.find).toHaveBeenCalled();
<<<<<<< HEAD
      expect(chain.populate).toHaveBeenCalledWith('permissions');
=======
      expect(chain.populate).toHaveBeenCalledWith("permissions");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(chain.lean).toHaveBeenCalled();
      const result = await chain.exec();
      expect(result).toEqual(roles);
    });
  });

<<<<<<< HEAD
  describe('updateById', () => {
    it('should update role by id', async () => {
      const updatedRole = { ...mockRole, name: 'super-admin' };
      model.findByIdAndUpdate.mockResolvedValue(updatedRole);

      const result = await repository.updateById(mockRole._id, {
        name: 'super-admin',
=======
  describe("updateById", () => {
    it("should update role by id", async () => {
      const updatedRole = { ...mockRole, name: "super-admin" };
      model.findByIdAndUpdate.mockResolvedValue(updatedRole);

      const result = await repository.updateById(mockRole._id, {
        name: "super-admin",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRole._id,
<<<<<<< HEAD
        { name: 'super-admin' },
=======
        { name: "super-admin" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        { new: true },
      );
      expect(result).toEqual(updatedRole);
    });
  });

<<<<<<< HEAD
  describe('deleteById', () => {
    it('should delete role by id', async () => {
=======
  describe("deleteById", () => {
    it("should delete role by id", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      model.findByIdAndDelete.mockResolvedValue(mockRole);

      const result = await repository.deleteById(mockRole._id);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockRole._id);
      expect(result).toEqual(mockRole);
    });
  });

<<<<<<< HEAD
  describe('findByIds', () => {
        it('should find roles by array of ids', async () => {
      // Simulate DB: role with populated permissions (array of objects)
      const roles = [{
        _id: mockRole._id,
        name: mockRole.name,
        permissions: [{ _id: 'perm1', name: 'perm:read' }],
      }];
=======
  describe("findByIds", () => {
    it("should find roles by array of ids", async () => {
      // Simulate DB: role with populated permissions (array of objects)
      const roles = [
        {
          _id: mockRole._id,
          name: mockRole.name,
          permissions: [{ _id: "perm1", name: "perm:read" }],
        },
      ];
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const ids = [mockRole._id.toString()];
      const chain = (repository as any)._createChainMock(roles);
      model.find.mockReturnValue(chain);

      const resultPromise = repository.findByIds(ids);

      expect(model.find).toHaveBeenCalledWith({ _id: { $in: ids } });
      expect(chain.lean).toHaveBeenCalled();
      const result = await resultPromise;
      expect(result).toEqual(roles);
<<<<<<< HEAD
        });
  });
});


=======
    });
  });
});
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
