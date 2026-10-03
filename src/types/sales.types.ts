import { Customer } from '@prisma/client';

// Sale input for creating sales orders
export interface SaleInput {
  customerId: number;
  lotIds: number[]; // Stock lot IDs being sold
  saleDate?: Date;
  notes?: string;
}

// Update sale input
export interface UpdateSaleInput {
  id?: number;
  saleDate?: Date;
  notes?: string;
  status?: string;
}

// Sale summary for reporting
export interface SaleSummary {
  id: number;
  customerId: number;
  totalAmount: number;
  status: string;
  saleDate: Date;
  notes?: string;
  customerName?: string;
}

// Create sale input for MCP tool handlers
export interface CreateSaleInput {
  customerId: number;
  lotDetails: Array<{
    lotId: number;
    yarnTypeId: number;
    yarnCountId: number;
    colorId: number;
    quantity: number;
    sellingPrice: number;
  }>;
  saleDate?: Date;
  notes?: string;
}

// Sale status options
export const SaleStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const;

export type SaleStatusValue = typeof SaleStatus[keyof typeof SaleStatus];