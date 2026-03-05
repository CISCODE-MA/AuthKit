# Changelog

All notable changes to the Authentication Kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-02

### 🏗️ Architecture Refactoring

This release refactors the module architecture to align with the **Controller-Service-Repository (CSR)** pattern, making it simpler and more intuitive for consumers while maintaining all functionality.

### Changed

- **BREAKING**: Renamed `models/` directory to `entities/`
- **BREAKING**: Renamed all `*.model.ts` files to `*.entity.ts`
  - `user.model.ts` → `user.entity.ts`
  - `role.model.ts` → `role.entity.ts`
  - `permission.model.ts` → `permission.entity.ts`
- **BREAKING**: Moved guards from `middleware/` to dedicated `guards/` directory
  - `middleware/authenticate.guard.ts` → `guards/authenticate.guard.ts`
  - `middleware/admin.guard.ts` → `guards/admin.guard.ts`
  - `middleware/role.guard.ts` → `guards/role.guard.ts`
- **BREAKING**: Moved decorators from `middleware/` to dedicated `decorators/` directory
  - `middleware/admin.decorator.ts` → `decorators/admin.decorator.ts`
- **BREAKING**: Renamed `dtos/` directory to `dto/` (singular form, following NestJS conventions)
- **BREAKING**: Updated TypeScript path aliases:
  - `@models/*` → `@entities/*`
  - `@dtos/*` → `@dto/*`
  - Added `@guards/*` → `src/guards/*`
  - Added `@decorators/*` → `src/decorators/*`

### Added

- ✨ **Public API Exports**: All DTOs are now exported from the main package entry point
  - Authentication DTOs: `LoginDto`, `RegisterDto`, `RefreshTokenDto`, `ForgotPasswordDto`, `ResetPasswordDto`, `VerifyEmailDto`, `ResendVerificationDto`, `UpdateUserRolesDto`
  - Role DTOs: `CreateRoleDto`, `UpdateRoleDto`
  - Permission DTOs: `CreatePermissionDto`, `UpdatePermissionDto`

### Removed

- Removed empty `application/` directory (use-cases not needed for library simplicity)
- Removed `middleware/` directory (contents moved to `guards/` and `decorators/`)

### Migration Guide for Consumers

**If you were using the public API correctly (importing from package root), NO CHANGES NEEDED:**

```typescript
// ✅ This continues to work (recommended usage)
import { AuthKitModule, AuthService, LoginDto, AuthenticateGuard } from '@ciscode/authentication-kit';
```

**If you were importing from internal paths (NOT recommended), update imports:**

```typescript
// ❌ OLD (internal imports - should never have been used)
import { User } from '@ciscode/authentication-kit/dist/models/user.model';
import { AuthenticateGuard } from '@ciscode/authentication-kit/dist/middleware/authenticate.guard';

// ✅ NEW (if you really need internal imports - but use public API instead)
import { User } from '@ciscode/authentication-kit/dist/entities/user.entity';
import { AuthenticateGuard } from '@ciscode/authentication-kit/dist/guards/authenticate.guard';

// ✅ BEST (use public API)
import { AuthenticateGuard } from '@ciscode/authentication-kit';
```

### Why This Change?

This refactoring aligns the module with industry-standard **Controller-Service-Repository (CSR)** pattern for NestJS libraries:

- **Simpler structure**: Easier to understand and navigate
- **Clear separation**: Guards, decorators, and entities in dedicated folders
- **Better discoverability**: All DTOs exported for consumer use
- **Industry standard**: Follows common NestJS library patterns

The 4-layer Clean Architecture is now reserved for complex business applications (like ComptAlEyes), while reusable modules like Authentication Kit use the simpler CSR pattern.

---

## [1.5.0] - Previous Release

(Previous changelog entries...)

