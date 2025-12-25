# Creative Engineering - Auto Setup Script (PowerShell)
# Run this script: .\setup.ps1

Write-Host "`n🚀 Creative Engineering - Auto Setup" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue
Write-Host ""

function Write-Step {
    param([int]$Number, [string]$Message)
    Write-Host "`n[$Number/6] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Step 1: Check .env file
Write-Step 1 "Checking .env file..."

$envPath = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envPath)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    $envContent = @"
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ce_website?schema=public"

# NextAuth Configuration
AUTH_SECRET="creative-engineering-2024-secret-key-please-change-in-production"
AUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
"@
    
    try {
        $envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline
        Write-Success ".env file created!"
        Write-Warning "⚠️  Please update DATABASE_URL with your actual database credentials!"
    }
    catch {
        Write-Error "Failed to create .env file. Please create it manually."
        Write-Host "`nCopy this content to ce-website\.env:" -ForegroundColor Yellow
        Write-Host $envContent
        exit 1
    }
}
else {
    Write-Success ".env file already exists"
}

# Step 2: Install dependencies
Write-Step 2 "Installing dependencies..."
try {
    npm install
    Write-Success "Dependencies installed"
}
catch {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Step 3: Check PostgreSQL
Write-Step 3 "Checking PostgreSQL connection..."
Write-Warning "Make sure PostgreSQL is running on your system!"

Write-Host "Attempting to create database..." -ForegroundColor Yellow
Write-Host "You may be prompted for the PostgreSQL password." -ForegroundColor Yellow

try {
    $createDb = "psql -U postgres -c `"CREATE DATABASE ce_website;`" 2>&1"
    Invoke-Expression $createDb | Out-Null
    Write-Success "Database created (or already exists)"
}
catch {
    Write-Warning "Could not create database automatically."
    Write-Host "Please create it manually:" -ForegroundColor Yellow
    Write-Host "  1. Open pgAdmin or psql" -ForegroundColor Cyan
    Write-Host "  2. Run: CREATE DATABASE ce_website;" -ForegroundColor Cyan
    Write-Host "`nPress Enter when ready to continue..."
    $null = Read-Host
}

# Step 4: Generate Prisma Client
Write-Step 4 "Generating Prisma Client..."
try {
    npx prisma generate
    Write-Success "Prisma Client generated"
}
catch {
    Write-Error "Failed to generate Prisma Client"
    exit 1
}

# Step 5: Push Database Schema
Write-Step 5 "Pushing database schema..."
Write-Host "This will create all tables in your database..." -ForegroundColor Yellow

try {
    npx prisma db push
    Write-Success "Database schema created"
}
catch {
    Write-Error "Database push failed. Please check:"
    Write-Host "  1. PostgreSQL is running" -ForegroundColor Yellow
    Write-Host "  2. Database ce_website exists" -ForegroundColor Yellow
    Write-Host "  3. DATABASE_URL in .env is correct" -ForegroundColor Yellow
    exit 1
}

# Step 6: Seed Database
Write-Step 6 "Seeding database with sample data..."
try {
    npx prisma db:seed
    Write-Success "Database seeded with sample data"
}
catch {
    Write-Warning "Seed failed, but you can continue. Add data manually via admin panel."
}

# Done!
Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================`n" -ForegroundColor Green

Write-Success "Your Creative Engineering website is ready!"
Write-Host "`n📋 Next Steps:" -ForegroundColor Blue
Write-Host "  1. Run: npm run dev" -ForegroundColor Cyan
Write-Host "  2. Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  3. Admin: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "     Login: admin@ce.com.vn / admin123`n" -ForegroundColor Cyan

Write-Host "📚 Documentation:" -ForegroundColor Blue
Write-Host "  - QUICK_START.md - Quick setup guide" -ForegroundColor Cyan
Write-Host "  - PROJECT_STATUS.md - Full project status" -ForegroundColor Cyan
Write-Host "  - SETUP_GUIDE.md - Detailed setup guide`n" -ForegroundColor Cyan

