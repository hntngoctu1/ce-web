# PostgreSQL Setup Script for Creative Engineering
# Run this script in PowerShell as Administrator

Write-Host "=== Creative Engineering - PostgreSQL Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
$pgPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "$env:ProgramFiles\PostgreSQL\16\bin",
    "$env:ProgramFiles\PostgreSQL\15\bin"
)

foreach ($path in $possiblePaths) {
    if (Test-Path "$path\psql.exe") {
        $pgPath = $path
        break
    }
}

if (-not $pgPath) {
    Write-Host "PostgreSQL not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL 14+ from:" -ForegroundColor Yellow
    Write-Host "  https://www.postgresql.org/download/windows/"
    Write-Host ""
    Write-Host "Or use Docker:" -ForegroundColor Yellow
    Write-Host '  docker run --name ce-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ce_dev -p 5432:5432 -d postgres:16-alpine'
    Write-Host ""
    exit 1
}

Write-Host "Found PostgreSQL at: $pgPath" -ForegroundColor Green
$env:Path = "$pgPath;$env:Path"

# Check if service is running
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($pgService) {
    if ($pgService.Status -ne 'Running') {
        Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
        Start-Service $pgService.Name
        Start-Sleep -Seconds 3
    }
    Write-Host "PostgreSQL service is running." -ForegroundColor Green
} else {
    Write-Host "PostgreSQL service not found. Is it installed as a Windows service?" -ForegroundColor Yellow
}

# Create database
Write-Host ""
Write-Host "Creating database 'ce_dev'..." -ForegroundColor Yellow

$createDbCmd = @"
DO `$`$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ce_dev') THEN
        CREATE DATABASE ce_dev;
    END IF;
END
`$`$;
"@

# Try to connect and create database
try {
    $env:PGPASSWORD = "postgres"
    echo $createDbCmd | & "$pgPath\psql.exe" -h localhost -U postgres -d postgres -q 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database 'ce_dev' is ready!" -ForegroundColor Green
    } else {
        Write-Host "Note: Could not create database. It may already exist or requires different credentials." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Could not connect to PostgreSQL. Please ensure it's running." -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Verify .env has correct DATABASE_URL:"
Write-Host '   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ce_dev?schema=public"' -ForegroundColor Gray
Write-Host ""
Write-Host "2. Run Prisma migrations:"
Write-Host "   npx prisma migrate deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Seed the database:"
Write-Host "   npm run db:seed" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start the development server:"
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

