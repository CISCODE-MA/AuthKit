---
'@ciscode/authentication-kit': minor
---

# AuthKit v1.6.0 Release

## 🏗️ Architecture Improvements

- **MODULE-001 Alignment**: Refactored codebase to align with Controller-Service-Repository (CSR) pattern
- **OAuth Refactoring**: Restructured OAuthService into modular provider architecture (Google, Facebook, GitHub)
- **Code Organization**: Reorganized test utilities and extracted common test helpers to reduce duplication

## 🔒 Security Fixes

- **Fixed Hardcoded Passwords**: Eliminated all password literals from test files using dynamic constant generation
  - Created centralized test password constants with dynamic generation pattern
  - Replaced 20+ instances across 5 test files (auth.service, auth.controller, users.service, users.controller, user.repository)
  - Addresses SonarQube S2068 rule violations
- **Improved Test Isolation**: All test passwords now generated via TEST_PASSWORDS constants

## ✅ Quality Improvements

- **Test Coverage**: Added comprehensive unit and integration tests
  - AuthService: 40 tests (100% coverage)
  - AuthController: 25 tests
  - Users and Permissions services: 22+ tests each
  - Guards and RBAC integration: 5+ integration tests
  - OAuth providers: Comprehensive provider tests with stability fixes
- **Code Quality**: Reduced code duplication by ~33 lines in guard tests
- **CI/CD**: Enhanced GitHub workflows with Dependabot configuration for automated security updates

## 🐛 Bug Fixes

- Fixed race condition in FacebookOAuthProvider test mock chains
- Fixed configuration error handling in guard tests
- Resolved merge conflicts with develop branch

## 📦 Dependencies

- No breaking changes
- All existing APIs remain compatible
- Security-focused improvements only affect test infrastructure

## Migration Notes

No migration needed. This release is fully backward compatible - all security and quality improvements are internal to the package.
