# Golden Yarns MCP Agent

An enterprise Model Context Protocol (MCP) server for managing yarn inventory, stock lots, yarn specifications, and business transactions with full traceability.

## Features

- **Stock Lot Management**: Create, retrieve, update, soft-delete, and filter stock lots with lot-level traceability.
- **Available Stock Queries**: Query active and reserved stock with aggregated totals and yarn type groupings.
- **Specification Tracking**: Maintain relationships across yarn types, yarn counts, colors, and suppliers.
- **MCP Integration**: Exposes standard MCP tools over `stdio` for seamless AI agent and Claude integration.
- **Prisma & SQLite**: Relational database persistence using Prisma ORM.

## Architecture

```
src/
├── index.ts                     # MCP Server initialization & stdio transport
├── tools/
│   ├── stockLot.tools.ts        # Stock lot MCP tool definitions and handlers
│   ├── stockMovement.tools.ts   # Stock movement MCP tool definitions
│   ├── supplier.tools.ts        # Supplier MCP tool definitions and handlers
│   └── customer.tools.ts        # Customer MCP tool definitions and handlers
├── services/
│   ├── stockLot.service.ts      # Stock lot domain business logic
│   ├── stockMovement.service.ts # Stock movement domain business logic
│   ├── supplier.service.ts      # Supplier domain business logic
│   └── customer.service.ts      # Customer domain business logic
├── repositories/
│   ├── stockLot.repository.ts   # Stock lot Prisma data access
│   ├── stockMovement.repository.ts # Stock movement Prisma data access
│   ├── supplier.repository.ts   # Supplier Prisma data access
│   └── customer.repository.ts   # Customer Prisma data access
├── types/
│   ├── stockLot.types.ts        # Stock lot TypeScript domain types
│   ├── stockMovement.types.ts   # Stock movement TypeScript domain types
│   ├── supplier.types.ts        # Supplier TypeScript domain types
│   └── customer.types.ts        # Customer TypeScript domain types
└── utils/
    ├── stockLot.validation.ts   # Stock lot Zod validation schemas
    ├── stockMovement.validation.ts # Stock movement Zod validation schemas
    ├── supplier.validation.ts   # Supplier Zod validation schemas
    └── customer.validation.ts   # Customer Zod validation schemas
```

## Available MCP Tools

### Stock Management Tools
- `create_stock_lot` — Create a new stock lot with weight, pricing, and traceability details.
- `get_stock_lot` — Retrieve a stock lot by ID or lot number.
- `get_stock_lots` — Query stock lots with pagination and filters (type, count, color, status, supplier).
- `update_stock_lot` — Update attributes of an existing stock lot.
- `delete_stock_lot` — Soft-delete a stock lot by updating its status to `INACTIVE`.
- `get_available_stock` — List available (`IN_STOCK`, `RESERVED`) inventory with summarized metrics.
- `record_stock_movement` — Record inbound or outbound stock movements with validation constraints.
- `adjust_stock` — Perform stock reconciliation to track lost, damaged, or corrected inventory quantities.
- `get_lot_balance` — Inspect movement ledger records and verify current lot volume reconciliation.

### Supplier Management Tools
- `create_supplier` — Create a new supplier with contact and tax identification details.
- `get_supplier` — Retrieve detailed profile information for a supplier by ID.
- `list_suppliers` — List suppliers with optional search filtering and pagination.
- `update_supplier` — Update an existing supplier profile and contact details.
- `set_supplier_status` — Activate or deactivate a supplier (soft deletion).
- `get_supplier_statement` — Retrieve comprehensive supplier statement with purchases, expenses, and payable balance.

### Customer Management Tools
- `create_customer` — Create a new customer with contact, company, and credit-limit details.
- `get_customer` — Retrieve detailed profile information for a customer by ID.
- `list_customers` — List customers with optional search filtering and pagination.
- `update_customer` — Update an existing customer profile and contact details.
- `set_customer_status` — Activate or deactivate a customer (soft deletion).
- `get_customer_summary` — Get total sales, payments, and outstanding receivable balance for a customer.
- `get_customer_statement` — Retrieve comprehensive customer statement with sales, payments, and receivable balance.

### Purchase Management Tools
- `create_purchase` — Create a new purchase order with lot details, automatically generating stock lots and recording Stock IN movements.
- `get_purchase` — Retrieve detailed information for a purchase by ID.
- `list_purchases` — List purchases with optional filtering by supplier, status, and date range.

### Sales Management Tools
- `create_sale` — Create a new sale order with selected stock lots, deduct inventory, and record Stock OUT movements.
- `get_sale` — Retrieve detailed information for a sale by ID.
- `list_sales` — List sales with optional filtering by customer, status, and date range.
- `cancel_sale` — Cancel an existing sale order and restore stock by recording reverse Stock IN movements.

- `ping` — Health check tool.

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run Prisma database migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Build TypeScript sources:
   ```bash
   npm run build
   ```

4. Start the MCP Server:
   ```bash
   npm start
   ```

## MCP Client Configuration

Add to your MCP client configuration (e.g., Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "golden-yarns": {
      "command": "node",
      "args": ["<path-to-repo>/dist/index.js"]
    }
  }
}
```
