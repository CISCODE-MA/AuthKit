# MODULE-001: Align Architecture to CSR Pattern

## Description
Refactor Auth Kit module to align with the new Controller-Service-Repository (CSR) pattern defined in the architectural strategy. This involves minimal structural changes to match the established pattern for reusable @ciscode/* modules.

## Business Rationale
- **Simplicity**: CSR pattern is simpler and more straightforward for library consumers
- **Industry Standard**: CSR is a well-known pattern for NestJS modules
- **Reusability**: Libraries should be easy to understand and integrate
- **Consistency**: Align with Database Kit and other @ciscode/* modules
- **Best Practice**: Clean Architecture (4-layer) reserved for complex applications, not libraries

## Implementation Details

### 1. Rename Directories
- ✅ `models/` → `entities/` (domain models)
- ✅ Keep `controllers/`, `services/`, `repositories/` as-is
- ✅ Keep `guards/`, `decorators/`, `dto/` as-is

### 2. Rename Files
- ✅ `user.model.ts` → `user.entity.ts`
- ✅ `role.model.ts` → `role.entity.ts`
- ✅ `permission.model.ts` → `permission.entity.ts`

### 3. Update Imports
- ✅ All imports from `@models/*` → `@entities/*`
- ✅ Update tsconfig.json path aliases
- ✅ Update all references in code

### 4. Update Public Exports (index.ts)
Add missing DTOs to public API:
```typescript
// Services
export { AuthService } from './services/auth.service';
export { SeedService } from './services/seed.service';
export { AdminRoleService } from './services/admin-role.service';

// DTOs - NEW
export { 
  LoginDto, 
  RegisterDto, 
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto 
} from './dto/auth';

export {
  CreateRoleDto,
  UpdateRoleDto,
  UpdateRolePermissionsDto
} from './dto/role';

// Guards
export { AuthenticateGuard } from './guards/jwt-auth.guard';
export { AdminGuard } from './guards/admin.guard';

// Decorators
export { Admin } from './decorators/admin.decorator';
export { hasRole } from './guards/role.guard';
```

### 5. Update Documentation
- ✅ Update copilot-instructions.md (already done)
- ✅ Update README.md if references to folder structure exist
- ✅ Add CHANGELOG entry

### 6. Testing (Future - separate task)
- Add unit tests for services
- Add integration tests for controllers
- Add E2E tests for auth flows
- Target: 80%+ coverage

## Files Modified

### Structural Changes:
- `src/models/` → `src/entities/`
- `src/models/user.model.ts` → `src/entities/user.entity.ts`
- `src/models/role.model.ts` → `src/entities/role.entity.ts`
- `src/models/permission.model.ts` → `src/entities/permission.entity.ts`

### Configuration:
- `tsconfig.json` - Update path aliases
- `src/index.ts` - Add DTO exports

### Documentation:
- `.github/copilot-instructions.md` - Architecture guidelines
- `README.md` - Update folder references (if any)
- `CHANGELOG.md` - Add entry for v2.0.0

### Code Updates:
- All files importing from `@models/*` → `@entities/*`
- Estimated: ~20-30 files with import updates

## Breaking Changes

**MAJOR version bump required: v1.5.0 → v2.0.0**

### Public API Changes:
1. **NEW EXPORTS**: DTOs now exported (non-breaking, additive)
2. **Internal Path Changes**: Only affects apps directly importing from internals (should never happen)

### Migration Guide for Consumers:
```typescript
// BEFORE (if anyone was doing this - which they shouldn't)
import { User } from '@ciscode/authentication-kit/dist/models/user.model';

// AFTER (still shouldn't do this, but now it's entities)
import { User } from '@ciscode/authentication-kit/dist/entities/user.entity';

// CORRECT WAY (unchanged)
import { AuthService, LoginDto } from '@ciscode/authentication-kit';
```

**Impact:** Minimal - no breaking changes for proper usage via public API

## Technical Decisions

### Why CSR over Clean Architecture?
1. **Library vs Application**: Auth Kit is a reusable library, not a business application
2. **Simplicity**: Consumers prefer simple, flat structures
3. **No Use-Cases Needed**: Auth logic is straightforward (login, register, validate)
4. **Industry Standard**: Most NestJS libraries use CSR pattern
5. **Maintainability**: Easier to maintain with fewer layers

### Why Keep Current Structure (mostly)?
1. **Minimal Migration**: Only rename models → entities
2. **Already Organized**: Controllers, Services, Repositories already separated
3. **Less Risk**: Smaller changes = less chance of introducing bugs
4. **Backward Compatible**: Public API remains unchanged

## Testing Strategy

### Before Release:
1. ✅ Build succeeds (`npm run build`)
2. ✅ No TypeScript errors
3. ✅ Manual smoke test (link to test app)
4. ✅ All endpoints tested via Postman/Thunder Client

### Future (Separate Task):
- Add Jest configuration
- Write comprehensive test suite
- Achieve 80%+ coverage

## Rollout Plan

### Phase 1: Structural Refactor (This Task)
- Rename folders/files
- Update imports
- Update exports
- Update documentation

### Phase 2: Testing (Future Task)
- Add test infrastructure
- Write unit tests
- Write integration tests
- Achieve coverage target

### Phase 3: Release
- Update version to v2.0.0
- Publish to npm
- Update ComptAlEyes to use new version

## Related Tasks

- **Depends on**: N/A (first task)
- **Blocks**: MODULE-002 (Add comprehensive testing)
- **Related**: Architecture strategy documentation (completed)

## Notes

### Architectural Philosophy
This refactor aligns with the new **"Different architectures for different purposes"** strategy:
- **Applications** (ComptAlEyes) → 4-Layer Clean Architecture
- **Modules** (@ciscode/*) → Controller-Service-Repository

### Path Alias Strategy
Keeping aliases simple:
- `@entities/*` - Domain models
- `@services/*` - Business logic
- `@repos/*` - Data access
- `@controllers/*` - HTTP layer
- `@dtos/*` - Data transfer objects

### Documentation Updates Required
1. Copilot instructions (✅ done)
2. README folder structure section
3. CHANGELOG with breaking changes section
4. Architecture strategy doc (✅ done in ComptAlEyes)

## Success Criteria

- [ ] All files renamed (models → entities)
- [ ] All imports updated
- [ ] Build succeeds without errors
- [ ] DTOs exported in index.ts
- [ ] Path aliases updated in tsconfig.json
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Manual testing passes
- [ ] Ready for version bump to v2.0.0

## Estimated Effort

**Time**: 2-3 hours
- Rename folders/files: 15 minutes
- Update imports: 1 hour (automated with IDE)
- Update exports: 15 minutes
- Update documentation: 30 minutes
- Testing: 45 minutes

**Risk Level**: LOW
- Mostly mechanical changes
- Public API unchanged
- TypeScript will catch import errors

---

*Created*: February 2, 2026
*Status*: In Progress
*Assignee*: GitHub Copilot (AI)
*Branch*: `refactor/MODULE-001-align-architecture-csr`
