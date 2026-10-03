import { z } from 'zod';

// PurchaseInput schema for validation
export const purchaseInputSchema = z.object({
  supplierId: z.number().int().positive('Supplier ID must be a positive integer'),
  lotDetails: z.array(
    z.object({
      yarnTypeId: z.number().int().positive('Yarn type ID must be a positive integer'),
      yarnCountId: z.number().int().positive('Yarn count ID must be a positive integer'),
      colorId: z.number().int().positive('Color ID must be a positive integer'),
      netWeight: z.number().positive('Net weight must be positive'),
      quantity: z.number().int().positive('Quantity must be a positive integer'),
      purchaseCost: z.number().nonnegative('Purchase cost cannot be negative'),
      lotNumber: z.string().optional(),
    })
  ).nonempty('At least one lot detail is required'),
  totalPurchaseCost: z.number().nonnegative().optional(),
  purchaseDate: z.string().datetime('Purchase date must be a valid ISO date string').optional(),
  notes: z.string().optional(),
});

// UpdatePurchaseInput schema for validation
export const updatePurchaseSchema = z.object({
  id: z.number().int().positive('Purchase ID must be a positive integer'),
  lotDetails: z.array(
    z.object({
      yarnTypeId: z.number().int().positive('Yarn type ID must be a positive integer').optional(),
      yarnCountId: z.number().int().positive('Yarn count ID must be a positive integer').optional(),
      colorId: z.number().int().positive('Color ID must be a positive integer').optional(),
      netWeight: z.number().positive('Net weight must be positive').optional(),
      quantity: z.number().int().positive('Quantity must be a positive integer').optional(),
      purchaseCost: z.number().nonnegative('Purchase cost cannot be negative').optional(),
      lotNumber: z.string().optional(),
    })
  ).optional(),
  totalPurchaseCost: z.number().nonnegative().optional(),
  purchaseDate: z.string().datetime('Purchase date must be a valid ISO date string').optional(),
  notes: z.string().optional(),
});

// GetPurchaseSchema for validation
export const getPurchaseSchema = z.object({
  id: z.number().int().positive('Purchase ID must be a positive integer'),
});

// ListPurchasesSchema for validation
export const listPurchasesSchema = z.object({
  supplierId: z.number().int().positive('Supplier ID must be a positive integer').optional(),
  status: z.string().optional(),
  startDate: z.string().datetime('Start date must be a valid ISO date string').optional(),
  endDate: z.string().datetime('End date must be a valid ISO date string').optional(),
});

// PurchaseSummary schema (for reference)
export const purchaseSummarySchema = z.object({
  purchaseId: z.number().int().positive(),
  totalAmount: z.number(),
  totalQuantity: z.number(),
  totalLots: z.number(),
  supplierId: z.number().int().positive(),
  purchaseDate: z.string().datetime(),
});
