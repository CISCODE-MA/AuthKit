# Copilot Instructions - Auth Kit Module

> **Purpose**: Development guidelines for the Auth Kit module - a reusable authentication library for NestJS applications.

---

## 🎯 Module Overview

**Package**: `@ciscode/authentication-kit`  
**Type**: Backend NestJS Module  
**Purpose**: JWT-based authentication and authorization for NestJS apps

### Responsibilities:
- User authentication (login, register)
- JWT token generation and validation
- Role-based access control (RBAC)
- Password hashing and validation
- Auth guards and decorators

---

## 🏗️ Module Architecture

**ALWAYS follow 4-layer Clean Architecture:**

```
src/
  ├── api/                    # Controllers, DTOs, HTTP layer
  │   ├── auth.controller.ts
  │   └── dto/
  ├── application/            # Use-cases, business logic
  │   ├── ports/              # Interfaces
  │   └── use-cases/
  ├── domain/                 # Entities, value objects
  │   └── user.entity.ts
  └── infrastructure/         # Repositories, JWT service
      ├── user.repository.ts
      └── jwt.service.ts
```

---

## 📝 Naming Conventions

**Files**: `kebab-case` + suffix
- `auth.controller.ts`
- `login.dto.ts`
- `user.entity.ts`
- `validate-token.use-case.ts`
- `user.repository.ts`

**Code**: Same as app standards (PascalCase classes, camelCase functions, UPPER_SNAKE_CASE constants)

---

## 🧪 Testing - RIGOROUS for Modules

### Coverage Target: 80%+

**Unit Tests - MANDATORY:**
- ✅ All use-cases
- ✅ All domain logic
- ✅ All utilities
- ✅ Guards and decorators

**Integration Tests:**
- ✅ Controllers (full request/response)
- ✅ JWT generation/validation
- ✅ Database operations (with test DB)

**E2E Tests:**
- ✅ Complete auth flows (register → login → protected route)

**Test file location:**
```
src/
  └── application/
      └── use-cases/
          ├── login.use-case.ts
          └── login.use-case.spec.ts  ← Same directory
```

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
**Export everything public:**
```typescript
// src/index.ts
export { AuthModule } from './auth.module';
export { LoginDto, RegisterDto, UserDto } from './api/dto';
export { JwtAuthGuard, RolesGuard } from './guards';
export { CurrentUser, Roles } from './decorators';
export { User } from './domain/user.entity';
```

### 2. Configuration
**Flexible module registration:**
```typescript
@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    // Configure with app-specific options
  }
}
```

### 3. Zero Business Logic Coupling
- No hardcoded business rules specific to one app
- Configurable behavior via options
- Repository abstraction (no direct DB dependency)

---

## 🔐 Security Best Practices

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
