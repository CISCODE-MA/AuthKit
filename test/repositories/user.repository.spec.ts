import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserRepository } from '@repos/user.repository';
import { User } from '@entities/user.entity';
import { Model, Types } from 'mongoose';

describe('UserRepository', () => {
  let repository: UserRepository;
  let model: any;

  const mockUser = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    email: 'test@example.com',
    username: 'testuser',
    phoneNumber: '+1234567890',
    roles: [],
  };


  beforeEach(async () => {
    // Helper to create a full mongoose chainable mock (populate, lean, select, exec)
    function createChainMock(finalValue: any) {
      // .lean() and .select() return chain, .exec() resolves to finalValue
      const chain: any = {};
      chain.exec = jest.fn().mockResolvedValue(finalValue);
      chain.lean = jest.fn(() => chain);
      chain.select = jest.fn(() => chain);
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

    // By default, return a Promise for direct calls, chain for populate/lean/select
    mockModel.find.mockImplementation((...args) => {
      // If called from a test that expects a chain, the test will override this
      return Promise.resolve([]);
    });
    mockModel.findById.mockImplementation((...args) => Promise.resolve(null));
    mockModel.findOne.mockImplementation((...args) => Promise.resolve(null));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    model = module.get(getModelToken(User.name));
    // Expose chain helper for use in tests
    (repository as any)._createChainMock = createChainMock;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      model.create.mockResolvedValue(mockUser);

      const result = await repository.create({ email: 'test@example.com' });

      expect(model.create).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      model.findById.mockReturnValue(Promise.resolve(mockUser) as any);

      const result = await repository.findById(mockUser._id);

      expect(model.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });

    it('should accept string id', async () => {
      model.findById.mockReturnValue(Promise.resolve(mockUser) as any);

      await repository.findById(mockUser._id.toString());

      expect(model.findById).toHaveBeenCalledWith(mockUser._id.toString());
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      model.findOne.mockReturnValue(Promise.resolve(mockUser) as any);

      const result = await repository.findByEmail('test@example.com');

      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should find user by email with password field', async () => {
      const userWithPassword = { ...mockUser, password: 'hashed' };
      const chain = (repository as any)._createChainMock(userWithPassword);
      model.findOne.mockReturnValue(chain);

      const resultPromise = repository.findByEmailWithPassword('test@example.com');

      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(chain.select).toHaveBeenCalledWith('+password');
      const result = await chain.exec();
      expect(result).toEqual(userWithPassword);
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      model.findOne.mockReturnValue(Promise.resolve(mockUser) as any);

      const result = await repository.findByUsername('testuser');

      expect(model.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByPhone', () => {
    it('should find user by phone number', async () => {
      model.findOne.mockReturnValue(Promise.resolve(mockUser) as any);

      const result = await repository.findByPhone('+1234567890');

      expect(model.findOne).toHaveBeenCalledWith({ phoneNumber: '+1234567890' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateById', () => {
    it('should update user by id', async () => {
      const updatedUser = { ...mockUser, email: 'updated@example.com' };
      model.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await repository.updateById(mockUser._id, {
        email: 'updated@example.com',
      });

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        { email: 'updated@example.com' },
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteById', () => {
    it('should delete user by id', async () => {
      model.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await repository.deleteById(mockUser._id);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByIdWithRolesAndPermissions', () => {
    it('should find user with populated roles and permissions', async () => {
      const userWithRoles = {
        ...mockUser,
        roles: [{ name: 'admin', permissions: [{ name: 'read:users' }] }],
      };
      const chain = (repository as any)._createChainMock(userWithRoles);
      model.findById.mockReturnValue(chain);

      const resultPromise = repository.findByIdWithRolesAndPermissions(mockUser._id);

      expect(model.findById).toHaveBeenCalledWith(mockUser._id);
      expect(chain.populate).toHaveBeenCalledWith({
        path: 'roles',
        populate: { path: 'permissions', select: 'name' },
        select: 'name permissions',
      });
      const result = await chain.exec();
      expect(result).toEqual(userWithRoles);
    });
  });

  describe('list', () => {
    it('should list users without filters', async () => {
      const users = [mockUser];
      const chain = (repository as any)._createChainMock(users);
      model.find.mockReturnValue(chain);

      const resultPromise = repository.list({});

      expect(model.find).toHaveBeenCalledWith({});
      expect(chain.populate).toHaveBeenCalledWith({ path: 'roles', select: 'name' });
      expect(chain.lean).toHaveBeenCalled();
      const result = await chain.exec();
      expect(result).toEqual(users);
    });

    it('should list users with email filter', async () => {
      const users = [mockUser];
      const chain = (repository as any)._createChainMock(users);
      model.find.mockReturnValue(chain);

      const resultPromise = repository.list({ email: 'test@example.com' });

      expect(model.find).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(chain.populate).toHaveBeenCalledWith({ path: 'roles', select: 'name' });
      expect(chain.lean).toHaveBeenCalled();
      const result = await chain.exec();
      expect(result).toEqual(users);
    });

    it('should list users with username filter', async () => {
      const users = [mockUser];
      const chain = (repository as any)._createChainMock(users);
      model.find.mockReturnValue(chain);

      const resultPromise = repository.list({ username: 'testuser' });

      expect(model.find).toHaveBeenCalledWith({ username: 'testuser' });
      expect(chain.populate).toHaveBeenCalledWith({ path: 'roles', select: 'name' });
      expect(chain.lean).toHaveBeenCalled();
      const result = await chain.exec();
      expect(result).toEqual(users);
    });

    it('should list users with both filters', async () => {
      const users = [mockUser];
      const chain = (repository as any)._createChainMock(users);
      model.find.mockReturnValue(chain);

      const resultPromise = repository.list({
        email: 'test@example.com',
        username: 'testuser',
      });

      expect(model.find).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
      });
      expect(chain.populate).toHaveBeenCalledWith({ path: 'roles', select: 'name' });
      expect(chain.lean).toHaveBeenCalled();
      const result = await chain.exec();
      expect(result).toEqual(users);
    });
  });
});


