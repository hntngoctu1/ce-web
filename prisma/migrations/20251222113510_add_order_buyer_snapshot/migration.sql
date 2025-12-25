-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
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
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("billingAddress", "createdAt", "currency", "customerEmail", "customerName", "customerPhone", "discount", "id", "notes", "orderNumber", "paymentMethod", "paymentStatus", "shippingAddress", "shippingCost", "status", "subtotal", "tax", "total", "updatedAt", "userId") SELECT "billingAddress", "createdAt", "currency", "customerEmail", "customerName", "customerPhone", "discount", "id", "notes", "orderNumber", "paymentMethod", "paymentStatus", "shippingAddress", "shippingCost", "status", "subtotal", "tax", "total", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
