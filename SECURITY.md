# Security Policy

Security is critical to AuthKit, a reusable authentication library used across CISCODE projects. We take vulnerabilities seriously and appreciate responsible disclosure.

---

## 🔐 Supported Versions

| Version | Status      | Security Updates Until |
| ------- | ----------- | ---------------------- |
| 1.5.x   | Current     | January 2027           |
| 1.4.x   | LTS         | January 2026           |
| 1.0-1.3 | Unsupported | End of life            |
| 0.x     | Unsupported | End of life            |

---

## 🚨 Reporting Security Vulnerabilities

**DO NOT open public GitHub issues for security vulnerabilities.**

### How to Report

1. **Email (Preferred)**
   - Send to: security@ciscode.ma
   - Subject: `[AuthKit Security] Vulnerability Report`
   - Include all details below

2. **Private Disclosure**
   - GitHub Security Advisory (if available)
   - Private message to maintainers

### What to Include

- **Vulnerability Description:** Clear explanation of the issue
- **Affected Versions:** Which AuthKit versions are vulnerable?
- **Steps to Reproduce:** Detailed reproduction steps
- **Impact Assessment:**
  - Severity (critical/high/medium/low)
  - What data/functionality is at risk?
  - Can unprivileged users exploit this?
- **Suggested Fix:** (Optional) If you have a mitigation idea
- **Your Contact Info:** So we can follow up
- **Disclosure Timeline:** Your preferred timeline for public disclosure

### Example Report

```
Title: JWT Secret Not Validated on Module Import

Description:
AuthKit fails to validate JWT_SECRET environment variable during module
initialization, allowing the module to start with undefined secret.

Affected Versions: 1.4.0, 1.5.0

Reproduction:
1. Skip setting JWT_SECRET in .env
2. Import AuthModule in NestJS app
3. Module initializes successfully (should fail)
4. All JWTs generated are vulnerable

Impact: CRITICAL
- All tokens generated without proper secret
- Tokens can be forged by attackers
- Authentication completely broken

Suggested Fix:
- Validate JWT_SECRET in AuthModule.forRoot()
- Throw error during module initialization if missing

Timeline: 30 days preferred (embargo until patch released)

Reporter: security@example.com
```

---

## ⏱️ Response Timeline

- **Acknowledgment:** Within 24 hours
- **Triage:** Within 72 hours
- **Fix Timeline:**
  - Critical: 7 days
  - High: 14 days
  - Medium: 30 days
  - Low: Next regular release
- **Public Disclosure:** 90 days after fix released (or sooner if already public)

---

## 🔑 Security Best Practices

### For AuthKit Maintainers

1. **Secrets Management**

   ```bash
   # ✅ DO - Use environment variables
   const jwtSecret = process.env.JWT_SECRET;

   # ❌ DON'T - Hardcode secrets
   const jwtSecret = "my-secret-key"; // NEVER
   ```

2. **Dependency Security**

   ```bash
   # Check for vulnerabilities
   npm audit
   npm audit fix

   # Keep dependencies updated
   npm update
   npm outdated
   ```

3. **Code Review**
   - Security review for all PRs
   - Focus on authentication/authorization changes
   - Check for SQL injection, XSS, CSRF risks
   - Validate input on all endpoints

4. **Testing**
   - Test with malformed/invalid tokens
   - Test permission boundaries
   - Test with expired tokens
   - Test OAuth token validation

### For Host Applications Using AuthKit

1. **Environment Variables - CRITICAL**

   ```env
   # ✅ Use strong, unique secrets (minimum 32 characters)
   JWT_SECRET=your_very_long_random_secret_key_minimum_32_chars
   JWT_REFRESH_SECRET=another_long_random_secret_key
   JWT_EMAIL_SECRET=third_long_random_secret_key
   JWT_RESET_SECRET=fourth_long_random_secret_key

   # ✅ Rotate secrets periodically
   # ✅ Use different secrets for different token types

   # ❌ DON'T share secrets between environments
   # ❌ DON'T commit .env to git (use .env.example)
   ```

2. **Token Configuration**

   ```env
   # Access tokens - SHORT expiration
   JWT_ACCESS_TOKEN_EXPIRES_IN=15m

   # Refresh tokens - LONGER expiration
   JWT_REFRESH_TOKEN_EXPIRES_IN=7d

   # Email verification - SHORT expiration
   JWT_EMAIL_TOKEN_EXPIRES_IN=1d

   # Password reset - SHORT expiration
   JWT_RESET_TOKEN_EXPIRES_IN=1h
   ```

3. **HTTPS/TLS - MANDATORY in Production**

   ```typescript
   // ✅ DO - Use HTTPS in production
   // ❌ DON'T - Allow HTTP connections with sensitive data
   ```

4. **Rate Limiting - HIGHLY RECOMMENDED**

   ```typescript
   // Protect against brute force attacks on auth endpoints
   import { ThrottlerModule } from '@nestjs/throttler';

   @Post('/auth/login')
   @UseGuards(ThrottlerGuard)  // Max 5 attempts per 15 minutes
   async login(@Body() dto: LoginDto) {
     // implementation
   }
   ```

5. **CORS Configuration**

   ```typescript
   // ✅ DO - Whitelist specific origins
   app.enableCors({
     origin: process.env.FRONTEND_URL,
     credentials: true,
   });

   // ❌ DON'T - Allow all origins with credentials
   app.enableCors({
     origin: "*",
     credentials: true, // BAD
   });
   ```

6. **Input Validation**

   ```typescript
   // ✅ DO - Validate all inputs
   @Post('/auth/login')
   async login(@Body() dto: LoginDto) {
     // DTO validation happens automatically
   }

   // ❌ DON'T - Skip validation
   ```

7. **Logging & Monitoring**

   ```typescript
   // ✅ DO - Log authentication failures
   // ❌ DON'T - Log passwords or tokens
   ```

8. **CORS & Credentials**
   - httpOnly cookies (refresh tokens)
   - Secure flag in production
   - SameSite=Strict policy

---

## 🔍 Security Vulnerability Types We Track

### High Priority

- ✋ Arbitrary code execution
- 🔓 Authentication bypass
- 🔑 Secret key exposure
- 💾 Database injection (NoSQL)
- 🛡️ Cross-site scripting (XSS)
- 🚪 Privilege escalation
- 📝 Sensitive data disclosure

### Medium Priority

- 🔐 Weak cryptography
- 🚫 CORS misconfiguration
- ⏱️ Race conditions
- 📦 Dependency vulnerabilities
- 🎯 Insecure defaults

### Low Priority

- 📋 Typos in documentation
- ⚠️ Missing error messages
- 🧹 Code cleanup suggestions

---

## ✅ Security Checklist for Releases

Before publishing any version:

- [ ] Run `npm audit` - zero vulnerabilities
- [ ] All tests passing (100% of test suite)
- [ ] No hardcoded secrets in code
- [ ] No credentials in logs
- [ ] JWT validation working correctly
- [ ] Password hashing uses bcryptjs (10+ rounds)
- [ ] Refresh tokens are invalidated on password change
- [ ] All user input is validated
- [ ] CSRF protection considered
- [ ] XSS prevention in place
- [ ] Rate limiting documented for applications
- [ ] Security review completed
- [ ] CHANGELOG documents security fixes
- [ ] Version bumped appropriately (MAJOR if security fix)

---

## 🔄 Known Security Considerations

1. **JWT Secret Rotation**
   - Currently not supported for zero-downtime rotation
   - Plan: v2.0.0 will support key versioning

2. **Token Invalidation**
   - Refresh tokens invalidated on password change ✅
   - No ability to revoke all tokens (stateless design)
   - Plan: Optional Redis-backed token blacklist in v2.0.0

3. **OAuth Provider Security**
   - Depends on provider security implementations
   - We validate tokens but trust provider attestations
   - Review provider security policies regularly

4. **Rate Limiting**
   - Not built-in (app responsibility)
   - Recommended: Use `@nestjs/throttler` with strict limits on auth endpoints

---

## 📚 Security Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [JWT Best Current Practices (RFC 8725)](https://tools.ietf.org/html/rfc8725)
- [NestJS Security Documentation](https://docs.nestjs.com/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 📞 Security Contact

- **Email:** security@ciscode.ma
- **Response SLA:** 24-72 hours for vulnerability acknowledgment
- **Maintainers:** Listed in repository

---

## 📜 Acknowledgments

We appreciate and publicly credit security researchers who responsibly disclose vulnerabilities.

We follow the [Coordinated Vulnerability Disclosure](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure) process.

---

**Last Updated:** January 31, 2026  
**Version:** 1.0.0
