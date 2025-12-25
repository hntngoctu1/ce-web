-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL DEFAULT 'OTHER',
    "note" TEXT,
    "actorAdminId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_actorAdminId_fkey" FOREIGN KEY ("actorAdminId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "orderCode" TEXT,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shippingAddress" TEXT,
    "billingAddress" TEXT,
    "buyerType" TEXT NOT NULL DEFAULT 'PERSONAL',
    "buyerCompanyName" TEXT,
    "buyerTaxId" TEXT,
    "buyerCompanyEmail" TEXT,
    "buyerSnapshot" TEXT,
    "shippingSnapshot" TEXT,
    "billingSnapshot" TEXT,
    "subtotal" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "shippingCost" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "outstandingAmount" REAL NOT NULL DEFAULT 0,
    "invoiceNo" TEXT,
    "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "accountingStatus" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "customerKind" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "companyId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "orderStatus" TEXT NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "paymentState" TEXT NOT NULL DEFAULT 'UNPAID',
    "fulfillmentStatus" TEXT NOT NULL DEFAULT 'UNFULFILLED',
    "transactionRef" TEXT,
    "carrier" TEXT,
    "trackingCode" TEXT,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    "canceledAt" DATETIME,
    "cancelReason" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("billingAddress", "billingSnapshot", "buyerCompanyEmail", "buyerCompanyName", "buyerSnapshot", "buyerTaxId", "buyerType", "cancelReason", "canceledAt", "carrier", "createdAt", "currency", "customerEmail", "customerName", "customerPhone", "deliveredAt", "discount", "fulfillmentStatus", "id", "notes", "orderCode", "orderNumber", "orderStatus", "paymentMethod", "paymentState", "paymentStatus", "shippedAt", "shippingAddress", "shippingCost", "shippingSnapshot", "status", "subtotal", "tax", "total", "trackingCode", "transactionRef", "updatedAt", "userId") SELECT "billingAddress", "billingSnapshot", "buyerCompanyEmail", "buyerCompanyName", "buyerSnapshot", "buyerTaxId", "buyerType", "cancelReason", "canceledAt", "carrier", "createdAt", "currency", "customerEmail", "customerName", "customerPhone", "deliveredAt", "discount", "fulfillmentStatus", "id", "notes", "orderCode", "orderNumber", "orderStatus", "paymentMethod", "paymentState", "paymentStatus", "shippedAt", "shippingAddress", "shippingCost", "shippingSnapshot", "status", "subtotal", "tax", "total", "trackingCode", "transactionRef", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE UNIQUE INDEX "orders_orderCode_key" ON "orders"("orderCode");
CREATE UNIQUE INDEX "orders_invoiceNo_key" ON "orders"("invoiceNo");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");
CREATE INDEX "orders_updatedAt_idx" ON "orders"("updatedAt");
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_customerEmail_idx" ON "orders"("customerEmail");
CREATE INDEX "orders_customerPhone_idx" ON "orders"("customerPhone");
CREATE INDEX "orders_buyerCompanyName_idx" ON "orders"("buyerCompanyName");
CREATE INDEX "orders_orderStatus_idx" ON "orders"("orderStatus");
CREATE INDEX "orders_paymentState_idx" ON "orders"("paymentState");
CREATE INDEX "orders_fulfillmentStatus_idx" ON "orders"("fulfillmentStatus");
CREATE INDEX "orders_accountingStatus_idx" ON "orders"("accountingStatus");
CREATE INDEX "orders_dueDate_idx" ON "orders"("dueDate");
CREATE INDEX "orders_companyId_idx" ON "orders"("companyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "companies_taxId_key" ON "companies"("taxId");

-- CreateIndex
CREATE INDEX "companies_name_idx" ON "companies"("name");

-- CreateIndex
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate");

-- CreateIndex
CREATE INDEX "payments_paymentMethod_idx" ON "payments"("paymentMethod");
