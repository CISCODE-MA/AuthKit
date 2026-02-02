# ✅ Auth Kit Testing - Implementation Checklist

> **Practical checklist for implementing testing infrastructure**

---

## 🎯 Goal: 80%+ Test Coverage

**Status**: Not Started  
**Estimated Time**: 2-3 weeks  
**Priority**: 🔴 CRITICAL

---

## Phase 1: Infrastructure Setup (1-2 days)

### Step 1: Install Test Dependencies

```bash
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  @nestjs/testing \
  mongodb-memory-server \
  supertest \
  @types/supertest
```

### Step 2: Create Jest Configuration

- [ ] Create `jest.config.js` in root:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/standalone.ts',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@dto/(.*)$': '<rootDir>/src/dto/$1',
    '^@repos/(.*)$': '<rootDir>/src/repositories/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@guards/(.*)$': '<rootDir>/src/guards/$1',
    '^@decorators/(.*)$': '<rootDir>/src/decorators/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@filters/(.*)$': '<rootDir>/src/filters/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};
```

### Step 3: Update package.json Scripts

- [ ] Replace test scripts:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
}
```

### Step 4: Create Test Utilities

- [ ] Create `src/test-utils/test-setup.ts`:

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

export const setupTestDB = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
};

export const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
```

- [ ] Create `src/test-utils/mock-factories.ts`:

```typescript
import { User } from '@entities/user.entity';
import { Role } from '@entities/role.entity';

export const createMockUser = (overrides?: Partial<User>): User => ({
  _id: 'mock-user-id',
  email: 'test@example.com',
  username: 'testuser',
  name: 'Test User',
  password: 'hashed-password',
  isEmailVerified: false,
  isBanned: false,
  roles: [],
  passwordChangedAt: new Date(),
  ...overrides,
});

export const createMockRole = (overrides?: Partial<Role>): Role => ({
  _id: 'mock-role-id',
  name: 'USER',
  description: 'Standard user role',
  permissions: [],
  ...overrides,
});
```

---

## Phase 2: Unit Tests - Services (Week 1)

### AuthService Tests (Priority: 🔥 HIGHEST)

- [ ] `src/services/auth.service.spec.ts`

**Test cases to implement**:

```typescript
describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user');
    it('should hash the password');
    it('should send verification email');
    it('should throw ConflictException if email exists');
    it('should assign default USER role');
  });

  describe('login', () => {
    it('should login with valid credentials');
    it('should return access and refresh tokens');
    it('should throw UnauthorizedException if credentials invalid');
    it('should throw ForbiddenException if email not verified');
    it('should throw ForbiddenException if user is banned');
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token');
    it('should throw UnauthorizedException if token invalid');
    it('should throw if user already verified');
  });

  describe('refreshToken', () => {
    it('should generate new tokens with valid refresh token');
    it('should throw if refresh token invalid');
    it('should throw if user not found');
    it('should throw if password changed after token issued');
  });

  describe('forgotPassword', () => {
    it('should send password reset email');
    it('should throw NotFoundException if email not found');
  });

  describe('resetPassword', () => {
    it('should reset password with valid token');
    it('should hash new password');
    it('should update passwordChangedAt');
    it('should throw if token invalid');
  });
});
```

### SeedService Tests

- [ ] `src/services/seed.service.spec.ts`

**Test cases**:
- Should create admin user
- Should create default roles
- Should not duplicate if already exists

### AdminRoleService Tests

- [ ] `src/services/admin-role.service.spec.ts`

**Test cases**:
- Should find all users
- Should ban/unban user
- Should update user roles
- Should delete user

### MailService Tests

- [ ] `src/services/mail.service.spec.ts`

**Test cases**:
- Should send verification email
- Should send password reset email
- Should handle mail server errors

### LoggerService Tests

- [ ] `src/services/logger.service.spec.ts`

**Test cases**:
- Should log info/error/debug
- Should format messages correctly

---

## Phase 2: Unit Tests - Guards & Decorators (Week 1)

### Guards Tests

- [ ] `src/guards/authenticate.guard.spec.ts`
  - Should allow authenticated requests
  - Should reject unauthenticated requests
  - Should extract user from JWT

- [ ] `src/guards/admin.guard.spec.ts`
  - Should allow admin users
  - Should reject non-admin users

- [ ] `src/guards/role.guard.spec.ts`
  - Should allow users with required role
  - Should reject users without required role

### Decorator Tests

- [ ] `src/decorators/admin.decorator.spec.ts`
  - Should set admin metadata correctly

---

## Phase 2: Unit Tests - Repositories (Week 1-2)

- [ ] `src/repositories/user.repository.spec.ts`
- [ ] `src/repositories/role.repository.spec.ts`
- [ ] `src/repositories/permission.repository.spec.ts`

**Test all CRUD operations with test database**

---

## Phase 3: Integration Tests - Controllers (Week 2)

### AuthController Tests

- [ ] `src/controllers/auth.controller.spec.ts`

**Test cases**:

```typescript
describe('AuthController (Integration)', () => {
  describe('POST /api/auth/register', () => {
    it('should return 201 with user data');
    it('should return 400 for invalid input');
    it('should return 409 if email exists');
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 with tokens');
    it('should return 401 for invalid credentials');
    it('should return 403 if email not verified');
  });

  describe('POST /api/auth/verify-email', () => {
    it('should return 200 on success');
    it('should return 401 if token invalid');
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should return new tokens');
    it('should return 401 if token invalid');
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return 200');
    it('should return 404 if email not found');
  });

  describe('POST /api/auth/reset-password', () => {
    it('should return 200 on success');
    it('should return 401 if token invalid');
  });
});
```

### Other Controller Tests

- [ ] `src/controllers/users.controller.spec.ts`
- [ ] `src/controllers/roles.controller.spec.ts`
- [ ] `src/controllers/permissions.controller.spec.ts`

---

## Phase 4: E2E Tests (Week 3)

### E2E Test Setup

- [ ] Create `test/` directory in root
- [ ] Create `test/jest-e2e.config.js`
- [ ] Create `test/app.e2e-spec.ts`

### Critical Flow Tests

- [ ] **Registration → Verification → Login Flow**
  ```typescript
  it('should complete full registration flow', async () => {
    // 1. Register user
    // 2. Extract verification token from email
    // 3. Verify email
    // 4. Login successfully
  });
  ```

- [ ] **OAuth Flow Tests**
  ```typescript
  it('should authenticate via Google OAuth');
  it('should authenticate via Microsoft OAuth');
  it('should authenticate via Facebook OAuth');
  ```

- [ ] **RBAC Flow Tests**
  ```typescript
  it('should restrict access based on roles');
  it('should allow access with correct permissions');
  ```

- [ ] **Password Reset Flow**
  ```typescript
  it('should complete password reset flow', async () => {
    // 1. Request password reset
    // 2. Extract reset token
    // 3. Reset password
    // 4. Login with new password
  });
  ```

---

## Phase 5: Coverage Optimization (Week 3)

### Coverage Check

- [ ] Run `npm run test:cov`
- [ ] Review coverage report
- [ ] Identify gaps (<80%)

### Fill Gaps

- [ ] Add missing edge case tests
- [ ] Test error handling paths
- [ ] Test validation logic
- [ ] Test helper functions

### Verification

- [ ] Ensure all files have 80%+ coverage
- [ ] Verify all critical paths tested
- [ ] Check for untested branches

---

## 📊 Progress Tracking

| Phase | Status | Coverage | Tests Written | Date |
|-------|--------|----------|---------------|------|
| Infrastructure | ⬜ Not Started | 0% | 0 | - |
| Services | ⬜ Not Started | 0% | 0 | - |
| Guards/Decorators | ⬜ Not Started | 0% | 0 | - |
| Repositories | ⬜ Not Started | 0% | 0 | - |
| Controllers | ⬜ Not Started | 0% | 0 | - |
| E2E | ⬜ Not Started | 0% | 0 | - |
| Coverage Optimization | ⬜ Not Started | 0% | 0 | - |

**Target**: 🎯 80%+ coverage across all categories

---

## 🚀 Quick Start

**To begin today**:

1. Create branch: `feature/MODULE-TEST-001-testing-infrastructure`
2. Install dependencies (Step 1)
3. Create Jest config (Step 2)
4. Update package.json (Step 3)
5. Create test utilities (Step 4)
6. Write first test: `auth.service.spec.ts` → `register()` test
7. Run: `npm test`
8. Verify test passes
9. Commit & continue

---

## 📖 Reference Examples

Look at **DatabaseKit module** for reference:
- `modules/database-kit/src/services/database.service.spec.ts`
- `modules/database-kit/src/utils/pagination.utils.spec.ts`
- `modules/database-kit/jest.config.js`

---

*Checklist created: February 2, 2026*  
*Start date: TBD*  
*Target completion: 3 weeks from start*
