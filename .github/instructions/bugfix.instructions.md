# Bugfix Instructions - AuthKit Module

> **Last Updated**: February 2026  
> **Version**: 1.5.x

---

## 🔍 Bug Investigation Process

### Phase 1: Reproduce

**Before writing any code:**

1. **Understand the issue**: Read the bug report carefully
2. **Reproduce locally**: Create a minimal test case that triggers the bug
3. **Verify it's actually a bug**: Ensure it's not expected behavior or user error
4. **Check documentation**: Is the feature documented correctly?

**Create reproduction test:**

```typescript
// auth.service.spec.ts - Add failing test FIRST
describe("Bug: Token validation fails after password reset", () => {
  it("should accept tokens issued after password reset", async () => {
    const user = await createMockUser({
      passwordChangedAt: new Date("2026-01-01"),
    });
    const token = generateToken(user._id, new Date("2026-01-02")); // Token AFTER reset

    // This should PASS but currently FAILS
    const result = await guard.canActivate(createContextWithToken(token));
    expect(result).toBe(true);
  });
});
```

### Phase 2: Identify Root Cause

**Tools for investigation:**

- **Logging**: Add temporary logs to trace execution
- **Debugger**: Use VS Code debugger or `console.log`
- **Unit tests**: Isolate the failing component
- **Git blame**: Check when the code was introduced

**Common investigation patterns:**

```typescript
// Add debug logging
this.logger.debug(`Token iat: ${decoded.iat * 1000}`, "AuthenticateGuard");
this.logger.debug(
  `Password changed at: ${user.passwordChangedAt.getTime()}`,
  "AuthenticateGuard",
);

// Check assumptions
console.assert(decoded.iat, "Token has no iat claim");
console.assert(user.passwordChangedAt, "User has no passwordChangedAt");
```

### Phase 3: Understand Impact

**Questions to answer:**

- How many users are affected?
- Is this a security issue? (Priority: CRITICAL)
- Is there a workaround?
- Does this affect other features?
- What version introduced this bug?

---

## 🐛 Common Bug Categories

### 1. Token-Related Issues

| Bug Type                | Symptoms                                     | Common Causes                                                       |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| **Token rejection**     | Valid tokens rejected                        | Incorrect timestamp comparison, timezone issues, missing JWT secret |
| **Token expiry**        | Tokens expire too early/late                 | Wrong expiry calculation, `iat` vs `exp` confusion                  |
| **Token invalidation**  | Tokens not invalidated after password change | `passwordChangedAt` not updated, incorrect comparison               |
| **Refresh token reuse** | Old refresh tokens still work                | Not checking `passwordChangedAt` in refresh flow                    |

**Example fix: Token timestamp comparison**

```typescript
// ❌ BUG - Incorrect comparison (iat is in seconds, getTime() is milliseconds)
if (decoded.iat < user.passwordChangedAt.getTime()) {
  throw new UnauthorizedException();
}

// ✅ FIX - Convert iat to milliseconds
if (decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
  throw new UnauthorizedException("Token expired due to password change");
}
```

### 2. Authentication Issues

| Bug Type                       | Symptoms                            | Common Causes                                                                |
| ------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------- |
| **Login failure**              | Cannot login with valid credentials | bcrypt comparison error, password field not selected, email case sensitivity |
| **Email verification failure** | Verification links don't work       | Token expiry, wrong secret, frontend/backend URL mismatch                    |
| **Password reset failure**     | Reset links don't work              | Token validation error, `passwordChangedAt` not updated                      |
| **OAuth login failure**        | Social login fails                  | Invalid token validation, API changes, missing scopes                        |

**Example fix: Password not selected**

```typescript
// ❌ BUG - Password field not selected (schema has select: false)
async login(dto: LoginDto) {
  const user = await this.users.findByEmail(dto.email); // Password is null!
  const valid = await bcrypt.compare(dto.password, user.password); // Always false
}

// ✅ FIX - Use specific method that selects password
async login(dto: LoginDto) {
  const user = await this.users.findByEmailWithPassword(dto.email);
  if (!user) throw new UnauthorizedException('Invalid credentials');
  const valid = await bcrypt.compare(dto.password, user.password);
}
```

### 3. Authorization Issues

| Bug Type                     | Symptoms                                | Common Causes                                                       |
| ---------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| **Role check failure**       | Users denied access despite having role | Role ID vs name confusion, populate missing, array comparison error |
| **Permission check failure** | Permission guards don't work            | Permissions not populated, wrong field checked                      |
| **Admin guard failure**      | Admin guard allows non-admins           | Admin role not seeded, wrong role ID checked                        |

**Example fix: Role array comparison**

```typescript
// ❌ BUG - Comparing ObjectId to string
if (user.roles.includes(requiredRoleId)) {
  // Always false (ObjectId !== string)
  return true;
}

// ✅ FIX - Convert ObjectIds to strings
const roleIds = user.roles.map((r) => r.toString());
if (roleIds.includes(requiredRoleId)) {
  return true;
}
```

### 4. Email Issues

| Bug Type                 | Symptoms                         | Common Causes                                                   |
| ------------------------ | -------------------------------- | --------------------------------------------------------------- |
| **Email not sent**       | Verification emails never arrive | SMTP config error, transporter not initialized, error swallowed |
| **Email template error** | Broken links in emails           | Wrong URL, missing env var, hardcoded localhost                 |
| **Email timeout**        | Slow/hanging requests            | SMTP timeout not set, blocking operation                        |

**Example fix: SMTP error handling**

```typescript
// ❌ BUG - Error swallowed, user thinks email was sent
async sendVerificationEmail(email: string, token: string) {
  try {
    await this.transporter.sendMail({ /* ... */ });
  } catch (error) {
    console.error(error); // ❌ Swallows error
  }
}

// ✅ FIX - Throw error to caller
async sendVerificationEmail(email: string, token: string) {
  if (!this.smtpConfigured) {
    throw new InternalServerErrorException('SMTP not configured');
  }

  try {
    await this.transporter.sendMail({ /* ... */ });
    this.logger.log(`Verification email sent to ${email}`, 'MailService');
  } catch (error) {
    this.logger.error(`Failed to send email: ${error.message}`, error.stack, 'MailService');
    throw new InternalServerErrorException('Failed to send verification email');
  }
}
```

### 5. Database Issues

| Bug Type                | Symptoms                  | Common Causes                                      |
| ----------------------- | ------------------------- | -------------------------------------------------- |
| **Query returns null**  | Expected data not found   | Missing populate, wrong query filter, index issue  |
| **Duplicate key error** | Cannot create user        | Unique constraint violated, validation not checked |
| **Population error**    | Roles/permissions missing | Wrong ref, populate path incorrect                 |

**Example fix: Missing populate**

```typescript
// ❌ BUG - Roles array contains ObjectIds, not objects
async findByIdWithRoles(id: string) {
  return this.userModel.findById(id); // roles = [ObjectId(...), ObjectId(...)]
}

// ✅ FIX - Populate roles
async findByIdWithRoles(id: string) {
  return this.userModel.findById(id).populate({ path: 'roles', select: 'name' });
}
```

---

## 🛠️ Bug Fix Workflow

### Standard Process

```
1. Create Failing Test → 2. Fix Bug → 3. Verify Fix → 4. Update Docs → 5. Release
```

### Step 1: Create Failing Test

**Always write a test that reproduces the bug FIRST:**

```typescript
// auth.service.spec.ts
describe("Bug #123: Login fails with uppercase email", () => {
  it("should login successfully with uppercase email", async () => {
    const user = {
      _id: "user123",
      email: "test@example.com", // Stored lowercase
      password: await bcrypt.hash("password123", 12),
      isVerified: true,
      isBanned: false,
    };

    userRepository.findByEmailWithPassword.mockResolvedValue(user as any);
    userRepository.findByIdWithRolesAndPermissions.mockResolvedValue({
      ...user,
      roles: [],
    } as any);

    // Bug: This fails because we search for 'TEST@EXAMPLE.COM'
    const result = await service.login({
      email: "TEST@EXAMPLE.COM", // ← Uppercase
      password: "password123",
    });

    expect(result).toHaveProperty("accessToken");
  });
});
```

### Step 2: Fix the Bug

**Apply the minimal fix:**

```typescript
// auth.service.ts
async login(dto: LoginDto) {
  // FIX: Normalize email to lowercase before search
  const email = dto.email.toLowerCase();
  const user = await this.users.findByEmailWithPassword(email);

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // ... rest of logic
}
```

### Step 3: Verify Fix

**Run tests:**

```bash
npm test -- auth.service.spec.ts
```

**Expected output:**

```
✓ Bug #123: Login fails with uppercase email
  ✓ should login successfully with uppercase email (42ms)
```

### Step 4: Check Edge Cases

**Add tests for related scenarios:**

```typescript
describe("Email normalization", () => {
  it("should handle mixed case emails", async () => {
    await expectLoginSuccess("TeSt@ExAmPlE.cOm", "password123");
  });

  it("should handle emails with whitespace", async () => {
    await expectLoginSuccess("  test@example.com  ", "password123");
  });

  it("should preserve password case sensitivity", async () => {
    await expectLoginFailure("test@example.com", "PASSWORD123"); // Wrong case
  });
});
```

### Step 5: Update Documentation

**Update CHANGELOG:**

```markdown
## [1.5.2] - 2026-02-20

### Fixed

- Login now case-insensitive for email addresses (issue #123)
- Email verification links now work correctly in production (issue #125)
```

**Update TROUBLESHOOTING.md (if applicable):**

```markdown
### Login fails with "Invalid credentials" despite correct password

**Symptom**: User cannot login even with correct password.

**Cause**: Email case sensitivity issue (fixed in v1.5.2).

**Solution**: Upgrade to v1.5.2 or later.
```

---

## ✅ Bug Fix Checklist

- [ ] **Bug reproduced**: Failing test created
- [ ] **Root cause identified**: Understand why it's happening
- [ ] **Fix implemented**: Minimal change to address issue
- [ ] **Test passes**: Failing test now passes
- [ ] **Edge cases tested**: Related scenarios covered
- [ ] **No regressions**: Full test suite still passes
- [ ] **Backwards compatible**: Fix doesn't break existing functionality
- [ ] **Logging added**: Help future debugging
- [ ] **Documentation updated**: CHANGELOG, TROUBLESHOOTING (if needed)
- [ ] **Version bumped**: `npm version patch`
- [ ] **Git commit follows format**: `fix: description (closes #123)`

---

## 🚫 Common Pitfalls

### ❌ Pitfall 1: Fixing Symptoms, Not Root Cause

```typescript
// ❌ BAD - Band-aid fix (hides real problem)
async login(dto: LoginDto) {
  try {
    const user = await this.users.findByEmail(dto.email);
    return this.generateTokens(user._id);
  } catch (error) {
    // Just retry if it fails??? This masks the real issue
    return this.generateTokens('default_user_id');
  }
}

// ✅ GOOD - Fix root cause
async login(dto: LoginDto) {
  const user = await this.users.findByEmailWithPassword(dto.email); // Use correct method
  if (!user) throw new UnauthorizedException('Invalid credentials');
  return this.generateTokens(user._id);
}
```

### ❌ Pitfall 2: Breaking Backwards Compatibility

```typescript
// ❌ BAD - Breaking change in bug fix (requires MAJOR version bump)
async login(dto: LoginDto): Promise<string[]> { // Changed return type!
  return [accessToken, refreshToken]; // Breaking change
}

// ✅ GOOD - Maintain backwards compatibility
async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
  // Original return structure preserved
  return { accessToken, refreshToken };
}
```

### ❌ Pitfall 3: Not Testing Both Success and Failure

```typescript
// ❌ BAD - Only test happy path
it("should login successfully", async () => {
  const result = await service.login(validDto);
  expect(result).toHaveProperty("accessToken");
});

// ✅ GOOD - Test both paths
describe("login", () => {
  it("should login successfully with valid credentials", async () => {
    const result = await service.login(validDto);
    expect(result).toHaveProperty("accessToken");
  });

  it("should reject invalid credentials", async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(null);
    await expect(service.login(invalidDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
```

### ❌ Pitfall 4: Ignoring Error Logs

```typescript
// ❌ BAD - Fix bug but don't add logging for future debugging
async refresh(token: string) {
  const decoded = jwt.verify(token, this.getEnv('JWT_REFRESH_SECRET'));
  return this.issueTokensForUser(decoded.sub);
}

// ✅ GOOD - Add logging to help future debugging
async refresh(token: string) {
  try {
    const decoded = jwt.verify(token, this.getEnv('JWT_REFRESH_SECRET'));
    this.logger.log(`Refresh token validated for user ${decoded.sub}`, 'AuthService');
    return this.issueTokensForUser(decoded.sub);
  } catch (error) {
    this.logger.error(
      `Token refresh failed: ${error.message}`,
      error.stack,
      'AuthService'
    );
    throw new UnauthorizedException('Invalid refresh token');
  }
}
```

---

## 🐞 Debugging Tips

### Enable Detailed Logging

**Add to AuthService temporarily:**

```typescript
async login(dto: LoginDto) {
  this.logger.debug(`Login attempt for email: ${dto.email}`, 'AuthService');

  const user = await this.users.findByEmailWithPassword(dto.email);
  this.logger.debug(`User found: ${!!user}`, 'AuthService');

  if (user) {
    this.logger.debug(`User verified: ${user.isVerified}, banned: ${user.isBanned}`, 'AuthService');
  }

  // ... rest of logic
}
```

**Set log level in environment:**

```env
LOG_LEVEL=debug
```

### Inspect JWT Tokens

**Use jwt.io or decode manually:**

```typescript
import jwt from "jsonwebtoken";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const decoded = jwt.decode(token);
console.log("Token payload:", decoded);
console.log("Token issued at:", new Date(decoded.iat * 1000));
console.log("Token expires at:", new Date(decoded.exp * 1000));
```

### Check Database State

**Inspect user record:**

```typescript
const user = await this.users.findById("user123");
console.log("User record:", JSON.stringify(user, null, 2));
console.log("Roles:", user.roles);
console.log("passwordChangedAt:", user.passwordChangedAt);
```

### Test in Isolation

**Create minimal reproduction:**

```typescript
// standalone-test.ts
import { AuthService } from "./services/auth.service";

async function testBug() {
  const service = new AuthService(/* mock dependencies */);
  const result = await service.login({
    email: "TEST@EXAMPLE.COM",
    password: "pass",
  });
  console.log("Result:", result);
}

testBug().catch(console.error);
```

---

## 🎯 Example Bug Fix Walkthrough

### Bug Report: "Token refresh fails after password reset"

**Reported Issue:**

> User changes password via reset link. Old tokens are invalidated correctly. However, when user logs in again and tries to refresh the access token, the refresh fails with "Token expired due to password change."

#### Phase 1: Reproduce

**Create failing test:**

```typescript
describe("Bug #156: Refresh fails after password reset", () => {
  it("should accept refresh tokens issued after password reset", async () => {
    // Simulate user flow:
    // 1. User resets password (passwordChangedAt updated)
    // 2. User logs in (new tokens issued AFTER reset)
    // 3. User tries to refresh (should work)

    const passwordResetTime = new Date("2026-02-01T10:00:00Z");
    const loginTime = new Date("2026-02-01T10:05:00Z"); // 5 min after reset

    const user = {
      _id: "user123",
      email: "test@example.com",
      passwordChangedAt: passwordResetTime,
      isVerified: true,
      isBanned: false,
    };

    // Create refresh token issued AFTER password change
    const refreshToken = jwt.sign(
      { sub: user._id, purpose: "refresh" },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    // Mock user lookup
    userRepository.findById.mockResolvedValue(user as any);
    userRepository.findByIdWithRolesAndPermissions.mockResolvedValue({
      ...user,
      roles: [],
    } as any);

    // This should PASS but currently FAILS
    const result = await service.refresh(refreshToken);
    expect(result).toHaveProperty("accessToken");
  });
});
```

**Run test:**

```bash
npm test -- --testNamePattern="Bug #156"
```

**Result:** ❌ Test fails with `UnauthorizedException: Token expired due to password change`

#### Phase 2: Identify Root Cause

**Inspect `refresh()` method in AuthService:**

```typescript
async refresh(token: string) {
  try {
    const decoded: any = jwt.verify(token, this.getEnv('JWT_REFRESH_SECRET'));
    const user = await this.users.findById(decoded.sub);

    // BUG: We check passwordChangedAt for REFRESH tokens
    // But refresh tokens are issued AFTER login, which is AFTER password change
    // So this check incorrectly rejects valid refresh tokens
    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
      throw new UnauthorizedException('Token expired due to password change');
    }

    return this.issueTokensForUser(decoded.sub);
  } catch (error) {
    // ...
  }
}
```

**Root Cause Identified:**

The `passwordChangedAt` check is applied to refresh tokens, but refresh tokens are issued **after** login, which happens **after** password reset. The check should only apply to **access tokens** in the `AuthenticateGuard`, not to refresh tokens in the `refresh()` method.

#### Phase 3: Fix

**Remove incorrect check from `refresh()`:**

```typescript
async refresh(token: string) {
  try {
    const decoded: any = jwt.verify(token, this.getEnv('JWT_REFRESH_SECRET'));
    const user = await this.users.findById(decoded.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isBanned) {
      throw new ForbiddenException('Account has been banned');
    }

    // FIX: Remove passwordChangedAt check for refresh tokens
    // Refresh tokens are issued AFTER login, so they're always valid
    // Access tokens will be checked by AuthenticateGuard

    this.logger.log(`Refresh token validated for user ${decoded.sub}`, 'AuthService');
    return this.issueTokensForUser(decoded.sub);
  } catch (error) {
    if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
      throw error;
    }

    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Refresh token has expired');
    }

    this.logger.error(`Token refresh failed: ${error.message}`, error.stack, 'AuthService');
    throw new UnauthorizedException('Invalid refresh token');
  }
}
```

**Keep check in `AuthenticateGuard` (for access tokens):**

```typescript
// middleware/authenticate.guard.ts
async canActivate(context: ExecutionContext): Promise<boolean> {
  // ... token extraction ...

  const decoded: any = jwt.verify(token, this.getEnv('JWT_SECRET'));
  const user = await this.users.findById(decoded.sub);

  // This check is CORRECT for access tokens
  if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw new UnauthorizedException('Token expired due to password change. Please login again');
  }

  // ...
}
```

#### Phase 4: Verify

**Run test again:**

```bash
npm test -- --testNamePattern="Bug #156"
```

**Result:** ✅ Test passes

**Run full test suite:**

```bash
npm test
```

**Result:** ✅ All tests pass (no regressions)

#### Phase 5: Document

**Update CHANGELOG:**

```markdown
## [1.5.3] - 2026-02-20

### Fixed

- Token refresh now works correctly after password reset (issue #156)
- Removed incorrect `passwordChangedAt` check from refresh token validation
- Access tokens still correctly invalidated on password change via `AuthenticateGuard`
```

**Update TROUBLESHOOTING.md:**

```markdown
### Refresh token fails after password reset

**Symptom**: User changes password, logs in successfully, but refresh token fails with "Token expired due to password change."

**Cause**: Incorrect validation logic (fixed in v1.5.3).

**Solution**: Upgrade to v1.5.3 or later.
```

#### Phase 6: Release

```bash
# Bump patch version
npm version patch  # 1.5.2 → 1.5.3

# Commit
git add .
git commit -m "fix: refresh token validation after password reset (closes #156)"

# Push
git push && git push --tags

# Publish
npm publish
```

---

## 📝 Commit Message Format

**Standard format:**

```
fix: <short description> (closes #<issue_number>)

<optional detailed explanation>

Fixes:
- Specific change 1
- Specific change 2
```

**Examples:**

```bash
git commit -m "fix: email case sensitivity in login (closes #123)"

git commit -m "fix: refresh token validation after password reset (closes #156)

Removed incorrect passwordChangedAt check from refresh() method.
Refresh tokens are issued after login, so they're always valid.
Access tokens are still correctly validated by AuthenticateGuard."
```

---

## ✅ Pre-Release Checklist

- [ ] Bug reproduced with failing test
- [ ] Root cause identified and documented
- [ ] Fix implemented with minimal changes
- [ ] All tests pass (no regressions)
- [ ] Edge cases covered
- [ ] Error logging improved
- [ ] CHANGELOG updated
- [ ] TROUBLESHOOTING.md updated (if applicable)
- [ ] Version bumped (`npm version patch`)
- [ ] Commit message follows format
- [ ] PR created to `develop`
- [ ] Integration tested in host app

---

**Last Updated**: February 2026  
**Bug Fix SLA**: Critical bugs < 24h, High priority < 3 days, Normal < 1 week
