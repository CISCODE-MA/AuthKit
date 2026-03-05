# 🔵 Facebook OAuth - Guida Setup Passo-Passo

> **Tempo stimato**: 10 minuti  
> **Difficoltà**: ⭐⭐☆☆☆ (Media-Facile)

---

## 🎯 Cosa Otterremo

Al termine avremo:

- ✅ `FB_CLIENT_ID` (App ID)
- ✅ `FB_CLIENT_SECRET` (App Secret)
- ✅ App configurata per OAuth testing locale

---

## 📋 STEP 1: Accedi a Facebook Developers

### 1.1 Apri il Browser

Vai su: **https://developers.facebook.com/**

### 1.2 Login

- Usa il tuo account Facebook personale
- Se non hai account Facebook, creane uno prima

### 1.3 Accetta Terms (se primo accesso)

- Leggi e accetta i Terms of Service
- Completa il profilo developer (se richiesto)

---

## 🆕 STEP 2: Crea Nuova App

### 2.1 Click su "My Apps" (in alto a destra)

### 2.2 Click su "Create App"

### 2.3 Scegli Tipo App

**Opzioni disponibili:**

- ❌ Business
- ❌ Consumer
- ✅ **Other** ← **SCEGLI QUESTO**

**Perché "Other"?**  
È il tipo più flessibile per testing e include tutte le feature necessarie.

### 2.4 Click "Next"

---

## 📝 STEP 3: Configura App Details

### 3.1 Compila Form

```
App name: Auth Kit Test
(Puoi usare qualsiasi nome)

App contact email: tua.email@example.com
(La tua email personale)
```

### 3.2 (Opzionale) Business Account

Se chiede "Connect a business account":

- **Puoi saltare** per testing
- O crea un test business account

### 3.3 Click "Create App"

### 3.4 Verifica Sicurezza

- Potrebbe chiederti di verificare l'account (2FA, codice SMS, etc.)
- Completa la verifica se richiesta

---

## 🔑 STEP 4: Ottieni Credenziali (App ID e App Secret)

### 4.1 Vai su Dashboard

Dopo aver creato l'app, sei nella **App Dashboard**.

### 4.2 Sidebar Sinistra → Click "Settings" → "Basic"

### 4.3 Copia App ID

```
App ID: 1234567890123456
```

📋 **COPIA QUESTO** - È il tuo `FB_CLIENT_ID`

### 4.4 Mostra App Secret

- Accanto a "App Secret" c'è un campo nascosto (`••••••••`)
- Click su **"Show"**
- Ti chiederà la password di Facebook
- Inserisci password e conferma

### 4.5 Copia App Secret

```
App Secret: abc123def456ghi789jkl012mno345pqr
```

📋 **COPIA QUESTO** - È il tuo `FB_CLIENT_SECRET`

⚠️ **IMPORTANTE**: App Secret è sensibile, non condividerlo pubblicamente!

---

## ⚙️ STEP 5: Configura App Settings

### 5.1 Ancora in "Settings" → "Basic"

Scorri in basso fino a trovare:

**App Domains:**

```
localhost
```

Aggiungi `localhost` e salva.

**Privacy Policy URL:** (richiesto per prod, opzionale per test)

```
http://localhost:3000/privacy
```

**Terms of Service URL:** (opzionale)

```
http://localhost:3000/terms
```

### 5.2 Click "Save Changes" (in basso)

---

## 🔐 STEP 6: Aggiungi Facebook Login Product

### 6.1 Sidebar Sinistra → Click su "+ Add Product"

### 6.2 Trova "Facebook Login"

- Scorri i prodotti disponibili
- Trova box **"Facebook Login"**
- Click su **"Set Up"**

### 6.3 Scegli Platform

Nella schermata "Quickstart":

- Salta il quickstart
- Sidebar sinistra → **"Facebook Login"** → **"Settings"**

---

## 🌐 STEP 7: Configura OAuth Redirect URIs

### 7.1 In "Facebook Login" → "Settings"

Trova sezione: **"Valid OAuth Redirect URIs"**

### 7.2 Aggiungi Callback URL

```
http://localhost:3000/api/auth/facebook/callback
```

⚠️ **IMPORTANTE**: Deve essere **ESATTAMENTE** questo URL (incluso `/api/auth/facebook/callback`)

### 7.3 Click "Save Changes"

---

## 🚀 STEP 8: Modalità Development

### 8.1 In alto a destra, accanto al nome dell'app

Verifica che ci sia un toggle con **"Development"** mode attivo.

```
[🔴 Development]  ← Deve essere così per testing
```

**Non** mettere in Production mode per ora (richiede App Review).

---

## ✅ STEP 9: Verifica Finale

### 9.1 Checklist

- [ ] App ID copiato
- [ ] App Secret copiato (password inserita per vederlo)
- [ ] App Domains impostato a `localhost`
- [ ] Facebook Login product aggiunto
- [ ] Valid OAuth Redirect URI: `http://localhost:3000/api/auth/facebook/callback`
- [ ] App in Development mode

### 9.2 Screenshot Configurazione Finale

**Settings → Basic:**

```
App ID: 1234567890123456
App Secret: ••••••••••••• (copiato)
App Domains: localhost
```

**Facebook Login → Settings:**

```
Valid OAuth Redirect URIs:
http://localhost:3000/api/auth/facebook/callback
```

---

## 📝 STEP 10: Forniscimi le Credenziali

Ora che hai tutto, forniscimi in questo formato:

```
FB_CLIENT_ID=1234567890123456
FB_CLIENT_SECRET=abc123def456ghi789jkl012mno345pqr
```

**Puoi incollare direttamente qui** e aggiornerò il file `.env` automaticamente.

---

## 🔍 Troubleshooting

### ❌ "Can't see App Secret"

**Soluzione**:

- Click "Show"
- Inserisci password Facebook
- Se non funziona, abilita 2FA sul tuo account Facebook

### ❌ "Redirect URI mismatch" durante test

**Soluzione**:
Verifica che in `.env` backend ci sia:

```env
FB_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
```

Deve corrispondere **esattamente** a quello in Facebook Login Settings.

### ❌ "App is in Development mode"

**Normale per testing!** Non serve Production mode ora.

---

## 📸 Screenshot di Riferimento

### Dashboard dopo creazione:

```
┌─────────────────────────────────────────┐
│ Auth Kit Test                [🔴 Dev]  │
├─────────────────────────────────────────┤
│ + Add Product                           │
│                                         │
│ Settings                                │
│   └─ Basic                              │
│   └─ Advanced                           │
│                                         │
│ Facebook Login                          │
│   └─ Settings   ← VAI QUI              │
│   └─ Quickstart                         │
└─────────────────────────────────────────┘
```

### Facebook Login Settings:

```
Valid OAuth Redirect URIs
┌─────────────────────────────────────────┐
│ http://localhost:3000/api/auth/        │
│ facebook/callback                       │
│                                         │
│ [+ Add Another]                         │
└─────────────────────────────────────────┘

[Save Changes]
```

---

## 🎯 Prossimo Step

Dopo che mi fornisci le credenziali:

1. ✅ Aggiorno `.env` backend con FB credentials
2. ✅ Restart backend server
3. ✅ Test OAuth flow: Click "Continue with Facebook" nella test app
4. ✅ Verifica redirect e login
5. 🎉 Facebook OAuth funzionante!

---

## 📞 Supporto

**Bloccato in qualche step?**

- Dimmi in quale step sei
- Descrivi cosa vedi (o screenshot)
- Ti aiuto a risolvere

**Pronto quando lo sei tu!** 🚀
