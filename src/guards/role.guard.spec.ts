import { ExecutionContext } from '@nestjs/common';
import { hasRole } from './role.guard';

describe('RoleGuard (hasRole factory)', () => {
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

  describe('hasRole', () => {
    it('should return a guard class', () => {
      const GuardClass = hasRole('role-id');
      expect(GuardClass).toBeDefined();
      expect(typeof GuardClass).toBe('function');
    });

    it('should return true if user has the required role', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      const context = mockExecutionContext([requiredRoleId, 'other-role']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false and send 403 if user does not have the required role', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      const context = mockExecutionContext(['user-role', 'other-role']);
      const response = context.switchToHttp().getResponse();

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.json).toHaveBeenCalledWith({ message: 'Forbidden: role required.' });
    });

    it('should return false if user has no roles', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      const context = mockExecutionContext([]);
      const response = context.switchToHttp().getResponse();

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
    });

    it('should handle undefined user.roles gracefully', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      
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

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
    });

    it('should handle null user gracefully', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      
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

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should create different guard instances for different roles', () => {
      const EditorGuard = hasRole('editor-role');
      const ViewerGuard = hasRole('viewer-role');

      expect(EditorGuard).not.toBe(ViewerGuard);

      const editorGuard = new EditorGuard();
      const viewerGuard = new ViewerGuard();

      const editorContext = mockExecutionContext(['editor-role']);
      const viewerContext = mockExecutionContext(['viewer-role']);

      expect(editorGuard.canActivate(editorContext)).toBe(true);
      expect(editorGuard.canActivate(viewerContext)).toBe(false);

      expect(viewerGuard.canActivate(viewerContext)).toBe(true);
      expect(viewerGuard.canActivate(editorContext)).toBe(false);
    });
  });
});
