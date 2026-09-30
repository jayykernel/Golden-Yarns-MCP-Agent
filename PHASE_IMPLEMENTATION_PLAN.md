# Golden Yarns Business Management System — Phase Implementation Plan

This document serves as the single source of truth for the progressive development of the Golden Yarns business management system, spanning core inventory, trading, billing, accounting, analytics, UI, AI integration, and production operations.

## Architectural Principles
- **Modular Monolith**: Clean layered architecture (Repositories -> Services -> MCP / REST APIs -> Frontend).
- **Shared Business Logic**: The MCP Server and Application API share identical business services, validations, and calculations.
- **Traceability**: All inventory movements are lot-based and fully traceable from purchase to sales and returns.
- **Integrity**: Strict transactional safety, prevention of negative stock, and idempotent operations.

---

## Phase Overview & Status

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Foundation & Stock Lot Management | **COMPLETED** |
| **Phase 2** | Stock Movement Management | **COMPLETED** |
| **Phase 3** | Supplier Management | **COMPLETED** |
| **Phase 4** | Customer Management | **PENDING** |
| **Phase 5** | Purchase Management | **PENDING** |
| **Phase 6** | Sales Management | **PENDING** |
| **Phase 7** | Billing and Invoicing | **PENDING** |
| **Phase 8** | Payment Management | **PENDING** |
| **Phase 9** | Expense Management | **PENDING** |
| **Phase 10** | Financial Management | **PENDING** |
| **Phase 11** | Sales Analytics | **PENDING** |
| **Phase 12** | Inventory Analytics | **PENDING** |
| **Phase 13** | Business Dashboard | **PENDING** |
| **Phase 14** | User-Facing Application (React/TypeScript) | **PENDING** |
| **Phase 15** | Authentication and Roles | **PENDING** |
| **Phase 16** | Audit and Business Safety | **PENDING** |
| **Phase 17** | Reporting and Export | **PENDING** |
| **Phase 18** | AI and MCP Intelligence | **PENDING** |
| **Phase 19** | Production Database | **PENDING** |
| **Phase 20** | Deployment and Operations | **PENDING** |

---

## Detailed Phase Requirements

### Phase 1: Foundation & Stock Lot Management (COMPLETED)
- Initial database models: `YarnType`, `YarnCount`, `Color`, `StockLot`.
- Repository, Validation, Service, and MCP tools for Stock Lots.
- Full lot-level metadata (net/gross weight, costs, status).

### Phase 2: Stock Movement Management
- **Operations**: Stock IN, Stock OUT, Stock ADJUSTMENT, Stock RETURN, Stock TRANSFER.
- **Engine Rules**:
  - Atomic database transactions.
  - Strict negative stock prevention.
  - Automatic lot balance updates and movement logging.
  - Movement history tracking and verification against lot net weight.
- **Interfaces**: Domain Types, Validation schemas, Repository, Service, MCP tools (`record_stock_movement`, `get_lot_movements`, `get_movement_history`, `adjust_stock_lot`).

### Phase 3: Supplier Management
- **Operations**: Create, retrieve, update, search, and list suppliers.
- **Financial Details**: Tax ID, contact info, supplier purchase history, payable balance, payment history.
- **Interfaces**: Repository, Service, MCP tools (`create_supplier`, `get_supplier`, `list_suppliers`, `update_supplier`, `get_supplier_statement`).

### Phase 4: Customer Management
- **Operations**: Create, retrieve, update, search, list customers.
- **Financial Details**: Credit limit, contact info, sales history, outstanding receivables, customer statement.
- **Interfaces**: Repository, Service, MCP tools (`create_customer`, `get_customer`, `list_customers`, `update_customer`, `get_customer_statement`).

### Phase 5: Purchase Management
- **Operations**: Create purchase orders / receipts, link to supplier, generate stock lots automatically, record Stock IN movements atomically.
- **Cost Calculations**: Total purchase amount, unit rates, supplier payable integration.
- **Interfaces**: Repository, Service, MCP tools (`create_purchase`, `get_purchase`, `list_purchases`).

### Phase 6: Sales Management
- **Operations**: Create sales orders, select available stock lots, deduct inventory (Stock OUT movement), validate sufficient stock, prevent over-allocation.
- **Interfaces**: Repository, Service, MCP tools (`create_sale`, `get_sale`, `list_sales`, `cancel_sale`).

### Phase 7: Billing and Invoicing
- **Operations**: Generate professional invoices for sales, track invoice status (`PENDING`, `PARTIAL`, `PAID`, `CANCELLED`, `OVERDUE`), calculate subtotal, taxes, due dates.
- **Interfaces**: Invoice generation service, retrieval, export helpers.

### Phase 8: Payment Management
- **Operations**: Customer payments (reduces receivable against sales/invoices), Supplier payments (reduces payable), partial & multi-invoice allocations, payment methods (Cash, Bank Transfer, Cheque, UPI).
- **Interfaces**: Payment Repository, Service, MCP tools (`record_payment`, `get_payments`, `get_outstanding_balances`).

### Phase 9: Expense Management
- **Operations**: Record operational business expenses (Rent, Electricity, Labour, Transport, Maintenance, Salaries), category tracking, supplier links.
- **Interfaces**: Expense Repository, Service, MCP tools (`record_expense`, `list_expenses`, `get_expense_summary`).

### Phase 10: Financial Management
- **Calculations**: Revenue, Cost of Goods Sold (COGS), Gross Profit, Operating Expenses, Net Profit, Receivables, Payables, Cash Flow summary.
- **Interfaces**: Financial calculation service, P&L reports, MCP tools (`get_financial_overview`, `get_profit_loss_statement`).

### Phase 11: Sales Analytics
- **Analytics**: Sales volume (weight, packages), revenue trends, period comparisons (daily, weekly, monthly, YoY), top selling yarn types, counts, colours, and customers.
- **Interfaces**: Analytics Service, MCP tools (`get_sales_analytics`).

### Phase 12: Inventory Analytics
- **Analytics**: Stock valuation, stock breakdown by yarn type/count/colour, aging inventory analysis, slow-moving items, low-stock reorder warnings.
- **Interfaces**: Inventory Analytics Service, MCP tools (`get_inventory_analytics`).

### Phase 13: Business Dashboard
- **Features**: Aggregated executive overview: Today's sales, stock on hand, inventory valuation, total receivables/payables, recent transactions, stock alerts.
- **Interfaces**: Dashboard API / Service, MCP tools (`get_business_dashboard`).

### Phase 14: User-Facing Application
- **Frontend Stack**: Modern React + TypeScript Single Page Application.
- **Pages**: Dashboard, Inventory, Movements, Purchases, Sales, Invoices, Customers, Suppliers, Payments, Expenses, Finance, Analytics, Settings.
- **API Server**: Express/REST API serving data to frontend, reusing the shared domain services.

### Phase 15: Authentication & Roles
- **Security**: JWT-based authentication, user roles (`Admin`, `Manager`, `Accounts`, `Sales`, `Inventory`), granular permissions.

### Phase 16: Audit & Business Safety
- **Auditing**: Audit logging for critical transactions (stock adjustments, cancellations, payments, price edits), concurrency controls, idempotency checks.

### Phase 17: Reporting & Export
- **Reporting Engine**: CSV, Excel, and printable PDF generation for Stock Reports, Sales Invoices, Customer/Supplier Statements, and P&L Statements.

### Phase 18: AI & MCP Intelligence
- **Natural Language Tooling**: Advanced MCP tools for multi-step AI business queries and operations with safety validation.

### Phase 19: Production Database
- **Scalability**: PostgreSQL migration compatibility, connection pooling, indexing optimization.

### Phase 20: Deployment & Operations
- **Production Readiness**: Docker containerization, CI/CD configuration, environment secrets management, automated backup scripts, healthcheck endpoints.
