<<<<<<< HEAD
import { ExecutionContext } from '@nestjs/common';
import { hasRole } from '@guards/role.guard';

describe('RoleGuard (hasRole factory)', () => {
=======
import type { ExecutionContext } from "@nestjs/common";
import { hasRole } from "@guards/role.guard";

describe("RoleGuard (hasRole factory)", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
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
=======
  describe("hasRole", () => {
    it("should return a guard class", () => {
      const GuardClass = hasRole("role-id");
      expect(GuardClass).toBeDefined();
      expect(typeof GuardClass).toBe("function");
    });

    it("should return true if user has the required role", () => {
      const requiredRoleId = "editor-role-id";
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      const context = mockExecutionContext([requiredRoleId, "other-role"]);
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

<<<<<<< HEAD
    it('should return false and send 403 if user does not have the required role', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      const context = mockExecutionContext(['user-role', 'other-role']);
=======
    it("should return false and send 403 if user does not have the required role", () => {
      const requiredRoleId = "editor-role-id";
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      const context = mockExecutionContext(["user-role", "other-role"]);
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const response = context.switchToHttp().getResponse();

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
<<<<<<< HEAD
      expect(response.json).toHaveBeenCalledWith({ message: 'Forbidden: role required.' });
    });

    it('should return false if user has no roles', () => {
      const requiredRoleId = 'editor-role-id';
=======
      expect(response.json).toHaveBeenCalledWith({
        message: "Forbidden: role required.",
      });
    });

    it("should return false if user has no roles", () => {
      const requiredRoleId = "editor-role-id";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      const context = mockExecutionContext([]);
      const response = context.switchToHttp().getResponse();

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(response.status).toHaveBeenCalledWith(403);
    });

<<<<<<< HEAD
    it('should handle undefined user.roles gracefully', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      
=======
    it("should handle undefined user.roles gracefully", () => {
      const requiredRoleId = "editor-role-id";
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();

>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
    it('should handle null user gracefully', () => {
      const requiredRoleId = 'editor-role-id';
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();
      
=======
    it("should handle null user gracefully", () => {
      const requiredRoleId = "editor-role-id";
      const GuardClass = hasRole(requiredRoleId);
      const guard = new GuardClass();

>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
    it('should create different guard instances for different roles', () => {
      const EditorGuard = hasRole('editor-role');
      const ViewerGuard = hasRole('viewer-role');
=======
    it("should create different guard instances for different roles", () => {
      const EditorGuard = hasRole("editor-role");
      const ViewerGuard = hasRole("viewer-role");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      expect(EditorGuard).not.toBe(ViewerGuard);

      const editorGuard = new EditorGuard();
      const viewerGuard = new ViewerGuard();

<<<<<<< HEAD
      const editorContext = mockExecutionContext(['editor-role']);
      const viewerContext = mockExecutionContext(['viewer-role']);
=======
      const editorContext = mockExecutionContext(["editor-role"]);
      const viewerContext = mockExecutionContext(["viewer-role"]);
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      expect(editorGuard.canActivate(editorContext)).toBe(true);
      expect(editorGuard.canActivate(viewerContext)).toBe(false);

      expect(viewerGuard.canActivate(viewerContext)).toBe(true);
      expect(viewerGuard.canActivate(editorContext)).toBe(false);
    });
  });
});
<<<<<<< HEAD


=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
