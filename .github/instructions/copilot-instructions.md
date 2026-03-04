# Copilot Instructions - AuthKit Developer Guide

> **Purpose**: Project-specific instructions for contributing to AuthKit, a comprehensive NestJS authentication and authorization module with OAuth 2.0, JWT, and RBAC support.

---

## 🎯 Project Overview

**Project**: @ciscode/authentication-kit  
**Type**: Modular NestJS Backend Library  
**Version**: 1.5.3  
**Purpose**: Production-ready authentication/authorization with local auth, OAuth 2.0, JWT tokens, role-based access control, email verification, and password reset.

### AuthKit Provides:

- **Local Authentication**: Email + password registration and login
- **OAuth 2.0 Integration**: Google, Microsoft (Entra ID), Facebook
- **JWT Token Management**: Access, refresh, email verification, password reset tokens
- **Role-Based Access Control (RBAC)**: Roles, permissions, and fine-grained authorization
- **Email Verification**: JWT-based email confirmation with customizable templates
- **Password Reset Flow**: Secure JWT-secured reset link workflow
- **Admin User Management**: Create, list, ban/unban, delete users, and assign roles
- **MongoDB Integration**: Uses host app's Mongoose connection (no DB lock-in)
- **TypeScript strict mode, path aliases, and full type safety**
- **Jest testing with 80%+ coverage required**
- **Changesets for versioning and changelog**
- **Linting (ESLint, Prettier) and pre-commit hooks (Husky)**

---

## 🏗️ AuthKit Project Structure

AuthKit uses a layered architecture combining Controller-Service-Repository (CSR) patterns for clarity and modularity.

```
src/
  index.ts                      # PUBLIC API exports
  auth/
    auth.controller.ts          # Auth endpoints (register, login, refresh, verify)
    auth.service.ts             # Auth business logic
    auth.repository.ts          # Auth data access
  users/
    users.controller.ts         # User management endpoints
    users.service.ts            # User business logic
    users.repository.ts         # User data access
  roles/
    roles.controller.ts         # Role/permission management
    roles.service.ts            # Role business logic
    roles.repository.ts         # Role data access
  models/
    user.model.ts               # User Mongoose schema
    role.model.ts               # Role Mongoose schema
    permission.model.ts         # Permission Mongoose schema
  middleware/
    guards/
      authenticate.guard.ts     # JWT authentication guard
      admin.guard.ts            # Admin-only guard
      roles.guard.ts            # Dynamic role-based guard
    decorators/
      current-user.decorator.ts # @CurrentUser() decorator
      admin.decorator.ts        # @Admin() decorator
  providers/
    oauth/
      google.strategy.ts        # Passport Google OAuth strategy
      microsoft.strategy.ts     # Passport Microsoft OAuth strategy
      facebook.strategy.ts      # Passport Facebook OAuth strategy
    mail/
      mail.service.ts           # Email sending service
  config/
    auth.config.ts              # Auth configuration
    jwt.config.ts               # JWT configuration
    oauth.config.ts             # OAuth configuration
  utils/
    token.utils.ts              # Token generation/validation
    password.utils.ts           # Password hashing/verification
```

**Responsibility Layers:**

| Layer            | Responsibility                   | Examples                |
| ---------------- | -------------------------------- | ----------------------- |
| **Controllers**  | HTTP endpoints, request handling | `auth.controller.ts`    |
| **Services**     | Business logic, orchestration    | `auth.service.ts`       |
| **Repositories** | Database access, queries         | `auth.repository.ts`    |
| **Models**       | Mongoose schemas                 | `user.model.ts`         |
| **Guards**       | Authentication/Authorization     | `authenticate.guard.ts` |
| **Decorators**   | Parameter extraction, metadata   | `@CurrentUser()`        |
| **Providers**    | OAuth strategies, mail service   | `google.strategy.ts`    |
| **Utils**        | Helper functions                 | `token.utils.ts`        |

**Public API Exports:**

```typescript
// src/index.ts - Only export what consumers need
export { AuthKitModule } from "./auth-kit.module";
export { AuthService, UsersService, RolesService } from "./services";
export { AuthenticateGuard, AdminGuard, hasRole } from "./middleware";
export { CurrentUser, Admin } from "./decorators";
export { SeedService } from "./seed.service";
export type { User, Role, Permission } from "./models";
```

---

## 📝 Naming Conventions

### Files

**Pattern**: `kebab-case` + suffix

| Type       | Example                     | Directory          |
| ---------- | --------------------------- | ------------------ |
| Controller | `auth.controller.ts`        | `auth/`            |
| Service    | `auth.service.ts`           | `auth/`            |
| Repository | `auth.repository.ts`        | `auth/`            |
| Model      | `user.model.ts`             | `models/`          |
| Guard      | `authenticate.guard.ts`     | `middleware/`      |
| Decorator  | `current-user.decorator.ts` | `decorators/`      |
| Strategy   | `google.strategy.ts`        | `providers/oauth/` |
| Config     | `jwt.config.ts`             | `config/`          |
| Utility    | `token.utils.ts`            | `utils/`           |

### Code Naming

- **Classes & Interfaces**: `PascalCase` → `AuthController`, `User`, `JWT Payload`
- **Functions & Methods**: `camelCase` → `login()`, `verifyToken()`, `assignRole()`
- **Constants**: `UPPER_SNAKE_CASE` → `JWT_SECRET`, `TOKEN_EXPIRY_TIME`
- **Variables**: `camelCase` → `currentUser`, `tokenPayload`

### Path Aliases

Configured in `tsconfig.json`:

```json
"@auth/*"    → "src/auth/*",
"@users/*"   → "src/users/*",
"@roles/*"   → "src/roles/*",
"@models/*"  → "src/models/*",
"@middleware/*" → "src/middleware/*",
"@providers/*" → "src/providers/*",
"@config/*"  → "src/config/*",
"@utils/*"   → "src/utils/*"
```

---

## 🧪 Testing - MANDATORY for AuthKit

### Coverage Target: 80%+ (REQUIRED)

**Unit Tests - MANDATORY:**

- ✅ All services (business logic)
- ✅ All guards and authentication flows
- ✅ All utilities (token, password)
- ✅ All OAuth strategies
- ✅ Repository methods

**Integration Tests:**

- ✅ Full auth flows (register, login, refresh)
- ✅ OAuth integration (mocked)
- ✅ Email verification flow
- ✅ Password reset flow

**Test file location:**

```
src/
  ├── auth/
  │   ├── auth.service.ts
  │   └── auth.service.spec.ts
  └── utils/
      ├── token.utils.ts
      └── token.utils.spec.ts
```

**CRITICAL**: AuthKit currently has ZERO tests. This MUST be fixed before release!

---

## 📚 Documentation - REQUIRED

### JSDoc/TSDoc - MANDATORY for all public APIs:

```typescript
/**
 * Authenticates a user with email and password
 * @param email - User email address
 * @param password - User password (plain text)
 * @returns Access token, refresh token, and user info
 * @throws {UnauthorizedException} If credentials invalid
 * @example
 * const result = await authService.login({ email: 'user@example.com', password: 'pass' });
 */
async login(loginDto: LoginDto): Promise<AuthResult>
```

**Required for:**

- All public functions/methods
- All exported classes and services
- All guards and decorators
- All authentication flows

### Swagger/OpenAPI - MANDATORY on controllers:

```typescript
@ApiOperation({ summary: 'User login with email and password' })
@ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
@ApiResponse({ status: 401, description: 'Invalid credentials' })
@Post('/login')
async login(@Body() dto: LoginDto) { }
```

---

## 🚀 Development Principles

### 1. Security First

- ✅ Always hash passwords with bcrypt (12+ rounds)
- ✅ Never expose sensitive data in responses
- ✅ Always validate JWT signatures
- ✅ Implement rate limiting on auth endpoints
- ✅ Sanitize all error messages (no stack traces)
- ✅ Never log passwords or tokens

### 2. Exportability

**Export ONLY public API:**

```typescript
// ✅ Export what apps need
export { AuthService } from "./auth/auth.service";
export { AuthenticateGuard } from "./middleware/guards";
export { CurrentUser } from "./decorators";

// ❌ NEVER export
export { AuthRepository } from "./auth/auth.repository"; // Internal
export { User } from "./models"; // Internal
```

### 3. Configuration

**Flexible module registration:**

```typescript
@Module({})
export class AuthKitModule {
  static forRoot(options: AuthKitOptions): DynamicModule {
    return {
      module: AuthKitModule,
      providers: [{ provide: "AUTH_OPTIONS", useValue: options }, AuthService],
      exports: [AuthService],
    };
  }

  static forRootAsync(options: AuthKitAsyncOptions): DynamicModule {
    // Async configuration
  }
}
```

### 4. Zero Business Logic Coupling

- No hardcoded business rules
- All behavior configurable via options
- Database-agnostic (apps provide connection)
- OAuth providers configurable
- Email templates customizable

---

## 🔄 Workflow & Task Management

### Branch Naming:

```bash
feature/AUTH-123-add-social-login
bugfix/AUTH-456-fix-token-expiry
refactor/AUTH-789-improve-security
```

### Task Documentation:

```
docs/tasks/active/AUTH-123-add-feature.md
docs/tasks/archive/by-release/v1.5.3/AUTH-123-add-feature.md
```

---

## 📦 Versioning & Breaking Changes

### Semantic Versioning (STRICT)

- **MAJOR** (x.0.0): Breaking changes to public API, guards, decorators
- **MINOR** (0.x.0): New features, new OAuth providers, new endpoints
- **PATCH** (0.0.x): Bug fixes, security patches, performance

### Changesets Workflow

**ALWAYS create a changeset for user-facing changes:**

```bash
npx changeset
```

**Before completing ANY task:**

- [ ] Code implemented
- [ ] Tests passing (80%+ coverage)
- [ ] Documentation updated
- [ ] **Changeset created** ← CRITICAL
- [ ] No security vulnerabilities

---

## ✅ Release Checklist

Before publishing:

- [ ] All tests passing (100% of test suite)
- [ ] Coverage >= 80%
- [ ] No ESLint warnings (`--max-warnings=0`)
- [ ] TypeScript strict mode passing
- [ ] All public APIs documented (JSDoc)
- [ ] Swagger documentation updated
- [ ] README updated with examples
- [ ] Changeset created
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Integration tested with sample app

---

## 🎨 Code Style

- ESLint `--max-warnings=0`
- Prettier formatting
- TypeScript strict mode
- Dependency injection via constructor

---

## 💬 Communication Style

- Brief and direct
- Focus on security and reliability
- Highlight security implications immediately
- AuthKit is production-critical

---

## 📋 Summary

**AuthKit Principles:**

1. Security first, always
2. Comprehensive testing (80%+)
3. Complete documentation
4. Strict versioning
5. Zero app coupling
6. Configurable behavior
7. Production-ready

**When in doubt:** Ask, don't assume. AuthKit secures your entire app.

---

_Last Updated: March 1, 2026_  
_Version: 1.5.3_
