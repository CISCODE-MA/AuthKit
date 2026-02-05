# 🔑 Credenziali Necessarie per Test Completi

> **Per**: Test Auth Kit + OAuth Providers  
> **Data**: 4 Febbraio 2026

---

## 📋 Riepilogo Credenziali Necessarie

### 🟢 **OBBLIGATORIE** (per funzionare)

| Tipo | Numero | Priorità | Tempo Setup |
|------|--------|----------|-------------|
| JWT Secrets | 4 secrets | 🔴 CRITICA | 1 min (auto-generati) |
| MongoDB | 1 connection string | 🔴 CRITICA | 5 min |
| SMTP (Email) | 1 account | 🟡 ALTA | 5 min |

### 🔵 **OPZIONALI** (per OAuth providers)

| Provider | Credenziali | Priorità | Tempo Setup |
|----------|-------------|----------|-------------|
| Google OAuth | Client ID + Secret | 🟢 MEDIA | 10 min |
| Microsoft OAuth | Client ID + Secret + Tenant ID | 🟢 MEDIA | 15 min |
| Facebook OAuth | App ID + Secret | 🟢 BASSA | 10 min |

---

## 🔴 PARTE 1: Credenziali OBBLIGATORIE

### 1️⃣ JWT Secrets (4 secrets)

**✅ SOLUZIONE AUTOMATICA (Raccomandata):**

```powershell
# Questo script genera automaticamente 4 secrets sicuri (64 caratteri)
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit"
.\scripts\setup-env.ps1 -GenerateSecrets
```

**✅ Fatto!** I secrets sono pronti in `.env`

---

**❌ Alternativa Manuale (NON raccomandata):**

Se vuoi generarli manualmente, devono essere:
- Minimo 32 caratteri
- Mix di lettere maiuscole, minuscole, numeri, simboli
- Diversi tra loro
- NON contenere parole comuni

```env
JWT_SECRET=tua_stringa_casuale_min_32_caratteri_qui
JWT_REFRESH_SECRET=altra_stringa_diversa_min_32_caratteri
JWT_EMAIL_SECRET=ancora_altra_stringa_min_32_caratteri
JWT_RESET_SECRET=ultima_stringa_diversa_min_32_caratteri
```

---

### 2️⃣ MongoDB Connection String

**Opzione A: MongoDB Locale (Più semplice per testing)**

```env
MONGO_URI=mongodb://127.0.0.1:27017/auth_kit_test
```

**Avvia MongoDB con Docker:**
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**✅ FATTO!** Nessuna credenziale da fornire.

---

**Opzione B: MongoDB Atlas (Cloud - per staging/production)**

1. **Vai su**: https://www.mongodb.com/cloud/atlas
2. **Registrati** (gratis)
3. **Crea Cluster** (free tier M0)
4. **Database Access** → Add New User:
   - Username: `auth_kit_user`
   - Password: [genera password sicura]
5. **Network Access** → Add IP Address:
   - IP: `0.0.0.0/0` (per testing)
6. **Clusters** → Connect → Connect your application
7. **Copia connection string**:

```env
MONGO_URI=mongodb+srv://auth_kit_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/auth_kit_test?retryWrites=true&w=majority
```

**📝 Forniscimi:**
- [ ] Username MongoDB Atlas (se usi Atlas)
- [ ] Password MongoDB Atlas (se usi Atlas)
- [ ] Connection string completo (se usi Atlas)

---

### 3️⃣ SMTP (Email Testing)

**✅ SOLUZIONE RACCOMANDATA: Mailtrap (Gratis)**

Mailtrap è un servizio di email testing che cattura tutte le email senza inviarle realmente.

1. **Vai su**: https://mailtrap.io/
2. **Registrati** (gratis - 500 email/mese)
3. **Dashboard** → **Inboxes** → **My Inbox**
4. **SMTP Settings**:

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=abc123def456    # Copia da Mailtrap
SMTP_PASS=xyz789ghi012    # Copia da Mailtrap
SMTP_SECURE=false
FROM_EMAIL=no-reply@test.com
```

**📝 Forniscimi (da Mailtrap dashboard):**
- [ ] SMTP_USER (Username)
- [ ] SMTP_PASS (Password)

**Screenshot della dashboard:**
```
Mailtrap.io → My Inbox → SMTP Settings → Show Credentials
```

---

**Alternativa: Gmail (SCONSIGLIATO per testing)**

Se vuoi usare Gmail (più complicato):

1. Abilita 2FA su Gmail
2. Genera App Password:
   - https://myaccount.google.com/apppasswords
3. Nome app: "Auth Kit Test"
4. Copia password generata (16 caratteri)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tua.email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # App password (16 chars)
SMTP_SECURE=false
FROM_EMAIL=tua.email@gmail.com
```

---

## 🔵 PARTE 2: OAuth Providers (OPZIONALI)

### 🟦 Google OAuth

**Tempo**: ~10 minuti  
**Difficoltà**: ⭐⭐☆☆☆ (Media)

#### Step 1: Google Cloud Console

1. **Vai su**: https://console.cloud.google.com/
2. **Crea Progetto**:
   - Nome: `Auth Kit Test`
   - Location: No organization
3. **Abilita API**:
   - Menu → APIs & Services → Library
   - Cerca "Google+ API" → Enable
4. **Crea Credentials**:
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: **Web application**
   - Name: `Auth Kit Local`
   
5. **Configura Redirect URIs**:
   ```
   Authorized JavaScript origins:
   http://localhost:3000
   
   Authorized redirect URIs:
   http://localhost:3000/api/auth/google/callback
   ```

6. **Copia Credentials**:
   - Client ID: `123456789-abc123xyz.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-abc123xyz789`

#### .env Configuration:

```env
GOOGLE_CLIENT_ID=TUO_CLIENT_ID_QUI
GOOGLE_CLIENT_SECRET=TUO_CLIENT_SECRET_QUI
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

**📝 Forniscimi:**
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET

---

### 🟦 Microsoft OAuth (Entra ID)

**Tempo**: ~15 minuti  
**Difficoltà**: ⭐⭐⭐☆☆ (Media-Alta)

#### Step 1: Azure Portal

1. **Vai su**: https://portal.azure.com/
2. **Entra ID** → **App registrations** → **New registration**:
   - Name: `Auth Kit Test`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI:
     - Type: `Web`
     - URL: `http://localhost:3000/api/auth/microsoft/callback`

3. **Copia Application (client) ID**:
   ```
   abc12345-6789-def0-1234-567890abcdef
   ```

4. **Certificates & secrets** → **New client secret**:
   - Description: `Auth Kit Local`
   - Expires: 24 months
   - **⚠️ COPIA SUBITO IL VALUE** (non visibile dopo)
   ```
   ABC~xyz123_789.def456-ghi
   ```

5. **API permissions** → **Add a permission**:
   - Microsoft Graph → Delegated permissions
   - Aggiungi:
     - [x] openid
     - [x] profile
     - [x] email
     - [x] User.Read
   - **Grant admin consent** (pulsante in alto)

6. **Copia Tenant ID** (Directory ID):
   ```
   Overview → Directory (tenant) ID
   ```

#### .env Configuration:

```env
MICROSOFT_CLIENT_ID=TUO_CLIENT_ID_QUI
MICROSOFT_CLIENT_SECRET=TUO_CLIENT_SECRET_QUI
MICROSOFT_CALLBACK_URL=http://localhost:3000/api/auth/microsoft/callback
MICROSOFT_TENANT_ID=common
```

**📝 Forniscimi:**
- [ ] MICROSOFT_CLIENT_ID (Application ID)
- [ ] MICROSOFT_CLIENT_SECRET (Client secret VALUE)
- [ ] MICROSOFT_TENANT_ID (usa `common` per tutti gli account)

---

### 🟦 Facebook OAuth

**Tempo**: ~10 minuti  
**Difficoltà**: ⭐⭐☆☆☆ (Media)

#### Step 1: Facebook Developers

1. **Vai su**: https://developers.facebook.com/
2. **My Apps** → **Create App**:
   - Use case: **Other**
   - App type: **Consumer**
   - App name: `Auth Kit Test`
   - Contact email: tua.email@example.com

3. **Dashboard** → **Settings** → **Basic**:
   - App Domains: `localhost`
   - Privacy Policy URL: `http://localhost:3000/privacy` (per testing)
   - Terms of Service URL: `http://localhost:3000/terms` (per testing)

4. **Add Product** → **Facebook Login** → **Set Up**:
   - Web platform

5. **Facebook Login** → **Settings**:
   - Valid OAuth Redirect URIs:
     ```
     http://localhost:3000/api/auth/facebook/callback
     ```

6. **Copia Credentials** (da Settings → Basic):
   - App ID: `1234567890123456`
   - App Secret: **Show** → `abc123xyz789def456ghi012jkl345mno`

#### .env Configuration:

```env
FB_CLIENT_ID=TUO_APP_ID_QUI
FB_CLIENT_SECRET=TUO_APP_SECRET_QUI
FB_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
```

**📝 Forniscimi:**
- [ ] FB_CLIENT_ID (App ID)
- [ ] FB_CLIENT_SECRET (App Secret)

---

## 📝 Template .env Completo da Compilare

```env
# =============================================================================
# Auth Kit - Environment Configuration
# Generated: 2026-02-04
# =============================================================================

# -----------------------------------------------------------------------------
# DATABASE (OBBLIGATORIO)
# -----------------------------------------------------------------------------
# Opzione 1: MongoDB locale
MONGO_URI=mongodb://127.0.0.1:27017/auth_kit_test

# Opzione 2: MongoDB Atlas (cloud)
# MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/auth_kit_test?retryWrites=true&w=majority

# -----------------------------------------------------------------------------
# JWT SECRETS (OBBLIGATORIO)
# Generati automaticamente con: .\scripts\setup-env.ps1 -GenerateSecrets
# -----------------------------------------------------------------------------
JWT_SECRET=GENERA_CON_SCRIPT_O_MIN_32_CARATTERI_CASUALI
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_SECRET=GENERA_CON_SCRIPT_O_MIN_32_CARATTERI_CASUALI
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
JWT_EMAIL_SECRET=GENERA_CON_SCRIPT_O_MIN_32_CARATTERI_CASUALI
JWT_EMAIL_TOKEN_EXPIRES_IN=1d
JWT_RESET_SECRET=GENERA_CON_SCRIPT_O_MIN_32_CARATTERI_CASUALI
JWT_RESET_TOKEN_EXPIRES_IN=1h

# -----------------------------------------------------------------------------
# EMAIL / SMTP (OBBLIGATORIO per verifiche email)
# Raccomandata: Mailtrap.io (gratis)
# -----------------------------------------------------------------------------
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=TUO_MAILTRAP_USERNAME
SMTP_PASS=TUO_MAILTRAP_PASSWORD
SMTP_SECURE=false
FROM_EMAIL=no-reply@test.com

# -----------------------------------------------------------------------------
# APPLICATION URLS
# -----------------------------------------------------------------------------
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000

# -----------------------------------------------------------------------------
# GOOGLE OAUTH (OPZIONALE)
# https://console.cloud.google.com/
# -----------------------------------------------------------------------------
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# -----------------------------------------------------------------------------
# MICROSOFT OAUTH (OPZIONALE)
# https://portal.azure.com/
# -----------------------------------------------------------------------------
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_CALLBACK_URL=http://localhost:3000/api/auth/microsoft/callback
MICROSOFT_TENANT_ID=common

# -----------------------------------------------------------------------------
# FACEBOOK OAUTH (OPZIONALE)
# https://developers.facebook.com/
# -----------------------------------------------------------------------------
FB_CLIENT_ID=
FB_CLIENT_SECRET=
FB_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback

# -----------------------------------------------------------------------------
# ENVIRONMENT
# -----------------------------------------------------------------------------
NODE_ENV=development
```

---

## 📤 Come Fornirmi le Credenziali

### Formato Preferito:

```
# OBBLIGATORIE
MongoDB: mongodb://127.0.0.1:27017/auth_kit_test
SMTP_USER: abc123def456
SMTP_PASS: xyz789ghi012

# OPZIONALI (se vuoi testare OAuth)
GOOGLE_CLIENT_ID: 123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET: GOCSPX-abc123xyz

MICROSOFT_CLIENT_ID: abc-123-def
MICROSOFT_CLIENT_SECRET: ABC~xyz123

FB_CLIENT_ID: 1234567890123456
FB_CLIENT_SECRET: abc123xyz789
```

### ⚠️ Sicurezza

- **NON** inviarmi mai secrets di **production**
- Usa solo credenziali di **testing/development**
- Posso aiutarti a crearle se preferisci (ti guido passo-passo)
- Dopo il testing, puoi **rigenerare** tutti i secrets

---

## 🎯 Priorità Setup

### 🔴 PRIORITÀ 1 (Per iniziare subito):

1. ✅ JWT Secrets (auto-generati con script)
2. ✅ MongoDB locale (Docker)
3. ⚠️ SMTP (Mailtrap - 5 minuti)

**Con questi 3 puoi testare:**
- ✅ Register + Email verification
- ✅ Login + Logout
- ✅ Forgot/Reset password
- ✅ User profile
- ✅ Refresh tokens

---

### 🟡 PRIORITÀ 2 (Dopo testing locale):

4. Google OAuth (più popolare)
5. Microsoft OAuth (enterprise)
6. Facebook OAuth (meno prioritario)

---

## 🚀 Prossimi Passi

### Cosa Fare Ora:

1. **JWT Secrets**: Esegui script automatico
   ```powershell
   .\scripts\setup-env.ps1 -GenerateSecrets
   ```

2. **MongoDB**: Avvia Docker
   ```powershell
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

3. **Mailtrap**: 
   - Registrati su https://mailtrap.io/
   - Copia SMTP credentials
   - Forniscimi username + password

4. **(Opzionale) OAuth**:
   - Decidi quali provider vuoi testare
   - Segui step-by-step guide sopra
   - Forniscimi credentials

### Quando Sei Pronto:

- [ ] Forniscimi SMTP credentials (Mailtrap)
- [ ] (Opzionale) Forniscimi OAuth credentials se vuoi testare provider
- [ ] Facciamo partire i test! 🚀

---

## 📞 Supporto

**Se hai problemi durante il setup:**
- Fammi sapere in quale step sei bloccato
- Posso guidarti passo-passo con screenshot
- Possiamo saltare OAuth providers e testarli dopo

---

**Pronto quando lo sei tu!** 🎉

