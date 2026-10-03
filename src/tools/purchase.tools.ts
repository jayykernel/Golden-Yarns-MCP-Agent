import { z } from 'zod';
import { PurchaseService } from '../services/purchase.service';
import {
  purchaseInputSchema,
  updatePurchaseSchema,
  getPurchaseSchema,
  listPurchasesSchema,
} from '../utils/purchase.validation';

const purchaseService = new PurchaseService();

export const purchaseTools = {
  createPurchase: {
    name: 'create_purchase',
    description: 'Create a new purchase order with lot details',
    inputSchema: purchaseInputSchema.shape,
    handler: async (args: z.infer<typeof purchaseInputSchema>) => {
      try {
        const validatedData = purchaseInputSchema.parse(args);
        const result = await purchaseService.createPurchase(validatedData);

        if (!result.success) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: result.message }, null, 2) }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, message: result.message, data: result.data }, null, 2) }],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Validation failed', errors: error.errors }, null, 2) }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Internal server error' }, null, 2) }],
          isError: true,
        };
      }
    },
  },

  getPurchase: {
    name: 'get_purchase',
    description: 'Retrieve detailed information for a purchase by ID',
    inputSchema: getPurchaseSchema.shape,
    handler: async (args: z.infer<typeof getPurchaseSchema>) => {
      try {
        const validatedArgs = getPurchaseSchema.parse(args);
        const result = await purchaseService.getPurchase(validatedArgs.id);

        if (!result.success) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: result.message }, null, 2) }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Purchase retrieved successfully', data: result.data }, null, 2) }],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Validation failed', errors: error.errors }, null, 2) }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Internal server error' }, null, 2) }],
          isError: true,
        };
      }
    },
  },

  listPurchases: {
    name: 'list_purchases',
    description: 'List purchases with optional filtering',
    inputSchema: listPurchasesSchema.shape,
    handler: async (args: z.infer<typeof listPurchasesSchema>) => {
      try {
        const validatedArgs = listPurchasesSchema.parse(args);
        const result = await purchaseService.listPurchases(validatedArgs);

        if (!result.success) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: result.message }, null, 2) }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Purchases retrieved successfully', data: result.data }, null, 2) }],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Validation failed', errors: error.errors }, null, 2) }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Internal server error' }, null, 2) }],
          isError: true,
        };
      }
    },
  },
};

export const allPurchaseTools = Object.values(purchaseTools);