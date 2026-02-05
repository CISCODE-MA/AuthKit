#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Script di configurazione automatica per Auth Kit - Verifica e setup .env

.DESCRIPTION
    Questo script:
    1. Verifica la presenza di file .env
    2. Valida i secrets JWT
    3. Controlla configurazioni OAuth
    4. Genera secrets sicuri se mancano
    5. Crea backup dei file .env esistenti

.EXAMPLE
    .\setup-env.ps1
    
.EXAMPLE
    .\setup-env.ps1 -Validate
    
.EXAMPLE
    .\setup-env.ps1 -GenerateSecrets
#>

param(
    [switch]$Validate,
    [switch]$GenerateSecrets,
    [switch]$Force
)

# Colori per output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

Write-Host "Auth Kit - Environment Setup & Validation" -ForegroundColor $Cyan
Write-Host ("=" * 60) -ForegroundColor $Cyan
Write-Host ""

# Path ai moduli
$AuthKitPath = "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit"
$AuthKitUIPath = "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit-ui"
$BackendPath = "c:\Users\RedaChanna\Desktop\Ciscode Web Site\comptaleyes\backend"
$FrontendPath = "c:\Users\RedaChanna\Desktop\Ciscode Web Site\comptaleyes\frontend"

# Funzione per generare secret sicuro
function New-SecureSecret {
    param([int]$Length = 64)
    
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^*()-_=+[]'
    $secret = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $secret
}

# Funzione per verificare se un secret è sicuro
function Test-SecretStrength {
    param([string]$Secret)
    
    if ($Secret.Length -lt 32) {
        return @{ IsSecure = $false; Reason = "Troppo corto (< 32 caratteri)" }
    }
    
    if ($Secret -match "change|example|test|demo|password") {
        return @{ IsSecure = $false; Reason = "Contiene parole comuni" }
    }
    
    return @{ IsSecure = $true; Reason = "OK" }
}

# Funzione per backup .env
function Backup-EnvFile {
    param([string]$EnvPath)
    
    if (Test-Path $EnvPath) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupPath = "$EnvPath.backup_$timestamp"
        Copy-Item $EnvPath $backupPath
        Write-Host "✅ Backup creato: $backupPath" -ForegroundColor $Green
        return $backupPath
    }
    return $null
}

# Funzione per leggere .env
function Read-EnvFile {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        return @{}
    }
    
    $env = @{}
    Get-Content $Path | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $env[$key] = $value
        }
    }
    return $env
}

# Funzione per scrivere .env
function Write-EnvFile {
    param(
        [string]$Path,
        [hashtable]$Config
    )
    
    $lines = @()
    
    # Header
    $lines += "# Auth Kit Configuration"
    $lines += "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $lines += ""
    
    # MongoDB
    $lines += "# Database"
    $lines += "MONGO_URI=$($Config.MONGO_URI)"
    $lines += ""
    
    # JWT Secrets
    $lines += "# JWT Configuration"
    $lines += "JWT_SECRET=$($Config.JWT_SECRET)"
    $lines += "JWT_ACCESS_TOKEN_EXPIRES_IN=$($Config.JWT_ACCESS_TOKEN_EXPIRES_IN)"
    $lines += "JWT_REFRESH_SECRET=$($Config.JWT_REFRESH_SECRET)"
    $lines += "JWT_REFRESH_TOKEN_EXPIRES_IN=$($Config.JWT_REFRESH_TOKEN_EXPIRES_IN)"
    $lines += "JWT_EMAIL_SECRET=$($Config.JWT_EMAIL_SECRET)"
    $lines += "JWT_EMAIL_TOKEN_EXPIRES_IN=$($Config.JWT_EMAIL_TOKEN_EXPIRES_IN)"
    $lines += "JWT_RESET_SECRET=$($Config.JWT_RESET_SECRET)"
    $lines += "JWT_RESET_TOKEN_EXPIRES_IN=$($Config.JWT_RESET_TOKEN_EXPIRES_IN)"
    $lines += ""
    
    # SMTP
    $lines += "# Email (SMTP)"
    $lines += "SMTP_HOST=$($Config.SMTP_HOST)"
    $lines += "SMTP_PORT=$($Config.SMTP_PORT)"
    $lines += "SMTP_USER=$($Config.SMTP_USER)"
    $lines += "SMTP_PASS=$($Config.SMTP_PASS)"
    $lines += "SMTP_SECURE=$($Config.SMTP_SECURE)"
    $lines += "FROM_EMAIL=$($Config.FROM_EMAIL)"
    $lines += ""
    
    # URLs
    $lines += "# Application URLs"
    $lines += "FRONTEND_URL=$($Config.FRONTEND_URL)"
    $lines += "BACKEND_URL=$($Config.BACKEND_URL)"
    $lines += ""
    
    # OAuth
    $lines += "# Google OAuth"
    $lines += "GOOGLE_CLIENT_ID=$($Config.GOOGLE_CLIENT_ID)"
    $lines += "GOOGLE_CLIENT_SECRET=$($Config.GOOGLE_CLIENT_SECRET)"
    $lines += "GOOGLE_CALLBACK_URL=$($Config.GOOGLE_CALLBACK_URL)"
    $lines += ""
    
    $lines += "# Microsoft OAuth"
    $lines += "MICROSOFT_CLIENT_ID=$($Config.MICROSOFT_CLIENT_ID)"
    $lines += "MICROSOFT_CLIENT_SECRET=$($Config.MICROSOFT_CLIENT_SECRET)"
    $lines += "MICROSOFT_CALLBACK_URL=$($Config.MICROSOFT_CALLBACK_URL)"
    $lines += "MICROSOFT_TENANT_ID=$($Config.MICROSOFT_TENANT_ID)"
    $lines += ""
    
    $lines += "# Facebook OAuth"
    $lines += "FB_CLIENT_ID=$($Config.FB_CLIENT_ID)"
    $lines += "FB_CLIENT_SECRET=$($Config.FB_CLIENT_SECRET)"
    $lines += "FB_CALLBACK_URL=$($Config.FB_CALLBACK_URL)"
    $lines += ""
    
    # Environment
    $lines += "# Environment"
    $lines += "NODE_ENV=$($Config.NODE_ENV)"
    
    $lines | Out-File -FilePath $Path -Encoding UTF8
}

# Configurazione di default
$defaultConfig = @{
    MONGO_URI = "mongodb://127.0.0.1:27017/auth_kit_dev"
    JWT_SECRET = ""
    JWT_ACCESS_TOKEN_EXPIRES_IN = "15m"
    JWT_REFRESH_SECRET = ""
    JWT_REFRESH_TOKEN_EXPIRES_IN = "7d"
    JWT_EMAIL_SECRET = ""
    JWT_EMAIL_TOKEN_EXPIRES_IN = "1d"
    JWT_RESET_SECRET = ""
    JWT_RESET_TOKEN_EXPIRES_IN = "1h"
    SMTP_HOST = "sandbox.smtp.mailtrap.io"
    SMTP_PORT = "2525"
    SMTP_USER = ""
    SMTP_PASS = ""
    SMTP_SECURE = "false"
    FROM_EMAIL = "no-reply@test.com"
    FRONTEND_URL = "http://localhost:3000"
    BACKEND_URL = "http://localhost:3000"
    GOOGLE_CLIENT_ID = ""
    GOOGLE_CLIENT_SECRET = ""
    GOOGLE_CALLBACK_URL = "http://localhost:3000/api/auth/google/callback"
    MICROSOFT_CLIENT_ID = ""
    MICROSOFT_CLIENT_SECRET = ""
    MICROSOFT_CALLBACK_URL = "http://localhost:3000/api/auth/microsoft/callback"
    MICROSOFT_TENANT_ID = "common"
    FB_CLIENT_ID = ""
    FB_CLIENT_SECRET = ""
    FB_CALLBACK_URL = "http://localhost:3000/api/auth/facebook/callback"
    NODE_ENV = "development"
}

# Funzione per validare configurazione
function Test-EnvConfiguration {
    param(
        [string]$ProjectPath,
        [string]$ProjectName
    )
    
    Write-Host "📂 Validating: $ProjectName" -ForegroundColor $Cyan
    Write-Host "   Path: $ProjectPath" -ForegroundColor Gray
    
    $envPath = Join-Path $ProjectPath ".env"
    $envExamplePath = Join-Path $ProjectPath ".env.example"
    
    $issues = @()
    
    # Check .env esiste
    if (-not (Test-Path $envPath)) {
        $issues += "❌ File .env mancante"
        Write-Host "   ❌ File .env mancante" -ForegroundColor $Red
        
        # Check se esiste .env.example
        if (Test-Path $envExamplePath) {
            Write-Host "   ℹ️  .env.example trovato - posso creare .env da template" -ForegroundColor $Yellow
        }
        return @{ HasIssues = $true; Issues = $issues }
    }
    
    Write-Host "   ✅ File .env trovato" -ForegroundColor $Green
    
    # Leggi .env
    $config = Read-EnvFile -Path $envPath
    
    # Valida JWT secrets
    $secrets = @("JWT_SECRET", "JWT_REFRESH_SECRET", "JWT_EMAIL_SECRET", "JWT_RESET_SECRET")
    
    foreach ($secretKey in $secrets) {
        if (-not $config.ContainsKey($secretKey) -or [string]::IsNullOrWhiteSpace($config[$secretKey])) {
            $issues += "❌ $secretKey mancante"
            Write-Host "   ❌ $secretKey mancante" -ForegroundColor $Red
        }
        else {
            $strength = Test-SecretStrength -Secret $config[$secretKey]
            if (-not $strength.IsSecure) {
                $issues += "⚠️  $secretKey non sicuro: $($strength.Reason)"
                Write-Host "   ⚠️  $secretKey non sicuro: $($strength.Reason)" -ForegroundColor $Yellow
            }
            else {
                Write-Host "   ✅ $secretKey OK" -ForegroundColor $Green
            }
        }
    }
    
    # Valida MongoDB URI
    if (-not $config.ContainsKey("MONGO_URI") -or [string]::IsNullOrWhiteSpace($config["MONGO_URI"])) {
        $issues += "❌ MONGO_URI mancante"
        Write-Host "   ❌ MONGO_URI mancante" -ForegroundColor $Red
    }
    else {
        Write-Host "   ✅ MONGO_URI configurato" -ForegroundColor $Green
    }
    
    # Valida SMTP (warning se mancante, non critico)
    if (-not $config.ContainsKey("SMTP_HOST") -or [string]::IsNullOrWhiteSpace($config["SMTP_HOST"])) {
        Write-Host "   ⚠️  SMTP non configurato (email non funzioneranno)" -ForegroundColor $Yellow
    }
    else {
        Write-Host "   ✅ SMTP configurato" -ForegroundColor $Green
    }
    
    # Check OAuth (info only, non critico)
    $oauthProviders = @("GOOGLE", "MICROSOFT", "FB")
    foreach ($provider in $oauthProviders) {
        $clientIdKey = "${provider}_CLIENT_ID"
        $hasClientId = $config.ContainsKey($clientIdKey) -and -not [string]::IsNullOrWhiteSpace($config[$clientIdKey])
        
        if ($hasClientId) {
            Write-Host "   ✅ $provider OAuth configurato" -ForegroundColor $Green
        }
        else {
            Write-Host "   ℹ️  $provider OAuth non configurato (opzionale)" -ForegroundColor $Yellow
        }
    }
    
    Write-Host ""
    
    return @{
        HasIssues = $issues.Count -gt 0
        Issues = $issues
        Config = $config
    }
}

# Funzione per generare .env con secrets sicuri
function New-SecureEnvFile {
    param(
        [string]$ProjectPath,
        [string]$ProjectName
    )
    
    Write-Host "🔧 Generazione .env sicuro per: $ProjectName" -ForegroundColor $Cyan
    
    $envPath = Join-Path $ProjectPath ".env"
    $envExamplePath = Join-Path $ProjectPath ".env.example"
    
    # Backup se esiste
    if (Test-Path $envPath) {
        $backup = Backup-EnvFile -EnvPath $envPath
    }
    
    # Leggi .env.example se esiste, altrimenti usa default
    $config = $defaultConfig.Clone()
    
    if (Test-Path $envExamplePath) {
        $exampleConfig = Read-EnvFile -Path $envExamplePath
        foreach ($key in $exampleConfig.Keys) {
            if ($config.ContainsKey($key)) {
                $config[$key] = $exampleConfig[$key]
            }
        }
    }
    
    # Genera secrets sicuri
    Write-Host "   🔑 Generazione secrets sicuri..." -ForegroundColor $Yellow
    $config.JWT_SECRET = New-SecureSecret -Length 64
    $config.JWT_REFRESH_SECRET = New-SecureSecret -Length 64
    $config.JWT_EMAIL_SECRET = New-SecureSecret -Length 64
    $config.JWT_RESET_SECRET = New-SecureSecret -Length 64
    
    # Scrivi file
    Write-EnvFile -Path $envPath -Config $config
    
    Write-Host "   ✅ File .env creato con secrets sicuri" -ForegroundColor $Green
    Write-Host ""
}

# =============================================================================
# MAIN SCRIPT EXECUTION
# =============================================================================

$projects = @(
    @{ Path = $AuthKitPath; Name = "Auth Kit (Backend)" },
    @{ Path = $BackendPath; Name = "ComptAlEyes Backend" }
)

if ($GenerateSecrets) {
    Write-Host "🔧 MODALITÀ: Generazione secrets sicuri" -ForegroundColor $Cyan
    Write-Host ""
    
    foreach ($project in $projects) {
        if (Test-Path $project.Path) {
            New-SecureEnvFile -ProjectPath $project.Path -ProjectName $project.Name
        }
        else {
            Write-Host "⚠️  Path non trovato: $($project.Path)" -ForegroundColor $Yellow
        }
    }
    
    Write-Host "✅ Secrets generati! Prossimi passi:" -ForegroundColor $Green
    Write-Host "   1. Configura SMTP (Mailtrap per testing)" -ForegroundColor $Yellow
    Write-Host "   2. Configura OAuth providers (opzionale)" -ForegroundColor $Yellow
    Write-Host "   3. Verifica MONGO_URI" -ForegroundColor $Yellow
    Write-Host ""
}
elseif ($Validate) {
    Write-Host "🔍 MODALITÀ: Solo validazione" -ForegroundColor $Cyan
    Write-Host ""
    
    $allResults = @()
    
    foreach ($project in $projects) {
        if (Test-Path $project.Path) {
            $result = Test-EnvConfiguration -ProjectPath $project.Path -ProjectName $project.Name
            $allResults += $result
        }
        else {
            Write-Host "⚠️  Path non trovato: $($project.Path)" -ForegroundColor $Yellow
        }
    }
    
    Write-Host "=" * 60 -ForegroundColor $Cyan
    Write-Host "📊 RIEPILOGO VALIDAZIONE" -ForegroundColor $Cyan
    Write-Host ""
    
    $hasAnyIssues = $false
    foreach ($result in $allResults) {
        if ($result.HasIssues) {
            $hasAnyIssues = $true
            Write-Host "❌ Issues trovati:" -ForegroundColor $Red
            foreach ($issue in $result.Issues) {
                Write-Host "   - $issue" -ForegroundColor $Red
            }
        }
    }
    
    if (-not $hasAnyIssues) {
        Write-Host "✅ Tutti i progetti configurati correttamente!" -ForegroundColor $Green
    }
    else {
        Write-Host ""
        Write-Host "💡 Per generare secrets sicuri automaticamente:" -ForegroundColor $Yellow
        Write-Host "   .\setup-env.ps1 -GenerateSecrets" -ForegroundColor $Yellow
    }
    Write-Host ""
}
else {
    Write-Host "🔧 MODALITÀ: Validazione e fix automatico" -ForegroundColor $Cyan
    Write-Host ""
    
    foreach ($project in $projects) {
        if (Test-Path $project.Path) {
            $result = Test-EnvConfiguration -ProjectPath $project.Path -ProjectName $project.Name
            
            if ($result.HasIssues) {
                Write-Host "❌ Issues trovati in $($project.Name)" -ForegroundColor $Red
                Write-Host "   Vuoi generare un .env sicuro? (Y/N)" -ForegroundColor $Yellow
                
                if ($Force) {
                    $response = "Y"
                }
                else {
                    $response = Read-Host
                }
                
                if ($response -eq "Y" -or $response -eq "y") {
                    New-SecureEnvFile -ProjectPath $project.Path -ProjectName $project.Name
                }
            }
        }
    }
    
    Write-Host "✅ Setup completato!" -ForegroundColor $Green
    Write-Host ""
}

Write-Host "=" * 60 -ForegroundColor $Cyan
Write-Host "📚 RISORSE UTILI" -ForegroundColor $Cyan
Write-Host ""
Write-Host "📄 Testing Guide (Backend): docs/TESTING_GUIDE.md" -ForegroundColor $Yellow
Write-Host "📄 Testing Guide (Frontend): auth-kit-ui/docs/TESTING_GUIDE.md" -ForegroundColor $Yellow
Write-Host "📄 OAuth Setup: Vedi TESTING_GUIDE.md sezione 'Test OAuth Providers'" -ForegroundColor $Yellow
Write-Host ""

