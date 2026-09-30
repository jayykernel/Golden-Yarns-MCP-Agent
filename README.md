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
│   └── stockLot.tools.ts        # MCP tool definitions and handlers
├── services/
│   └── stockLot.service.ts      # Domain business logic and validation
├── repositories/
│   └── stockLot.repository.ts   # Prisma data access layer
├── types/
│   └── stockLot.types.ts        # TypeScript domain and relation types
└── utils/
    └── stockLot.validation.ts   # Zod input validation schemas
```

## Available MCP Tools

- `create_stock_lot` — Create a new stock lot with weight, pricing, and traceability details.
- `get_stock_lot` — Retrieve a stock lot by ID or lot number.
- `get_stock_lots` — Query stock lots with pagination and filters (type, count, color, status, supplier).
- `update_stock_lot` — Update attributes of an existing stock lot.
- `delete_stock_lot` — Soft-delete a stock lot by updating its status to `INACTIVE`.
- `get_available_stock` — List available (`IN_STOCK`, `RESERVED`) inventory with summarized metrics.
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
