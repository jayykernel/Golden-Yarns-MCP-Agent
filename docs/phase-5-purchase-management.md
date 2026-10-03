# Phase 5: Purchase Management — Architecture & Implementation

## Overview
Phase 5 integrates the Purchase Order workflow into the Golden Yarns business management system, establishing end-to-end traceability from yarn procurement to stock lot creation and supplier payable balances.

## Key Components

1. **Domain Types** (`src/types/purchase.types.ts`)
   - `PurchaseInput`: Payload for creating purchase records with nested lot details.
   - `UpdatePurchaseInput`: Partial update payload.
   - `PurchaseSummary`: Aggregated purchase metrics.
   - `LotDetailInput`: Per-lot specifications (yarn type, count, color, weight, quantity, unit cost).

2. **Validation** (`src/utils/purchase.validation.ts`)
   - Comprehensive Zod schemas enforcing positive weights, quantities, and valid relations.

3. **Repository** (`src/repositories/purchase.repository.ts`)
   - Full CRUD data access leveraging Prisma ORM for SQLite.

4. **Service** (`src/services/purchase.service.ts`)
   - Transactional business logic linking purchases to auto-generated stock lots.
   - Automatic packaging weight calculations.
   - Financial integration with supplier payable ledgers.

5. **MCP Tools** (`src/tools/purchase.tools.ts`)
   - `create_purchase`: Create purchases and generate corresponding inventory.
   - `get_purchase`: Retrieve purchase records by ID.
   - `list_purchases`: Query and filter purchases by date, supplier, or status.
