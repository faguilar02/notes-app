# PowerShell script to check prerequisites

$ErrorActionPreference = "Continue"

Write-Host "Checking prerequisites for Notes Application..." -ForegroundColor Cyan
Write-Host ""

$allOk = $true

# Check Docker
if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        $dockerVersion = docker --version 2>$null
        Write-Host "Docker is installed: $dockerVersion" -ForegroundColor Green
    } catch {
        Write-Host "Docker command failed" -ForegroundColor Red
        $allOk = $false
    }
} else {
    Write-Host "Docker is NOT installed" -ForegroundColor Red
    Write-Host "  Please install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/"
    $allOk = $false
}

# Check Docker Compose
$composeAvailable = $false
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    try {
        $composeVersion = docker-compose --version 2>$null
        Write-Host "Docker Compose is installed: $composeVersion" -ForegroundColor Green
        $composeAvailable = $true
    } catch {
        Write-Host "docker-compose command failed" -ForegroundColor Yellow
    }
}

if (-not $composeAvailable) {
    try {
        $composeVersion = docker compose version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Docker Compose is installed: $composeVersion" -ForegroundColor Green
            $composeAvailable = $true
        }
    } catch {
        # Silently continue
    }
}

if (-not $composeAvailable) {
    Write-Host "Docker Compose is NOT installed" -ForegroundColor Red
    Write-Host "  Docker Compose should come with Docker Desktop"
    $allOk = $false
}

# Check if Docker daemon is running (only if Docker command exists)
if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Docker daemon is running" -ForegroundColor Green
        } else {
            Write-Host "Docker daemon is NOT running" -ForegroundColor Red
            Write-Host "  Please start Docker Desktop"
            $allOk = $false
        }
    } catch {
        Write-Host "Docker daemon is NOT running" -ForegroundColor Red
        Write-Host "  Please start Docker Desktop"
        $allOk = $false
    }
}

# Check ports availability
Write-Host ""
Write-Host "Checking port availability..." -ForegroundColor Cyan

function Test-Port {
    param([int]$Port)
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connection) {
            Write-Host "Port $Port is already in use" -ForegroundColor Yellow
            foreach ($conn in $connection) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "   Used by: $($process.Name) (PID: $($process.Id))" -ForegroundColor Gray
                }
            }
            return $false
        } else {
            Write-Host "Port $Port is available" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "Cannot check port $Port (insufficient permissions or error)" -ForegroundColor Yellow
        return $true
    }
}

$portsOk = $true
if (-not (Test-Port 4200)) { $portsOk = $false }
if (-not (Test-Port 3000)) { $portsOk = $false }
if (-not (Test-Port 5432)) { $portsOk = $false }

Write-Host ""
if ($allOk) {
    if ($portsOk) {
        Write-Host "All prerequisites met! You can run the application." -ForegroundColor Green
    } else {
        Write-Host "Some ports are in use, but continuing anyway..." -ForegroundColor Yellow
        Write-Host "   Docker will handle port conflicts or the application may fail to start." -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "To start the application, run:" -ForegroundColor Cyan
    Write-Host "  .\start.ps1" -ForegroundColor White
    exit 0
} else {
    Write-Host "Some prerequisites are missing. Please install them first." -ForegroundColor Red
    exit 1
}
