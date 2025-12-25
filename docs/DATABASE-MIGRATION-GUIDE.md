# 🗄️ Database Migration Guide

## SQLite → PostgreSQL Migration

### Current State
- **Database**: SQLite (development)
- **ORM**: Prisma 6.x
- **Models**: 39 Prisma models
- **Schema**: `prisma/schema.prisma`

---

## Pre-Migration Checklist

### 1. Schema Improvements Needed

#### Missing Indexes (Add for Performance)

```prisma
// User
model User {
  // Add:
  @@index([role])
  @@index([createdAt])
}

// Order - Already has good indexes
model Order {
  // Consider composite indexes for common queries:
  @@index([orderStatus, createdAt])
  @@index([paymentState, createdAt])
  @@index([userId, createdAt])
}

// Product
model Product {
  // Add:
  @@index([groupId])
  @@index([industryId])
  @@index([brandId])
  @@index([isActive, isFeatured])
  @@index([createdAt])
}

// BlogPost
model BlogPost {
  // Already has good indexes
}

// InventoryItem
model InventoryItem {
  // Add for low stock queries:
  @@index([availableQty])
}
```

#### Standardize onDelete Strategies

| Relation | Current | Recommended | Reason |
|----------|---------|-------------|--------|
| User → Order | SetNull | SetNull ✅ | Keep order history |
| User → BlogPost | SetNull | SetNull ✅ | Keep content |
| Product → OrderItem | SetNull | SetNull ✅ | Keep order history |
| Order → OrderItem | Cascade | Cascade ✅ | Delete items with order |
| Product → InventoryItem | Cascade | Restrict ❌ | Prevent deleting product with stock |

#### Add Soft Delete (Optional)

For entities that should be archived rather than deleted:

```prisma
model Product {
  // Add:
  deletedAt DateTime?
  deletedBy String?
  
  @@index([deletedAt])
}

model Order {
  // Already has canceledAt - use for soft delete
}

model BlogPost {
  // status = ARCHIVED serves as soft delete
}
```

### 2. Data Type Considerations

| SQLite | PostgreSQL | Notes |
|--------|------------|-------|
| `Float` | `Decimal(12,2)` | Money fields - better precision |
| `String` | `Text` | Large content fields |
| `Json` | `JsonB` | Better indexing in PG |
| `DateTime` | `Timestamp with time zone` | Timezone aware |

### 3. Constraints to Add

```prisma
model Order {
  total Float  // Should be: total Decimal @db.Decimal(12, 2)
  
  // Add check constraints (PG only):
  // @@check("total >= 0", name: "total_non_negative")
}

model InventoryItem {
  onHandQty Decimal
  reservedQty Decimal
  availableQty Decimal
  
  // Add check constraint:
  // @@check("reservedQty >= 0", name: "reserved_non_negative")
  // @@check("availableQty = onHandQty - reservedQty", name: "available_calc")
}
```

---

## Migration Steps

### Step 1: Prepare PostgreSQL

```bash
# Create database
createdb ce_production

# Or with Docker:
docker run --name ce-postgres -e POSTGRES_DB=ce_production \
  -e POSTGRES_USER=ce_user -e POSTGRES_PASSWORD=secure_password \
  -p 5432:5432 -d postgres:15
```

### Step 2: Update Schema Provider

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 3: Generate Migration

```bash
# Backup current SQLite data first!
cp prisma/dev.db prisma/dev.db.backup

# Update .env
# DATABASE_URL="postgresql://ce_user:password@localhost:5432/ce_production"

# Generate migration
npx prisma migrate dev --name init_postgres

# If existing data needs migration:
npx prisma migrate deploy
```

### Step 4: Data Migration Script

```typescript
// scripts/migrate-data.ts
import { PrismaClient as SqliteClient } from '@prisma/client';
import { PrismaClient as PgClient } from '@prisma/client';

async function migrateData() {
  const sqlite = new SqliteClient({
    datasources: { db: { url: 'file:./prisma/dev.db' } }
  });
  const pg = new PgClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
  });

  // Migrate in order (respecting foreign keys)
  const tables = [
    'User',
    'CustomerProfile',
    'CustomerAddress',
    'ProductGroup',
    'IndustryCategory',
    'Partner',
    'Product',
    'ProductImage',
    'ProductSpec',
    'Warehouse',
    'WarehouseLocation',
    'InventoryItem',
    'Order',
    'OrderItem',
    'OrderStatusHistory',
    'Payment',
    // ... etc
  ];

  for (const table of tables) {
    const data = await (sqlite as any)[table.toLowerCase()].findMany();
    console.log(`Migrating ${data.length} ${table} records...`);
    
    for (const record of data) {
      await (pg as any)[table.toLowerCase()].create({ data: record });
    }
  }

  await sqlite.$disconnect();
  await pg.$disconnect();
}

migrateData().catch(console.error);
```

### Step 5: Verify Migration

```bash
# Check row counts
npx prisma studio

# Run test queries
npx tsx scripts/verify-migration.ts
```

---

## PostgreSQL-Specific Features to Enable

### 1. Full-Text Search

```prisma
// Add to Product for search optimization
model Product {
  // PostgreSQL full-text search (add after migration)
  searchVector Unsupported("tsvector")?
  
  @@index([searchVector], type: Gin)
}
```

### 2. JSON Indexing

```prisma
// For better JSON query performance
model Order {
  buyerSnapshot String? // Change to Json with @db.JsonB
  
  @@index([buyerSnapshot(ops: JsonbPathOps)], type: Gin)
}
```

### 3. Partial Indexes

```sql
-- Only index active products
CREATE INDEX idx_products_active ON products (created_at) 
  WHERE is_active = true;

-- Only index unpaid orders
CREATE INDEX idx_orders_unpaid ON orders (due_date) 
  WHERE payment_state = 'UNPAID';
```

---

## Rollback Plan

### If Migration Fails:

1. **Stop application**
2. **Restore .env to SQLite URL**
3. **Revert schema.prisma provider**
4. **Regenerate Prisma client**: `npx prisma generate`
5. **Verify SQLite backup**: `cp prisma/dev.db.backup prisma/dev.db`
6. **Restart application**

---

## Performance Monitoring

After migration, monitor:

1. **Slow queries**: Enable `log_min_duration_statement` in PostgreSQL
2. **Connection pooling**: Use PgBouncer for production
3. **Index usage**: `pg_stat_user_indexes`

```sql
-- Find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE 'pg_%';

-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Environment Configuration

### Development (SQLite)
```env
DATABASE_URL="file:./prisma/dev.db"
```

### Staging (PostgreSQL)
```env
DATABASE_URL="postgresql://user:pass@staging-db:5432/ce_staging?schema=public"
```

### Production (PostgreSQL with SSL)
```env
DATABASE_URL="postgresql://user:pass@prod-db:5432/ce_production?schema=public&sslmode=require"
```

