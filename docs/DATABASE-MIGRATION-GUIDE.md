# 🗄️ Database Guide - PostgreSQL

> **✅ MIGRATION COMPLETE**: Schema has been updated to PostgreSQL.

## Quick Start

### 1. Prerequisites
- PostgreSQL 14+ installed (or Docker)
- Node.js 18+

### 2. Setup PostgreSQL

**Option A: Docker (Recommended)**
```bash
docker run --name ce-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ce_dev \
  -p 5432:5432 \
  -d postgres:16-alpine
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb ce_dev
```

### 3. Configure Environment

Create/update `.env`:
```env
# PostgreSQL Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ce_dev?schema=public"

# Auth
AUTH_SECRET="your-secret-key-min-32-characters"
AUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed data
npm run db:seed
```

### 5. Verify Setup

```bash
# Open Prisma Studio to view data
npx prisma studio
```

---

## Schema Overview

### Database Provider
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Key Features Enabled

| Feature | Implementation |
|---------|---------------|
| **Decimal precision** | `@db.Decimal(15, 2)` for money |
| **Text fields** | `@db.Text` for long content |
| **JSON columns** | `@db.JsonB` for indexed JSON |
| **Composite indexes** | Optimized query performance |
| **Proper cascades** | `onDelete: Cascade/SetNull` |

### Model Count
- **39 Prisma models**
- **15+ enums**
- **100+ indexes**

---

## Data Types Mapping

| Field Type | PostgreSQL | Example |
|-----------|------------|---------|
| Money | `Decimal(15, 2)` | `price`, `total`, `amount` |
| Quantity | `Decimal(15, 4)` | `onHandQty`, `reservedQty` |
| Long text | `Text` | `contentEn`, `description` |
| JSON | `JsonB` | `metadata`, `buyerSnapshot` |
| Timestamps | `Timestamp(3)` | `createdAt`, `updatedAt` |

---

## Index Strategy

### Primary Indexes
```prisma
model Order {
  @@index([createdAt])
  @@index([orderStatus])
  @@index([paymentState])
  @@index([customerEmail])
  @@index([orderStatus, createdAt])  // Composite
}
```

### Performance Indexes
```prisma
model Product {
  @@index([isActive, isFeatured])
  @@index([groupId])
  @@index([industryId])
}

model InventoryItem {
  @@index([availableQty])  // Low stock queries
}
```

---

## Migration Commands

### Development
```bash
# Create new migration
npx prisma migrate dev --name <migration_name>

# Reset database (destroys data!)
npx prisma migrate reset

# View current schema
npx prisma studio
```

### Production
```bash
# Apply pending migrations (safe)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

---

## Connection Pooling (Production)

For serverless/edge deployments, use connection pooling:

### Option 1: Prisma Accelerate
```env
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
DIRECT_URL="postgresql://user:pass@host:5432/db"
```

### Option 2: PgBouncer
```env
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@postgres:5432/db"
```

Update schema:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Backup & Restore

### Backup
```bash
# Full backup
pg_dump -h localhost -U postgres -d ce_dev > backup.sql

# Compressed backup
pg_dump -h localhost -U postgres -d ce_dev -Fc > backup.dump
```

### Restore
```bash
# From SQL
psql -h localhost -U postgres -d ce_dev < backup.sql

# From compressed
pg_restore -h localhost -U postgres -d ce_dev backup.dump
```

---

## Monitoring Queries

### Connection Status
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'ce_dev';
```

### Index Usage
```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Table Sizes
```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
```

### Slow Queries (requires pg_stat_statements)
```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Production Environment

### Recommended Settings
```env
# Connection with SSL
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&sslmode=require"

# Pool size (adjust based on serverless function count)
# In Prisma schema or connection URL:
# connection_limit=5
```

### Hosting Providers
| Provider | Features | Pricing |
|----------|----------|---------|
| **Supabase** | Free tier, auto backups | Free - $25/mo |
| **Neon** | Serverless, branching | Free - $19/mo |
| **Railway** | Easy deploy | $5/mo |
| **Vercel Postgres** | Edge optimized | $20/mo |
| **AWS RDS** | Enterprise | $15/mo+ |

---

## Troubleshooting

### Connection Refused
```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# or
pg_isready -h localhost -p 5432
```

### Permission Denied
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE ce_dev TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### Migration Conflicts
```bash
# Reset migrations (development only!)
npx prisma migrate reset

# Mark migration as applied (production)
npx prisma migrate resolve --applied <migration_name>
```

---

## Previous SQLite Data Migration

If migrating from SQLite:

```bash
# 1. Export SQLite data
sqlite3 prisma/dev.db .dump > sqlite_backup.sql

# 2. Start fresh with PostgreSQL
npx prisma migrate deploy
npm run db:seed
```

For complex data migration, use custom scripts in `/scripts/`.
