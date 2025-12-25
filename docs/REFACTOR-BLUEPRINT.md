# 🏗️ REFACTOR BLUEPRINT - Creative Engineering Platform

**Version:** 1.0  
**Date:** December 26, 2024  
**Author:** Solution Architect

---

## 📊 CURRENT STATE ANALYSIS

### Architecture Issues Identified

| Category | Issue | Severity | Impact |
|----------|-------|----------|--------|
| **Structure** | Flat lib folder with mixed concerns | High | Hard to navigate, no clear ownership |
| **Structure** | Business logic in API routes | High | Untestable, duplicated logic |
| **Structure** | No service/repository layers | High | Prisma calls scattered everywhere |
| **Structure** | Duplicate admin routes (`/admin` + `/[locale]/admin`) | Medium | Confusion, maintenance burden |
| **Database** | Float for money fields | High | Precision errors in calculations |
| **Database** | Missing indexes on query fields | Medium | Performance degradation at scale |
| **Database** | Inconsistent onDelete strategies | Medium | Orphan data or cascade issues |
| **Database** | No soft delete | Low | Data loss on delete |
| **Security** | No centralized RBAC | High | Inconsistent auth checks |
| **Security** | No rate limiting | High | DoS vulnerability |
| **Security** | No audit logging | Medium | No accountability trail |
| **API** | No standardized response format | Medium | Inconsistent client handling |
| **API** | Validation scattered | Medium | Inconsistent error messages |
| **Code** | State machine logic in UI | High | Business rules in components |
| **Code** | No idempotency for checkout | High | Duplicate orders possible |

### What's Working Well ✅

- Order workflow state machine (`lib/orders/workflow.ts`)
- Stock operations with idempotency keys
- NextAuth authentication setup
- i18n with next-intl (5 languages)
- Component organization (product/pdp, product/plp)
- Prisma schema is comprehensive

---

## 🎯 TARGET ARCHITECTURE

### Domain-Driven Folder Structure

```
src/
├── modules/                          # Domain modules
│   ├── auth/                         # Authentication & Authorization
│   │   ├── domain/
│   │   │   ├── types.ts              # User, Session, Role types
│   │   │   └── permissions.ts        # RBAC permissions matrix
│   │   ├── services/
│   │   │   ├── auth.service.ts       # Login, register, session
│   │   │   └── rbac.service.ts       # Role-based access control
│   │   ├── guards/
│   │   │   ├── require-auth.ts       # Auth middleware
│   │   │   └── require-role.ts       # Role guard
│   │   └── index.ts                  # Module exports
│   │
│   ├── catalog/                      # Products & Categories
│   │   ├── domain/
│   │   │   ├── types.ts              # Product, ProductGroup, Industry
│   │   │   └── validators.ts         # Zod schemas
│   │   ├── repositories/
│   │   │   ├── product.repository.ts
│   │   │   └── category.repository.ts
│   │   ├── services/
│   │   │   ├── product.service.ts
│   │   │   └── search.service.ts
│   │   └── index.ts
│   │
│   ├── orders/                       # Order management
│   │   ├── domain/
│   │   │   ├── types.ts              # Order, OrderItem, Status
│   │   │   ├── validators.ts         # Zod schemas
│   │   │   └── state-machine.ts      # Order status transitions
│   │   ├── repositories/
│   │   │   └── order.repository.ts
│   │   ├── services/
│   │   │   ├── order.service.ts      # Create, update, transitions
│   │   │   ├── checkout.service.ts   # Checkout flow
│   │   │   └── payment.service.ts    # Payment tracking
│   │   └── index.ts
│   │
│   ├── inventory/                    # Warehouse & Stock
│   │   ├── domain/
│   │   │   ├── types.ts
│   │   │   ├── validators.ts
│   │   │   └── state-machine.ts      # Document status transitions
│   │   ├── repositories/
│   │   │   ├── inventory.repository.ts
│   │   │   ├── warehouse.repository.ts
│   │   │   └── document.repository.ts
│   │   ├── services/
│   │   │   ├── inventory.service.ts
│   │   │   ├── stock-document.service.ts
│   │   │   └── stock-operation.service.ts
│   │   └── index.ts
│   │
│   ├── content/                      # Blog & CMS
│   │   ├── domain/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── index.ts
│   │
│   ├── customers/                    # Customer profiles
│   │   ├── domain/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── index.ts
│   │
│   ├── notifications/                # Email, SMS, Push
│   │   ├── domain/
│   │   ├── services/
│   │   └── index.ts
│   │
│   └── reporting/                    # Analytics & Reports
│       ├── domain/
│       ├── services/
│       └── index.ts
│
├── shared/                           # Cross-cutting concerns
│   ├── database/
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── transaction.ts            # Transaction helpers
│   │   └── migrations/               # Migration scripts
│   ├── errors/
│   │   ├── app-error.ts              # Base error class
│   │   ├── error-codes.ts            # Error code constants
│   │   └── error-handler.ts          # Global error handler
│   ├── api/
│   │   ├── response.ts               # Standardized API responses
│   │   ├── pagination.ts             # Pagination helpers
│   │   └── rate-limit.ts             # Rate limiting
│   ├── logging/
│   │   ├── logger.ts                 # Structured logging
│   │   └── audit.ts                  # Audit trail
│   ├── validation/
│   │   ├── schemas.ts                # Common Zod schemas
│   │   └── sanitize.ts               # Input sanitization
│   ├── utils/
│   │   ├── date.ts
│   │   ├── money.ts                  # Decimal handling
│   │   └── id.ts                     # ID generation
│   └── types/
│       ├── api.ts                    # API types
│       └── common.ts                 # Shared types
│
├── app/                              # Next.js App Router (unchanged)
│   ├── [locale]/                     # i18n pages
│   ├── api/                          # API routes (thin handlers)
│   └── admin/                        # Admin pages
│
├── components/                       # UI components (unchanged)
└── i18n/                             # Translations (unchanged)
```

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        API ROUTES                           │
│  (Thin handlers: validation → service call → response)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVICES                              │
│  (Business logic, orchestration, transactions)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      REPOSITORIES                           │
│  (Database access, queries, caching)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        PRISMA                               │
│  (ORM, migrations, database)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 INCREMENTAL REFACTOR PLAN

### Phase 1: Foundation (Steps 1-3)

#### Step 1: Shared Infrastructure ⏱️ 2-3 hours
**Goal:** Create shared utilities that all modules will use

**Changes:**
- Create `/src/shared/` folder structure
- Implement standardized API response format
- Implement AppError class with error codes
- Implement structured logger
- Add pagination helpers

**Files to create:**
```
src/shared/
├── api/
│   ├── response.ts
│   └── pagination.ts
├── errors/
│   ├── app-error.ts
│   └── error-codes.ts
├── logging/
│   └── logger.ts
├── database/
│   └── prisma.ts (move from lib/db.ts)
└── types/
    └── api.ts
```

**Migration:** None required
**Rollback:** Delete `/src/shared/` folder

---

#### Step 2: Auth Module & RBAC ⏱️ 3-4 hours
**Goal:** Centralize authentication and authorization

**Changes:**
- Create auth module structure
- Implement centralized RBAC guard
- Create permission matrix
- Update admin routes to use new guards

**Files to create:**
```
src/modules/auth/
├── domain/
│   ├── types.ts
│   └── permissions.ts
├── guards/
│   ├── require-auth.ts
│   └── require-role.ts
└── index.ts
```

**Migration:** Update existing routes to use new guards
**Rollback:** Revert route changes, keep old auth

---

#### Step 3: Audit Logging ⏱️ 2 hours
**Goal:** Track all sensitive actions

**Changes:**
- Enhance existing audit-log.ts
- Add audit middleware
- Log: order changes, payments, inventory, user changes

**Files to modify:**
- `src/lib/audit-log.ts` → `src/shared/logging/audit.ts`

**Migration:** None
**Rollback:** Remove audit calls

---

### Phase 2: Core Modules (Steps 4-6)

#### Step 4: Orders Module ⏱️ 4-5 hours
**Goal:** Extract order logic into clean module

**Changes:**
- Create orders module structure
- Move state machine from `lib/orders/workflow.ts`
- Create order.service.ts with all business logic
- Create order.repository.ts for queries
- Add checkout idempotency

**Files to create:**
```
src/modules/orders/
├── domain/
│   ├── types.ts
│   ├── validators.ts
│   └── state-machine.ts
├── repositories/
│   └── order.repository.ts
├── services/
│   ├── order.service.ts
│   ├── checkout.service.ts
│   └── payment.service.ts
└── index.ts
```

**Migration:** Update API routes to use new services
**Rollback:** Keep old lib/orders files as backup

---

#### Step 5: Inventory Module ⏱️ 4-5 hours
**Goal:** Extract inventory logic into clean module

**Changes:**
- Create inventory module structure
- Move warehouse.ts logic
- Create stock document state machine
- Add transaction boundaries

**Files to create:**
```
src/modules/inventory/
├── domain/
│   ├── types.ts
│   ├── validators.ts
│   └── state-machine.ts
├── repositories/
│   ├── inventory.repository.ts
│   ├── warehouse.repository.ts
│   └── document.repository.ts
├── services/
│   ├── inventory.service.ts
│   ├── stock-document.service.ts
│   └── stock-operation.service.ts
└── index.ts
```

**Migration:** Update warehouse API routes
**Rollback:** Keep old lib/warehouse.ts

---

#### Step 6: Catalog Module ⏱️ 3-4 hours
**Goal:** Extract product/category logic

**Changes:**
- Create catalog module
- Add caching for product lists
- Optimize queries with proper includes

**Files to create:**
```
src/modules/catalog/
├── domain/
│   ├── types.ts
│   └── validators.ts
├── repositories/
│   ├── product.repository.ts
│   └── category.repository.ts
├── services/
│   └── product.service.ts
└── index.ts
```

---

### Phase 3: Database & Security (Steps 7-9)

#### Step 7: Database Improvements ⏱️ 3-4 hours
**Goal:** Prepare for Postgres migration

**Changes:**
- Add missing indexes
- Standardize onDelete strategies
- Add soft delete fields where needed
- Document SQLite → Postgres migration path

**Files to modify:**
- `prisma/schema.prisma`

**Migration:** Run `prisma migrate dev`
**Rollback:** Revert schema, run migration

---

#### Step 8: Security Hardening ⏱️ 3 hours
**Goal:** Add rate limiting, CSRF, secure uploads

**Changes:**
- Add rate limiting middleware
- Configure secure file upload constraints
- Add CSRF protection for mutations

**Files to create:**
```
src/shared/security/
├── rate-limit.ts
├── csrf.ts
└── upload.ts
```

---

#### Step 9: API Standardization ⏱️ 4 hours
**Goal:** All APIs use consistent format

**Changes:**
- Update all API routes to use standardized responses
- Add Zod validation to every route
- Generate OpenAPI spec (optional)

---

### Phase 4: Polish (Steps 10-12)

#### Step 10: Content Module ⏱️ 2-3 hours
Extract blog/CMS logic into module

#### Step 11: Testing Infrastructure ⏱️ 3-4 hours
- Unit tests for state machines
- Integration tests for checkout
- CI pipeline setup

#### Step 12: Documentation ⏱️ 2-3 hours
- Architecture documentation
- API documentation
- Migration guide

---

## 📊 IMPLEMENTATION PRIORITY

| Step | Priority | Effort | Risk | Dependencies |
|------|----------|--------|------|--------------|
| 1. Shared Infrastructure | 🔴 Critical | Medium | Low | None |
| 2. Auth & RBAC | 🔴 Critical | High | Medium | Step 1 |
| 3. Audit Logging | 🟡 High | Low | Low | Step 1 |
| 4. Orders Module | 🔴 Critical | High | Medium | Steps 1-2 |
| 5. Inventory Module | 🟡 High | High | Medium | Steps 1-2 |
| 6. Catalog Module | 🟢 Medium | Medium | Low | Step 1 |
| 7. Database Improvements | 🟡 High | Medium | Medium | None |
| 8. Security Hardening | 🔴 Critical | Medium | Low | Step 1 |
| 9. API Standardization | 🟡 High | High | Low | Steps 1-6 |
| 10. Content Module | 🟢 Medium | Medium | Low | Step 1 |
| 11. Testing | 🟡 High | High | Low | Steps 4-5 |
| 12. Documentation | 🟢 Medium | Low | Low | All |

---

## ✅ SUCCESS CRITERIA

- [ ] All API routes use standardized response format
- [ ] Centralized RBAC protects all admin/customer routes
- [ ] Order and Inventory modules have explicit state machines
- [ ] Checkout has idempotency (no duplicate orders)
- [ ] All sensitive actions are audit logged
- [ ] Rate limiting on public endpoints
- [ ] Database ready for Postgres migration
- [ ] Unit tests for state machines
- [ ] Integration tests for critical flows
- [ ] CI pipeline with lint/typecheck/test
- [ ] Documentation complete

---

## 🚀 IMPLEMENTATION PROGRESS

### ✅ Step 1: Shared Infrastructure (COMPLETED)

Files created:
```
src/shared/
├── api/
│   ├── response.ts      # Standardized API responses
│   └── index.ts
├── database/
│   ├── prisma.ts        # Prisma singleton
│   ├── transaction.ts   # Transaction helpers
│   └── index.ts
├── errors/
│   ├── app-error.ts     # AppError class
│   ├── error-codes.ts   # Error code constants
│   └── index.ts
├── logging/
│   ├── logger.ts        # Structured logger
│   ├── audit.ts         # Audit trail
│   └── index.ts
├── types/
│   ├── common.ts        # Common types
│   └── index.ts
├── utils/
│   ├── money.ts         # Currency/Decimal helpers
│   ├── id.ts            # ID generation
│   ├── date.ts          # Date utilities
│   └── index.ts
└── index.ts             # Main exports
```

### ✅ Step 2: Auth Module & RBAC (COMPLETED)

Files created:
```
src/modules/auth/
├── domain/
│   ├── types.ts         # User, Session, Role types
│   ├── permissions.ts   # RBAC permissions matrix
│   └── index.ts
├── guards/
│   ├── require-auth.ts  # Auth middleware
│   ├── require-role.ts  # Role guards
│   └── index.ts
└── index.ts             # Module exports
```

### 🔄 Next Steps

- Step 3: Enhance audit logging
- Step 4: Create orders module
- Step 5: Create inventory module

