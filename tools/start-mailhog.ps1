#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start MailHog SMTP server for local email testing

.DESCRIPTION
    MailHog captures all outgoing emails and displays them in a web UI.
    - SMTP Server: localhost:1025
    - Web UI: http://localhost:8025
    
.EXAMPLE
    .\start-mailhog.ps1
#>

Write-Host "🚀 Starting MailHog..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📧 SMTP Server: localhost:1025" -ForegroundColor Green
Write-Host "🌐 Web UI: http://localhost:8025" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop MailHog" -ForegroundColor Yellow
Write-Host ""

# Start MailHog
& "$PSScriptRoot\mailhog.exe"
