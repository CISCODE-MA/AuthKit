# 🧪 Auth Kit - Guida Completa ai Test

> **Documento creato**: 4 Febbraio 2026  
> **Versione Auth Kit**: 1.5.0  
> **Stato**: ✅ Production Ready (90%+ coverage)

---

## 📋 Indice

1. [Setup Iniziale](#setup-iniziale)
2. [Test Locali (Senza OAuth)](#test-locali-senza-oauth)
3. [Test OAuth Providers](#test-oauth-providers)
4. [Test Completi E2E](#test-completi-e2e)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Iniziale

### 1. Configurazione Environment

Copia `.env.example` in `.env`:

```bash
cp .env.example .env
```

### 2. Configurazione Minima (Local Testing)

Per testare **senza OAuth** (solo local auth):

```env
# Database
MONGO_URI=mongodb://127.0.0.1:27017/auth_kit_test

# JWT Secrets (⚠️ CAMBIARE IN PRODUZIONE)
JWT_SECRET=dev_secret_change_in_production_123456789
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production_987654321
JWT_EMAIL_SECRET=dev_email_secret_change_in_production_abc123
JWT_RESET_SECRET=dev_reset_secret_change_in_production_xyz789

# Token Expiration
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
JWT_EMAIL_TOKEN_EXPIRES_IN=1d
JWT_RESET_TOKEN_EXPIRES_IN=1h

# Email (SMTP) - Mailtrap per testing
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=YOUR_MAILTRAP_USER
SMTP_PASS=YOUR_MAILTRAP_PASSWORD
SMTP_SECURE=false
FROM_EMAIL=no-reply@test.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 3. Installazione Dipendenze

```bash
npm install
```

### 4. Avvio MongoDB Locale

```bash
# Opzione 1: MongoDB standalone
mongod --dbpath=/path/to/data

# Opzione 2: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## 🔐 Test Locali (Senza OAuth)

### 1. Avvio Server di Test

```bash
# Build
npm run build

# Start server (porta 3000 default)
npm run start:dev

# O in modalità watch
npm run dev
```

### 2. Test Endpoints - Local Auth

#### A. **Registrazione**

```bash
POST http://localhost:3000/api/auth/register

Body (JSON):
{
  "email": "test@example.com",
  "password": "SecurePassword123!",
  "name": "Test User"
}

✅ Expected Response:
{
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "507f1f77bcf86cd799439011"
}
```

#### B. **Verifica Email**

**Metodo 1: Link dall'email (GET):**
```bash
GET http://localhost:3000/api/auth/verify-email/{TOKEN}

# Redirect automatico a frontend con success=true
```

**Metodo 2: POST manuale:**
```bash
POST http://localhost:3000/api/auth/verify-email

Body:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### C. **Login**

```bash
POST http://localhost:3000/api/auth/login

Body:
{
  "email": "test@example.com",
  "password": "SecurePassword123!"
}

✅ Expected Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### D. **Get User Profile**

```bash
GET http://localhost:3000/api/auth/me

Headers:
Authorization: Bearer {ACCESS_TOKEN}

✅ Expected Response:
{
  "id": "507f1f77bcf86cd799439011",
  "email": "test@example.com",
  "name": "Test User",
  "roles": ["user"],
  "isVerified": true
}
```

#### E. **Refresh Token**

```bash
POST http://localhost:3000/api/auth/refresh-token

Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

✅ Expected Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### F. **Forgot Password**

```bash
POST http://localhost:3000/api/auth/forgot-password

Body:
{
  "email": "test@example.com"
}

✅ Expected Response:
{
  "message": "Password reset email sent successfully."
}
```

#### G. **Reset Password**

```bash
POST http://localhost:3000/api/auth/reset-password

Body:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePassword456!"
}

✅ Expected Response:
{
  "message": "Password reset successfully."
}
```

---

## 🌐 Test OAuth Providers

### Setup OAuth Credentials

#### A. **Google OAuth**

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea nuovo progetto
3. Abilita **Google+ API**
4. Crea credenziali OAuth 2.0:
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
   - Authorized JavaScript origins:
     - `http://localhost:3000`
5. Copia **Client ID** e **Client Secret**

```env
GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

#### B. **Microsoft OAuth (Entra ID)**

1. Vai su [Azure Portal](https://portal.azure.com/)
2. **App registrations** → **New registration**
3. Nome: "Auth Kit Test"
4. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
5. Redirect URI: `http://localhost:3000/api/auth/microsoft/callback`
6. **Certificates & secrets** → New client secret
7. **API permissions** → Add:
   - `User.Read`
   - `openid`
   - `profile`
   - `email`

```env
MICROSOFT_CLIENT_ID=abc12345-6789-def0-1234-567890abcdef
MICROSOFT_CLIENT_SECRET=ABC~xyz123_789.def456-ghi
MICROSOFT_CALLBACK_URL=http://localhost:3000/api/auth/microsoft/callback
MICROSOFT_TENANT_ID=common
```

#### C. **Facebook OAuth**

1. Vai su [Facebook Developers](https://developers.facebook.com/)
2. **My Apps** → **Create App**
3. Type: **Consumer**
4. **Settings** → **Basic**:
   - App Domains: `localhost`
5. **Facebook Login** → **Settings**:
   - Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/facebook/callback`

```env
FB_CLIENT_ID=1234567890123456
FB_CLIENT_SECRET=abc123xyz789def456ghi012jkl345mno
FB_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
```

---

### Test OAuth Flows

#### 1. **Google OAuth - Web Flow**

**Inizia il flow:**
```bash
GET http://localhost:3000/api/auth/google

# Redirect automatico a Google consent screen
```

**Callback (automatico dopo Google login):**
```bash
GET http://localhost:3000/api/auth/google/callback?code=...

✅ Expected Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Mobile Flow (ID Token):**
```bash
POST http://localhost:3000/api/auth/oauth/google

Body:
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
}

✅ Expected Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. **Microsoft OAuth - Web Flow**

```bash
GET http://localhost:3000/api/auth/microsoft

# Redirect automatico a Microsoft consent screen
```

**Mobile Flow (ID Token):**
```bash
POST http://localhost:3000/api/auth/oauth/microsoft

Body:
{
  "idToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs..."
}
```

#### 3. **Facebook OAuth - Web Flow**

```bash
GET http://localhost:3000/api/auth/facebook

# Redirect automatico a Facebook consent screen
```

**Mobile Flow (Access Token):**
```bash
POST http://localhost:3000/api/auth/oauth/facebook

Body:
{
  "accessToken": "EAABwzLixnjYBAO..."
}
```

---

## 🧪 Test Completi E2E

### 1. Creare App di Test

```bash
cd ~/test-auth-kit
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/mongoose @ciscode/authentication-kit mongoose
```

**app.module.ts:**
```typescript
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

**main.ts:**
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
  console.log('🚀 Auth Kit Test App running on http://localhost:3000');
}
bootstrap();
```

### 2. Postman Collection

Scarica e importa la collection Postman:

📄 File: `ciscode-auth-collection 1.json` (root del progetto)

**Contiene:**
- ✅ Tutti gli endpoints (local + OAuth)
- ✅ Environment variables pre-configurate
- ✅ Esempi di request/response
- ✅ Token auto-refresh

---

## 🔍 Test Automatici (Jest)

### Run Test Suite

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Specific test file
npm test -- auth.controller.spec.ts
```

### Coverage Report

```bash
npm run test:cov

# Open HTML report
open coverage/lcov-report/index.html
```

**Current Coverage (v1.5.0):**
```
Statements   : 90.25% (1065/1180)
Branches     : 74.95% (404/539)
Functions    : 86.09% (161/187)
Lines        : 90.66% (981/1082)
```

---

## 🛠️ Tools Utili

### 1. **Mailtrap** (Email Testing)

- Signup gratuito: https://mailtrap.io/
- Crea inbox di test
- Copia SMTP credentials in `.env`
- Vedi email di verifica/reset in real-time

### 2. **MongoDB Compass** (DB Visualization)

- Download: https://www.mongodb.com/products/compass
- Connect: `mongodb://127.0.0.1:27017/auth_kit_test`
- Vedi collezioni `users`, `roles`, `permissions`

### 3. **Postman** (API Testing)

- Import collection: `ciscode-auth-collection 1.json`
- Crea environment con:
  - `baseUrl`: `http://localhost:3000`
  - `accessToken`: auto-popolato dopo login
  - `refreshToken`: auto-popolato dopo login

### 4. **JWT Debugger**

- Website: https://jwt.io/
- Copia/incolla access token per vedere payload
- Verifica `exp` (expiration), `sub` (user ID), `roles`

---

## 🚨 Troubleshooting

### ❌ Problema: Email non arrivano

**Causa**: SMTP non configurato correttamente

**Soluzione:**
```env
# Usa Mailtrap per testing
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_password
SMTP_SECURE=false
```

### ❌ Problema: MongoDB connection refused

**Causa**: MongoDB non in esecuzione

**Soluzione:**
```bash
# Start MongoDB
mongod --dbpath=/path/to/data

# O con Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### ❌ Problema: JWT expired

**Causa**: Token scaduto

**Soluzione:**
```bash
# Usa refresh token per ottenere nuovo access token
POST /api/auth/refresh-token
Body: { "refreshToken": "..." }
```

### ❌ Problema: OAuth redirect mismatch

**Causa**: URL di callback non corrisponde a quello configurato nel provider

**Soluzione:**
- Google: `http://localhost:3000/api/auth/google/callback`
- Microsoft: `http://localhost:3000/api/auth/microsoft/callback`
- Facebook: `http://localhost:3000/api/auth/facebook/callback`

### ❌ Problema: User not verified

**Causa**: Email non verificata

**Soluzione:**
```bash
# 1. Controlla inbox Mailtrap
# 2. Clicca link di verifica
# 3. O POST manuale:
POST /api/auth/verify-email
Body: { "token": "..." }
```

### ❌ Problema: Default role not found

**Causa**: Seed non eseguito

**Soluzione:**
```typescript
// In AppModule
async onModuleInit() {
  await this.seed.seedDefaults();
}
```

---

## 📊 Checklist Test Completi

### ✅ Local Authentication

- [ ] Register new user
- [ ] Email verification (link)
- [ ] Login with email/password
- [ ] Get user profile (with token)
- [ ] Refresh access token
- [ ] Forgot password
- [ ] Reset password
- [ ] Delete account

### ✅ OAuth Providers

#### Google
- [ ] Web flow (GET /auth/google)
- [ ] Callback handling
- [ ] Mobile ID token exchange
- [ ] Mobile authorization code exchange

#### Microsoft
- [ ] Web flow (GET /auth/microsoft)
- [ ] Callback handling
- [ ] Mobile ID token exchange

#### Facebook
- [ ] Web flow (GET /auth/facebook)
- [ ] Callback handling
- [ ] Mobile access token exchange

### ✅ Security & Edge Cases

- [ ] Invalid credentials (401)
- [ ] Expired token (401)
- [ ] Invalid refresh token (401)
- [ ] Email already exists (409)
- [ ] User not verified (403)
- [ ] Invalid reset token (400)
- [ ] Rate limiting (429) - se configurato

---

## 📝 Log & Monitoring

### Console Logs

Durante i test, monitora i log del server:

```bash
npm run start:dev

# Expected logs:
[Nest] INFO  MongoDB connected successfully
[Nest] INFO  Default roles seeded
[Nest] INFO  Application started on port 3000
[Auth] INFO  User registered: test@example.com
[Auth] INFO  Email verification sent to: test@example.com
[Auth] INFO  User logged in: test@example.com
[OAuth] INFO Google login successful: user@gmail.com
```

### MongoDB Logs

```bash
# Vedi query in real-time
mongod --verbose

# O in MongoDB Compass:
# Tools → Performance → Enable Profiling
```

---

## 🎯 Prossimi Passi

Dopo aver testato Auth Kit:

1. **Integra in ComptAlEyes**:
   ```bash
   cd ~/comptaleyes/backend
   npm install @ciscode/authentication-kit
   ```

2. **Configura Auth Kit UI**:
   ```bash
   cd ~/comptaleyes/frontend
   npm install @ciscode/ui-authentication-kit
   ```

3. **Deploy in staging** con credenziali reali

4. **Production deploy** con secrets in vault

---

## 📚 Risorse Aggiuntive

- **README**: `/README.md` - Setup e API reference
- **STATUS**: `/docs/STATUS.md` - Coverage e metriche
- **NEXT_STEPS**: `/docs/NEXT_STEPS.md` - Roadmap
- **Postman Collection**: `/ciscode-auth-collection 1.json`
- **Backend Docs**: Swagger UI su `http://localhost:3000/api` (se configurato)

---

**Documento compilato da**: GitHub Copilot  
**Ultimo aggiornamento**: 4 Febbraio 2026  
**Auth Kit Version**: 1.5.0

