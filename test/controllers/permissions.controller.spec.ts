<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { PermissionsController } from '@controllers/permissions.controller';
import { PermissionsService } from '@services/permissions.service';
import { CreatePermissionDto } from '@dto/permission/create-permission.dto';
import { UpdatePermissionDto } from '@dto/permission/update-permission.dto';
import { AdminGuard } from '@guards/admin.guard';
import { AuthenticateGuard } from '@guards/authenticate.guard';

describe('PermissionsController', () => {
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { Response } from "express";
import { PermissionsController } from "@controllers/permissions.controller";
import { PermissionsService } from "@services/permissions.service";
import type { CreatePermissionDto } from "@dto/permission/create-permission.dto";
import type { UpdatePermissionDto } from "@dto/permission/update-permission.dto";
import { AdminGuard } from "@guards/admin.guard";
import { AuthenticateGuard } from "@guards/authenticate.guard";

describe("PermissionsController", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  let controller: PermissionsController;
  let mockService: jest.Mocked<PermissionsService>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [{ provide: PermissionsService, useValue: mockService }],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthenticateGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

<<<<<<< HEAD
  describe('create', () => {
    it('should create a permission and return 201', async () => {
      const dto: CreatePermissionDto = {
        name: 'read:users',
        description: 'Read users',
      };
      const created = { _id: 'perm-id', ...dto };
=======
  describe("create", () => {
    it("should create a permission and return 201", async () => {
      const dto: CreatePermissionDto = {
        name: "read:users",
        description: "Read users",
      };
      const created = { _id: "perm-id", ...dto };
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      mockService.create.mockResolvedValue(created as any);

      await controller.create(dto, mockResponse as Response);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(created);
    });
  });

<<<<<<< HEAD
  describe('list', () => {
    it('should return all permissions with 200', async () => {
      const permissions = [
        { _id: 'p1', name: 'read:users', description: 'Read' },
        { _id: 'p2', name: 'write:users', description: 'Write' },
=======
  describe("list", () => {
    it("should return all permissions with 200", async () => {
      const permissions = [
        { _id: "p1", name: "read:users", description: "Read" },
        { _id: "p2", name: "write:users", description: "Write" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      ];

      mockService.list.mockResolvedValue(permissions as any);

      await controller.list(mockResponse as Response);

      expect(mockService.list).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(permissions);
    });
  });

<<<<<<< HEAD
  describe('update', () => {
    it('should update a permission and return 200', async () => {
      const dto: UpdatePermissionDto = {
        description: 'Updated description',
      };
      const updated = {
        _id: 'perm-id',
        name: 'read:users',
        description: 'Updated description',
=======
  describe("update", () => {
    it("should update a permission and return 200", async () => {
      const dto: UpdatePermissionDto = {
        description: "Updated description",
      };
      const updated = {
        _id: "perm-id",
        name: "read:users",
        description: "Updated description",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      mockService.update.mockResolvedValue(updated as any);

<<<<<<< HEAD
      await controller.update('perm-id', dto, mockResponse as Response);

      expect(mockService.update).toHaveBeenCalledWith('perm-id', dto);
=======
      await controller.update("perm-id", dto, mockResponse as Response);

      expect(mockService.update).toHaveBeenCalledWith("perm-id", dto);
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updated);
    });
  });

<<<<<<< HEAD
  describe('delete', () => {
    it('should delete a permission and return 200', async () => {
=======
  describe("delete", () => {
    it("should delete a permission and return 200", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const deleted = { ok: true };

      mockService.delete.mockResolvedValue(deleted as any);

<<<<<<< HEAD
      await controller.delete('perm-id', mockResponse as Response);

      expect(mockService.delete).toHaveBeenCalledWith('perm-id');
=======
      await controller.delete("perm-id", mockResponse as Response);

      expect(mockService.delete).toHaveBeenCalledWith("perm-id");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(deleted);
    });
  });
});
<<<<<<< HEAD


=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
