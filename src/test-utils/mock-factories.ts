import type { User } from '@entities/user.entity';
import type { Role } from '@entities/role.entity';
import type { Permission } from '@entities/permission.entity';

/**
 * Create a mock user for testing
 */
export const createMockUser = (overrides?: any): any => ({
  _id: 'mock-user-id',
  email: 'test@example.com',
  username: 'testuser',
  fullname: { fname: 'Test', lname: 'User' },
  password: '$2a$10$abcdefghijklmnopqrstuvwxyz', // Mock hashed password
  isVerified: false,
  isBanned: false,
  roles: [],
  passwordChangedAt: new Date('2026-01-01'),
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

/**
 * Create a mock verified user for testing
 */
export const createMockVerifiedUser = (overrides?: any): any => ({
  ...createMockUser(),
  isVerified: true,
  ...overrides,
});

/**
 * Create a mock admin user for testing
 */
export const createMockAdminUser = (overrides?: any): any => ({
  ...createMockVerifiedUser(),
  roles: ['admin-role-id'],
  ...overrides,
});

/**
 * Create a mock role for testing
 */
export const createMockRole = (overrides?: any): any => ({
  _id: 'mock-role-id',
  name: 'USER',
  description: 'Standard user role',
  permissions: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

/**
 * Create a mock admin role for testing
 */
export const createMockAdminRole = (overrides?: any): any => ({
  ...createMockRole(),
  _id: 'admin-role-id',
  name: 'ADMIN',
  description: 'Administrator role',
  ...overrides,
});

/**
 * Create a mock permission for testing
 */
export const createMockPermission = (overrides?: any): any => ({
  _id: 'mock-permission-id',
  name: 'read:users',
  description: 'Permission to read users',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

/**
 * Create a mock JWT payload
 */
export const createMockJwtPayload = (overrides?: any) => ({
  sub: 'mock-user-id',
  email: 'test@example.com',
  roles: [],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
  ...overrides,
});
