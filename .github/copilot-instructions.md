# Copilot Instructions - Auth Kit Module

> **Purpose**: Development guidelines for the Auth Kit module - a production-ready authentication library for NestJS applications.

---

## 📊 Current Status (Feb 4, 2026)

**Production Ready**: ✅ YES  
**Version**: 1.5.0  
**Test Coverage**: 90.25% (312 tests passing)  
**Integration**: ✅ Active in ComptAlEyes

**See**: `docs/STATUS.md` for detailed metrics and `docs/NEXT_STEPS.md` for roadmap.

---

## 🎯 Module Overview

**Package**: `@ciscode/authentication-kit`  
**Type**: Backend NestJS Module  
**Purpose**: JWT-based authentication and authorization for NestJS apps

### Responsibilities:
- User authentication (login, register, email verification)
- JWT token management (access, refresh, email, reset)
- OAuth integration (Google, Microsoft, Facebook)
- Role-based access control (RBAC)
- Password hashing and reset
- Admin user management
- Auth guards and decorators

---

## 🏗️ Module Architecture

**Modules use Controller-Service-Repository (CSR) pattern for simplicity and reusability.**

> **WHY CSR for modules?** Reusable libraries need to be simple, well-documented, and easy to integrate. The 4-layer Clean Architecture is better suited for complex applications, not libraries.

```
src/
  ├── index.ts                    # PUBLIC API exports
  ├── auth-kit.module.ts          # NestJS module definition
  │
  ├── controllers/                # HTTP Layer
  │   ├── auth.controller.ts
  │   ├── users.controller.ts
  │   └── roles.controller.ts
  │
  ├── services/                   # Business Logic
  │   ├── auth.service.ts
  │   ├── oauth.service.ts
  │   └── mail.service.ts
  │
  ├── entities/                   # Domain Models
  │   ├── user.entity.ts
  │   ├── role.entity.ts
  │   └── permission.entity.ts
  │
  ├── repositories/               # Data Access
  │   ├── user.repository.ts
  │   ├── role.repository.ts
  │   └── permission.repository.ts
  │
  ├── guards/                     # Auth Guards
  │   ├── jwt-auth.guard.ts
  │   ├── roles.guard.ts
  │   └── admin.guard.ts
  │
  ├── decorators/                 # Custom Decorators
  │   ├── current-user.decorator.ts
  │   ├── roles.decorator.ts
  │   └── admin.decorator.ts
  │
  ├── dto/                        # Data Transfer Objects
  │   ├── auth/
  │   │   ├── login.dto.ts
  │   │   ├── register.dto.ts
  │   │   └── user.dto.ts
  │   └── role/
  │
  ├── filters/                    # Exception Filters
  ├── middleware/                 # Middleware
  ├── config/                     # Configuration
  └── utils/                      # Utilities
```

**Responsibility Layers:**

| Layer          | Responsibility                              | Examples                          |
|----------------|---------------------------------------------|-----------------------------------|
| **Controllers** | HTTP handling, route definition            | `auth.controller.ts`              |
| **Services**    | Business logic, orchestration              | `auth.service.ts`                 |
| **Entities**    | Domain models (Mongoose schemas)           | `user.entity.ts`                  |
| **Repositories**| Data access, database queries              | `user.repository.ts`              |
| **Guards**      | Authentication/Authorization               | `jwt-auth.guard.ts`               |
| **Decorators**  | Parameter extraction, metadata             | `@CurrentUser()`                  |
| **DTOs**        | Input validation, API contracts            | `login.dto.ts`                    |

**Module Exports (Public API):**
```typescript
// src/index.ts - Only export what apps need to consume
export { AuthKitModule } from './auth-kit.module';

// Services (main API)
export { AuthService } from './services/auth.service';
export { SeedService } from './services/seed.service';

// DTOs (public contracts)
export { LoginDto, RegisterDto, UserDto } from './dto/auth';
export { CreateRoleDto, UpdateRoleDto } from './dto/role';

// Guards (for protecting routes)
export { AuthenticateGuard } from './guards/jwt-auth.guard';
export { RolesGuard } from './guards/roles.guard';
export { AdminGuard } from './guards/admin.guard';

// Decorators (for DI and metadata)
export { CurrentUser } from './decorators/current-user.decorator';
export { Roles } from './decorators/roles.decorator';
export { Admin } from './decorators/admin.decorator';

// ❌ NEVER export entities or repositories
// export { User } from './entities/user.entity'; // FORBIDDEN
// export { UserRepository } from './repositories/user.repository'; // FORBIDDEN
```

**Rationale:**
- **Entities** = internal implementation details (can change)
- **Repositories** = internal data access (apps shouldn't depend on it)
- **DTOs** = stable public contracts (apps depend on these)
- **Services** = public API (apps use methods, not internals)

---

## 📝 Naming Conventions

**Files**: `kebab-case` + suffix
- `auth.controller.ts`
- `login.dto.ts`
- `user.entity.ts`
- `user.repository.ts`
- `jwt-auth.guard.ts`
- `current-user.decorator.ts`

**Code**: Same as app standards (PascalCase classes, camelCase functions, UPPER_SNAKE_CASE constants)

### Path Aliases

Configured in `tsconfig.json`:
```typescript
"@/*"              → "src/*"
"@controllers/*"   → "src/controllers/*"
"@services/*"      → "src/services/*"
"@entities/*"      → "src/entities/*"
"@repos/*"         → "src/repositories/*"
"@dtos/*"          → "src/dto/*"
"@guards/*"        → "src/guards/*"
"@decorators/*"    → "src/decorators/*"
"@config/*"        → "src/config/*"
"@utils/*"         → "src/utils/*"
```

Use aliases for cleaner imports:
```typescript
import { LoginDto } from '@dtos/auth/login.dto';
import { AuthService } from '@services/auth.service';
import { User } from '@entities/user.entity';
import { UserRepository } from '@repos/user.repository';
import { AuthenticateGuard } from '@guards/jwt-auth.guard';
```

---

## 🧪 Testing - RIGOROUS for Modules

### Coverage Target: 80%+

**Current Status**: ✅ **90.25% coverage, 312 tests passing**

**Test Structure:**
```
test/
  ├── controllers/    # Integration tests
  ├── services/       # Unit tests
  ├── guards/         # Unit tests
  ├── repositories/   # Unit tests
  └── decorators/     # Unit tests
```

**Coverage Details:**
- Statements: 90.25% (1065/1180)
- Branches: 74.95% (404/539)
- Functions: 86.09% (161/187)
- Lines: 90.66% (981/1082)

**What's Tested:**
- ✅ All services (business logic)
- ✅ All controllers (HTTP layer)
- ✅ All guards and decorators
- ✅ All repository methods
- ✅ Complete auth flows (E2E style)

**When Adding New Features:**
- MUST write tests before merging
- MUST maintain 80%+ coverage
- MUST test both success and error cases
- MUST follow existing test patterns

---

## 📚 Documentation - Complete

### JSDoc/TSDoc - ALWAYS for:

```typescript
/**
 * Authenticates a user with email and password
 * @param email - User email address
 * @param password - Plain text password
 * @returns JWT access token and refresh token
 * @throws {UnauthorizedException} If credentials are invalid
 * @example
 * ```typescript
 * const tokens = await authService.login('user@example.com', 'password123');
 * ```
 */
async login(email: string, password: string): Promise<AuthTokens>
```

**Required for:**
- All exported functions/methods
- All public classes
- All DTOs (with property descriptions)

### API Documentation:
- Swagger decorators on all controllers
- README with usage examples
- CHANGELOG for all releases

---

## 🚀 Module Development Principles

### 1. Exportability
**Export ONLY public API (Services + DTOs + Guards + Decorators):**
```typescript
// src/index.ts - Public API
export { AuthModule } from './auth-kit.module';

// DTOs (public contracts - what apps consume)
export { LoginDto, RegisterDto, UserDto, AuthTokensDto } from './api/dto';

// Guards (for protecting routes in apps)
export { JwtAuthGuard, RolesGuard, PermissionsGuard } from './api/guards';

// Decorators (for extracting data in apps)
export { CurrentUser, Roles, Permissions } from './api/decorators';

// Services (if apps need direct access)
export { AuthService } from './application/auth.service';

// Types (TypeScript interfaces for configuration)
export type { AuthModuleOptions, JwtConfig } from './types';
```

**❌ NEVER export:**
```typescript
// ❌ Entities - internal domain models
export { User } from './domain/user.entity'; // FORBIDDEN

// ❌ Repositories - infrastructure details
export { UserRepository } from './infrastructure/user.repository'; // FORBIDDEN

// ❌ Use-cases directly - use services instead
export { LoginUseCase } from './application/use-cases/login.use-case'; // FORBIDDEN
```

**Rationale:**
- DTOs = stable public contract
- Entities = internal implementation (can change)
- Apps work with DTOs, never entities
- Clean separation of concerns

### Path Aliases

Configured in `tsconfig.json`:
```typescript
"@/*"              → "src/*"
"@api/*"           → "src/api/*"
"@application/*"   → "src/application/*"
"@domain/*"        → "src/domain/*"
"@infrastructure/*"→ "src/infrastructure/*"
```

Use aliases for cleaner imports:
```typescript
import { LoginDto } from '@api/dto';
import { LoginUseCase } from '@application/use-cases';
import { User } from '@domain/user.entity';
import { UserRepository } from '@infrastructure/user.repository';
```

### 2. Configuration
**Flexible module registration:**
```typescript
@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        { provide: 'AUTH_OPTIONS', useValue: options },
        AuthService,
        JwtService,
      ],
      exports: [AuthService],
    };
  }
  
  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    // Async configuration (from ConfigService, etc.)
  }
}
```

### 3. Zero Business Logic Coupling
- No hardcoded business rules specific to one app
- Configurable behavior via options
- Repository abstraction (database-agnostic)
- Apps provide their own database connection

---

## � Workflow & Task Management

### Task-Driven Development (Module Specific)

**1. Branch Creation:**
```bash
feature/MODULE-123-add-refresh-token
bugfix/MODULE-456-fix-jwt-validation
refactor/MODULE-789-extract-password-service
```

**2. Task Documentation:**
Create task file at branch start:
```
docs/tasks/active/MODULE-123-add-refresh-token.md
```

**Task file structure** (same as main app):
```markdown
# MODULE-123: Add Refresh Token Support

## Description
Add refresh token rotation for enhanced security

## Implementation Details
- What was done
- Why (technical/security reasons)
- Key decisions made

## Files Modified
- src/api/dto/auth-tokens.dto.ts
- src/application/use-cases/refresh-token.use-case.ts

## Breaking Changes
- `login()` now returns `AuthTokensDto` instead of `string`
- Apps need to update response handling

## Notes
Decision: Token rotation over sliding window for security
```

**3. On Release:**
Move to archive:
```
docs/tasks/archive/by-release/v2.0.0/MODULE-123-add-refresh-token.md
```

### Development Workflow

**Simple changes** (bug fix, small improvements):
- Read context → Implement directly → Update docs → Update CHANGELOG

**Complex changes** (new features, breaking changes):
- Read context → Discuss approach → Implement step-by-step → Update docs → Update CHANGELOG → Update version

**When blocked or uncertain:**
- **DO**: Ask for clarification immediately
- **DON'T**: Make breaking changes without approval

---

## �🔐 Security Best Practices

**ALWAYS:**
- ✅ Input validation on all DTOs
- ✅ Password hashing (bcrypt, min 10 rounds)
- ✅ JWT secret from env (never hardcoded)
- ✅ Token expiration times configurable
- ✅ Refresh token rotation
- ✅ Rate limiting on auth endpoints

---

## 📦 Versioning & Breaking Changes

### Semantic Versioning (Strict)

**MAJOR** (x.0.0) - Breaking changes:
- Changed function signatures
- Removed public methods
- Changed DTOs structure
- Changed module configuration

**MINOR** (0.x.0) - New features:
- New endpoints/methods
- New optional parameters
- New decorators/guards

**PATCH** (0.0.x) - Bug fixes:
- Internal fixes
- Performance improvements
- Documentation updates

### CHANGELOG Required
```markdown
# Changelog

## [2.0.0] - 2026-01-30
### BREAKING CHANGES
- `login()` now returns `AuthTokens` instead of string
- Removed deprecated `validateUser()` method

### Added
- Refresh token support
- Role-based guards

### Fixed
- Token expiration validation
```

---

## 🚫 Restrictions - Require Approval

**NEVER without approval:**
- Breaking changes to public API
- Changing exported DTOs/interfaces
- Removing exported functions
- Major dependency upgrades
- Security-related changes

**CAN do autonomously:**
- Bug fixes (no breaking changes)
- Internal refactoring
- Adding new features (non-breaking)
- Test improvements
- Documentation updates

---

## ✅ Release Checklist

Before publishing:
- [ ] All tests passing (100% of test suite)
- [ ] Coverage >= 80%
- [ ] No ESLint warnings
- [ ] TypeScript strict mode passing
- [ ] All public APIs documented (JSDoc)
- [ ] README updated with examples
- [ ] CHANGELOG updated
- [ ] Version bumped (semantic)
- [ ] Breaking changes highlighted
- [ ] Integration tested with sample app

---

## 🔄 Development Workflow

### Working on Module:
1. Clone module repo
2. Create branch: `feature/TASK-123-description`
3. Implement with tests
4. Verify checklist
5. Update CHANGELOG
6. Bump version in package.json
7. Create PR

### Testing in App:
```bash
# In module
npm link

# In app
cd ~/comptaleyes/backend
npm link @ciscode/authentication-kit

# Develop and test
# Unlink when done
npm unlink @ciscode/authentication-kit
```

---

## 🎨 Code Style

**Same as app:**
- ESLint `--max-warnings=0`
- Prettier formatting
- TypeScript strict mode
- FP for logic, OOP for structure
- Dependency injection via constructor

---

## 🐛 Error Handling

**Custom domain errors:**
```typescript
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}
```

**Structured logging:**
```typescript
this.logger.error('Authentication failed', {
  email,
  reason: 'invalid_password',
  timestamp: new Date().toISOString()
});
```

---

## 💬 Communication Style

- Brief and direct
- Focus on results
- Module-specific context
- Highlight breaking changes immediately

---

## 📋 Summary

**Module Principles:**
1. Reusability over specificity
2. Comprehensive testing (80%+)
3. Complete documentation
4. Strict versioning
5. Breaking changes = MAJOR bump
6. Zero app coupling
7. Configurable behavior

**When in doubt:** Ask, don't assume. Modules impact multiple projects.

---

*Last Updated: January 30, 2026*  
*Version: 1.0.0*
