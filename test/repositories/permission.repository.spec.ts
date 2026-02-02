import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PermissionRepository } from '@repos/permission.repository';
import { Permission } from '@entities/permission.entity';
import { Model, Types } from 'mongoose';

describe('PermissionRepository', () => {
  let repository: PermissionRepository;
  let model: any;

  const mockPermission = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'read:users',
    description: 'Read users',
  };

  beforeEach(async () => {
    const leanMock = jest.fn();
    const findMock = jest.fn(() => ({ lean: leanMock }));

    const mockModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      find: findMock,
      lean: leanMock,
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionRepository,
        {
          provide: getModelToken(Permission.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<PermissionRepository>(PermissionRepository);
    model = module.get(getModelToken(Permission.name));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new permission', async () => {
      model.create.mockResolvedValue(mockPermission);

      const result = await repository.create({ name: 'read:users' });

      expect(model.create).toHaveBeenCalledWith({ name: 'read:users' });
      expect(result).toEqual(mockPermission);
    });
  });

  describe('findById', () => {
    it('should find permission by id', async () => {
      model.findById.mockResolvedValue(mockPermission);

      const result = await repository.findById(mockPermission._id);

      expect(model.findById).toHaveBeenCalledWith(mockPermission._id);
      expect(result).toEqual(mockPermission);
    });

    it('should accept string id', async () => {
      model.findById.mockResolvedValue(mockPermission);

      await repository.findById(mockPermission._id.toString());

      expect(model.findById).toHaveBeenCalledWith(mockPermission._id.toString());
    });
  });

  describe('findByName', () => {
    it('should find permission by name', async () => {
      model.findOne.mockResolvedValue(mockPermission);

      const result = await repository.findByName('read:users');

      expect(model.findOne).toHaveBeenCalledWith({ name: 'read:users' });
      expect(result).toEqual(mockPermission);
    });
  });

  describe('list', () => {
    it('should return all permissions', async () => {
      const permissions = [mockPermission];
      const leanSpy = model.find().lean;
      leanSpy.mockResolvedValue(permissions);

      const result = await repository.list();

      expect(model.find).toHaveBeenCalled();
      expect(leanSpy).toHaveBeenCalled();
      expect(result).toEqual(permissions);
    });
  });

  describe('updateById', () => {
    it('should update permission by id', async () => {
      const updatedPerm = { ...mockPermission, description: 'Updated' };
      model.findByIdAndUpdate.mockResolvedValue(updatedPerm);

      const result = await repository.updateById(mockPermission._id, {
        description: 'Updated',
      });

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPermission._id,
        { description: 'Updated' },
        { new: true },
      );
      expect(result).toEqual(updatedPerm);
    });
  });

  describe('deleteById', () => {
    it('should delete permission by id', async () => {
      model.findByIdAndDelete.mockResolvedValue(mockPermission);

      const result = await repository.deleteById(mockPermission._id);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockPermission._id);
      expect(result).toEqual(mockPermission);
    });
  });
});


