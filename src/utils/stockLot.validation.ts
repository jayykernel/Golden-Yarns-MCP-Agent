import { z } from 'zod';

export const createStockLotSchema = z.object({
  lotNumber: z.string().min(1, 'Lot number is required'),
  yarnTypeId: z.number().int().positive('Yarn type ID must be a positive integer'),
  yarnCountId: z.number().int().positive('Yarn count ID must be a positive integer'),
  colorId: z.number().int().positive('Color ID must be a positive integer'),
  netWeight: z.number().positive('Net weight must be greater than 0'),
  grossWeight: z.number().min(0, 'Gross weight must be greater than or equal to 0'),
  quantity: z.number().int().nonnegative('Quantity must be a non-negative integer').optional(),
  unitOfMeasurement: z.string().optional(),
  purchaseCost: z.number().nonnegative('Purchase cost cannot be negative'),
  sellingPrice: z.number().nonnegative('Selling price cannot be negative').optional(),
  purchaseDate: z.string().datetime('Purchase date must be a valid ISO date string'),
  manufacturingDate: z.string().datetime('Manufacturing date must be a valid ISO date string').optional(),
  expiryDate: z.string().datetime('Expiry date must be a valid ISO date string').optional(),
  warehouseLocation: z.string().optional(),
  currentStatus: z.enum(['IN_STOCK', 'SOLD', 'RESERVED', 'IN_TRANSIT', 'DAMAGED', 'INACTIVE']).optional(),
  notes: z.string().optional(),
  supplierId: z.number().int().positive('Supplier ID must be a positive integer').optional(),
});

export const updateStockLotSchema = z.object({
  id: z.number().int().positive('Stock lot ID must be a positive integer'),
  lotNumber: z.string().min(1, 'Lot number is required').optional(),
  yarnTypeId: z.number().int().positive('Yarn type ID must be a positive integer').optional(),
  yarnCountId: z.number().int().positive('Yarn count ID must be a positive integer').optional(),
  colorId: z.number().int().positive('Color ID must be a positive integer').optional(),
  netWeight: z.number().positive('Net weight must be greater than 0').optional(),
  grossWeight: z.number().min(0, 'Gross weight must be greater than or equal to 0').optional(),
  quantity: z.number().int().nonnegative('Quantity must be a non-negative integer').optional(),
  unitOfMeasurement: z.string().optional(),
  purchaseCost: z.number().nonnegative('Purchase cost cannot be negative').optional(),
  sellingPrice: z.number().nonnegative('Selling price cannot be negative').optional(),
  purchaseDate: z.string().datetime('Purchase date must be a valid ISO date string').optional(),
  manufacturingDate: z.string().datetime('Manufacturing date must be a valid ISO date string').optional(),
  expiryDate: z.string().datetime('Expiry date must be a valid ISO date string').optional(),
  warehouseLocation: z.string().optional(),
  currentStatus: z.enum(['IN_STOCK', 'SOLD', 'RESERVED', 'IN_TRANSIT', 'DAMAGED', 'INACTIVE']).optional(),
  notes: z.string().optional(),
  supplierId: z.number().int().positive('Supplier ID must be a positive integer').optional(),
});

export const getStockLotSchema = z.object({
  id: z.number().int().positive('Stock lot ID must be a positive integer').optional(),
  lotNumber: z.string().optional(),
}).refine(
  (data) => data.id !== undefined || data.lotNumber !== undefined,
  { message: 'Either id or lotNumber must be provided' }
);

export const getStockLotsSchema = z.object({
  skip: z.number().int().nonnegative('Skip must be a non-negative integer').optional(),
  take: z.number().int().positive('Take must be a positive integer').optional(),
  yarnTypeId: z.number().int().positive('Yarn type ID must be a positive integer').optional(),
  yarnCountId: z.number().int().positive('Yarn count ID must be a positive integer').optional(),
  colorId: z.number().int().positive('Color ID must be a positive integer').optional(),
  currentStatus: z.enum(['IN_STOCK', 'SOLD', 'RESERVED', 'IN_TRANSIT', 'DAMAGED', 'INACTIVE']).optional(),
  supplierId: z.number().int().positive('Supplier ID must be a positive integer').optional(),
});

export const deleteStockLotSchema = z.object({
  id: z.number().int().positive('Stock lot ID must be a positive integer')
});

export const getAvailableStockSchema = z.object({
  yarnTypeId: z.number().int().positive('Yarn type ID must be a positive integer').optional(),
  yarnCountId: z.number().int().positive('Yarn count ID must be a positive integer').optional(),
  colorId: z.number().int().positive('Color ID must be a positive integer').optional(),
});
