# 🚀 Auth Kit - Piano Completo di Test

> **Creato**: 4 Febbraio 2026  
> **Per**: Test completi Auth Kit + Auth Kit UI + OAuth Providers

---

## 📋 Panoramica

Questo documento ti guida attraverso il **testing completo** di:

1. ✅ **Auth Kit Backend** (v1.5.0) - Local auth + OAuth providers
2. ✅ **Auth Kit UI** (v1.0.4) - React hooks + OAuth integration
3. ✅ **OAuth Providers** - Google, Microsoft, Facebook
4. ✅ **Environment Configuration** - .env setup e secrets

---

## 🎯 Obiettivi

- [x] Backend Auth Kit: 90%+ coverage, 312 tests passing ✅
- [ ] Frontend Auth Kit UI: Test hooks e integration con backend
- [ ] OAuth Providers: Test Google, Microsoft, Facebook
- [ ] Environment: Configurazione .env sicura e completa

---

## 📁 File Importanti Creati

### 1. **TESTING_GUIDE.md (Backend)**
📄 `modules/auth-kit/docs/TESTING_GUIDE.md`

**Contiene:**
- Setup iniziale con MongoDB
- Test endpoints local auth (register, login, verify, etc.)
- Configurazione OAuth providers (Google, Microsoft, Facebook)
- Test OAuth flows (web + mobile)
- Postman collection
- Troubleshooting

### 2. **TESTING_GUIDE.md (Frontend)**
📄 `modules/auth-kit-ui/docs/TESTING_GUIDE.md`

**Contiene:**
- Setup hooks `useAuth()`
- Test login/register/logout flows
- OAuth integration (buttons, callbacks)
- Componenti UI (Material-UI, Tailwind examples)
- Test automatizzati con Vitest
- Troubleshooting frontend-backend

### 3. **setup-env.ps1 (Script PowerShell)**
📄 `modules/auth-kit/scripts/setup-env.ps1`

**Funzioni:**
- Valida file .env esistenti
- Controlla sicurezza dei JWT secrets
- Genera secrets sicuri automaticamente
- Crea backup prima di modifiche
- Valida configurazioni OAuth

---

## 🚀 Quick Start - Passo per Passo

### STEP 1: Setup Environment (5 minuti)

#### Opzione A: Script Automatico (Raccomandato)

```powershell
# Vai nella cartella Auth Kit
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit"

# Valida configurazione attuale
.\scripts\setup-env.ps1 -Validate

# Genera secrets sicuri (crea backup automatico)
.\scripts\setup-env.ps1 -GenerateSecrets

# Fix automatico (con conferma interattiva)
.\scripts\setup-env.ps1
```

#### Opzione B: Manuale

```powershell
# Copy .env.example to .env
cp .env.example .env

# Modifica .env e cambia:
# - JWT_SECRET (min 32 caratteri)
# - JWT_REFRESH_SECRET (min 32 caratteri)
# - JWT_EMAIL_SECRET (min 32 caratteri)
# - JWT_RESET_SECRET (min 32 caratteri)
# - MONGO_URI (se diverso da default)
```

---

### STEP 2: Avvia MongoDB (2 minuti)

```powershell
# Opzione 1: MongoDB standalone
mongod --dbpath="C:\data\db"

# Opzione 2: Docker (più semplice)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verifica che sia in esecuzione
docker ps | findstr mongodb
```

---

### STEP 3: Test Backend - Local Auth (10 minuti)

```powershell
# Vai in Auth Kit
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit"

# Installa dipendenze (se non fatto)
npm install

# Build
npm run build

# Avvia server di test
npm run start:dev

# In un altro terminale, esegui i test
npm test

# Coverage report
npm run test:cov
```

**Test manualmente con Postman:**
1. Importa collection: `ciscode-auth-collection 1.json`
2. Testa endpoints:
   - POST `/api/auth/register`
   - POST `/api/auth/verify-email`
   - POST `/api/auth/login`
   - GET `/api/auth/me`
   - POST `/api/auth/refresh-token`

📚 **Guida dettagliata**: `docs/TESTING_GUIDE.md`

---

### STEP 4: Setup OAuth Providers (15-20 minuti)

#### A. Google OAuth

1. **Google Cloud Console**:
   - https://console.cloud.google.com/
   - Crea progetto → "Auth Kit Test"
   - Abilita Google+ API
   - Credentials → OAuth 2.0 Client ID
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`

2. **Copia credentials in .env**:
   ```env
   GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
   ```

#### B. Microsoft OAuth

1. **Azure Portal**:
   - https://portal.azure.com/
   - App registrations → New
   - Redirect URI: `http://localhost:3000/api/auth/microsoft/callback`
   - API permissions: `User.Read`, `openid`, `profile`, `email`

2. **Copia credentials in .env**:
   ```env
   MICROSOFT_CLIENT_ID=abc-123-def
   MICROSOFT_CLIENT_SECRET=ABC~xyz123
   MICROSOFT_CALLBACK_URL=http://localhost:3000/api/auth/microsoft/callback
   MICROSOFT_TENANT_ID=common
   ```

#### C. Facebook OAuth

1. **Facebook Developers**:
   - https://developers.facebook.com/
   - My Apps → Create App
   - Facebook Login settings
   - Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/facebook/callback`

2. **Copia credentials in .env**:
   ```env
   FB_CLIENT_ID=1234567890123456
   FB_CLIENT_SECRET=abc123xyz789
   FB_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
   ```

📚 **Guida dettagliata**: `docs/TESTING_GUIDE.md` → Sezione "Test OAuth Providers"

---

### STEP 5: Test Backend - OAuth (10 minuti)

**Con browser:**

```
# Google OAuth
http://localhost:3000/api/auth/google

# Microsoft OAuth
http://localhost:3000/api/auth/microsoft

# Facebook OAuth
http://localhost:3000/api/auth/facebook
```

**Con Postman (mobile flow):**

```bash
# Google ID Token
POST /api/auth/oauth/google
Body: { "idToken": "..." }

# Microsoft ID Token
POST /api/auth/oauth/microsoft
Body: { "idToken": "..." }

# Facebook Access Token
POST /api/auth/oauth/facebook
Body: { "accessToken": "..." }
```

---

### STEP 6: Test Frontend - Auth Kit UI (15 minuti)

```powershell
# Vai in Auth Kit UI
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit-ui"

# Installa dipendenze
npm install

# Run tests
npm test

# Coverage
npm run test:coverage

# Build
npm run build
```

**Crea app di test React:**

```powershell
# Crea app di test (opzionale)
cd ~/test-auth-ui
npm create vite@latest . -- --template react-ts
npm install @ciscode/ui-authentication-kit

# Usa esempi da auth-kit-ui/examples/
```

📚 **Guida dettagliata**: `auth-kit-ui/docs/TESTING_GUIDE.md`

---

### STEP 7: Integrazione ComptAlEyes (Opzionale)

Se vuoi testare in ComptAlEyes:

```powershell
# Backend
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\comptaleyes\backend"
npm install @ciscode/authentication-kit

# Frontend
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\comptaleyes\frontend"
npm install @ciscode/ui-authentication-kit
```

---

## 🧪 Test Completi - Checklist

### ✅ Backend (Auth Kit)

#### Local Authentication
- [ ] Register nuovo utente
- [ ] Email verification (GET link + POST token)
- [ ] Login con email/password
- [ ] Get user profile (con token)
- [ ] Refresh token
- [ ] Forgot password
- [ ] Reset password
- [ ] Delete account
- [ ] Errori (401, 403, 409)

#### OAuth Providers
- [ ] Google web flow (redirect)
- [ ] Google callback handling
- [ ] Google mobile (ID token)
- [ ] Microsoft web flow
- [ ] Microsoft callback
- [ ] Microsoft mobile (ID token)
- [ ] Facebook web flow
- [ ] Facebook callback
- [ ] Facebook mobile (access token)

#### Tests Automatici
- [ ] `npm test` passa (312 tests)
- [ ] Coverage >= 90%
- [ ] No ESLint warnings

---

### ✅ Frontend (Auth Kit UI)

#### Hooks (useAuth)
- [ ] Login with email/password
- [ ] Register new user
- [ ] Logout
- [ ] Get current user profile
- [ ] Auto-refresh token (before expiry)
- [ ] Forgot password
- [ ] Reset password
- [ ] Error handling

#### OAuth Integration
- [ ] OAuth buttons render
- [ ] Google redirect e callback
- [ ] Microsoft redirect e callback
- [ ] Facebook redirect e callback
- [ ] Token storage dopo OAuth
- [ ] Redirect a dashboard dopo login

#### UI Components
- [ ] Material-UI login form
- [ ] Tailwind CSS form (example)
- [ ] Form validation
- [ ] Loading states
- [ ] Error display
- [ ] Success redirects

#### Tests Automatici
- [ ] `npm test` passa
- [ ] Coverage >= 80%
- [ ] No TypeScript errors

---

### ✅ Environment & Configuration

#### Secrets
- [ ] JWT secrets >= 32 caratteri
- [ ] Secrets non contengono parole comuni
- [ ] Backup .env creato
- [ ] .env in .gitignore

#### MongoDB
- [ ] MongoDB in esecuzione
- [ ] Connection string corretto
- [ ] Database accessibile
- [ ] Seed default roles eseguito

#### SMTP (Email)
- [ ] SMTP configurato (Mailtrap per test)
- [ ] Email di verifica arrivano
- [ ] Email reset password arrivano
- [ ] Links nelle email funzionano

#### OAuth Credentials
- [ ] Google Client ID/Secret validi
- [ ] Microsoft Client ID/Secret validi
- [ ] Facebook App ID/Secret validi
- [ ] Callback URLs corrispondono

---

## 🚨 Troubleshooting Rapido

### ❌ MongoDB connection refused
```powershell
# Start MongoDB
docker start mongodb
# O
mongod --dbpath="C:\data\db"
```

### ❌ JWT secret troppo corto/insicuro
```powershell
# Rigenera secrets automaticamente
.\scripts\setup-env.ps1 -GenerateSecrets
```

### ❌ Email non arrivano
```env
# Usa Mailtrap per testing
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
```

### ❌ OAuth redirect mismatch
```
# Verifica che gli URL siano IDENTICI:
Backend .env: GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
Google Console: http://localhost:3000/api/auth/google/callback
```

### ❌ CORS error (frontend → backend)
```typescript
// Backend main.ts
app.enableCors({
  origin: 'http://localhost:3001', // Frontend URL
  credentials: true,
});
```

### ❌ Token expired (401)
```typescript
// Frontend - Abilita auto-refresh
const useAuth = createUseAuth({
  baseUrl: 'http://localhost:3000',
  autoRefresh: true,
  refreshBeforeSeconds: 60,
});
```

📚 **Troubleshooting completo**: Vedi guide TESTING_GUIDE.md

---

## 🎯 Prossimi Passi

Dopo aver completato tutti i test:

### 1. **Documentazione**
- [ ] Aggiorna README con esempi reali
- [ ] Screenshot dei flows OAuth
- [ ] Video tutorial (opzionale)

### 2. **Production Setup**
- [ ] Genera secrets production (diversi da dev)
- [ ] Configura secrets manager (AWS Secrets Manager, Azure Key Vault)
- [ ] Setup OAuth credentials production
- [ ] HTTPS obbligatorio

### 3. **Deploy**
- [ ] Deploy backend in staging
- [ ] Deploy frontend in staging
- [ ] Test end-to-end staging
- [ ] Production deploy

### 4. **Monitoring**
- [ ] Setup logging (CloudWatch, Elasticsearch)
- [ ] Alert per errori OAuth
- [ ] Metrics (login success rate, OAuth usage)

---

## 📚 Risorse

### Documentazione
- **Backend Guide**: `modules/auth-kit/docs/TESTING_GUIDE.md`
- **Frontend Guide**: `modules/auth-kit-ui/docs/TESTING_GUIDE.md`
- **Backend README**: `modules/auth-kit/README.md`
- **Frontend README**: `modules/auth-kit-ui/README.md`
- **Status Report**: `modules/auth-kit/docs/STATUS.md`

### Tools
- **Postman Collection**: `modules/auth-kit/ciscode-auth-collection 1.json`
- **Setup Script**: `modules/auth-kit/scripts/setup-env.ps1`
- **MongoDB Compass**: https://www.mongodb.com/products/compass
- **Mailtrap**: https://mailtrap.io/ (email testing)
- **JWT Debugger**: https://jwt.io/

### OAuth Setup
- **Google Console**: https://console.cloud.google.com/
- **Azure Portal**: https://portal.azure.com/
- **Facebook Developers**: https://developers.facebook.com/

---

## 📝 Note Finali

### Sicurezza
- ⚠️ **MAI committare .env** nel git
- ⚠️ **Cambiare tutti i secrets** in production
- ⚠️ **HTTPS obbligatorio** in production
- ⚠️ **Rate limiting** su login endpoints

### Best Practices
- ✅ Usa `setup-env.ps1` per gestire secrets
- ✅ Backup `.env` prima di modifiche
- ✅ Testa ogni provider OAuth separatamente
- ✅ Monitora i log durante i test
- ✅ Usa Mailtrap per email testing

### Performance
- Token refresh automatico (prima della scadenza)
- Caching di JWKS keys (Microsoft)
- Connection pooling MongoDB
- Rate limiting su OAuth endpoints

---

## 🤝 Supporto

Se incontri problemi:

1. **Controlla i log** del backend (console)
2. **Consulta TESTING_GUIDE.md** (troubleshooting section)
3. **Verifica .env** con `setup-env.ps1 -Validate`
4. **Controlla MongoDB** è in esecuzione
5. **Testa endpoint** singolarmente con Postman

---

**Documento compilato da**: GitHub Copilot  
**Data**: 4 Febbraio 2026  
**Versioni**:
- Auth Kit: v1.5.0 ✅ Production Ready
- Auth Kit UI: v1.0.4 → v2.0.0 (in development)

---

**Buon testing! 🚀**

