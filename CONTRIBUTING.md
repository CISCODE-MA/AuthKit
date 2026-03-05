# Contributing

Thank you for your interest in contributing to AuthKit! This is a reusable NestJS authentication library used across CISCODE projects, so we maintain high standards for quality and documentation.

Contributions of all kinds are welcome: bug reports, feature requests, documentation improvements, and code contributions.

---

## 📋 Before You Start

**Please read:**

1. [.github/copilot-instructions.md](.github/copilot-instructions.md) - **CRITICAL** - Module development principles
2. [README.md](README.md) - Feature overview and API documentation
3. [SECURITY.md](SECURITY.md) - Security best practices and vulnerability reporting

---

## 🏗️ Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- MongoDB 5+ (local or remote)
- Git

### Environment Setup

```bash
# 1. Clone repository
git clone https://github.com/CISCODE-MA/AuthKit.git
cd AuthKit

# 2. Install dependencies
npm install

# 3. Create .env from example
cp .env.example .env

# 4. Configure environment
# Edit .env with your local MongoDB URI and secrets
# See README.md for all required variables
```

### Running Locally

```bash
# Build TypeScript + resolve aliases
npm run build

# Run standalone (if applicable)
npm run start

# Run tests
npm run test

# Watch mode (during development)
npm run build:watch
```

---

## 🌳 Git Workflow

### Branch Naming

Follow the naming convention from copilot-instructions.md:

```
feature/MODULE-123-add-refresh-token
bugfix/MODULE-456-fix-jwt-validation
refactor/MODULE-789-extract-password-service
docs/MODULE-XXX-update-readme
```

### Workflow

1. **Create branch from `develop`:**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/MODULE-123-your-feature
   ```

2. **Implement with tests:**
   - Make changes with comprehensive test coverage (80%+ target)
   - Follow code style guidelines (see below)
   - Update documentation

3. **Commit with clear messages:**

   ```bash
   git commit -m "MODULE-123: Add refresh token support

   - Implement JWT refresh token rotation
   - Add refresh token endpoint
   - Update user model with token tracking
   - Add tests for token refresh flow"
   ```

4. **Push and create PR:**

   ```bash
   git push origin feature/MODULE-123-your-feature
   gh pr create --base develop
   ```

5. **After merge to `develop`, for releases:**
   ```bash
   # Only after PR approval and merge
   git checkout master
   git pull
   git merge develop
   npm version patch  # or minor/major
   git push origin master --tags
   npm publish
   ```

### Important Rules

- ✅ Feature branches **FROM** `develop`
- ✅ PRs **TO** `develop`
- ✅ `master` **ONLY** for releases
- ❌ **NEVER** direct PR to `master`

---

## 📝 Code Guidelines

### Architecture

**Follow Clean Architecture (4 layers):**

```
src/
  ├── api/                 # HTTP layer (controllers, guards, decorators)
  ├── application/         # Business logic (use-cases, services)
  ├── domain/              # Entities (User, Role, Permission)
  └── infrastructure/      # Repositories, external services
```

**Dependency Flow:** `api → application → domain ← infrastructure`

### File Naming

- Files: `kebab-case` + suffix
  - `auth.controller.ts`
  - `login.use-case.ts`
  - `user.repository.ts`

- Classes/Interfaces: `PascalCase`
  - `AuthService`
  - `LoginDto`
  - `User`

- Functions/Variables: `camelCase`
  - `generateToken()`
  - `userEmail`

- Constants: `UPPER_SNAKE_CASE`
  - `JWT_EXPIRATION_HOURS`
  - `MAX_LOGIN_ATTEMPTS`

### TypeScript

- Always use `strict` mode (required)
- Use path aliases for cleaner imports:
  ```typescript
  import { LoginDto } from "@api/dto";
  import { AuthService } from "@application/auth.service";
  import { User } from "@domain/user.entity";
  ```

### Documentation

**Every exported function/class MUST have JSDoc:**

````typescript
/**
 * Authenticates user with email and password
 * @param email - User email address
 * @param password - Plain text password (will be hashed)
 * @returns Access and refresh tokens
 * @throws {UnauthorizedException} If credentials invalid
 * @example
 * ```typescript
 * const tokens = await authService.login('user@example.com', 'password123');
 * ```
 */
async login(email: string, password: string): Promise<AuthTokens> {
  // implementation
}
````

### Code Style

- ESLint with `--max-warnings=0`
- Prettier formatting
- No magic numbers (use constants)
- Prefer functional programming for logic
- Use dependency injection via constructor

```bash
# Format and lint before committing
npm run format
npm run lint
```

---

## 🧪 Testing Requirements

### Coverage Target: 80%+

**MANDATORY unit tests for:**

- All use-cases in `src/application/use-cases/`
- All domain logic in `src/domain/`
- All utilities in `src/utils/`
- All guards and decorators in `src/api/`

**Integration tests for:**

- Controllers (full request/response flow)
- Repository operations
- External service interactions (mail, OAuth)

**Test file location:**

```
src/
  └── application/
      └── use-cases/
          ├── login.use-case.ts
          └── login.use-case.spec.ts  ← Same directory
```

**Running tests:**

```bash
npm run test                 # Run all tests
npm run test:watch          # Watch mode
npm run test:cov            # With coverage report
```

---

## 🔐 Security

### Password & Secrets

- ✅ Use environment variables for all secrets
- ❌ **NEVER** commit secrets, API keys, or credentials
- ❌ **NEVER** hardcode JWT secrets or OAuth credentials

### Input Validation

```typescript
// Use class-validator on all DTOs
import { IsEmail, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
```

### Password Hashing

```typescript
import * as bcrypt from "bcryptjs";

// Hash with minimum 10 rounds
const hashedPassword = await bcrypt.hash(password, 10);
```

---

## 📚 Documentation Requirements

Before submitting PR:

- [ ] Update README.md if adding new features
- [ ] Update CHANGELOG.md with your changes
- [ ] Add JSDoc comments to all public APIs
- [ ] Add inline comments for complex logic
- [ ] Document breaking changes prominently

### Documenting Breaking Changes

In PR description and CHANGELOG:

````markdown
## ⚠️ BREAKING CHANGES

- `login()` now returns `AuthTokens` instead of string
- Apps must update to:
  ```typescript
  const { accessToken, refreshToken } = await authService.login(...);
  ```
````

- See migration guide in README

````

---

## 📦 Versioning & Release

### Version Bumping

```bash
# Bug fixes (1.0.0 → 1.0.1)
npm version patch

# New features (1.0.0 → 1.1.0)
npm version minor

# Breaking changes (1.0.0 → 2.0.0)
npm version major

# This creates commit + tag automatically
git push origin master --tags
npm publish
````

### Before Release

Complete the **Release Checklist** in [copilot-instructions.md](.github/copilot-instructions.md):

- [ ] All tests passing (100%)
- [ ] Coverage >= 80%
- [ ] No ESLint warnings
- [ ] TypeScript strict mode passing
- [ ] All public APIs documented
- [ ] README updated
- [ ] CHANGELOG updated with version & date
- [ ] Version bumped (semantic)
- [ ] Breaking changes documented

---

## 🐛 Reporting Bugs

Include in bug reports:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Relevant error logs (redacted if needed)
- Node.js version, OS, MongoDB version
- Which OAuth providers (if applicable)

**Example:**

```markdown
## Bug: JWT validation fails on token refresh

### Steps to Reproduce

1. Register user
2. Login successfully
3. Call /api/auth/refresh-token after 1 hour

### Expected

New access token returned

### Actual

401 Unauthorized - "Invalid token"

### Error Log

JwtError: jwt malformed...

### Environment

- Node: 18.12.0
- MongoDB: 5.0
- AuthKit: 1.5.0
```

---

## 💡 Feature Requests

When requesting features:

- Explain the use case
- How it benefits multiple apps (not just one)
- Suggested implementation approach (optional)
- Any security implications

**Example:**

```markdown
## Feature: API Key Authentication

### Use Case

Service-to-service communication without user accounts

### Benefit

Enables webhook signing and service integration across CISCODE platform

### Suggested Approach

- New API key model with user reference
- New ApiKeyGuard for protecting routes
- Rate limiting by key
```

---

## 🔄 Pull Request Process

1. **Create PR with clear title & description**

   ```
   MODULE-123: Add refresh token support

   ## Changes
   - Implement JWT refresh token rotation
   - Add refresh endpoint
   - Add token tests

   ## Breaking Changes
   - login() now returns AuthTokens instead of string

   ## Checklist
   - [x] Tests passing
   - [x] Coverage >= 80%
   - [x] Documentation updated
   - [x] No breaking changes without approval
   ```

2. **Link to issue if applicable**

   ```
   Closes #123
   ```

3. **Address review feedback**

4. **Squash commits for cleaner history** (if requested)

5. **Merge only after approval**

---

## 🚫 What NOT to Do

- ❌ Break backward compatibility without MAJOR version bump
- ❌ Commit secrets or credentials
- ❌ Add undocumented public APIs
- ❌ Remove exported functions without MAJOR bump
- ❌ Make PRs directly to `master`
- ❌ Skip tests or reduce coverage
- ❌ Ignore ESLint or TypeScript errors
- ❌ Use magic strings/numbers without constants

---

## ❓ Questions?

- Check [copilot-instructions.md](.github/copilot-instructions.md) for module standards
- Read existing code in `src/` for examples
- Check closed PRs for discussion patterns
- Open a discussion issue with `[question]` tag

---

## 📜 License

By contributing, you agree your contributions are licensed under the same license as the project (MIT).

---

**Last Updated:** January 31, 2026  
**Version:** 1.0.0
