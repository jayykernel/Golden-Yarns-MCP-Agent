-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Supplier" ("address", "contactPerson", "createdAt", "email", "id", "name", "phone", "taxId", "updatedAt") SELECT "address", "contactPerson", "createdAt", "email", "id", "name", "phone", "taxId", "updatedAt" FROM "Supplier";
DROP TABLE "Supplier";
ALTER TABLE "new_Supplier" RENAME TO "Supplier";
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
