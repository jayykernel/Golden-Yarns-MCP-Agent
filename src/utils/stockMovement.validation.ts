import { z } from 'zod';

export const recordStockMovementSchema = z.object({
  lotId: z.number().int().positive('Lot ID must be a positive integer'),
  movementType: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN', 'TRANSFER']),
  quantity: z.number().positive('Quantity must be greater than 0'),
  referenceId: z.string().optional(),
  referenceType: z.enum(['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'TRANSFER', 'MANUAL']).optional(),
  movementDate: z.string().datetime('Movement date must be a valid ISO date string').optional(),
  notes: z.string().optional(),
});

export const adjustStockLotSchema = z.object({
  lotId: z.number().int().positive('Lot ID must be a positive integer'),
  newNetWeight: z.number().nonnegative('New net weight cannot be negative'),
  newGrossWeight: z.number().nonnegative('New gross weight cannot be negative').optional(),
  reason: z.string().min(3, 'Reason for adjustment must be at least 3 characters'),
  referenceId: z.string().optional(),
  movementDate: z.string().datetime('Movement date must be a valid ISO date string').optional(),
});

export const getLotMovementsSchema = z.object({
  lotId: z.number().int().positive('Lot ID must be a positive integer'),
});

export const getMovementHistorySchema = z.object({
  lotId: z.number().int().positive('Lot ID must be a positive integer').optional(),
  movementType: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN', 'TRANSFER']).optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  startDate: z.string().datetime('Start date must be a valid ISO date string').optional(),
  endDate: z.string().datetime('End date must be a valid ISO date string').optional(),
  skip: z.number().int().nonnegative('Skip must be a non-negative integer').optional(),
  take: z.number().int().positive('Take must be a positive integer').optional(),
});
