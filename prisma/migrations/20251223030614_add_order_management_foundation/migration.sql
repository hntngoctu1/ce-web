-- CreateTable
CREATE TABLE "order_counters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "actorAdminId" TEXT,
    "noteInternal" TEXT,
    "noteCustomer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_status_history_actorAdminId_fkey" FOREIGN KEY ("actorAdminId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "providerMessageId" TEXT,
    "error" TEXT,
    "dedupeKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_logs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("billingAddress", "billingSnapshot", "buyerCompanyEmail", "buyerCompanyName", "buyerSnapshot", "buyerTaxId", "buyerType", "createdAt", "currency", "customerEmail", "customerName", "customerPhone", "discount", "id", "notes", "orderNumber", "paymentMethod", "paymentStatus", "shippingAddress", "shippingCost", "shippingSnapshot", "status", "subtotal", "tax", "total", "updatedAt", "userId") SELECT "billingAddress", "billingSnapshot", "buyerCompanyEmail", "buyerCompanyName", "buyerSnapshot", "buyerTaxId", "buyerType", "createdAt", "currency", "customerEmail", "customerName", "customerPhone", "discount", "id", "notes", "orderNumber", "paymentMethod", "paymentStatus", "shippingAddress", "shippingCost", "shippingSnapshot", "status", "subtotal", "tax", "total", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE UNIQUE INDEX "orders_orderCode_key" ON "orders"("orderCode");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");
CREATE INDEX "orders_updatedAt_idx" ON "orders"("updatedAt");
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_customerEmail_idx" ON "orders"("customerEmail");
CREATE INDEX "orders_customerPhone_idx" ON "orders"("customerPhone");
CREATE INDEX "orders_buyerCompanyName_idx" ON "orders"("buyerCompanyName");
CREATE INDEX "orders_orderStatus_idx" ON "orders"("orderStatus");
CREATE INDEX "orders_paymentState_idx" ON "orders"("paymentState");
CREATE INDEX "orders_fulfillmentStatus_idx" ON "orders"("fulfillmentStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "order_counters_year_key" ON "order_counters"("year");

-- CreateIndex
CREATE INDEX "order_status_history_orderId_idx" ON "order_status_history"("orderId");

-- CreateIndex
CREATE INDEX "order_status_history_toStatus_idx" ON "order_status_history"("toStatus");

-- CreateIndex
CREATE INDEX "order_status_history_createdAt_idx" ON "order_status_history"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_logs_dedupeKey_key" ON "notification_logs"("dedupeKey");

-- CreateIndex
CREATE INDEX "notification_logs_orderId_idx" ON "notification_logs"("orderId");

-- CreateIndex
CREATE INDEX "notification_logs_recipient_idx" ON "notification_logs"("recipient");

-- CreateIndex
CREATE INDEX "notification_logs_createdAt_idx" ON "notification_logs"("createdAt");
