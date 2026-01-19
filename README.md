Auth Service (NestJS, JWT, RBAC)
Internal package - private to the company.
This package is not published on npmjs. Install it only from the company Azure Artifacts feed using a project or user-level .npmrc.

Authentication and authorization module for NestJS apps.
Provides local email/password auth with lockout, JWT access tokens and refresh, RBAC, and optional OAuth (Microsoft Entra, Google, Facebook).

Features
Local auth (email/password) with account lockout policy.
JWT access tokens (Bearer) and refresh endpoint (cookie or body).
RBAC (roles -> permission strings).
Microsoft Entra (Azure AD), Google, Facebook OAuth (optional).
MongoDB/Mongoose models.

Routes are mounted under:

/api/auth (auth, password reset)
/api/users (user admin)
/api/auth/roles and /api/auth/permissions (RBAC)
/api/admin (admin actions)

Installation

1) Install the package
npm i @ciscode/authentication-kit

2) Required environment variables (host app)
Create a .env in the host project:

# Server
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Database (the service connects to this on startup)
MONGO_URI_T=mongodb://127.0.0.1:27017/auth_service

# JWT
JWT_SECRET=change_me
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_too
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Lockout policy
MAX_FAILED_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_TIME_MINUTES=15

# (Optional) Microsoft Entra ID (Azure AD)
MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_CLIENT_SECRET=your-secret
MICROSOFT_CALLBACK_URL=${BASE_URL}/api/auth/microsoft/callback

Use inside an existing Nest app
The module connects to Mongo on init and mounts its controllers.

// app.module.ts (host app)
import { Module } from '@nestjs/common';
import { AuthKitModule } from '@ciscode/authentication-kit';

@Module({
  imports: [AuthKitModule]
})
export class AppModule {}

If you need to run it standalone, build and start the package:

npm run build
npm start

What is included (routes and behavior)
Auth
POST /api/auth/login - Local login. On success, returns accessToken and may set a refreshToken httpOnly cookie.
POST /api/auth/refresh-token - New access token from a valid refresh token (cookie or body).
POST /api/auth/request-password-reset - Sends a reset token (e.g., by email).
POST /api/auth/reset-password - Consumes the reset token and sets a new password.
GET /api/auth/microsoft - GET /api/auth/microsoft/callback - Optional Microsoft Entra OAuth; issues first-party tokens.
Users
GET /api/users - List users (paginated).
POST /api/users - Create a user.
Additional CRUD endpoints as exposed by controllers.
Roles and Permissions
GET/POST /api/auth/roles - Manage roles (name, permissions: string[]).
GET /api/auth/permissions - List permission strings and metadata.

Protecting your own routes (host app)
import { UseGuards } from '@nestjs/common';
import { AuthenticateGuard, hasPermission } from '@ciscode/authentication-kit';

@UseGuards(AuthenticateGuard, hasPermission('reports:read'))
@Get('reports')
getReports() {
  return { ok: true };
}

Quick start (smoke tests)
Start your host app, then create a user and log in:

curl -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@b.com","password":"Secret123!","name":"Alice"}'

curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@b.com","password":"Secret123!"}'
# => { "accessToken": "...", "refreshToken": "..." }

Call a protected route

ACCESS=<paste_access_token_here>
curl http://localhost:3000/api/users -H "Authorization: Bearer $ACCESS"

Refresh token

curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<paste_refresh_token_here>"}'
# => { "accessToken": "..." }

Microsoft OAuth (optional) - Visit: http://localhost:3000/api/auth/microsoft to complete sign-in.
- Callback: ${BASE_URL}/api/auth/microsoft/callback returns tokens (and may set the refresh cookie).

CI/CD (Azure Pipelines)
# azure-pipelines.yml (snippet)
- task: npmAuthenticate@0
  inputs:
    workingFile: .npmrc  # optional; the task wires npm auth for subsequent steps

- script: npm ci
  displayName: Install deps
(For GitHub Actions, write a ~/.npmrc with the token from secrets.AZURE_ARTIFACTS_PAT before npm ci.)

Security notes
Never commit real PATs. Use env vars or CI secrets.
Run behind HTTPS. Rotate JWT and refresh secrets periodically.
Limit login attempts; log auth events for auditing.
License
Internal - Company proprietary.
