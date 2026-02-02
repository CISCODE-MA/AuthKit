import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RoleRepository } from '@repos/role.repository';
import { Role } from '@entities/role.entity';
import { Model, Types } from 'mongoose';

describe('RoleRepository', () => {
  let repository: RoleRepository;
  let model: any;

  const mockRole = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'admin',
    permissions: [],
  };

  beforeEach(async () => {
    const leanMock = jest.fn();
    const populateMock = jest.fn(() => ({ lean: leanMock }));
    const findMock = jest.fn(() => ({ populate: populateMock, lean: leanMock }));

    const mockModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      find: findMock,
      populate: populateMock,
      lean: leanMock,
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

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
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      model.create.mockResolvedValue(mockRole);

      const result = await repository.create({ name: 'admin' });

      expect(model.create).toHaveBeenCalledWith({ name: 'admin' });
      expect(result).toEqual(mockRole);
    });
  });

  describe('findById', () => {
    it('should find role by id', async () => {
      model.findById.mockResolvedValue(mockRole);

      const result = await repository.findById(mockRole._id);

      expect(model.findById).toHaveBeenCalledWith(mockRole._id);
      expect(result).toEqual(mockRole);
    });

    it('should accept string id', async () => {
      model.findById.mockResolvedValue(mockRole);

      await repository.findById(mockRole._id.toString());

      expect(model.findById).toHaveBeenCalledWith(mockRole._id.toString());
    });
  });

  describe('findByName', () => {
    it('should find role by name', async () => {
      model.findOne.mockResolvedValue(mockRole);

      const result = await repository.findByName('admin');

      expect(model.findOne).toHaveBeenCalledWith({ name: 'admin' });
      expect(result).toEqual(mockRole);
    });
  });

  describe('list', () => {
    it('should return all roles with populated permissions', async () => {
      const roles = [mockRole];
      const chain = model.find();
      chain.lean.mockResolvedValue(roles);

      const result = await repository.list();

      expect(model.find).toHaveBeenCalled();
      expect(chain.populate).toHaveBeenCalledWith('permissions');
      expect(chain.lean).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });
  });

  describe('updateById', () => {
    it('should update role by id', async () => {
      const updatedRole = { ...mockRole, name: 'super-admin' };
      model.findByIdAndUpdate.mockResolvedValue(updatedRole);

      const result = await repository.updateById(mockRole._id, {
        name: 'super-admin',
      });

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRole._id,
        { name: 'super-admin' },
        { new: true },
      );
      expect(result).toEqual(updatedRole);
    });
  });

  describe('deleteById', () => {
    it('should delete role by id', async () => {
      model.findByIdAndDelete.mockResolvedValue(mockRole);

      const result = await repository.deleteById(mockRole._id);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockRole._id);
      expect(result).toEqual(mockRole);
    });
  });

  describe('findByIds', () => {
    it('should find roles by array of ids', async () => {
      const roles = [mockRole];
      const chain = model.find({ _id: { $in: [] } });
      chain.lean.mockResolvedValue(roles);

      const ids = [mockRole._id.toString()];
      const result = await repository.findByIds(ids);

      expect(model.find).toHaveBeenCalledWith({ _id: { $in: ids } });
      expect(chain.lean).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });
  });
});


