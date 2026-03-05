<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { UsersController } from '@controllers/users.controller';
import { UsersService } from '@services/users.service';
import { RegisterDto } from '@dto/auth/register.dto';
import { UpdateUserRolesDto } from '@dto/auth/update-user-role.dto';
import { AdminGuard } from '@guards/admin.guard';
import { AuthenticateGuard } from '@guards/authenticate.guard';

describe('UsersController', () => {
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { Response } from "express";
import { UsersController } from "@controllers/users.controller";
import { UsersService } from "@services/users.service";
import type { RegisterDto } from "@dto/auth/register.dto";
import type { UpdateUserRolesDto } from "@dto/auth/update-user-role.dto";
import { AdminGuard } from "@guards/admin.guard";
import { AuthenticateGuard } from "@guards/authenticate.guard";

describe("UsersController", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
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
=======
  describe("create", () => {
    it("should create a user and return 201", async () => {
      const dto: RegisterDto = {
        fullname: { fname: "Test", lname: "User" },
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      };
      const created = {
        id: "user-id",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        email: dto.email,
      };

      mockService.create.mockResolvedValue(created as any);

      await controller.create(dto, mockResponse as Response);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(created);
    });
  });

<<<<<<< HEAD
  describe('list', () => {
    it('should return all users with 200', async () => {
      const users = [
        { _id: 'u1', email: 'user1@test.com', username: 'user1', roles: [] },
        { _id: 'u2', email: 'user2@test.com', username: 'user2', roles: [] },
=======
  describe("list", () => {
    it("should return all users with 200", async () => {
      const users = [
        { _id: "u1", email: "user1@test.com", username: "user1", roles: [] },
        { _id: "u2", email: "user2@test.com", username: "user2", roles: [] },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      ];

      mockService.list.mockResolvedValue(users as any);

      await controller.list({}, mockResponse as Response);

      expect(mockService.list).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });

<<<<<<< HEAD
    it('should filter users by email', async () => {
      const query = { email: 'test@example.com' };
      const users = [{ _id: 'u1', email: 'test@example.com', username: 'test', roles: [] }];
=======
    it("should filter users by email", async () => {
      const query = { email: "test@example.com" };
      const users = [
        { _id: "u1", email: "test@example.com", username: "test", roles: [] },
      ];
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      mockService.list.mockResolvedValue(users as any);

      await controller.list(query, mockResponse as Response);

      expect(mockService.list).toHaveBeenCalledWith(query);
      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });

<<<<<<< HEAD
    it('should filter users by username', async () => {
      const query = { username: 'testuser' };
      const users = [{ _id: 'u1', email: 'test@test.com', username: 'testuser', roles: [] }];
=======
    it("should filter users by username", async () => {
      const query = { username: "testuser" };
      const users = [
        { _id: "u1", email: "test@test.com", username: "testuser", roles: [] },
      ];
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      mockService.list.mockResolvedValue(users as any);

      await controller.list(query, mockResponse as Response);

      expect(mockService.list).toHaveBeenCalledWith(query);
      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });
  });

<<<<<<< HEAD
  describe('ban', () => {
    it('should ban a user and return 200', async () => {
      const bannedUser = {
        id: 'user-id',
=======
  describe("ban", () => {
    it("should ban a user and return 200", async () => {
      const bannedUser = {
        id: "user-id",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        isBanned: true,
      };

      mockService.setBan.mockResolvedValue(bannedUser as any);

<<<<<<< HEAD
      await controller.ban('user-id', mockResponse as Response);

      expect(mockService.setBan).toHaveBeenCalledWith('user-id', true);
=======
      await controller.ban("user-id", mockResponse as Response);

      expect(mockService.setBan).toHaveBeenCalledWith("user-id", true);
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(bannedUser);
    });
  });

<<<<<<< HEAD
  describe('unban', () => {
    it('should unban a user and return 200', async () => {
      const unbannedUser = {
        id: 'user-id',
=======
  describe("unban", () => {
    it("should unban a user and return 200", async () => {
      const unbannedUser = {
        id: "user-id",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        isBanned: false,
      };

      mockService.setBan.mockResolvedValue(unbannedUser as any);

<<<<<<< HEAD
      await controller.unban('user-id', mockResponse as Response);

      expect(mockService.setBan).toHaveBeenCalledWith('user-id', false);
=======
      await controller.unban("user-id", mockResponse as Response);

      expect(mockService.setBan).toHaveBeenCalledWith("user-id", false);
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(unbannedUser);
    });
  });

<<<<<<< HEAD
  describe('delete', () => {
    it('should delete a user and return 200', async () => {
=======
  describe("delete", () => {
    it("should delete a user and return 200", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const deleted = { ok: true };

      mockService.delete.mockResolvedValue(deleted as any);

<<<<<<< HEAD
      await controller.delete('user-id', mockResponse as Response);

      expect(mockService.delete).toHaveBeenCalledWith('user-id');
=======
      await controller.delete("user-id", mockResponse as Response);

      expect(mockService.delete).toHaveBeenCalledWith("user-id");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(deleted);
    });
  });

<<<<<<< HEAD
  describe('updateRoles', () => {
    it('should update user roles and return 200', async () => {
      const dto: UpdateUserRolesDto = {
        roles: ['role-1', 'role-2'],
      };
      const updated = {
        id: 'user-id',
=======
  describe("updateRoles", () => {
    it("should update user roles and return 200", async () => {
      const dto: UpdateUserRolesDto = {
        roles: ["role-1", "role-2"],
      };
      const updated = {
        id: "user-id",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        roles: [] as any,
      };

      mockService.updateRoles.mockResolvedValue(updated as any);

<<<<<<< HEAD
      await controller.updateRoles('user-id', dto, mockResponse as Response);

      expect(mockService.updateRoles).toHaveBeenCalledWith('user-id', dto.roles);
=======
      await controller.updateRoles("user-id", dto, mockResponse as Response);

      expect(mockService.updateRoles).toHaveBeenCalledWith(
        "user-id",
        dto.roles,
      );
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updated);
    });
  });
});
<<<<<<< HEAD


=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
