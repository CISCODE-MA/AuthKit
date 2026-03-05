# Testing Instructions - AuthKit Module

> **Last Updated**: February 2026  
> **Current Status**: ⚠️ Tests need expansion (target: 80%+ coverage)

---

## 🎯 Testing Philosophy

### Behavior Over Implementation

**✅ Test what the code does, not how it does it:**

```typescript
// ✅ GOOD - Testing behavior
it("should reject login with invalid credentials", async () => {
  await expect(
    authService.login({ email: "test@example.com", password: "wrong" }),
  ).rejects.toThrow(UnauthorizedException);
});

// ❌ BAD - Testing implementation
it("should call bcrypt.compare with user password", async () => {
  const spy = jest.spyOn(bcrypt, "compare");
  await authService.login(dto);
  expect(spy).toHaveBeenCalledWith(dto.password, user.password);
});
```

**Why**: Implementation tests break when refactoring, even if behavior stays the same.

### Test the Contract, Not the Code

For AuthKit, the **contract** is:

- Public methods in exported services
- Guard behavior (allow/deny access)
- Controller endpoints (HTTP responses)
- DTO validation (accept/reject inputs)

**Don't test**: Private methods, internal utilities (unless complex logic), Mongoose internals.

---

## 📊 Coverage Targets

| Layer            | Minimum Coverage | Priority    | Notes                                     |
| ---------------- | ---------------- | ----------- | ----------------------------------------- |
| **Services**     | 90%+             | 🔴 Critical | Core business logic, all paths tested     |
| **Repositories** | 70%+             | 🟡 High     | Database abstraction, test CRUD + queries |
| **Guards**       | 95%+             | 🔴 Critical | Security-critical, test all scenarios     |
| **Controllers**  | 80%+             | 🟢 Medium   | Integration tests preferred               |
| **DTOs**         | 100%             | 🔴 Critical | Validate all validation rules             |
| **Utils**        | 80%+             | 🟢 Medium   | Test edge cases                           |

**Overall Target**: 80%+ code coverage

---

## 📁 Test File Organization

### File Placement

**Rule**: Tests live next to the code they test

```
src/
  services/
    auth.service.ts
    auth.service.spec.ts        ← Same directory
    mail.service.ts
    mail.service.spec.ts
  repositories/
    user.repository.ts
    user.repository.spec.ts
  middleware/
    authenticate.guard.ts
    authenticate.guard.spec.ts
```

### Naming Convention

| Code File               | Test File                    | Pattern     |
| ----------------------- | ---------------------------- | ----------- |
| `auth.service.ts`       | `auth.service.spec.ts`       | `*.spec.ts` |
| `user.repository.ts`    | `user.repository.spec.ts`    | `*.spec.ts` |
| `authenticate.guard.ts` | `authenticate.guard.spec.ts` | `*.spec.ts` |

### Test Structure

**Standard template:**

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { ServiceUnderTest } from "./service-under-test";
import { DependencyOne } from "./dependency-one";
import { DependencyTwo } from "./dependency-two";

describe("ServiceUnderTest", () => {
  let service: ServiceUnderTest;
  let dependencyOne: jest.Mocked<DependencyOne>;
  let dependencyTwo: jest.Mocked<DependencyTwo>;

  beforeEach(async () => {
    // Create mock dependencies
    const mockDependencyOne = {
      methodOne: jest.fn(),
      methodTwo: jest.fn(),
    };

    const mockDependencyTwo = {
      methodThree: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceUnderTest,
        { provide: DependencyOne, useValue: mockDependencyOne },
        { provide: DependencyTwo, useValue: mockDependencyTwo },
      ],
    }).compile();

    service = module.get<ServiceUnderTest>(ServiceUnderTest);
    dependencyOne = module.get(DependencyOne);
    dependencyTwo = module.get(DependencyTwo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("methodName", () => {
    it("should do expected behavior in normal case", async () => {
      // Arrange
      dependencyOne.methodOne.mockResolvedValue(expectedData);

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
      expect(dependencyOne.methodOne).toHaveBeenCalledWith(expectedArgs);
    });

    it("should handle error case appropriately", async () => {
      // Arrange
      dependencyOne.methodOne.mockRejectedValue(new Error("DB error"));

      // Act & Assert
      await expect(service.methodName(input)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
```

---

## 🎭 Mocking Patterns

### 1. Mocking Repositories

**Pattern for UserRepository:**

```typescript
const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
  findByIdWithRolesAndPermissions: jest.fn(),
  list: jest.fn(),
};

// In test setup
{ provide: UserRepository, useValue: mockUserRepository }

// In test
mockUserRepository.findByEmail.mockResolvedValue({
  _id: 'user123',
  email: 'test@example.com',
  password: 'hashed_password',
  isVerified: true,
  isBanned: false,
  roles: ['role123'],
});
```

**For RoleRepository:**

```typescript
const mockRoleRepository = {
  findByName: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  list: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
  assignPermissions: jest.fn(),
};
```

**For PermissionRepository:**

```typescript
const mockPermissionRepository = {
  findByName: jest.fn(),
  create: jest.fn(),
  list: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
};
```

### 2. Mocking Services

**Pattern for MailService:**

```typescript
const mockMailService = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  verifyConnection: jest.fn(),
};

// In test
mockMailService.sendVerificationEmail.mockResolvedValue(undefined);
```

**For LoggerService:**

```typescript
const mockLoggerService = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// Usually no assertions needed, but can verify error logging
expect(mockLoggerService.error).toHaveBeenCalledWith(
  expect.stringContaining("Authentication failed"),
  expect.any(String),
  "AuthService",
);
```

**For AuthService (when testing controllers):**

```typescript
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerification: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  getMe: jest.fn(),
};
```

### 3. Mocking External Libraries

**bcrypt:**

```typescript
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// In test
mockedBcrypt.hash.mockResolvedValue("hashed_password" as never);
mockedBcrypt.compare.mockResolvedValue(true as never);
```

**jsonwebtoken:**

```typescript
import * as jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// In test
mockedJwt.sign.mockReturnValue("mock_token" as any);
mockedJwt.verify.mockReturnValue({ sub: "user123", roles: [] } as any);
```

**nodemailer:**

```typescript
const mockTransporter = {
  sendMail: jest.fn().mockResolvedValue({ messageId: "msg123" }),
  verify: jest.fn().mockResolvedValue(true),
};

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => mockTransporter),
}));
```

### 4. Mocking Mongoose Models

```typescript
import { getModelToken } from '@nestjs/mongoose';
import { User } from '@models/user.model';

const mockUserModel = {
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
};

// Add chainable methods for populate
mockUserModel.findById.mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(mockUser),
});

// In test setup
{ provide: getModelToken(User.name), useValue: mockUserModel }
```

### 5. Mocking NestJS ExecutionContext (Guards)

```typescript
const mockExecutionContext = {
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue({
      headers: { authorization: "Bearer mock_token" },
      user: { sub: "user123", roles: ["role123"] },
      cookies: { refreshToken: "refresh_token" },
    }),
    getResponse: jest.fn().mockReturnValue({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }),
  }),
} as unknown as ExecutionContext;
```

### 6. Mocking Environment Variables

```typescript
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    JWT_SECRET: "test_secret",
    JWT_REFRESH_SECRET: "test_refresh_secret",
    JWT_ACCESS_TOKEN_EXPIRES_IN: "15m",
    JWT_REFRESH_TOKEN_EXPIRES_IN: "7d",
    SMTP_HOST: "smtp.test.com",
    SMTP_PORT: "587",
  };
});

afterEach(() => {
  process.env = originalEnv;
});
```

---

## 🧪 What to Test

### Services Layer

#### AuthService

**✅ Test these scenarios:**

| Method             | Test Cases                                                              |
| ------------------ | ----------------------------------------------------------------------- |
| `register()`       | Success: Create user, hash password, send verification email            |
|                    | Error: Duplicate email throws ConflictException                         |
|                    | Error: Mail service failure is handled                                  |
| `login()`          | Success: Valid credentials return tokens                                |
|                    | Error: Invalid email throws UnauthorizedException                       |
|                    | Error: Invalid password throws UnauthorizedException                    |
|                    | Error: Unverified email throws ForbiddenException                       |
|                    | Error: Banned user throws ForbiddenException                            |
| `refresh()`        | Success: Valid refresh token returns new tokens                         |
|                    | Error: Invalid token throws UnauthorizedException                       |
|                    | Error: Expired token throws UnauthorizedException                       |
|                    | Error: Token issued before password change throws UnauthorizedException |
| `verifyEmail()`    | Success: Valid token verifies user                                      |
|                    | Error: Invalid token throws UnauthorizedException                       |
|                    | Error: Already verified user handled gracefully                         |
| `forgotPassword()` | Success: Sends reset email                                              |
|                    | Error: User not found handled gracefully (no user enumeration)          |
| `resetPassword()`  | Success: Valid token resets password                                    |
|                    | Error: Invalid token throws UnauthorizedException                       |
|                    | Error: Updates passwordChangedAt timestamp                              |

**Example test:**

```typescript
describe("AuthService", () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let mailService: jest.Mocked<MailService>;
  let roleRepository: jest.Mocked<RoleRepository>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      findByIdWithRolesAndPermissions: jest.fn(),
    };

    const mockMailService = {
      sendVerificationEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    };

    const mockRoleRepository = {
      findByName: jest.fn(),
    };

    const mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: MailService, useValue: mockMailService },
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    mailService = module.get(MailService);
    roleRepository = module.get(RoleRepository);
    loggerService = module.get(LoggerService);

    // Set up environment
    process.env.JWT_SECRET = "test_secret";
    process.env.JWT_REFRESH_SECRET = "test_refresh";
  });

  describe("login", () => {
    const loginDto = { email: "test@example.com", password: "password123" };

    it("should return access and refresh tokens for valid credentials", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 12),
        isVerified: true,
        isBanned: false,
        roles: [],
      };

      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      userRepository.findByIdWithRolesAndPermissions.mockResolvedValue({
        ...mockUser,
        roles: [],
      } as any);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
    });

    it("should throw UnauthorizedException for invalid email", async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw ForbiddenException for unverified user", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 12),
        isVerified: false, // ← Unverified
        isBanned: false,
      };

      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser as any);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it("should throw ForbiddenException for banned user", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 12),
        isVerified: true,
        isBanned: true, // ← Banned
      };

      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser as any);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });
  });
});
```

#### UsersService

**✅ Test these scenarios:**

| Method         | Test Cases                       |
| -------------- | -------------------------------- |
| `createUser()` | Success: Admin creates user      |
|                | Error: Duplicate email handled   |
| `listUsers()`  | Success: Returns paginated list  |
|                | Success: Filters work correctly  |
| `banUser()`    | Success: Sets isBanned flag      |
|                | Error: User not found            |
| `deleteUser()` | Success: Deletes user            |
|                | Error: Cannot delete admin users |

### Guards Layer

#### AuthenticateGuard

**✅ Test these scenarios:**

```typescript
describe("AuthenticateGuard", () => {
  let guard: AuthenticateGuard;
  let userRepository: jest.Mocked<UserRepository>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(() => {
    process.env.JWT_SECRET = "test_secret";
  });

  it("should allow access with valid token", async () => {
    const mockUser = { _id: "user123", isVerified: true, isBanned: false };
    userRepository.findById.mockResolvedValue(mockUser as any);

    const context = createMockContext("Bearer valid_token");
    const canActivate = await guard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  it("should throw UnauthorizedException when Authorization header is missing", async () => {
    const context = createMockContext(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should throw UnauthorizedException when token is invalid", async () => {
    const context = createMockContext("Bearer invalid_token");

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should throw ForbiddenException for unverified user", async () => {
    const mockUser = { _id: "user123", isVerified: false, isBanned: false };
    userRepository.findById.mockResolvedValue(mockUser as any);

    const context = createMockContext("Bearer valid_token");

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("should throw UnauthorizedException when token issued before password change", async () => {
    const mockUser = {
      _id: "user123",
      isVerified: true,
      isBanned: false,
      passwordChangedAt: new Date(),
    };
    userRepository.findById.mockResolvedValue(mockUser as any);

    // Create token with old iat
    const oldToken = jwt.sign(
      { sub: "user123", iat: Math.floor(Date.now() / 1000) - 3600 },
      "test_secret",
    );

    const context = createMockContext(`Bearer ${oldToken}`);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
```

#### hasRole() Guard

**✅ Test these scenarios:**

```typescript
describe("hasRole", () => {
  it("should allow access when user has required role", () => {
    const RoleGuard = hasRole("admin_role_id");
    const guard = new RoleGuard();

    const context = createMockContext(null, { roles: ["admin_role_id"] });
    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  it("should deny access when user lacks required role", () => {
    const RoleGuard = hasRole("admin_role_id");
    const guard = new RoleGuard();

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const context = createMockContext(
      null,
      { roles: ["user_role_id"] },
      mockResponse,
    );

    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(false);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
  });
});
```

### Repository Layer

#### UserRepository

**✅ Test these methods:**

```typescript
describe("UserRepository", () => {
  let repository: UserRepository;
  let mockUserModel: any;

  beforeEach(async () => {
    mockUserModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      find: jest.fn(),
    };

    // Mock populate chain
    mockUserModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  it("should create a user", async () => {
    const userData = { email: "test@example.com", password: "hashed" };
    mockUserModel.create.mockResolvedValue(userData);

    const result = await repository.create(userData);

    expect(result).toEqual(userData);
    expect(mockUserModel.create).toHaveBeenCalledWith(userData);
  });

  it("should find user by email", async () => {
    const mockUser = { _id: "user123", email: "test@example.com" };
    mockUserModel.findOne.mockResolvedValue(mockUser);

    const result = await repository.findByEmail("test@example.com");

    expect(result).toEqual(mockUser);
    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
    });
  });
});
```

### Controllers Layer

**Test HTTP layer (integration tests preferred):**

```typescript
describe("AuthController", () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      verifyEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: OAuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe("POST /api/auth/login", () => {
    it("should return access and refresh tokens", async () => {
      const loginDto = { email: "test@example.com", password: "password123" };
      const tokens = {
        accessToken: "access_token",
        refreshToken: "refresh_token",
      };

      authService.login.mockResolvedValue(tokens);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      } as any;

      await controller.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refreshToken",
        tokens.refreshToken,
        expect.objectContaining({ httpOnly: true }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(tokens);
    });
  });
});
```

### DTOs Layer

**Test validation rules:**

```typescript
import { validate } from "class-validator";
import { LoginDto } from "@dtos/auth/login.dto";

describe("LoginDto", () => {
  it("should pass validation with valid data", async () => {
    const dto = new LoginDto();
    dto.email = "test@example.com";
    dto.password = "password123";

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation with invalid email", async () => {
    const dto = new LoginDto();
    dto.email = "invalid-email";
    dto.password = "password123";

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("email");
  });

  it("should fail validation when password is missing", async () => {
    const dto = new LoginDto();
    dto.email = "test@example.com";
    // password not set

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("password");
  });
});
```

---

## 🚨 Error Scenarios

### Test All Exception Types

| Exception                      | When to Test                                             |
| ------------------------------ | -------------------------------------------------------- |
| `UnauthorizedException`        | Invalid credentials, expired tokens, missing auth header |
| `ForbiddenException`           | Unverified user, banned user, insufficient permissions   |
| `NotFoundException`            | User not found, role not found, permission not found     |
| `ConflictException`            | Duplicate email, duplicate role name                     |
| `BadRequestException`          | Invalid token format, malformed data                     |
| `InternalServerErrorException` | Missing env vars, external service failures              |

**Example:**

```typescript
describe("Error handling", () => {
  it("should throw InternalServerErrorException when JWT_SECRET is missing", async () => {
    delete process.env.JWT_SECRET;

    await expect(service.login(dto)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(loggerService.error).toHaveBeenCalledWith(
      expect.stringContaining("JWT_SECRET"),
      "AuthService",
    );
  });

  it("should throw InternalServerErrorException when mail service fails", async () => {
    mailService.sendVerificationEmail.mockRejectedValue(
      new Error("SMTP error"),
    );

    await expect(service.register(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
```

---

## 🔍 Edge Cases

### Authentication Edge Cases

| Scenario                                  | Expected Behavior                                   |
| ----------------------------------------- | --------------------------------------------------- |
| Token issued before password change       | Reject with UnauthorizedException                   |
| Token with tampered payload               | Reject with UnauthorizedException                   |
| Refresh token reuse after password change | Reject with UnauthorizedException                   |
| Email verification token used twice       | Handle gracefully (already verified)                |
| Password reset token expired              | Reject with UnauthorizedException                   |
| User deleted but token still valid        | Reject with UnauthorizedException                   |
| Role removed from user but token cached   | (Current implementation allows until token expires) |

### Data Edge Cases

| Scenario                              | Expected Behavior                           |
| ------------------------------------- | ------------------------------------------- |
| Empty roles array                     | Login succeeds, token has `roles: []`       |
| Role with no permissions              | Login succeeds, token has `permissions: []` |
| Null/undefined email                  | DTO validation fails                        |
| Email with uppercase letters          | Normalize to lowercase                      |
| Password with leading/trailing spaces | Accept as-is (user input)                   |
| Duplicate role assignment             | Handle gracefully (no duplicates)           |

**Example:**

```typescript
describe("Edge cases", () => {
  it("should handle user with no roles", async () => {
    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      isVerified: true,
      isBanned: false,
      roles: [], // ← No roles
    };

    userRepository.findByIdWithRolesAndPermissions.mockResolvedValue(
      mockUser as any,
    );

    const tokens = await service.issueTokensForUser("user123");
    const decoded = jwt.verify(tokens.accessToken, process.env.JWT_SECRET!);

    expect(decoded).toHaveProperty("roles", []);
    expect(decoded).toHaveProperty("permissions", []);
  });

  it("should normalize email to lowercase", async () => {
    const dto = { email: "TEST@EXAMPLE.COM", password: "password123" };
    roleRepository.findByName.mockResolvedValue({ _id: "role123" } as any);
    userRepository.create.mockResolvedValue({
      _id: "user123",
      email: "test@example.com",
    } as any);

    await service.register(dto as any);

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: expect.stringMatching(/^[a-z]/) }),
    );
  });
});
```

---

## 🏃 Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="login"
```

### Coverage Report

```bash
npm run test:cov

# Output:
# File                | % Stmts | % Branch | % Funcs | % Lines |
# --------------------|---------|----------|---------|---------|
# services/           |   85.2  |   78.5   |   90.1  |   86.3  |
#  auth.service.ts    |   92.1  |   85.0   |   95.0  |   93.4  |
#  mail.service.ts    |   75.3  |   68.2   |   80.0  |   76.5  |
# --------------------|---------|----------|---------|---------|
```

---

## 🚫 Common Testing Mistakes

### ❌ Mistake 1: Testing Implementation Details

```typescript
// ❌ BAD
it("should call userRepository.findByEmail", async () => {
  await service.login(dto);
  expect(userRepository.findByEmail).toHaveBeenCalled();
});

// ✅ GOOD
it("should return tokens for valid credentials", async () => {
  const result = await service.login(dto);
  expect(result).toHaveProperty("accessToken");
  expect(result).toHaveProperty("refreshToken");
});
```

### ❌ Mistake 2: Not Isolating Tests

```typescript
// ❌ BAD - Tests depend on each other
let user;

it("should register user", async () => {
  user = await service.register(dto);
});

it("should login user", async () => {
  await service.login({ email: user.email, password: dto.password });
});

// ✅ GOOD - Each test is independent
it("should register user", async () => {
  const user = await service.register(dto);
  expect(user).toBeDefined();
});

it("should login user", async () => {
  userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
  const result = await service.login(dto);
  expect(result).toHaveProperty("accessToken");
});
```

### ❌ Mistake 3: Not Cleaning Up Mocks

```typescript
// ❌ BAD - Mocks persist between tests
it("test 1", () => {
  mockService.method.mockResolvedValue("value1");
});

it("test 2", () => {
  // mockService.method still has value1 mock!
});

// ✅ GOOD
afterEach(() => {
  jest.clearAllMocks();
});
```

### ❌ Mistake 4: Over-mocking

```typescript
// ❌ BAD - Mocking too much loses test value
jest.mock("@services/auth.service");

// ✅ GOOD - Only mock external dependencies
const mockUserRepository = { findById: jest.fn() };
const mockMailService = { sendEmail: jest.fn() };
// Test AuthService with real logic
```

---

## ⚙️ Jest Configuration

**Recommended `jest.config.js` for AuthKit:**

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.spec.ts"],
  moduleNameMapper: {
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@dtos/(.*)$": "<rootDir>/src/dtos/$1",
    "^@repos/(.*)$": "<rootDir>/src/repositories/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@middleware/(.*)$": "<rootDir>/src/middleware/$1",
    "^@filters/(.*)$": "<rootDir>/src/filters/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/standalone.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: "coverage",
  verbose: true,
};
```

---

## 📋 Testing Checklist

Before marking a feature complete:

- [ ] All public methods have tests
- [ ] All error paths are tested
- [ ] Edge cases are covered
- [ ] DTOs validation rules are tested
- [ ] Guards allow/deny correctly
- [ ] Mocks are cleaned up between tests
- [ ] Tests are independent (can run in any order)
- [ ] Coverage >= 80% for changed files
- [ ] No skipped tests (`it.skip` or `describe.skip`)
- [ ] No focused tests (`it.only` or `describe.only`)
- [ ] Tests run successfully: `npm test`

---

**Last Updated**: February 2026  
**Status**: ⚠️ Expand test coverage to 80%+  
**Priority**: High (critical for module stability)
