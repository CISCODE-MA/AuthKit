# Changelog

All notable changes to the AuthKit authentication library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.0] - 2026-01-31

### Added

- Full API documentation in README with request/response examples
- Complete Copilot development instructions for module maintainers
- Contribution guidelines with module-specific setup instructions
- Enhanced SECURITY.md with vulnerability reporting procedures
- Troubleshooting and FAQ sections in documentation
- TypeScript type definitions for all public APIs

### Changed

- Improved error handling and error message consistency
- Enhanced JWT payload structure documentation
- Optimized admin route filtering capabilities
- Updated CONTRIBUTING.md with module-specific requirements

### Fixed

- Translation of Italian text in Copilot instructions to English
- JWT refresh token validation edge cases
- Admin decorator permission checking

### Security

- Added security best practices section to documentation
- Documented JWT secret rotation procedures
- Enhanced password reset token expiration guidelines

---

## [1.4.0] - 2026-01-15

### Added

- Support for Facebook OAuth provider
- Microsoft Entra ID OAuth with JWKS verification
- Role-based permission management system
- Admin routes for user, role, and permission management
- User banning/unbanning functionality

### Changed

- Refresh token implementation now uses JWT instead of database storage
- Password change now invalidates all existing refresh tokens
- User model now supports optional jobTitle and company fields

### Fixed

- OAuth provider token validation improvements
- Email verification token expiration handling
- Microsoft tenant ID configuration flexibility

---

## [1.3.0] - 2025-12-20

### Added

- Email verification requirement before login
- Password reset functionality with JWT-secured reset links
- Resend verification email feature
- User profile endpoint (`GET /api/auth/me`)
- Account deletion endpoint (`DELETE /api/auth/account`)
- Auto-generated usernames when not provided (fname-lname format)

### Changed

- Authentication flow now requires email verification
- User model schema restructuring for better organization
- Improved password hashing with bcryptjs

### Security

- Implemented httpOnly cookies for refresh token storage
- Added password change tracking with `passwordChangedAt` timestamp
- Enhanced input validation on all auth endpoints

---

## [1.2.0] - 2025-11-10

### Added

- JWT refresh token implementation
- Token refresh endpoint (`POST /api/auth/refresh-token`)
- Automatic token refresh via cookies
- Configurable token expiration times

### Changed

- Access token now shorter-lived (15 minutes by default)
- Refresh token implementation for better security posture
- JWT payload structure refined

### Fixed

- Token expiration validation during refresh

---

## [1.1.0] - 2025-10-05

### Added

- Google OAuth provider integration
- OAuth mobile exchange endpoints (ID Token and Authorization Code)
- OAuth web redirect flow with Passport.js
- Automatic user registration for OAuth providers

### Changed

- Authentication controller refactored for OAuth support
- Module configuration to support multiple OAuth providers

### Security

- Google ID Token validation implementation
- Authorization Code exchange with PKCE support

---

## [1.0.0] - 2025-09-01

### Added

- Initial release of AuthKit authentication library
- Local authentication (email + password)
- User registration and login
- JWT access token generation and validation
- Role-Based Access Control (RBAC) system
- Admin user management routes
- Email service integration (SMTP)
- Host app independent - uses host app's Mongoose connection
- Seed service for default roles and permissions
- Admin decorator and authenticate guard

### Features

- Local auth strategy with password hashing
- JWT-based authentication
- Role and permission models
- Default admin, user roles with configurable permissions
- Email sending capability for future notifications
- Clean Architecture implementation
- Production-ready error handling

---

## Future Roadmap

### Planned for v2.0.0

- [ ] Two-factor authentication (2FA) support
- [ ] API key authentication for service-to-service communication
- [ ] Audit logging for security-critical operations
- [ ] Session management with concurrent login limits
- [ ] OpenID Connect (OIDC) provider support
- [ ] Breaking change: Restructure module exports for better tree-shaking
- [ ] Migration guide for v1.x → v2.0.0

### Planned for v1.6.0

- [ ] Rate limiting built-in helpers
- [ ] Request signing and verification for webhooks
- [ ] Enhanced logging with structured JSON output
- [ ] Support for more OAuth providers (LinkedIn, GitHub)

---

## Support

For version support timeline and security updates, please refer to the [SECURITY.md](SECURITY) policy.

For issues, questions, or contributions, please visit: https://github.com/CISCODE-MA/AuthKit
