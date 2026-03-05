import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AdminGuard } from '@guards/admin.guard';
import { AdminRoleService } from '@services/admin-role.service';
import { createMockContextWithRoles } from '../utils/test-helpers';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let mockAdminRoleService: jest.Mocked<AdminRoleService>;

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
      const context = createMockContextWithRoles([adminRoleId, 'other-role']);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockAdminRoleService.loadAdminRoleId).toHaveBeenCalled();
    });

    it('should return false and send 403 if user does not have admin role', async () => {
      const adminRoleId = 'admin-role-id';
      mockAdminRoleService.loadAdminRoleId.mockResolvedValue(adminRoleId);
      const context = createMockContextWithRoles(['user-role', 'other-role']);
      const response = context.switchToHttp().getResponse();

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Forbidden: admin required.',
      });
    });

    it('should return false if user has no roles', async () => {
      const adminRoleId = 'admin-role-id';
      mockAdminRoleService.loadAdminRoleId.mockResolvedValue(adminRoleId);
      const context = createMockContextWithRoles([]);
      const response = context.switchToHttp().getResponse();

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
    });

    it('should handle undefined user.roles gracefully', async () => {
      const adminRoleId = 'admin-role-id';
      mockAdminRoleService.loadAdminRoleId.mockResolvedValue(adminRoleId);

      const context = createMockContextWithRoles([]);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      const response = context.switchToHttp().getResponse();
      expect(response.status).toHaveBeenCalledWith(403);
    });

    it('should handle null user gracefully', async () => {
      const adminRoleId = 'admin-role-id';
      mockAdminRoleService.loadAdminRoleId.mockResolvedValue(adminRoleId);

      const context = createMockContextWithRoles([]);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });
  });
});
