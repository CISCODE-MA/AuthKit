# 📘 Technical Overview - Auth Kit Module

**Package**: `@ciscode/authentication-kit`  
**Version**: 1.5.0  
**Date**: January 30, 2026  
**Status**: Pre-Refactoring Documentation

> This document describes the **current** technical architecture of the Auth Kit module before the 4-layer refactoring. Use this as reference for understanding the existing structure and behavior.

---

## 🏗️ Current Architecture

### Folder Structure (Legacy)

```
src/
  ├── auth-kit.module.ts        # Main NestJS module
  ├── index.ts                   # Public exports
  ├── standalone.ts              # Standalone server
  ├── types.d.ts                 # TypeScript types
  ├── config/                    # Configuration
  │   └── passport.config.ts     # OAuth strategies setup
  ├── controllers/               # HTTP endpoints
  │   ├── auth.controller.ts
  │   ├── users.controller.ts
  │   ├── roles.controller.ts
  │   ├── permissions.controller.ts
  │   └── health.controller.ts
  ├── services/                  # Business logic
  │   ├── auth.service.ts
  │   ├── users.service.ts
  │   ├── roles.service.ts
  │   ├── permissions.service.ts
  │   ├── admin-role.service.ts
  │   ├── oauth.service.ts
  │   ├── mail.service.ts
  │   ├── seed.service.ts
  │   └── logger.service.ts
  ├── models/                    # Mongoose schemas
  │   ├── user.model.ts
  │   ├── role.model.ts
  │   └── permission.model.ts
  ├── repositories/              # Data access
  │   ├── user.repository.ts
  │   ├── role.repository.ts
  │   └── permission.repository.ts
  ├── dtos/                      # Data Transfer Objects
  │   ├── auth/
  │   ├── role/
  │   └── permission/
  ├── middleware/                # Guards & Decorators
  │   ├── authenticate.guard.ts
  │   ├── admin.guard.ts
  │   ├── role.guard.ts
  │   └── admin.decorator.ts
  ├── filters/                   # Exception filters
  │   └── http-exception.filter.ts
  └── utils/                     # Utilities
```

**Notes:**
- ⚠️ This is a **legacy structure** (controllers/services/models)
- 🔄 Will be refactored to 4-layer Clean Architecture

---

## 🔌 Module Registration

### Dynamic Module

The module supports dynamic configuration:

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    PermissionsController,
    HealthController,
  ],
  providers: [
    AuthService,
    UsersService,
    RolesService,
    PermissionsService,
    MailService,
    SeedService,
    LoggerService,
    AdminRoleService,
    OAuthService,
    UserRepository,
    RoleRepository,
    PermissionRepository,
    AuthenticateGuard,
    AdminGuard,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
  exports: [
    AuthService,
    UsersService,
    RolesService,
    PermissionsService,
    AuthenticateGuard,
    AdminGuard,
  ],
})
export class AuthKitModule implements NestModule, OnModuleInit {
  // Cookie parser middleware
  // OAuth strategies initialization
}
```

---

## 📦 Public API (Exports)

### Current Exports (index.ts)

```typescript
export { AuthKitModule } from './auth-kit.module';
export { AuthenticateGuard } from './middleware/authenticate.guard';
export { hasRole } from './middleware/role.guard';
export { Admin } from './middleware/admin.decorator';
export { SeedService } from './services/seed.service';
export { AdminGuard } from './middleware/admin.guard';
export { AdminRoleService } from './services/admin-role.service';
```

**What Apps Can Import:**
- `AuthKitModule` - Main module to register
- Guards: `AuthenticateGuard`, `AdminGuard`
- Decorators: `@Admin()`, `hasRole()`
- Services: `SeedService`, `AdminRoleService`

**What is NOT Exported:**
- DTOs (should be but aren't)
- Controllers (internal)
- Repositories (internal)
- Models/Entities (internal - correct)

---

## 🎯 Core Features

### 1. Authentication

**Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/verify-email` - Email verification

**OAuth Providers:**
- Google OAuth 2.0
- Facebook OAuth
- Azure AD OAuth 2.0

### 2. Role-Based Access Control (RBAC)

**Entities:**
- **User** - Has roles
- **Role** - Has permissions
- **Permission** - Specific action

**Endpoints:**
- `GET /roles` - List all roles
- `POST /roles` - Create role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `GET /permissions` - List permissions
- `POST /permissions` - Create permission

**Guards:**
- `@UseGuards(AuthenticateGuard)` - Requires authentication
- `@UseGuards(AdminGuard)` - Requires admin role
- `@hasRole('ROLE_NAME')` - Requires specific role

### 3. User Management

**Endpoints:**
- `GET /users` - List users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

---

## 🔐 Security Features

### JWT Tokens

- **Access Token**: Short-lived (15 min default)
- **Refresh Token**: Long-lived (7 days default)
- Stored in HTTP-only cookies

### Password Security

- **Hashing**: bcryptjs with 10 salt rounds
- **Reset Tokens**: Cryptographically secure random tokens
- **Token Expiration**: Reset tokens expire after 1 hour

### CORS & Cookies

- Configurable CORS origins
- Secure, HTTP-only cookies
- SameSite policy support

---

## 📊 Data Models

### User Model

```typescript
{
  email: string;           // Unique, required
  password: string;        // Hashed
  firstName: string;
  lastName: string;
  roles: ObjectId[];       // Reference to Role
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Role Model

```typescript
{
  name: string;            // Unique (e.g., 'ADMIN', 'USER')
  description: string;
  permissions: ObjectId[]; // Reference to Permission
  createdAt: Date;
  updatedAt: Date;
}
```

### Permission Model

```typescript
{
  name: string;            // Unique (e.g., 'users:read', 'roles:write')
  description: string;
  resource: string;        // e.g., 'users', 'roles'
  action: string;          // e.g., 'read', 'write', 'delete'
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🛠️ Services Overview

### AuthService

**Responsibilities:**
- User authentication (login, register)
- JWT token generation and validation
- Password reset flow
- Email verification

**Key Methods:**
```typescript
async register(dto: RegisterDto): Promise<User>
async login(dto: LoginDto): Promise<{ accessToken, refreshToken }>
async refreshToken(token: string): Promise<{ accessToken }>
async forgotPassword(email: string): Promise<void>
async resetPassword(token: string, newPassword: string): Promise<void>
async verifyEmail(token: string): Promise<void>
```

### UsersService

**Responsibilities:**
- User CRUD operations
- User-role assignment
- User queries

**Key Methods:**
```typescript
async findAll(): Promise<User[]>
async findById(id: string): Promise<User>
async create(dto: CreateUserDto): Promise<User>
async update(id: string, dto: UpdateUserDto): Promise<User>
async delete(id: string): Promise<void>
async assignRole(userId: string, roleId: string): Promise<User>
```

### RolesService

**Responsibilities:**
- Role CRUD operations
- Role-permission assignment

**Key Methods:**
```typescript
async findAll(): Promise<Role[]>
async create(dto: CreateRoleDto): Promise<Role>
async assignPermission(roleId: string, permissionId: string): Promise<Role>
```

### MailService

**Responsibilities:**
- Send transactional emails
- Password reset emails
- Email verification emails

**Key Methods:**
```typescript
async sendPasswordResetEmail(email: string, token: string): Promise<void>
async sendEmailVerification(email: string, token: string): Promise<void>
```

### OAuthService

**Responsibilities:**
- OAuth provider authentication
- User creation from OAuth profiles

**Key Methods:**
```typescript
async googleAuth(profile: GoogleProfile): Promise<User>
async facebookAuth(profile: FacebookProfile): Promise<User>
async azureAuth(profile: AzureProfile): Promise<User>
```

---

## 🔒 Guards & Decorators

### AuthenticateGuard

**Purpose**: Verify JWT token and attach user to request

**Usage:**
```typescript
@UseGuards(AuthenticateGuard)
@Get('profile')
getProfile(@Req() req) {
  return req.user; // User attached by guard
}
```

### AdminGuard

**Purpose**: Restrict access to admin users only

**Usage:**
```typescript
@UseGuards(AuthenticateGuard, AdminGuard)
@Delete('users/:id')
deleteUser(@Param('id') id: string) {
  // Only admins can access
}
```

### @hasRole Decorator

**Purpose**: Check if user has specific role

**Usage:**
```typescript
@UseGuards(AuthenticateGuard)
@hasRole('MODERATOR')
@Post('moderate')
moderateContent() {
  // Only MODERATOR role can access
}
```

### @Admin Decorator

**Purpose**: Shorthand for admin-only endpoints

**Usage:**
```typescript
@Admin()
@Get('admin/dashboard')
adminDashboard() {
  // Combines AuthenticateGuard + AdminGuard
}
```

---

## 📂 Repositories

### UserRepository

**Purpose**: Data access layer for users

**Key Methods:**
```typescript
async findAll(): Promise<User[]>
async findById(id: string): Promise<User | null>
async findByEmail(email: string): Promise<User | null>
async create(data: Partial<User>): Promise<User>
async update(id: string, data: Partial<User>): Promise<User>
async delete(id: string): Promise<void>
```

**Pattern**: 
- Uses Mongoose Model
- Abstracts database operations
- Returns plain objects or models

---

## 🌍 Environment Variables

### Required Configuration

```bash
# Database
MONGO_URI=mongodb://localhost:27017/auth-kit

# JWT Secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# JWT Expiration
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Service
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-password
MAIL_FROM=noreply@example.com

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...

# App
APP_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Admin Seed
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

---

## 🔄 Initialization Flow

### Module Bootstrap

1. **Module Registration**: `AuthKitModule.forRoot()`
2. **Database Connection**: Mongoose schemas registered
3. **Middleware Setup**: Cookie parser added
4. **OAuth Strategies**: Passport strategies registered
5. **Seed Data** (if enabled): Admin user and roles created

### OnModuleInit

```typescript
async onModuleInit() {
  registerOAuthStrategies(); // Setup OAuth
  await this.seedService.seed(); // Seed admin data
}
```

---

## 📡 API Routes

### Auth Routes (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password | No |
| GET | `/auth/verify-email` | Verify email | No |
| GET | `/auth/google` | Google OAuth | No |
| GET | `/auth/facebook` | Facebook OAuth | No |
| GET | `/auth/azure` | Azure OAuth | No |

### User Routes (`/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | List all users | Admin |
| GET | `/users/:id` | Get user by ID | Admin |
| POST | `/users` | Create user | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

### Role Routes (`/roles`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/roles` | List all roles | Admin |
| POST | `/roles` | Create role | Admin |
| PUT | `/roles/:id` | Update role | Admin |
| DELETE | `/roles/:id` | Delete role | Admin |

### Permission Routes (`/permissions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/permissions` | List permissions | Admin |
| POST | `/permissions` | Create permission | Admin |

---

## 🧪 Testing Status

**Current Status**: ❌ No tests implemented

**Required:**
- Unit tests for services
- Integration tests for controllers
- E2E tests for auth flows
- Guard unit tests

**Target Coverage**: 80%+

---

## 📦 Dependencies

### Core Dependencies

```json
{
  "axios": "^1.7.7",
  "bcryptjs": "^2.4.3",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.14.1",
  "cookie-parser": "^1.4.6",
  "jsonwebtoken": "^9.0.2",
  "nodemailer": "^6.9.15",
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0",
  "passport-facebook": "^3.0.0",
  "passport-azure-ad-oauth2": "^0.0.4"
}
```

---

## 🔍 Known Issues & Limitations

### Architecture
- ❌ Not following Clean Architecture
- ❌ Business logic mixed in services
- ❌ No clear separation of concerns

### Testing
- ❌ Zero test coverage
- ❌ No CI/CD integration

### Documentation
- ⚠️ Missing CHANGELOG
- ⚠️ Limited JSDoc coverage
- ⚠️ No API documentation (Swagger missing)

### Exports
- ❌ DTOs not exported (breaking encapsulation)
- ⚠️ Some services exported (may not all be needed)

---

## 🚀 Usage Examples

### Register Module in App

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthKitModule } from '@ciscode/authentication-kit';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthKitModule,
  ],
})
export class AppModule {}
```

### Protect Route

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthenticateGuard } from '@ciscode/authentication-kit';

@Controller('dashboard')
export class DashboardController {
  @UseGuards(AuthenticateGuard)
  @Get()
  getDashboard() {
    return { message: 'Protected route' };
  }
}
```

### Use Role Guard

```typescript
import { Controller, Delete, UseGuards } from '@nestjs/common';
import { AuthenticateGuard, hasRole } from '@ciscode/authentication-kit';

@Controller('admin')
export class AdminController {
  @UseGuards(AuthenticateGuard)
  @hasRole('ADMIN')
  @Delete('users/:id')
  deleteUser() {
    return { message: 'Admin only' };
  }
}
```

---

## 📌 Next Steps (Refactoring)

### Phase 1: Restructure Folders
- Move `controllers/` → `api/`
- Split `services/` → `application/` + `infrastructure/`
- Move `models/` → `domain/`
- Move `repositories/` → `infrastructure/`
- Organize `middleware/` → `api/guards/` + `api/decorators/`

### Phase 2: Implement Use-Cases
- Extract business logic from services
- Create use-case classes in `application/use-cases/`
- Define ports/interfaces in `application/ports/`

### Phase 3: Update Exports
- Export DTOs for public consumption
- Review and cleanup service exports
- Document public API clearly

### Phase 4: Testing
- Setup Jest configuration
- Implement unit tests (80%+ coverage)
- Add integration and E2E tests

### Phase 5: Documentation
- Create CHANGELOG.md
- Add JSDoc to all public APIs
- Setup Swagger/OpenAPI docs

---

**Document Version**: 1.0  
**Last Updated**: January 30, 2026  
**Status**: Pre-Refactoring Baseline
