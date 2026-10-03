import { SaleService } from '../services/sales.service';
import { createSaleSchema, listSalesSchema, getSaleSchema } from '../utils/sales.validation';

const saleService = new SaleService();

export const salesTools = {
  createSale: {
    name: 'create_sale',
    description: 'Create a new sale order with items, automatically recording stock OUT movements',
    inputSchema: {
      type: 'object' as const,
      properties: {
        customerId: {
          type: 'number',
          description: 'Customer ID',
        },
        lotDetails: {
          type: 'array',
          description: 'Array of lot details being sold',
          items: {
            type: 'object',
            properties: {
              lotId: {
                type: 'number',
                description: 'Stock lot ID',
              },
              quantity: {
                type: 'number',
                description: 'Quantity to sell (in kg or units)',
              },
              sellingPrice: {
                type: 'number',
                description: 'Selling price per unit',
              },
            },
            required: ['lotId', 'quantity', 'sellingPrice'],
          },
        },
        saleDate: {
          type: 'string',
          description: 'Sale date (ISO 8601 format, optional)',
        },
        notes: {
          type: 'string',
          description: 'Additional notes (optional)',
        },
      },
      required: ['customerId', 'lotDetails'],
    },
    handler: async (input: any) => {
      try {
        const result = await saleService.createSale(input);

        if (!result.success) {
          return {
            content: [{ type: 'text' as const, text: JSON.stringify({ success: false, message: result.message }) }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ success: false, message: 'Error creating sale' }) }],
          isError: true,
        };
      }
    },
  },

  getSale: {
    name: 'get_sale',
    description: 'Retrieve detailed information for a sale by ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'number',
          description: 'Sale ID',
        },
      },
      required: ['id'],
    },
    handler: async (input: any) => {
      try {
        const validated = getSaleSchema.parse(input);
        const result = await saleService.getSale(validated.id);

        if (!result.success) {
          return {
            content: [{ type: 'text' as const, text: JSON.stringify({ success: false, message: result.message }) }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ success: false, message: 'Invalid input' }) }],
          isError: true,
        };
      }
    },
  },

  listSales: {
    name: 'list_sales',
    description: 'List sales with optional filtering by customer, status, and date range',
    inputSchema: {
      type: 'object' as const,
      properties: {
        customerId: {
          type: 'number',
          description: 'Filter by customer ID (optional)',
        },
        status: {
          type: 'string',
          enum: ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'],
          description: 'Filter by sale status (optional)',
        },
        startDate: {
          type: 'string',
          description: 'Start date filter (ISO 8601 format, optional)',
        },
        endDate: {
          type: 'string',
          description: 'End date filter (ISO 8601 format, optional)',
        },
      },
    },
    handler: async (input: any) => {
      try {
        const result = await saleService.listSales(input);

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ success: false, message: 'Error listing sales' }) }],
          isError: true,
        };
      }
    },
  },

  cancelSale: {
    name: 'cancel_sale',
    description: 'Cancel a sale and reverse stock OUT movements',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'number',
          description: 'Sale ID to cancel',
        },
      },
      required: ['id'],
    },
    handler: async (input: any) => {
      try {
        const validated = getSaleSchema.parse(input);
        const result = await saleService.cancelSale(validated.id);

        if (!result.success) {
          return {
            content: [{ type: 'text' as const, text: JSON.stringify({ success: false, message: result.message }) }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ success: false, message: 'Invalid input' }) }],
          isError: true,
        };
      }
    },
  },
};
