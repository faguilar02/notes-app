# PowerShell script to start the application on Windows

$ErrorActionPreference = "Stop"

Write-Host "Starting Notes Application..." -ForegroundColor Green
Write-Host ""

# Run prerequisites check if available
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PrereqScript = Join-Path $ScriptDir "check-prerequisites.ps1"
if (Test-Path $PrereqScript) {
    Write-Host "Running prerequisites check..." -ForegroundColor Cyan
    try {
        & $PrereqScript
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "Prerequisites check failed. Please fix the issues above and try again." -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host ""
        Write-Host "Prerequisites check failed: $_" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Determine which Docker Compose command to use
$composeCmd = $null
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    $composeCmd = "docker-compose"
} elseif ((docker compose version 2>$null)) {
    $composeCmd = "docker"
    $composeArgs = "compose"
} else {
    Write-Host "Docker Compose is not available." -ForegroundColor Red
    Write-Host "Docker Compose should come with Docker Desktop"
    exit 1
}

if ($composeCmd -eq "docker") {
    Write-Host "Using: docker compose" -ForegroundColor Green
} else {
    Write-Host "Using: $composeCmd" -ForegroundColor Green
}
Write-Host ""

# Check if .env file exists
$envFile = Join-Path $ScriptDir ".env"
if (-not (Test-Path $envFile)) {
    Write-Host ".env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create it from the template:" -ForegroundColor Yellow
    Write-Host "  cp .env.example .env" -ForegroundColor White
    Write-Host ""
    Write-Host "Then edit .env and set your own credentials." -ForegroundColor Yellow
    exit 1
}

# Stop any running containers
Write-Host "Stopping any running containers..." -ForegroundColor Yellow
if ($composeCmd -eq "docker") {
    & docker compose down
} else {
    & $composeCmd down
}

# Build and start all services
Write-Host "Building and starting services..." -ForegroundColor Cyan
if ($composeCmd -eq "docker") {
    & docker compose up --build -d
} else {
    & $composeCmd up --build -d
}

# Wait for database to be healthy
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
$maxWait = 60
$elapsed = 0
$dbHealthy = $false
while ($elapsed -lt $maxWait) {
    try {
        $health = docker inspect --format='{{.State.Health.Status}}' notes-db 2>$null
        if ($health -eq "healthy") {
            Write-Host "✓ Database is healthy" -ForegroundColor Green
            $dbHealthy = $true
            break
        }
    } catch {
        # Container not ready yet
    }
    Start-Sleep -Seconds 2
    $elapsed += 2
}

if (-not $dbHealthy) {
    Write-Host "Database healthcheck timeout, but continuing..." -ForegroundColor Yellow
}

# Wait for backend to respond
Write-Host "Waiting for backend to be ready..." -ForegroundColor Yellow
$maxWait = 60
$elapsed = 0
$backendReady = $false
while ($elapsed -lt $maxWait) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Backend is responding" -ForegroundColor Green
            $backendReady = $true
            break
        }
    } catch {
        # Backend not ready yet
    }
    Start-Sleep -Seconds 2
    $elapsed += 2
}

if (-not $backendReady) {
    Write-Host "Backend timeout, check logs with: $composeCmd logs backend" -ForegroundColor Yellow
}

# Show status
Write-Host ""
Write-Host "Application is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Services Status:" -ForegroundColor Cyan
if ($composeCmd -eq "docker") {
    & docker compose ps
} else {
    & $composeCmd ps
}
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Green
Write-Host "   - Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "   - Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "   - Database: localhost:5432" -ForegroundColor White
Write-Host ""
if ($composeCmd -eq "docker") {
    Write-Host "To view logs, run: docker compose logs -f" -ForegroundColor Yellow
    Write-Host " To stop the application, run: docker compose down" -ForegroundColor Yellow
} else {
    Write-Host " To view logs, run: $composeCmd logs -f" -ForegroundColor Yellow
    Write-Host " To stop the application, run: $composeCmd down" -ForegroundColor Yellow
}
Write-Host ""
