# General Instructions - AuthKit Module

> **Last Updated**: February 2026  
> **Version**: 1.5.x

---

## 📦 Package Overview

### What is AuthKit?

**AuthKit** (`@ciscode/authentication-kit`) is a production-ready, comprehensive NestJS authentication/authorization module that provides:

- **Local Authentication**: Email + password registration and login
- **OAuth 2.0 Integration**: Google, Microsoft (Entra ID), Facebook
- **JWT Token Management**: Access, refresh, email verification, and password reset tokens
- **Role-Based Access Control (RBAC)**: Roles, permissions, and fine-grained authorization
- **Email Verification**: JWT-based email confirmation with customizable templates
- **Password Reset Flow**: Secure JWT-secured reset link workflow
- **Admin User Management**: Create, list, ban/unban, delete users, and assign roles
- **MongoDB Integration**: Uses host app's Mongoose connection (no DB lock-in)

### Package Type & Target Users

- **Type**: Backend NestJS Module (not standalone app)
- **Framework**: NestJS 10+/11+ with MongoDB + Mongoose
- **Target Users**: Backend developers building NestJS applications requiring authentication
- **Distribution**: NPM package (`@ciscode/authentication-kit`)
- **License**: MIT

### Key Characteristics

| Characteristic     | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| **Architecture**   | Repository pattern, dependency injection, layered structure      |
| **Database**       | MongoDB via Mongoose (host app connection)                       |
| **Token Strategy** | JWT (stateless) with automatic invalidation on password change   |
| **OAuth Flow**     | Mobile token exchange + Web redirect (Passport)                  |
| **Security**       | bcrypt password hashing (12 rounds), JWT secrets, HTTPS cookies  |
| **Extensibility**  | Configurable via env vars, exportable guards/services/decorators |
| **Testing**        | Currently minimal - requires expansion (target: 80%+ coverage)   |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HOST APP (NestJS)                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  app.module.ts                                                  │ │
│  │  - MongooseModule.forRoot(MONGO_URI)  ← Host DB Connection     │ │
│  │  - AuthKitModule (imported)                                     │ │
│  └───────────────┬────────────────────────────────────────────────┘ │
│                  │                                                    │
└──────────────────┼────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    @ciscode/authentication-kit                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  PUBLIC API (exported from src/index.ts)                        │ │
│ │  - AuthKitModule                                                │ │
│ │  - AuthenticateGuard, AdminGuard, hasRole(roleId)              │ │
│ │  - Admin decorator                                              │ │
│ │  - AuthService, UsersService, RolesService, etc.                │ │
│ │  - SeedService (for initial RBAC setup)                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  CONTROLLERS LAYER (src/controllers/)                           │ │
│ │  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐     │ │
│ │  │   Auth      │  │    Users     │  │  Roles/Permissions │     │ │
│ │  │ Controller  │  │  Controller  │  │    Controllers     │     │ │
│ │  │             │  │              │  │                    │     │ │
│ │  │ /api/auth   │  │ /api/users   │  │ /api/roles         │     │ │
│ │  └──────┬──────┘  └──────┬───────┘  └──────┬─────────────┘     │ │
│ └─────────┼────────────────┼──────────────────┼───────────────────┘ │
│           │                │                  │                     │
│           ▼                ▼                  ▼                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  SERVICES LAYER (src/services/)                                 │ │
│ │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │ │
│ │  │ AuthService  │  │ UsersService │  │ RolesService          │ │ │
│ │  │              │  │              │  │ PermissionsService    │ │ │
│ │  │ - register() │  │ - create()   │  │ - createRole()        │ │ │
│ │  │ - login()    │  │ - list()     │  │ - assignPermissions() │ │ │
│ │  │ - refresh()  │  │ - ban()      │  │                       │ │ │
│ │  │ - verify()   │  │              │  │                       │ │ │
│ │  └──────┬───────┘  └──────┬───────┘  └──────┬────────────────┘ │ │
│ └─────────┼──────────────────┼──────────────────┼──────────────────┘ │
│           │                  │                  │                    │
│           ▼                  ▼                  ▼                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  REPOSITORIES LAYER (src/repositories/)                         │ │
│ │  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │ │
│ │  │ UserRepository │  │ RoleRepository │  │PermissionRepo    │  │ │
│ │  │                │  │                │  │                  │  │ │
│ │  │ - findById()   │  │ - findByName() │  │ - create()       │  │ │
│ │  │ - findByEmail()│  │ - create()     │  │ - list()         │  │ │
│ │  │ - create()     │  │                │  │                  │  │ │
│ │  └────────┬───────┘  └────────┬───────┘  └────────┬─────────┘  │ │
│ └───────────┼──────────────────┼──────────────────┼──────────────┘ │
│             │                  │                  │                 │
│             ▼                  ▼                  ▼                 │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  MODELS LAYER (src/models/)                                     │ │
│ │  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐    │ │
│ │  │    User    │  │    Role    │  │      Permission        │    │ │
│ │  │  (Schema)  │  │  (Schema)  │  │       (Schema)         │    │ │
│ │  │            │  │            │  │                        │    │ │
│ │  │ - fullname │  │ - name     │  │ - name                 │    │ │
│ │  │ - email    │  │ - perms[]  │  │ - description          │    │ │
│ │  │ - roles[]  │  │            │  │                        │    │ │
│ │  │ - password │  │            │  │                        │    │ │
│ │  └────────────┘  └────────────┘  └────────────────────────┘    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  MIDDLEWARE/GUARDS (src/middleware/)                            │ │
│ │  - AuthenticateGuard: Validates JWT access tokens               │ │
│ │  - AdminGuard: Checks for admin role                            │ │
│ │  - hasRole(roleId): Factory for role-specific guards            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  EXTERNAL SERVICES                                              │ │
│ │  - MailService: SMTP email sending (nodemailer)                 │ │
│ │  - OAuthService: Google/Microsoft/Facebook OAuth validation     │ │
│ │  - LoggerService: Structured logging                            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘

                             │
                             ▼
                    ┌────────────────┐
                    │   MongoDB      │
                    │   (Host App)   │
                    └────────────────┘
```

### Data Flow Example: User Login

```
1. Client → POST /api/auth/login { email, password }
2. AuthController.login(dto) → AuthService.login(dto)
3. AuthService → UserRepository.findByEmailWithPassword(email)
4. UserRepository → Mongoose → MongoDB
5. Validate password (bcrypt.compare)
6. Build JWT payload with user roles & permissions
7. Sign access token (JWT_SECRET, 15m) & refresh token (JWT_REFRESH_SECRET, 7d)
8. Set refreshToken in httpOnly cookie
9. Return { accessToken, refreshToken } to client
```

---

## 📁 File Structure

```
AuthKit/
├── src/
│   ├── controllers/              # HTTP request handlers
│   │   ├── auth.controller.ts    # Auth endpoints (register, login, refresh, verify, reset)
│   │   ├── users.controller.ts   # Admin user management (create, list, ban, delete)
│   │   ├── roles.controller.ts   # Role CRUD operations
│   │   ├── permissions.controller.ts  # Permission CRUD operations
│   │   └── health.controller.ts  # Health check endpoint
│   │
│   ├── services/                 # Business logic
│   │   ├── auth.service.ts       # Core auth operations (register, login, token generation)
│   │   ├── users.service.ts      # User management logic
│   │   ├── roles.service.ts      # Role management logic
│   │   ├── permissions.service.ts  # Permission management logic
│   │   ├── mail.service.ts       # Email sending (nodemailer)
│   │   ├── oauth.service.ts      # OAuth provider validation (Google, MS, FB)
│   │   ├── seed.service.ts       # Initial RBAC data seeding
│   │   ├── admin-role.service.ts # Admin role resolution
│   │   └── logger.service.ts     # Structured logging
│   │
│   ├── repositories/             # Database abstraction
│   │   ├── user.repository.ts    # User CRUD + queries
│   │   ├── role.repository.ts    # Role CRUD + queries
│   │   └── permission.repository.ts  # Permission CRUD + queries
│   │
│   ├── models/                   # Mongoose schemas
│   │   ├── user.model.ts         # User schema (email, password, roles[], isVerified, isBanned)
│   │   ├── role.model.ts         # Role schema (name, permissions[])
│   │   └── permission.model.ts   # Permission schema (name, description)
│   │
│   ├── dtos/                     # Data Transfer Objects (validation)
│   │   ├── auth/                 # Auth-related DTOs
│   │   │   ├── login.dto.ts      # { email, password }
│   │   │   ├── register.dto.ts   # { fullname, email, password, username?, phoneNumber? }
│   │   │   ├── refresh-token.dto.ts  # { refreshToken? }
│   │   │   ├── verify-email.dto.ts   # { token }
│   │   │   ├── resend-verification.dto.ts  # { email }
│   │   │   ├── forgot-password.dto.ts      # { email }
│   │   │   ├── reset-password.dto.ts       # { token, newPassword }
│   │   │   └── update-user-role.dto.ts     # { roleIds }
│   │   ├── role/                 # Role DTOs
│   │   │   ├── create-role.dto.ts
│   │   │   └── update-role.dto.ts
│   │   └── permission/           # Permission DTOs
│   │       ├── create-permission.dto.ts
│   │       └── update-permission.dto.ts
│   │
│   ├── middleware/               # Guards & decorators
│   │   ├── authenticate.guard.ts  # JWT validation guard
│   │   ├── admin.guard.ts         # Admin role guard
│   │   ├── role.guard.ts          # Dynamic role guard factory
│   │   └── admin.decorator.ts     # @Admin() parameter decorator
│   │
│   ├── filters/                  # Exception filters
│   │   └── http-exception.filter.ts  # Global exception formatting
│   │
│   ├── config/                   # Configuration
│   │   └── passport.config.ts    # Passport OAuth strategies setup
│   │
│   ├── utils/                    # Utilities
│   │   └── helper.ts             # getMillisecondsFromExpiry, generateUsernameFromName
│   │
│   ├── auth-kit.module.ts        # Main NestJS module
│   ├── index.ts                  # Public API exports
│   ├── standalone.ts             # Standalone server (testing/demo)
│   └── types.d.ts                # Type declarations
│
├── docs/                         # Documentation
│   └── tasks/                    # Task tracking
│       ├── active/               # Current work
│       └── archive/              # Completed tasks
│
├── .github/
│   ├── instructions/             # AI assistant instructions (this folder)
│   └── copilot-instructions.md   # Main Copilot rules
│
├── package.json                  # NPM metadata
├── tsconfig.json                 # TypeScript config (path aliases)
├── README.md                     # User-facing documentation
├── CHANGELOG.md                  # Version history
├── CONTRIBUTING.md               # Contribution guidelines
├── SECURITY.md                   # Security policy
├── TROUBLESHOOTING.md            # Common issues
└── LICENSE                       # MIT license
```

---

## 🔤 Naming Conventions

### Files

| Type             | Pattern            | Examples                                    |
| ---------------- | ------------------ | ------------------------------------------- |
| **Controllers**  | `*.controller.ts`  | `auth.controller.ts`, `users.controller.ts` |
| **Services**     | `*.service.ts`     | `auth.service.ts`, `mail.service.ts`        |
| **Repositories** | `*.repository.ts`  | `user.repository.ts`, `role.repository.ts`  |
| **Models**       | `*.model.ts`       | `user.model.ts`, `role.model.ts`            |
| **DTOs**         | `*.dto.ts`         | `login.dto.ts`, `create-role.dto.ts`        |
| **Guards**       | `*.guard.ts`       | `authenticate.guard.ts`, `admin.guard.ts`   |
| **Decorators**   | `*.decorator.ts`   | `admin.decorator.ts`                        |
| **Config**       | `*.config.ts`      | `passport.config.ts`                        |
| **Utils**        | `*.ts` (in utils/) | `helper.ts`                                 |

**Rule**: Always use `kebab-case` for file names with descriptive suffixes.

### Classes & Interfaces

| Type             | Pattern                      | Examples                            |
| ---------------- | ---------------------------- | ----------------------------------- |
| **Controllers**  | `PascalCase` + `Controller`  | `AuthController`, `UsersController` |
| **Services**     | `PascalCase` + `Service`     | `AuthService`, `MailService`        |
| **Repositories** | `PascalCase` + `Repository`  | `UserRepository`, `RoleRepository`  |
| **Models**       | `PascalCase`                 | `User`, `Role`, `Permission`        |
| **DTOs**         | `PascalCase` + `Dto`         | `LoginDto`, `RegisterDto`           |
| **Guards**       | `PascalCase` + `Guard`       | `AuthenticateGuard`, `AdminGuard`   |
| **Interfaces**   | `PascalCase` (or `I` prefix) | `UserDocument`, `ITokenPayload`     |

### Functions & Methods

| Type                   | Pattern                  | Examples                                                    |
| ---------------------- | ------------------------ | ----------------------------------------------------------- |
| **Public methods**     | `camelCase`              | `login()`, `register()`, `verifyEmail()`                    |
| **Private methods**    | `camelCase`              | `signAccessToken()`, `buildTokenPayload()`                  |
| **Repository methods** | `camelCase` (CRUD verbs) | `findById()`, `create()`, `updateById()`, `deleteById()`    |
| **Utility functions**  | `camelCase`              | `getMillisecondsFromExpiry()`, `generateUsernameFromName()` |

### Variables & Constants

| Type                          | Pattern            | Examples                               |
| ----------------------------- | ------------------ | -------------------------------------- |
| **Variables**                 | `camelCase`        | `accessToken`, `refreshToken`, `user`  |
| **Constants (immutable)**     | `UPPER_SNAKE_CASE` | `JWT_SECRET`, `TOKEN_EXPIRY`           |
| **Env vars (in process.env)** | `UPPER_SNAKE_CASE` | `MONGO_URI`, `JWT_SECRET`, `SMTP_HOST` |

### Path Aliases

Configured in `tsconfig.json`:

```typescript
"@models/*"      → "src/models/*"
"@dtos/*"        → "src/dtos/*"
"@repos/*"       → "src/repositories/*"
"@services/*"    → "src/services/*"
"@controllers/*" → "src/controllers/*"
"@config/*"      → "src/config/*"
"@middleware/*"  → "src/middleware/*"
"@filters/*"     → "src/filters/*"
"@utils/*"       → "src/utils/*"
```

**Always use path aliases in imports:**

```typescript
// ✅ Correct
import { UserRepository } from "@repos/user.repository";
import { LoginDto } from "@dtos/auth/login.dto";
import { AuthService } from "@services/auth.service";

// ❌ Wrong
import { UserRepository } from "../../repositories/user.repository";
import { LoginDto } from "../dtos/auth/login.dto";
```

---

## 🎯 Code Patterns

### Dependency Injection (Constructor Injection)

**✅ Correct Pattern:**

```typescript
import { Injectable } from "@nestjs/common";
import { UserRepository } from "@repos/user.repository";
import { MailService } from "@services/mail.service";
import { LoggerService } from "@services/logger.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly mail: MailService,
    private readonly logger: LoggerService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.users.create(dto);
    await this.mail.sendVerificationEmail(user.email, token);
    return user;
  }
}
```

**❌ Anti-Pattern:**

```typescript
// DON'T import services directly or instantiate manually
import { UserRepository } from "@repos/user.repository";
const userRepo = new UserRepository(); // ❌ Breaks DI container
```

### Error Handling

**✅ Structured Error Handling:**

```typescript
import { NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

async findUserById(id: string) {
  try {
    const user = await this.users.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isBanned) {
      throw new ForbiddenException('Account has been banned. Please contact support');
    }

    return user;
  } catch (error) {
    // Re-throw known NestJS exceptions
    if (error instanceof NotFoundException || error instanceof ForbiddenException) {
      throw error;
    }

    // Log unexpected errors and throw generic error
    this.logger.error(`Failed to find user: ${error.message}`, error.stack, 'AuthService');
    throw new InternalServerErrorException('Failed to retrieve user');
  }
}
```

**❌ Anti-Pattern:**

```typescript
// DON'T throw generic Error or return error strings
async findUserById(id: string) {
  const user = await this.users.findById(id);
  if (!user) {
    return { error: 'Not found' }; // ❌ Return error objects
  }
  throw new Error('User not found'); // ❌ Generic Error
}
```

### Repository Pattern

**✅ Correct Repository:**

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

  async findById(id: string | Types.ObjectId) {
    return this.userModel.findById(id);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  async updateById(id: string | Types.ObjectId, data: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findByIdWithRolesAndPermissions(id: string | Types.ObjectId) {
    return this.userModel.findById(id).populate({
      path: "roles",
      populate: { path: "permissions", select: "name" },
      select: "name permissions",
    });
  }
}
```

**Key principles:**

- Inject Mongoose model via `@InjectModel()`
- Return Mongoose queries/promises (let services handle errors)
- Use descriptive method names (`findByEmail`, not `getUser`)
- Accept flexible types (`string | Types.ObjectId`)

### JWT Token Management

**✅ Token Signing Pattern:**

```typescript
private signAccessToken(payload: any) {
  const expiresIn = this.resolveExpiry(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN, '15m');
  return jwt.sign(payload, this.getEnv('JWT_SECRET'), { expiresIn });
}

private signRefreshToken(payload: any) {
  const expiresIn = this.resolveExpiry(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN, '7d');
  return jwt.sign(payload, this.getEnv('JWT_REFRESH_SECRET'), { expiresIn });
}

private async buildTokenPayload(userId: string) {
  const user = await this.users.findByIdWithRolesAndPermissions(userId);
  if (!user) throw new NotFoundException('User not found');

  const roles = (user.roles || []).map((r: any) => r._id.toString());
  const permissions = (user.roles || [])
    .flatMap((r: any) => (r.permissions || []).map((p: any) => p.name))
    .filter(Boolean);

  return { sub: user._id.toString(), roles, permissions };
}
```

**Token invalidation on password change:**

```typescript
// In AuthenticateGuard
if (
  user.passwordChangedAt &&
  decoded.iat * 1000 < user.passwordChangedAt.getTime()
) {
  throw new UnauthorizedException(
    "Token expired due to password change. Please login again",
  );
}
```

### Environment Variables

**✅ Safe Env Access Pattern:**

```typescript
private getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    this.logger.error(`Environment variable ${name} is not set`, 'AuthService');
    throw new InternalServerErrorException('Server configuration error');
  }
  return value;
}

// Usage
const secret = this.getEnv('JWT_SECRET');
```

**❌ Anti-Pattern:**

```typescript
// DON'T access env vars without validation
const secret = process.env.JWT_SECRET; // ❌ Might be undefined
```

### DTO Validation

**✅ Using class-validator:**

```typescript
import {
  IsEmail,
  IsString,
  MinLength,
  ValidateNested,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

class FullNameDto {
  @IsString()
  fname!: string;

  @IsString()
  lname!: string;
}

export class RegisterDto {
  @ValidateNested()
  @Type(() => FullNameDto)
  fullname!: FullNameDto;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
```

### Password Hashing

**✅ bcrypt with constant rounds:**

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Constant, secure

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
```

### Logging Pattern

**✅ Structured logging:**

```typescript
this.logger.log("User registered successfully", "AuthService");
this.logger.warn(
  "SMTP not configured - email functionality disabled",
  "MailService",
);
this.logger.error(
  `Authentication failed: ${error.message}`,
  error.stack,
  "AuthenticateGuard",
);
```

---

## 🚫 Anti-Patterns to Avoid

### 1. ❌ Business Logic in Controllers

```typescript
// ❌ BAD
@Controller("api/auth")
export class AuthController {
  @Post("login")
  async login(@Body() dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException();
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET);
    return { token };
  }
}

// ✅ GOOD - Delegate to service
@Controller("api/auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.auth.login(dto);
    // Handle cookie setting and response formatting here only
    return res.status(200).json({ accessToken, refreshToken });
  }
}
```

### 2. ❌ Direct Mongoose Calls in Services

```typescript
// ❌ BAD
@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(dto: RegisterDto) {
    return this.userModel.create(dto); // ❌ Service knows about Mongoose
  }
}

// ✅ GOOD - Use repository
@Injectable()
export class AuthService {
  constructor(private readonly users: UserRepository) {}

  async register(dto: RegisterDto) {
    return this.users.create(dto); // ✅ Repository abstracts DB
  }
}
```

### 3. ❌ Hardcoded Secrets/Config

```typescript
// ❌ BAD
const token = jwt.sign(payload, "my-secret-key", { expiresIn: "15m" });

// ✅ GOOD
const token = jwt.sign(payload, this.getEnv("JWT_SECRET"), {
  expiresIn: this.resolveExpiry(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN, "15m"),
});
```

### 4. ❌ Returning Sensitive Data

```typescript
// ❌ BAD
async getUser(id: string) {
  return this.users.findById(id); // Returns password field
}

// ✅ GOOD
async getUser(id: string) {
  const user = await this.users.findById(id);
  if (!user) throw new NotFoundException('User not found');

  const userObject = user.toObject ? user.toObject() : user;
  const { password, passwordChangedAt, ...safeUser } = userObject as any;
  return safeUser;
}
```

### 5. ❌ Catching Errors Without Re-throwing

```typescript
// ❌ BAD
try {
  const user = await this.users.findById(id);
} catch (error) {
  console.log(error); // ❌ Swallows error silently
}

// ✅ GOOD
try {
  const user = await this.users.findById(id);
  if (!user) throw new NotFoundException("User not found");
  return user;
} catch (error) {
  if (error instanceof NotFoundException) throw error;
  this.logger.error(
    `Failed to find user: ${error.message}`,
    error.stack,
    "AuthService",
  );
  throw new InternalServerErrorException("Failed to retrieve user");
}
```

---

## 📤 Export Rules

### What MUST be exported from `src/index.ts`:

**✅ Public API:**

```typescript
// Module
export { AuthKitModule } from "./auth-kit.module";

// Guards (used by host apps)
export { AuthenticateGuard } from "./middleware/authenticate.guard";
export { AdminGuard } from "./middleware/admin.guard";
export { hasRole } from "./middleware/role.guard";

// Decorators
export { Admin } from "./middleware/admin.decorator";

// Services (if host apps need direct access)
export { AuthService } from "./services/auth.service";
export { UsersService } from "./services/users.service";
export { RolesService } from "./services/roles.service";
export { SeedService } from "./services/seed.service";
export { AdminRoleService } from "./services/admin-role.service";
```

### What MUST NOT be exported:

**❌ Internal Implementation:**

```typescript
// ❌ NEVER export models/schemas
export { User, UserSchema } from "./models/user.model"; // FORBIDDEN

// ❌ NEVER export repositories directly (exported via module if needed)
export { UserRepository } from "./repositories/user.repository"; // Consider carefully

// ❌ NEVER export DTOs (host apps don't need them - they use the API)
export { LoginDto, RegisterDto } from "./dtos/auth/login.dto"; // FORBIDDEN

// ❌ NEVER export internal utilities
export { generateUsernameFromName } from "./utils/helper"; // FORBIDDEN
```

**Rationale:**

- **DTOs**: Internal validation contracts, not public API
- **Models**: Internal data structure, can change between versions
- **Repositories**: Implementation detail, accessed via services
- **Utilities**: Internal helpers, not part of public contract

### Exporting via Module

```typescript
// auth-kit.module.ts
@Module({
  imports: [MongooseModule.forFeature([...])],
  controllers: [...],
  providers: [...],
  exports: [
    AuthService,
    UsersService,
    RolesService,
    SeedService,
    AuthenticateGuard,
    AdminGuard,
    // ... other services/guards needed by host apps
  ],
})
export class AuthKitModule { }
```

**Host apps can then inject exported services:**

```typescript
// In host app
import { AuthService } from "@ciscode/authentication-kit";

@Injectable()
export class MyService {
  constructor(private readonly auth: AuthService) {}
}
```

---

## 🔒 Security Best Practices

### 1. Password Security

```typescript
// ✅ bcrypt with strong rounds
const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// ✅ Select password only when needed
findByEmailWithPassword(email: string) {
  return this.userModel.findOne({ email }).select('+password');
}

// ✅ Exclude password by default (in schema)
@Prop({ minlength: 8, select: false })
password?: string;
```

### 2. JWT Security

```typescript
// ✅ Different secrets for different token types
JWT_SECRET=access_token_secret_change_this
JWT_REFRESH_SECRET=refresh_token_secret_change_this
JWT_EMAIL_SECRET=email_verification_secret_change_this
JWT_RESET_SECRET=password_reset_secret_change_this

// ✅ Short-lived access tokens
JWT_ACCESS_TOKEN_EXPIRES_IN=15m

// ✅ Token invalidation on password change
if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
  throw new UnauthorizedException('Token expired due to password change');
}
```

### 3. Cookie Security

```typescript
const isProd = process.env.NODE_ENV === "production";

res.cookie("refreshToken", refreshToken, {
  httpOnly: true, // ✅ Prevent JS access
  secure: isProd, // ✅ HTTPS only in production
  sameSite: isProd ? "none" : "lax", // ✅ CSRF protection
  path: "/",
  maxAge: getMillisecondsFromExpiry(refreshTTL),
});
```

### 4. Email Verification Enforcement

```typescript
// ✅ Block unverified users
if (!user.isVerified) {
  throw new ForbiddenException('Email not verified. Please check your inbox');
}

// ✅ Verify email before allowing login
async login(dto: LoginDto) {
  const user = await this.users.findByEmailWithPassword(dto.email);
  if (!user) throw new UnauthorizedException('Invalid credentials');
  if (!user.isVerified) throw new ForbiddenException('Email not verified');
  // ... proceed with login
}
```

### 5. Rate Limiting (Recommendation)

```typescript
// Host apps should implement rate limiting
// Example with @nestjs/throttler:
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per 60 seconds
@Post('login')
async login(@Body() dto: LoginDto) { }
```

### 6. Input Validation

```typescript
// ✅ Always use DTOs with class-validator
@IsEmail()
email!: string;

@IsString()
@MinLength(8)
password!: string;

// ✅ Sanitize user input (handled by class-validator)
```

### 7. Error Message Safety

```typescript
// ✅ Generic error for login failures (prevent user enumeration)
throw new UnauthorizedException("Invalid credentials");

// ❌ DON'T reveal specific info
throw new UnauthorizedException("User not found"); // Reveals email exists
throw new UnauthorizedException("Wrong password"); // Reveals email exists
```

---

## 📊 Versioning & Semantic Versioning

### Semantic Versioning Rules

**Format**: `MAJOR.MINOR.PATCH` (e.g., `1.5.1`)

| Version Type      | When to Bump                        | Examples                                                                                            |
| ----------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| **MAJOR** (x.0.0) | Breaking changes                    | Changed exported function signatures, removed public methods, changed DTO structure, renamed guards |
| **MINOR** (0.x.0) | New features (backwards-compatible) | Added new endpoints, new optional parameters, new guards/decorators                                 |
| **PATCH** (0.0.x) | Bug fixes, internal changes         | Fixed token validation bug, improved error messages, documentation updates                          |

### Breaking Changes Examples

**MAJOR version bump required:**

```typescript
// v1.x.x - OLD
export class AuthService {
  async login(dto: LoginDto): Promise<string> {
    // Returns token string
    return accessToken;
  }
}

// v2.0.0 - NEW (BREAKING)
export class AuthService {
  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return { accessToken, refreshToken };
  }
}
```

**MINOR version bump (non-breaking):**

```typescript
// v1.5.x - Add new optional parameter
export class AuthService {
  async register(dto: RegisterDto, skipEmailVerification = false) {
    // ✅ Non-breaking
    // ...
  }
}
```

### Version Bump Workflow

```bash
# For bug fixes
npm version patch  # 1.5.1 → 1.5.2

# For new features (backwards-compatible)
npm version minor  # 1.5.1 → 1.6.0

# For breaking changes
npm version major  # 1.5.1 → 2.0.0

# This automatically:
# - Updates package.json version
# - Creates git commit "vX.X.X"
# - Creates git tag

git push && git push --tags
```

### CHANGELOG Maintenance

**Always update `CHANGELOG.md` before releasing:**

```markdown
# Changelog

## [2.0.0] - 2026-02-15

### BREAKING CHANGES

- `login()` now returns `{ accessToken, refreshToken }` instead of string
- Removed deprecated `validateUser()` method

### Added

- Refresh token rotation support
- `hasRole(roleId)` guard factory for dynamic role checking

### Fixed

- Token expiration validation now correctly handles timezone differences
- Email verification links now work correctly in production

## [1.5.1] - 2026-01-30

### Fixed

- Fixed SMTP connection error handling
```

---

## ✅ Release Checklist

Before publishing a new version:

- [ ] All tests passing (`npm test` - currently minimal, expand later)
- [ ] No ESLint warnings (if linting configured)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] All public APIs documented with JSDoc/TSDoc
- [ ] README updated with new features/changes
- [ ] CHANGELOG updated with version notes
- [ ] Breaking changes highlighted in CHANGELOG
- [ ] Version bumped (`npm version patch|minor|major`)
- [ ] Git tags pushed (`git push --tags`)
- [ ] Integration tested with host app
- [ ] Environment variables documented (if new ones added)
- [ ] Security review completed (if auth logic changed)

### Pre-Publish Commands

```bash
# 1. Build and verify
npm run build
ls -la dist/  # Verify output

# 2. Test in host app (link)
npm link
cd ~/path/to/host-app
npm link @ciscode/authentication-kit
# Test thoroughly

# 3. Unlink and publish
npm unlink @ciscode/authentication-kit
cd ~/AuthKit
npm publish
```

---

## 🛠️ Development Commands

| Command                             | Purpose                                                             |
| ----------------------------------- | ------------------------------------------------------------------- |
| `npm run build`                     | Compile TypeScript → `dist/` (uses `tsc-alias` for path resolution) |
| `npm start`                         | Run standalone server (testing/demo mode)                           |
| `npm test`                          | Run test suite (currently minimal - expand later)                   |
| `npm run prepack`                   | Auto-runs before `npm pack` or `npm publish`                        |
| `npm link`                          | Link package locally for testing in host apps                       |
| `npm version [patch\|minor\|major]` | Bump version, commit, and tag                                       |
| `npm publish`                       | Publish to NPM registry                                             |

### Testing in Host App

```bash
# In AuthKit directory
npm run build
npm link

# In host app
npm link @ciscode/authentication-kit

# After testing
npm unlink @ciscode/authentication-kit
```

---

## 🤖 AI Assistant Guidelines Summary

### DO:

- ✅ Use dependency injection (constructor)
- ✅ Follow repository pattern (services → repositories → Mongoose)
- ✅ Use path aliases (`@models/*`, `@services/*`, etc.)
- ✅ Validate all inputs with class-validator DTOs
- ✅ Handle errors with specific NestJS exceptions
- ✅ Log errors with `LoggerService`
- ✅ Exclude sensitive data (passwords) from responses
- ✅ Use bcrypt for password hashing (12 rounds)
- ✅ Validate JWT tokens properly (check expiry, password change, user status)
- ✅ Export only public API from `src/index.ts`
- ✅ Update CHANGELOG for every version
- ✅ Follow semantic versioning strictly

### DON'T:

- ❌ Put business logic in controllers
- ❌ Call Mongoose models directly from services
- ❌ Hardcode secrets or configuration
- ❌ Return sensitive data (passwords, internal IDs)
- ❌ Swallow errors silently
- ❌ Export internal models/DTOs/utilities
- ❌ Make breaking changes without MAJOR version bump
- ❌ Use relative imports when path aliases exist
- ❌ Access `process.env` without validation
- ❌ Skip input validation

### When Adding Features:

1. Determine if it's a breaking change (MAJOR) or not (MINOR/PATCH)
2. Create branch: `feature/MODULE-123-description`
3. Implement with proper error handling and logging
4. Update CHANGELOG
5. Bump version appropriately
6. Test in linked host app
7. Create PR to `develop` (not `master`)

### When Fixing Bugs:

1. Create branch: `bugfix/MODULE-456-description`
2. Fix with proper error handling
3. Update CHANGELOG (PATCH section)
4. Bump patch version
5. Test thoroughly
6. Create PR to `develop`

---

**Last Updated**: February 2026  
**Package Version**: 1.5.x  
**Maintained By**: CISCODE  
**License**: MIT
