<<<<<<< HEAD
import type { User } from '@entities/user.entity';
import type { Role } from '@entities/role.entity';
import type { Permission } from '@entities/permission.entity';

=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
/**
 * Create a mock user for testing
 */
export const createMockUser = (overrides?: any): any => ({
<<<<<<< HEAD
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
=======
  _id: "mock-user-id",
  email: "test@example.com",
  username: "testuser",
  fullname: { fname: "Test", lname: "User" },
  password: "$2a$10$abcdefghijklmnopqrstuvwxyz", // Mock hashed password
  isVerified: false,
  isBanned: false,
  roles: [],
  passwordChangedAt: new Date("2026-01-01"),
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
<<<<<<< HEAD
  roles: ['admin-role-id'],
=======
  roles: ["admin-role-id"],
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  ...overrides,
});

/**
 * Create a mock role for testing
 */
export const createMockRole = (overrides?: any): any => ({
<<<<<<< HEAD
  _id: 'mock-role-id',
  name: 'USER',
  description: 'Standard user role',
  permissions: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
=======
  _id: "mock-role-id",
  name: "USER",
  description: "Standard user role",
  permissions: [],
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  ...overrides,
});

/**
 * Create a mock admin role for testing
 */
export const createMockAdminRole = (overrides?: any): any => ({
  ...createMockRole(),
<<<<<<< HEAD
  _id: 'admin-role-id',
  name: 'ADMIN',
  description: 'Administrator role',
=======
  _id: "admin-role-id",
  name: "ADMIN",
  description: "Administrator role",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  ...overrides,
});

/**
 * Create a mock permission for testing
 */
export const createMockPermission = (overrides?: any): any => ({
<<<<<<< HEAD
  _id: 'mock-permission-id',
  name: 'read:users',
  description: 'Permission to read users',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
=======
  _id: "mock-permission-id",
  name: "read:users",
  description: "Permission to read users",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  ...overrides,
});

/**
 * Create a mock JWT payload
 */
export const createMockJwtPayload = (overrides?: any) => ({
<<<<<<< HEAD
  sub: 'mock-user-id',
  email: 'test@example.com',
=======
  sub: "mock-user-id",
  email: "test@example.com",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  roles: [],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
  ...overrides,
});
