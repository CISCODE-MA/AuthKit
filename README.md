# AuthKit (NestJS Auth Package)

A production-ready, comprehensive authentication/authorization kit for NestJS with local auth, OAuth (Google/Microsoft/Facebook), JWT tokens, RBAC, admin user management, email verification, and password reset.

## Features

- **Local Authentication:** Email + password registration & login
- **OAuth Providers:**
  - Google (ID Token validation + Authorization Code exchange)
  - Microsoft (Entra ID with JWKS verification)
  - Facebook (App token validation)
  - Web redirect flow (Passport)
  - Mobile token/code exchange
- **JWT Management:**
  - Access tokens (stateless, short-lived)
  - Refresh tokens (long-lived JWTs with automatic invalidation on password change)
  - Email verification tokens (JWT-based links)
  - Password reset tokens (JWT-based links)
- **Email Verification:** Required before login
- **Password Reset:** JWT-secured reset link
- **Admin User Management:** Create, list, ban/unban, delete, assign roles
- **RBAC (Role-Based Access Control):**
  - Roles linked to users
  - Permissions linked to roles
  - Roles automatically included in JWT payload (Ids)
  - Fine-grained access control
- **Host App Control:** Package uses host app's Mongoose connection (no DB lock-in)

## Install

```bash
npm i @ciscode/authentication-kit
```

## Host App Setup

### 1. Environment Variables

```env
# Database
MONGO_URI=mongodb://127.0.0.1:27017/app_db

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_this
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_change_this
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
JWT_EMAIL_SECRET=your_email_secret_change_this
JWT_EMAIL_TOKEN_EXPIRES_IN=1d
JWT_RESET_SECRET=your_reset_secret_change_this
JWT_RESET_TOKEN_EXPIRES_IN=1h

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
FROM_EMAIL=noreply@yourapp.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Microsoft/Entra ID OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:3000/api/auth/microsoft/callback
MICROSOFT_TENANT_ID=common  # Optional, defaults to 'common'

# Facebook OAuth
FB_CLIENT_ID=your-facebook-app-id
FB_CLIENT_SECRET=your-facebook-app-secret
FB_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback

# Environment
NODE_ENV=development
```

### 2. Host app example

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthKitModule, SeedService } from '@ciscode/authentication-kit';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI), AuthKitModule],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seed: SeedService) {}

  async onModuleInit() {
    await this.seed.seedDefaults();
  }
}
```

> NOTES:
>
> The AuthKit, by default seeds database with default roles and permissions once the host app is bootstraped (logs are generated for info)
> Default user role, on first register, is 'user' ... Mongoose needs Id to do this relation (the app MUST seed db from the package before anything)

## API Routes

### Local Auth Routes (Public)

```
POST   /api/auth/register
POST   /api/auth/verify-email
POST   /api/auth/resend-verification
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
DELETE /api/auth/account (protected)
```

### OAuth Routes - Mobile Exchange (Public)

Exchange OAuth provider tokens for app tokens:

```txt
POST /api/auth/oauth/google       { idToken?: string, code?: string }
POST /api/auth/oauth/microsoft    { idToken: string }
POST /api/auth/oauth/facebook     { accessToken: string }
```

### OAuth Routes - Web Redirect (Public)

Passport-based OAuth flow for web browsers:

```txt
GET /api/auth/google                    | Google OAuth
GET /api/auth/google/callback           | Google Redirect (After login)
GET /api/auth/microsoft                 | Microsoft OAuth
GET /api/auth/microsoft/callback        | Microsoft Redirect (After login)
GET /api/auth/facebook                  | Facebook OAuth
GET /api/auth/facebook/callback         | Facebook Redirect (After login)
```

### Admin Routes - Users (Protected with @Admin())

```txt
POST   /api/admin/users                         |Create user
GET    /api/admin/users?email=...&username=...  |List users (with filters)
PATCH  /api/admin/users/:id/ban                 |Ban user
PATCH  /api/admin/users/:id/unban               |Unban user
PATCH  /api/admin/users/:id/roles               |Update user roles
DELETE /api/admin/users/:id                     |Delete user
```

### Admin Routes - Roles (Protected with @Admin())

```txt
POST   /api/admin/roles                    Create role
GET    /api/admin/roles                    List all roles
PUT    /api/admin/roles/:id                Update role name
PUT    /api/admin/roles/:id/permissions    Set role permissions
DELETE /api/admin/roles/:id                Delete role
```

### Admin Routes - Permissions (Protected with @Admin())

```txt
POST   /api/admin/permissions              Create permission
GET    /api/admin/permissions              List all permissions
PUT    /api/admin/permissions/:id          Update permission
DELETE /api/admin/permissions/:id          Delete permission
```

## Usage Examples

### Register

**Request:**

```json
POST /api/auth/register
Content-Type: application/json

{
  "fullname": {
    "fname": "Test",
    "lname": "User"
  },
  "username": "custom-username",
  "email": "user@example.com",
  "password": "Pa$$word!",
  "phoneNumber": "+1234567890",
  "avatar": "https://example.com/avatar.jpg",
  "jobTitle": "Software Engineer",
  "company": "Ciscode"
}
```

**Notes:**

- `username` is now **optional**. If not provided, it will be auto-generated as `fname-lname` (e.g., `test-user`)
- `jobTitle` and `company` are **optional** profile fields
- All other fields work as before

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com"
}
```

### Login

**Request:**

```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Pa$$word!"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

_Note: `refreshToken` is also set in httpOnly cookie_

### Verify Email

**Request:**

```json
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "email-verification-token-from-email"
}
```

**Response:**

```json
{
  "ok": true
}
```

### Refresh Token

**Request (from body):**

```json
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh-token-value"
}
```

**OR (from cookie - automatic):**

```json
POST /api/auth/refresh-token
Cookie: refreshToken=refresh-token-value
```

**Response:**

```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

### OAuth Google (Mobile Exchange)

**Request (with ID Token):**

```json
POST /api/auth/oauth/google
Content-Type: application/json

{
  "idToken": "google-id-token-from-client"
}
```

**OR (with Authorization Code):**

```json
POST /api/auth/oauth/google
Content-Type: application/json

{
  "code": "authorization-code-from-google"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Delete Account

**Request:**

```json
DELETE /api/auth/account
Authorization: Bearer access-token
```

**Response:**

```json
{
  "ok": true
}
```

## Guards & Decorators

**AuthenticateGuard:** Protects routes that require authentication. (No Access if not authenticated)
**Admin Decorator:** Restricts routes to admin users only. (No Access if not an admin)

## JWT Token Structure

### Access Token Payload

```json
{
  "sub": "user-id",
  "roles": ["ids"],
  "iat": 1672531200,
  "exp": 1672531900
}
```

### Refresh Token Payload

```json
{
  "sub": "user-id",
  "purpose": "refresh",
  "iat": 1672531200,
  "exp": 1672617600
}
```

**Security Note:** Refresh tokens are automatically invalidated if user changes password. The `passwordChangedAt` timestamp is checked during token refresh.

## Seeding

On app startup via `onModuleInit()`, the following are created:

**Roles:**

- `admin` - Full permissions
- `user` - No default permissions

**Permissions:**

- `users:manage` - Create, list, ban, delete users
- `roles:manage` - Create, list, update, delete roles
- `permissions:manage` - Create, list, update, delete permissions

All permissions are assigned to the `admin` role.

## User Model

```typescript
{
  _id: ObjectId,
  fullname: {
    fname: string,
    lname: string
  },
  username: string (unique, 3-30 chars, auto-generated as fname-lname if not provided),
  email: string (unique, validated),
  phoneNumber?: string (unique, 10-14 digits),
  avatar?: string (default: 'default.jpg'),
  jobTitle?: string,
  company?: string,
  password: string (hashed, min 6 chars),
  roles: ObjectId[] (references Role),
  isVerified: boolean (default: false),
  isBanned: boolean (default: false),
  passwordChangedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Role Model

```typescript
{
  _id: ObjectId,
  name: string (unique),
  permissions: ObjectId[] (references Permission),
  createdAt: Date,
  updatedAt: Date
}
```

## Permission Model

```typescript
{
  _id: ObjectId,
  name: string (unique),
  description?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Important Notes

- **Database:** AuthKit does NOT manage MongoDB connection. Your host app must provide the connection via `MongooseModule.forRoot()`.
- **Stateless:** JWTs are stateless; refresh tokens are signed JWTs (not stored in DB).
- **Email Verification Required:** Users cannot login until they verify their email.
- **Password Changes Invalidate Tokens:** All refresh tokens become invalid immediately after password change.
- **OAuth Auto-Registration:** Users logging in via OAuth are automatically created with verified status.
- **Cookie + Body Support:** Refresh tokens can be passed via httpOnly cookies OR request body.
- **Admin Access:** Routes under `/api/admin/*` require the `admin` role (enforced by `@Admin()` decorator).

## Error Handling

The package throws errors with descriptive messages. Your host app should catch and format them appropriately:

```typescript
try {
  await authService.login(dto);
} catch (error) {
  // Possible errors:
  // "Invalid credentials."
  // "Account banned."
  // "Email not verified."
  // "User not found."
  // "JWT_SECRET is not set"
  // etc.
}
```

## Development

```bash
npm run build      # Compile TypeScript + alias paths
npm run start      # Run standalone (if applicable)
npm run test       # Run tests (currently no tests defined)
```

## License

MIT

## Author

Ciscode

---

**Version:** 1.2.0
