# Features Instructions - AuthKit Module

> **Last Updated**: February 2026  
> **Version**: 1.5.x

---

## 🚀 Before Starting Any Feature

### Pre-Implementation Checklist

- [ ] **Check existing functionality**: Search codebase to avoid duplication
- [ ] **Understand scope**: Is this a breaking change? (MAJOR version bump needed?)
- [ ] **Review public API impact**: Will this change exported interfaces/methods?
- [ ] **Check dependencies**: Do I need to add new npm packages?
- [ ] **Plan backwards compatibility**: Can existing users upgrade without code changes?
- [ ] **Consider security implications**: Does this affect authentication/authorization?
- [ ] **Review module philosophy**: Does this fit the module's purpose?

### Questions to Ask

1. **Is this already implemented?**
   - Search: `grep -r "featureName" src/`
   - Check: `README.md`, `CHANGELOG.md`

2. **Is this the right place?**
   - Should this be in the host app instead?
   - Is this too specific to one use case?

3. **What's the impact?**
   - Breaking change → MAJOR version
   - New feature → MINOR version
   - Bug fix → PATCH version

---

## 📋 Implementation Workflow

### Standard Feature Development Process

```
1. Design → 2. Implement → 3. Test → 4. Document → 5. Release
```

#### 1️⃣ Design Phase

- [ ] Create task file: `docs/tasks/active/MODULE-XXX-feature-name.md`
- [ ] Define interface/method signatures
- [ ] Plan error handling strategy
- [ ] Identify affected files
- [ ] Consider migration path (if breaking change)

#### 2️⃣ Implementation Phase

- [ ] Create feature branch: `feature/MODULE-XXX-description`
- [ ] Implement core logic (services layer)
- [ ] Add repository methods (if needed)
- [ ] Update controllers/endpoints (if needed)
- [ ] Add guards/decorators (if needed)
- [ ] Handle errors appropriately
- [ ] Add logging

#### 3️⃣ Testing Phase

- [ ] Write unit tests for services
- [ ] Write integration tests for controllers
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Verify coverage >= 80%
- [ ] Run full test suite: `npm test`

#### 4️⃣ Documentation Phase

- [ ] Update JSDoc/TSDoc for all public methods
- [ ] Update `README.md` with usage examples
- [ ] Update `CHANGELOG.md` with feature details
- [ ] Update task file with implementation notes
- [ ] Add troubleshooting notes (if complex)

#### 5️⃣ Release Phase

- [ ] Bump version: `npm version [minor|major]`
- [ ] Test in host app via `npm link`
- [ ] Create PR to `develop`
- [ ] After merge: Release from `master`

---

## ➕ Adding New Methods to Existing Services

### Example: Add `getUsersByRole()` to UsersService

#### Step 1: Design the Interface

````typescript
/**
 * Retrieve all users assigned to a specific role
 * @param roleId - The ID of the role to filter by
 * @returns Array of users with that role
 * @throws {NotFoundException} If role does not exist
 * @example
 * ```typescript
 * const admins = await usersService.getUsersByRole('admin_role_id');
 * ```
 */
async getUsersByRole(roleId: string): Promise<User[]> {
  // Implementation
}
````

#### Step 2: Add Repository Method (if needed)

**File**: [src/repositories/user.repository.ts](src/repositories/user.repository.ts)

```typescript
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "@models/user.model";

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // ... existing methods ...

  async findByRole(roleId: string | Types.ObjectId) {
    return this.userModel
      .find({ roles: roleId })
      .populate({ path: "roles", select: "name" })
      .lean();
  }
}
```

#### Step 3: Implement Service Method

**File**: [src/services/users.service.ts](src/services/users.service.ts)

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "@repos/user.repository";
import { RoleRepository } from "@repos/role.repository";
import { LoggerService } from "@services/logger.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly users: UserRepository,
    private readonly roles: RoleRepository,
    private readonly logger: LoggerService,
  ) {}

  // ... existing methods ...

  async getUsersByRole(roleId: string) {
    try {
      // Validate role exists
      const role = await this.roles.findById(roleId);
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      // Fetch users
      const users = await this.users.findByRole(roleId);
      this.logger.log(
        `Retrieved ${users.length} users for role ${roleId}`,
        "UsersService",
      );
      return users;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get users by role: ${error.message}`,
        error.stack,
        "UsersService",
      );
      throw new InternalServerErrorException("Failed to retrieve users");
    }
  }
}
```

#### Step 4: Add Controller Endpoint (Optional)

**File**: [src/controllers/users.controller.ts](src/controllers/users.controller.ts)

```typescript
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { UsersService } from "@services/users.service";
import { AuthenticateGuard } from "@middleware/authenticate.guard";
import { AdminGuard } from "@middleware/admin.guard";

@Controller("api/users")
@UseGuards(AuthenticateGuard, AdminGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // ... existing endpoints ...

  @Get("by-role/:roleId")
  async getUsersByRole(@Param("roleId") roleId: string) {
    return this.users.getUsersByRole(roleId);
  }
}
```

#### Step 5: Write Tests

**File**: [src/services/users.service.spec.ts](src/services/users.service.spec.ts)

```typescript
describe("UsersService", () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;
  let roleRepository: jest.Mocked<RoleRepository>;

  describe("getUsersByRole", () => {
    it("should return users for valid role ID", async () => {
      const mockRole = { _id: "role123", name: "admin" };
      const mockUsers = [
        { _id: "user1", email: "user1@example.com", roles: ["role123"] },
        { _id: "user2", email: "user2@example.com", roles: ["role123"] },
      ];

      roleRepository.findById.mockResolvedValue(mockRole as any);
      userRepository.findByRole.mockResolvedValue(mockUsers as any);

      const result = await service.getUsersByRole("role123");

      expect(result).toEqual(mockUsers);
      expect(roleRepository.findById).toHaveBeenCalledWith("role123");
      expect(userRepository.findByRole).toHaveBeenCalledWith("role123");
    });

    it("should throw NotFoundException for invalid role ID", async () => {
      roleRepository.findById.mockResolvedValue(null);

      await expect(service.getUsersByRole("invalid_id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

#### Step 6: Update Documentation

**Update**: [README.md](README.md)

````markdown
### Get Users by Role

```typescript
// Get all users with a specific role
const admins = await usersService.getUsersByRole("admin_role_id");
```
````

````

**Update**: [CHANGELOG.md](CHANGELOG.md)

```markdown
## [1.6.0] - 2026-02-XX

### Added
- `getUsersByRole(roleId)` method in UsersService to retrieve users by role
- New endpoint `GET /api/users/by-role/:roleId` (admin only)
````

---

## ⚙️ Adding Configuration Options

### Example: Add Configurable Token Expiry Defaults

#### Step 1: Define Configuration Interface

**File**: [src/types/auth-config.interface.ts](src/types/auth-config.interface.ts) (create if not exists)

```typescript
export interface AuthKitConfig {
  tokenExpiry?: {
    accessToken?: string; // Default: '15m'
    refreshToken?: string; // Default: '7d'
    emailToken?: string; // Default: '1d'
    resetToken?: string; // Default: '1h'
  };
  security?: {
    saltRounds?: number; // Default: 12
    requireEmailVerification?: boolean; // Default: true
  };
}
```

#### Step 2: Update Module to Accept Configuration

**File**: [src/auth-kit.module.ts](src/auth-kit.module.ts)

```typescript
import { DynamicModule, Module } from "@nestjs/common";
import { AuthKitConfig } from "./types/auth-config.interface";

@Module({})
export class AuthKitModule {
  static forRoot(config?: AuthKitConfig): DynamicModule {
    return {
      module: AuthKitModule,
      providers: [
        {
          provide: "AUTH_KIT_CONFIG",
          useValue: config || {},
        },
        // ... other providers
      ],
      exports: [
        // ... exports
      ],
    };
  }
}
```

#### Step 3: Inject Configuration in Service

**File**: [src/services/auth.service.ts](src/services/auth.service.ts)

```typescript
import { Injectable, Inject } from "@nestjs/common";
import { AuthKitConfig } from "../types/auth-config.interface";

@Injectable()
export class AuthService {
  private readonly defaultTokenExpiry = {
    accessToken: "15m",
    refreshToken: "7d",
    emailToken: "1d",
    resetToken: "1h",
  };

  constructor(
    @Inject("AUTH_KIT_CONFIG") private readonly config: AuthKitConfig,
    private readonly users: UserRepository,
    // ... other dependencies
  ) {}

  private getTokenExpiry(type: keyof AuthKitConfig["tokenExpiry"]): string {
    return (
      this.config.tokenExpiry?.[type] ||
      process.env[`JWT_${type.toUpperCase()}_EXPIRES_IN`] ||
      this.defaultTokenExpiry[type]
    );
  }

  private signAccessToken(payload: any) {
    const expiresIn = this.getTokenExpiry("accessToken");
    return jwt.sign(payload, this.getEnv("JWT_SECRET"), { expiresIn });
  }

  // ... other methods
}
```

#### Step 4: Document Configuration

**Update**: [README.md](README.md)

````markdown
### Advanced Configuration

```typescript
import { AuthKitModule } from "@ciscode/authentication-kit";

@Module({
  imports: [
    AuthKitModule.forRoot({
      tokenExpiry: {
        accessToken: "30m", // Override default 15m
        refreshToken: "14d", // Override default 7d
      },
      security: {
        saltRounds: 14, // Override default 12
        requireEmailVerification: false, // Override default true
      },
    }),
  ],
})
export class AppModule {}
```
````

````

---

## 🛡️ Adding New Guards

### Example: Add Permission-Based Guard

#### Step 1: Create Guard

**File**: [src/middleware/permissions.guard.ts](src/middleware/permissions.guard.ts)

```typescript
import { CanActivate, ExecutionContext, Injectable, mixin, Type } from '@nestjs/common';

/**
 * Factory function to create a permission guard
 * @param requiredPermissions - Array of permission names required
 * @returns Guard class that checks for permissions in JWT payload
 * @example
 * ```typescript
 * @UseGuards(hasPermissions(['users:read', 'users:write']))
 * @Get('admin/users')
 * async listUsers() { }
 * ```
 */
export const hasPermissions = (requiredPermissions: string[]): Type<CanActivate> => {
  @Injectable()
  class PermissionsGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      const userPermissions = Array.isArray(req.user?.permissions) ? req.user.permissions : [];

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every((perm) =>
        userPermissions.includes(perm)
      );

      if (hasAllPermissions) {
        return true;
      }

      res.status(403).json({
        message: 'Forbidden: insufficient permissions',
        required: requiredPermissions,
      });
      return false;
    }
  }

  return mixin(PermissionsGuard);
};
````

#### Step 2: Export Guard

**File**: [src/index.ts](src/index.ts)

```typescript
export { hasPermissions } from "./middleware/permissions.guard";
```

#### Step 3: Write Tests

**File**: [src/middleware/permissions.guard.spec.ts](src/middleware/permissions.guard.spec.ts)

```typescript
import { hasPermissions } from "./permissions.guard";
import { ExecutionContext } from "@nestjs/common";

describe("hasPermissions", () => {
  it("should allow access when user has all required permissions", () => {
    const PermissionsGuard = hasPermissions(["users:read", "users:write"]);
    const guard = new PermissionsGuard();

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { permissions: ["users:read", "users:write", "posts:read"] },
        }),
        getResponse: () => ({
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }),
      }),
    } as unknown as ExecutionContext;

    const canActivate = guard.canActivate(mockContext);
    expect(canActivate).toBe(true);
  });

  it("should deny access when user lacks required permissions", () => {
    const PermissionsGuard = hasPermissions(["users:delete"]);
    const guard = new PermissionsGuard();

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { permissions: ["users:read"] },
        }),
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const canActivate = guard.canActivate(mockContext);

    expect(canActivate).toBe(false);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("insufficient permissions"),
      }),
    );
  });
});
```

#### Step 4: Document Usage

**Update**: [README.md](README.md)

````markdown
### Permission-Based Guards

```typescript
import { hasPermissions } from "@ciscode/authentication-kit";

@Controller("api/admin")
export class AdminController {
  @UseGuards(AuthenticateGuard, hasPermissions(["users:delete"]))
  @Delete("users/:id")
  async deleteUser(@Param("id") id: string) {
    // Only accessible to users with 'users:delete' permission
  }
}
```
````

````

---

## 🎣 Adding Events/Hooks

### Example: Add Post-Login Hook

#### Step 1: Define Event Interface

**File**: [src/types/auth-events.interface.ts](src/types/auth-events.interface.ts)

```typescript
export interface AuthEvents {
  onPostLogin?: (userId: string, email: string) => Promise<void> | void;
  onPostRegister?: (userId: string, email: string) => Promise<void> | void;
  onEmailVerified?: (userId: string, email: string) => Promise<void> | void;
}
````

#### Step 2: Update Configuration Interface

**File**: [src/types/auth-config.interface.ts](src/types/auth-config.interface.ts)

```typescript
import { AuthEvents } from "./auth-events.interface";

export interface AuthKitConfig {
  tokenExpiry?: {
    /* ... */
  };
  security?: {
    /* ... */
  };
  events?: AuthEvents; // ← Add this
}
```

#### Step 3: Trigger Events in Service

**File**: [src/services/auth.service.ts](src/services/auth.service.ts)

```typescript
@Injectable()
export class AuthService {
  constructor(
    @Inject("AUTH_KIT_CONFIG") private readonly config: AuthKitConfig,
    // ... other dependencies
  ) {}

  async login(dto: LoginDto) {
    const user = await this.users.findByEmailWithPassword(dto.email);
    // ... validation logic ...

    const tokens = await this.issueTokensForUser(user._id.toString());

    // Trigger post-login hook
    if (this.config.events?.onPostLogin) {
      try {
        await this.config.events.onPostLogin(user._id.toString(), user.email);
      } catch (error) {
        this.logger.error(
          `Post-login hook failed: ${error.message}`,
          error.stack,
          "AuthService",
        );
        // Don't fail login if hook fails
      }
    }

    return tokens;
  }
}
```

#### Step 4: Document Usage

**Update**: [README.md](README.md)

````markdown
### Event Hooks

```typescript
import { AuthKitModule } from "@ciscode/authentication-kit";

@Module({
  imports: [
    AuthKitModule.forRoot({
      events: {
        onPostLogin: async (userId, email) => {
          console.log(`User ${email} logged in`);
          // Custom logic: update last login, send analytics, etc.
        },
        onEmailVerified: async (userId, email) => {
          console.log(`User ${email} verified their email`);
          // Custom logic: send welcome email, grant access, etc.
        },
      },
    }),
  ],
})
export class AppModule {}
```
````

````

---

## 🔧 Adding Utility Functions

### Example: Add `generateSecureToken()` Utility

#### Step 1: Implement Utility

**File**: [src/utils/crypto.utils.ts](src/utils/crypto.utils.ts) (create new file)

```typescript
import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 * @param length - Token length in bytes (default: 32)
 * @returns Hex-encoded random token
 * @example
 * ```typescript
 * const token = generateSecureToken(); // 64-character hex string
 * ```
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure numeric code (e.g., for 2FA)
 * @param digits - Number of digits (default: 6)
 * @returns Numeric code as string
 * @example
 * ```typescript
 * const code = generateNumericCode(6); // "123456"
 * ```
 */
export function generateNumericCode(digits: number = 6): string {
  const max = Math.pow(10, digits) - 1;
  const min = Math.pow(10, digits - 1);
  const code = Math.floor(Math.random() * (max - min + 1)) + min;
  return code.toString();
}
````

#### Step 2: Write Tests

**File**: [src/utils/crypto.utils.spec.ts](src/utils/crypto.utils.spec.ts)

```typescript
import { generateSecureToken, generateNumericCode } from "./crypto.utils";

describe("Crypto Utils", () => {
  describe("generateSecureToken", () => {
    it("should generate hex token of correct length", () => {
      const token = generateSecureToken(32);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should generate unique tokens", () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("generateNumericCode", () => {
    it("should generate code with correct number of digits", () => {
      const code = generateNumericCode(6);
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^\d{6}$/);
    });

    it("should not start with 0", () => {
      const code = generateNumericCode(6);
      expect(code[0]).not.toBe("0");
    });
  });
});
```

#### Step 3: Use in Services (Optional - Internal Use)

```typescript
// In auth.service.ts
import { generateSecureToken } from '@utils/crypto.utils';

async generatePasswordResetToken(userId: string): Promise<string> {
  const randomPart = generateSecureToken(16);
  const payload = { sub: userId, random: randomPart };
  return this.signResetToken(payload);
}
```

**Note**: Utility functions are typically NOT exported from `src/index.ts` (internal use only).

---

## 🔄 Backwards Compatibility Guidelines

### Non-Breaking Changes (MINOR/PATCH)

**✅ Safe to add:**

- New optional parameters with defaults
- New methods/endpoints
- New guards/decorators
- Internal refactoring (no API changes)

**Example - Adding Optional Parameter:**

```typescript
// v1.5.x - OLD
async register(dto: RegisterDto) { }

// v1.6.0 - NEW (non-breaking)
async register(dto: RegisterDto, skipVerification = false) {
  // Default value preserves old behavior
}
```

### Breaking Changes (MAJOR)

**❌ Requires MAJOR version bump:**

- Changing method signatures (parameters, return types)
- Removing public methods
- Renaming exported classes/functions
- Changing DTO structures

**Example - Breaking Change:**

```typescript
// v1.x.x - OLD
async login(dto: LoginDto): Promise<string> {
  return accessToken;
}

// v2.0.0 - NEW (BREAKING - return type changed)
async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
  return { accessToken, refreshToken };
}
```

**Migration guide required:**

````markdown
## Migrating from v1.x to v2.0

### Breaking Changes

#### `login()` return type changed

**Before (v1.x):**

```typescript
const token = await authService.login(dto); // string
```
````

**After (v2.0):**

```typescript
const { accessToken, refreshToken } = await authService.login(dto);
```

**Migration:**
Replace all calls to `login()` to destructure the returned object.

````

---

## 🗑️ Deprecation Process

### Step 1: Mark as Deprecated (MINOR version)

```typescript
/**
 * @deprecated Use `issueTokensForUser()` instead. Will be removed in v3.0.0
 */
async generateTokens(userId: string) {
  console.warn('DEPRECATED: generateTokens() is deprecated. Use issueTokensForUser() instead.');
  return this.issueTokensForUser(userId);
}
````

### Step 2: Update CHANGELOG

```markdown
## [1.7.0] - 2026-03-01

### Deprecated

- `generateTokens()` - Use `issueTokensForUser()` instead (will be removed in v3.0.0)
```

### Step 3: Remove in Next MAJOR Version

```markdown
## [3.0.0] - 2026-06-01

### BREAKING CHANGES

- Removed deprecated `generateTokens()` method - use `issueTokensForUser()` instead
```

---

## 🎯 Feature Example: Walk-Through

### Scenario: Add "Remember Me" Functionality

#### 1. Design

**Goal**: Extend refresh token expiry when user selects "Remember Me"

**Changes needed**:

- Add `rememberMe?: boolean` to `LoginDto`
- Modify `login()` to handle extended expiry
- Update token generation logic

**Impact**: Non-breaking (MINOR version bump)

#### 2. Implementation

**Step 2a: Update DTO**

[src/dtos/auth/login.dto.ts](src/dtos/auth/login.dto.ts):

```typescript
import { IsEmail, IsString, IsBoolean, IsOptional } from "class-validator";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
```

**Step 2b: Update Service**

[src/services/auth.service.ts](src/services/auth.service.ts):

```typescript
async login(dto: LoginDto) {
  const user = await this.users.findByEmailWithPassword(dto.email);
  // ... validation ...

  const payload = await this.buildTokenPayload(user._id.toString());
  const accessToken = this.signAccessToken(payload);

  // Extended expiry for "Remember Me"
  const refreshExpiry = dto.rememberMe ? '30d' : '7d';
  const refreshToken = jwt.sign(
    { sub: user._id.toString(), purpose: 'refresh' },
    this.getEnv('JWT_REFRESH_SECRET'),
    { expiresIn: refreshExpiry }
  );

  this.logger.log(
    `User ${user.email} logged in (rememberMe: ${dto.rememberMe})`,
    'AuthService'
  );

  return { accessToken, refreshToken };
}
```

**Step 2c: Update Controller (Cookie TTL)**

[src/controllers/auth.controller.ts](src/controllers/auth.controller.ts):

```typescript
@Post('login')
async login(@Body() dto: LoginDto, @Res() res: Response) {
  const { accessToken, refreshToken } = await this.auth.login(dto);
  const refreshTTL = dto.rememberMe ? '30d' : '7d';
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: getMillisecondsFromExpiry(refreshTTL),
  });

  return res.status(200).json({ accessToken, refreshToken });
}
```

#### 3. Testing

[src/services/auth.service.spec.ts](src/services/auth.service.spec.ts):

```typescript
describe("login", () => {
  it("should use extended expiry when rememberMe is true", async () => {
    const dto = {
      email: "test@example.com",
      password: "password123",
      rememberMe: true,
    };
    userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
    userRepository.findByIdWithRolesAndPermissions.mockResolvedValue(mockUser);

    const { refreshToken } = await service.login(dto);
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    );

    // Check expiry is ~30 days (allow 1 hour tolerance)
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    const actualTTL = decoded.exp - decoded.iat;
    expect(actualTTL).toBeGreaterThan(thirtyDaysInSeconds - 3600);
  });

  it("should use default expiry when rememberMe is false", async () => {
    const dto = {
      email: "test@example.com",
      password: "password123",
      rememberMe: false,
    };
    // ... test 7-day expiry ...
  });
});
```

#### 4. Documentation

**Update**: [README.md](README.md)

````markdown
### Login with "Remember Me"

```typescript
// Standard login (refresh token valid for 7 days)
await authService.login({ email: "user@example.com", password: "password123" });

// Login with "Remember Me" (refresh token valid for 30 days)
await authService.login({
  email: "user@example.com",
  password: "password123",
  rememberMe: true,
});
```
````

````

**Update**: [CHANGELOG.md](CHANGELOG.md)

```markdown
## [1.7.0] - 2026-03-15

### Added
- "Remember Me" functionality: `LoginDto` now accepts optional `rememberMe` boolean
- When `rememberMe: true`, refresh token expiry is extended to 30 days (default: 7 days)
````

#### 5. Release

```bash
# Bump minor version (new feature, backwards-compatible)
npm version minor  # 1.6.0 → 1.7.0

# Push
git push && git push --tags

# Test in host app
npm run build && npm link
cd ~/host-app && npm link @ciscode/authentication-kit
# Test thoroughly

# Publish
npm publish
```

---

## ✅ Feature Completion Checklist

- [ ] Feature designed and documented in task file
- [ ] Implementation complete (services, repositories, controllers)
- [ ] Error handling implemented
- [ ] Logging added
- [ ] Unit tests written (coverage >= 80%)
- [ ] Integration tests written (if applicable)
- [ ] JSDoc/TSDoc added to all public methods
- [ ] README updated with usage examples
- [ ] CHANGELOG updated
- [ ] Version bumped appropriately
- [ ] Tested in host app via `npm link`
- [ ] Breaking changes documented (if MAJOR version)
- [ ] PR created to `develop`
- [ ] Task file moved to archive after merge

---

**Last Updated**: February 2026  
**Process Owner**: Development Team  
**Review Cycle**: Every major release
