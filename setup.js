#!/usr/bin/env node

/**
 * Creative Engineering - Auto Setup Script
 * This script automates the entire setup process
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function step(number, message) {
  log(`\n[${number}/6] ${message}`, 'cyan');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function runCommand(command, errorMessage) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (e) {
    error(errorMessage);
    return false;
  }
}

async function main() {
  log('\n🚀 Creative Engineering - Auto Setup', 'blue');
  log('=====================================\n', 'blue');

  // Step 1: Check .env file
  step(1, 'Checking .env file...');
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    log('Creating .env file...', 'yellow');
    const envContent = `# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ce_website?schema=public"

# NextAuth Configuration
AUTH_SECRET="creative-engineering-2024-secret-key-please-change-in-production"
AUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
`;

    try {
      fs.writeFileSync(envPath, envContent);
      success('.env file created!');
      warning('⚠️  Please update DATABASE_URL with your actual database credentials!');
    } catch (e) {
      error('Failed to create .env file. Please create it manually.');
      log('\nCopy this content to ce-website/.env:\n', 'yellow');
      console.log(envContent);
      process.exit(1);
    }
  } else {
    success('.env file already exists');
  }

  // Step 2: Install dependencies
  step(2, 'Installing dependencies...');
  if (!runCommand('npm install', 'Failed to install dependencies')) {
    process.exit(1);
  }
  success('Dependencies installed');

  // Step 3: Check PostgreSQL
  step(3, 'Checking PostgreSQL connection...');
  warning('Make sure PostgreSQL is running on your system!');

  // Try to create database
  log('Attempting to create database...', 'yellow');
  const createDbCommand = 'psql -U postgres -c "CREATE DATABASE ce_website;"';

  if (process.platform === 'win32') {
    log('On Windows, run this in a new terminal:', 'yellow');
    log('psql -U postgres -c "CREATE DATABASE ce_website;"', 'cyan');
  } else {
    runCommand(createDbCommand, 'Database might already exist (this is OK)');
  }

  // Step 4: Generate Prisma Client
  step(4, 'Generating Prisma Client...');
  if (!runCommand('npx prisma generate', 'Failed to generate Prisma Client')) {
    process.exit(1);
  }
  success('Prisma Client generated');

  // Step 5: Push Database Schema
  step(5, 'Pushing database schema...');
  log('This will create all tables in your database...', 'yellow');

  if (!runCommand('npx prisma db push', 'Failed to push database schema')) {
    error('Database push failed. Please check:');
    log('  1. PostgreSQL is running', 'yellow');
    log('  2. Database ce_website exists', 'yellow');
    log('  3. DATABASE_URL in .env is correct', 'yellow');
    process.exit(1);
  }
  success('Database schema created');

  // Step 6: Seed Database
  step(6, 'Seeding database with sample data...');
  if (!runCommand('npx prisma db:seed', 'Failed to seed database')) {
    warning('Seed failed, but you can continue. Add data manually via admin panel.');
  } else {
    success('Database seeded with sample data');
  }

  // Done!
  log('\n🎉 Setup Complete!', 'green');
  log('==================\n', 'green');

  success('Your Creative Engineering website is ready!');
  log('\n📋 Next Steps:', 'blue');
  log('  1. Run: npm run dev', 'cyan');
  log('  2. Open: http://localhost:3000', 'cyan');
  log('  3. Admin: http://localhost:3000/admin', 'cyan');
  log('     Login: admin@ce.com.vn / admin123\n', 'cyan');

  log('📚 Documentation:', 'blue');
  log('  - QUICK_START.md - Quick setup guide', 'cyan');
  log('  - PROJECT_STATUS.md - Full project status', 'cyan');
  log('  - SETUP_GUIDE.md - Detailed setup guide\n', 'cyan');
}

main().catch((err) => {
  error('Setup failed with error:');
  console.error(err);
  process.exit(1);
});
