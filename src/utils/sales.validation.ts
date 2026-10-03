import { z } from 'zod';
import { createCustomerSchema, updateCustomerSchema } from './customer.validation';

// Schema for creating a sale
export const createSaleSchema = z.object({
  customerId: z.number().int().positive('Customer ID must be a positive integer'),
  lotDetails: z
    .array(
      z.object({
        lotId: z.number().int().positive('Lot ID must be a positive integer'),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
        sellingPrice: z.number().nonnegative('Selling price must be non-negative'),
      })
    )
    .nonempty('At least one lot detail is required'),
  saleDate: z.date().optional(),
  notes: z.string().optional(),
});

// Schema for updating a sale
export const updateSaleSchema = z.object({
  saleDate: z.date().optional(),
  notes: z.string().optional(),
  status: z
    .enum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'])
    .optional(),
});

// Schema for listing sales with filters
export const listSalesSchema = z.object({
  customerId: z.number().int().positive().optional(),
  status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// Schema for getting a sale by ID
export const getSaleSchema = z.object({
  id: z.number().int().positive('Sale ID must be a positive integer'),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;
export type ListSalesInput = z.infer<typeof listSalesSchema>;
export type GetSaleInput = z.infer<typeof getSaleSchema>;