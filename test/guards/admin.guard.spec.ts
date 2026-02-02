import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AdminGuard } from '@guards/admin.guard';
import { AdminRoleService } from '@services/admin-role.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let mockAdminRoleService: jest.Mocked<AdminRoleService>;

  const mockExecutionContext = (userRoles: string[] = []) => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const request = {
      user: { roles: userRoles },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    mockAdminRoleService = {
      loadAdminRoleId: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        { provide: AdminRoleService, useValue: mockAdminRoleService },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true if user has admin role', async () => {
      const adminRoleId = 'admin-role-id';
      mockAdminRoleService.loadAdminRoleId.mockResolvedValue(adminRoleId);
      const context = mockExecutionContext([adminRoleId, 'other-role']);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockAdminRoleService.loadAdminRoleId).toHaveBeenCalled();
    });

    it('should return false and send 403 if user does not have admin role', async () => {
      const adminRoleId = 'admin-role-id';
      mockAdminRoleService.loadAdminRoleId.mockResolvedValue(adminRoleId);
      const context = mockExecutionContext(['user-role', 'other-role']);
      const response = context.switchToHttp().getResponse();

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.json).toHaveBeenCalledWith({ message: 'Forbidden: admin required.' });
    });

    it('should return false if user has no roles', async () => {
      const adminRoleId = 'admin-role-id';
      mockAdminRoleService.loadAdminRoleId.mockResolvedValue(adminRoleId);
      const context = mockExecutionContext([]);
      const response = context.switchToHttp().getResponse();

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
    });

    it('should handle undefined user.roles gracefully', async () => {
      const adminRoleId = 'admin-role-id';
      mockAdminRoleService.loadAdminRoleId.mockResolvedValue(adminRoleId);
      
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: {} }),
          getResponse: () => response,
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
    });

    it('should handle null user gracefully', async () => {
      const adminRoleId = 'admin-role-id';
      mockAdminRoleService.loadAdminRoleId.mockResolvedValue(adminRoleId);
      
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: null }),
          getResponse: () => response,
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });
  });
});


