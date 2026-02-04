# Development Setup Guide

This guide helps you set up the complete development environment for Auth Kit backend.

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally on port 27017
- PowerShell (Windows) or Bash (Linux/Mac)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

The default `.env` is pre-configured for local development.

### 3. Start MongoDB

Make sure MongoDB is running on `mongodb://127.0.0.1:27017`

### 4. Start MailHog (Email Testing)

MailHog captures all outgoing emails for testing.

**Windows (PowerShell):**
```powershell
.\tools\start-mailhog.ps1
```

**Linux/Mac:**
```bash
chmod +x tools/mailhog
./tools/mailhog
```

- **SMTP Server**: `localhost:1025`
- **Web UI**: http://localhost:8025

Leave MailHog running in a separate terminal.

### 5. Start Backend

```bash
npm run build
npm run start
```

Backend will be available at: http://localhost:3000

### 6. Test Email Features

With MailHog running:
1. Register a new user → email sent to MailHog
2. Open http://localhost:8025 to see the verification email
3. Copy the token from the email
4. Use the token to verify the account

## Development Workflow

### Running in Development Mode

For auto-reload during development:

```bash
npm run build:watch  # Terminal 1 - watches TypeScript
npm run start        # Terminal 2 - runs the server
```

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:cov      # With coverage
```

### Seeding Test Data

Create admin user for testing:

```bash
node scripts/seed-admin.ts
```

Default credentials:
- **Email**: admin@example.com
- **Password**: admin123

Then verify the admin user:

```bash
node scripts/verify-admin.js
```

## Architecture

This backend follows **CSR (Controller-Service-Repository)** pattern:

```
src/
├── controllers/     # HTTP endpoints
├── services/        # Business logic
├── repositories/    # Database access
├── entities/        # Mongoose schemas
├── dto/             # Input validation
├── guards/          # Auth guards
└── decorators/      # Custom decorators
```

## Email Testing Workflow

1. **Start MailHog** (captures emails)
2. **Register user** via API or test app
3. **Check MailHog UI** (http://localhost:8025)
4. **Copy verification token** from email
5. **Verify email** via API or test app

## Common Issues

### MongoDB Connection Error

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**: Make sure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"
```

### MailHog Not Starting

**Error**: Port 1025 or 8025 already in use

**Solution**: Kill existing MailHog process:
```powershell
Get-Process -Name mailhog -ErrorAction SilentlyContinue | Stop-Process -Force
```

### SMTP Connection Error

**Error**: `SMTP connection failed: connect ECONNREFUSED 127.0.0.1:1025`

**Solution**: Start MailHog before starting the backend.

## Environment Variables

Key variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://127.0.0.1:27017/auth_kit_test` | MongoDB connection |
| `SMTP_HOST` | `127.0.0.1` | MailHog SMTP host |
| `SMTP_PORT` | `1025` | MailHog SMTP port |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL for email links |
| `JWT_SECRET` | (test key) | JWT signing secret |

**⚠️ Security Note**: Default secrets are for development only. Use strong secrets in production.

## Tools Directory

The `tools/` directory contains development utilities:

- **mailhog.exe** (Windows) / **mailhog** (Linux/Mac) - Email testing server
- **start-mailhog.ps1** - PowerShell script to start MailHog

These tools are **not committed to git** and should be downloaded during setup.

## Production Deployment

For production:

1. **Update all secrets** in `.env` with strong random values
2. **Use real SMTP service** (SendGrid, AWS SES, Mailgun, etc.)
3. **Enable HTTPS** for frontend and backend URLs
4. **Set NODE_ENV=production**

Example production SMTP config:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your-sendgrid-api-key>
SMTP_SECURE=true
FROM_EMAIL=noreply@yourdomain.com
```

## Next Steps

- Read [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for code structure
- Check [API.md](../docs/API.md) for endpoint documentation
- Review [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines

---

**Need Help?** Open an issue on GitHub or check existing documentation.
