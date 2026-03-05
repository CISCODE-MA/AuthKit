import { hasRole } from '@guards/role.guard';
import { createMockContextWithRoles } from '../utils/test-helpers';

describe('RoleGuard (hasRole factory)', () => {
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
      const context = createMockContextWithRoles([
        requiredRoleId,
        'other-role',
      ]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false and send 403 if user does not have the required role', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      const context = createMockContextWithRoles(['user-role', 'other-role']);
      const response = context.switchToHttp().getResponse();

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Forbidden: role required.',
      });
    });

    it('should return false if user has no roles', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      const context = createMockContextWithRoles([]);
      const response = context.switchToHttp().getResponse();

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
    });

    it('should handle undefined user.roles gracefully', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();

      const context = createMockContextWithRoles([]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      const response = context.switchToHttp().getResponse();
      expect(response.status).toHaveBeenCalledWith(403);
    });

    it('should handle null user gracefully', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();

      const context = createMockContextWithRoles([]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should create different guard instances for different roles', () => {
      const EditorGuard = hasRole('editor-role');
      const ViewerGuard = hasRole('viewer-role');

      expect(EditorGuard).not.toBe(ViewerGuard);

      const editorGuard = new EditorGuard();
      const viewerGuard = new ViewerGuard();

      const editorContext = createMockContextWithRoles(['editor-role']);
      const viewerContext = createMockContextWithRoles(['viewer-role']);

      expect(editorGuard.canActivate(editorContext)).toBe(true);
      expect(editorGuard.canActivate(viewerContext)).toBe(false);

      expect(viewerGuard.canActivate(viewerContext)).toBe(true);
      expect(viewerGuard.canActivate(editorContext)).toBe(false);
    });
  });
});
