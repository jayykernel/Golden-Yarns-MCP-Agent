import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  contactPerson: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.number().nonnegative('Credit limit must be a non-negative number').optional(),
  isActive: z.boolean().optional(),
});

export const getCustomerSchema = z.object({
  id: z.number().int().positive('Customer ID must be a positive integer'),
});

export const updateCustomerSchema = z.object({
  id: z.number().int().positive('Customer ID must be a positive integer'),
  name: z.string().min(2, 'Customer name must be at least 2 characters').optional(),
  contactPerson: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.number().nonnegative('Credit limit must be a non-negative number').optional(),
  isActive: z.boolean().optional(),
});

export const listCustomersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  skip: z.number().int().nonnegative('Skip must be a non-negative integer').optional(),
  take: z.number().int().positive('Take must be a positive integer').optional(),
});

export const setCustomerStatusSchema = z.object({
  id: z.number().int().positive('Customer ID must be a positive integer'),
  isActive: z.boolean(),
});

export const getCustomerStatementSchema = z.object({
  customerId: z.number().int().positive('Customer ID must be a positive integer'),
  startDate: z.string().datetime('Start date must be a valid ISO date string').optional(),
  endDate: z.string().datetime('End date must be a valid ISO date string').optional(),
});