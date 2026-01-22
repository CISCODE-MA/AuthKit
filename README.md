# AuthKit (NestJS Auth Package)

A clean, production-ready authentication/authorization kit for NestJS.
Includes local auth, OAuth (Google/Microsoft/Facebook), JWT tokens, RBAC, admin user management, email verification, and password reset.

## Features

- Local auth (email + password)
- OAuth (Google / Microsoft Entra / Facebook)
  - Web redirect (Passport)
  - Mobile exchange (token/code)
- JWT access + refresh (stateless)
- Email verification (required before login)
- Password reset via JWT link
- Admin user management (create/list/ban/delete/role switch)
- RBAC (roles ↔ permissions)
- Host app owns DB (package uses host Mongoose connection)

## Install

```bash
npm i @ciscode/authentication-kit
```

## Host App Setup

1. Env Vars

```env
   MONGO_URI=mongodb://127.0.0.1:27017/app_db

JWT_SECRET=change_me
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_too
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
JWT_EMAIL_SECRET=change_me_email
JWT_EMAIL_TOKEN_EXPIRES_IN=1d
JWT_RESET_SECRET=change_me_reset
JWT_RESET_TOKEN_EXPIRES_IN=1h

SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_SECURE=false
FROM_EMAIL=no-reply@yourapp.com
FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_CALLBACK_URL=http://localhost:3000/api/auth/microsoft/callback

FB_CLIENT_ID=...
FB_CLIENT_SECRET=...
FB_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
```

2. App Module

```js
   import { Module, OnModuleInit } from '@nestjs/common';
   import { MongooseModule } from '@nestjs/mongoose';
   import { AuthKitModule, SeedService } from '@ciscode/authentication-kit';

@Module({
imports: [
MongooseModule.forRoot(process.env.MONGO_URI),
AuthKitModule,
],
})
export class AppModule implements OnModuleInit {
constructor(private readonly seed: SeedService) {}

    async onModuleInit() {
      await this.seed.seedDefaults();
    }

}
```

## Routes

```txt
Auth (public)

- POST /api/auth/register
- POST /api/auth/verify-email
- POST /api/auth/resend-verification
- POST /api/auth/login
- POST /api/auth/refresh-token
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- DELETE /api/auth/account

OAuth (mobile exchange)

- POST /api/auth/oauth/google { idToken | code }
- POST /api/auth/oauth/microsoft { idToken }
- POST /api/auth/oauth/facebook { accessToken }

OAuth (web redirect)

- GET /api/auth/google
- GET /api/auth/google/callback
- GET /api/auth/microsoft
- GET /api/auth/microsoft/callback
- GET /api/auth/facebook
- GET /api/auth/facebook/callback

Admin (protected)

- POST /api/admin/users
- GET /api/admin/users
- PATCH /api/admin/users/:id/ban
- PATCH /api/admin/users/:id/unban
- PATCH /api/admin/users/:id/roles
- DELETE /api/admin/users/:id

- POST /api/admin/roles
- GET /api/admin/roles
- PUT /api/admin/roles/:id
- PUT /api/admin/roles/:id/permissions
- DELETE /api/admin/roles/:id

- POST /api/admin/permissions
- GET /api/admin/permissions
- PUT /api/admin/permissions/:id
- DELETE /api/admin/permissions/:id
```

## Guards

```js
import { AuthenticateGuard } from '@ciscode/authentication-kit';

@UseGuards(AuthenticateGuard)
@Get('me')
getProfile() { ... }

Admin Guard
import { Admin } from '@ciscode/authentication-kit';

@Admin()
@Get('admin-only')
adminRoute() { ... }
```

## Seeding

On startup, call:

```bash
await seed.seedDefaults();
```

It creates:

- Roles: admin, user
- Permissions: users:manage, roles:manage, permissions:manage

## Notes

- AuthKit does not manage DB connection. Host app must connect to Mongo.
- JWTs are stateless; refresh tokens are signed JWTs.
- Email verification is required before login.
