import { z } from 'zod';

// PurchaseInput for creating a new purchase
export interface PurchaseInput {
  supplierId: number;
  lotDetails: Array<{
    yarnTypeId: number;
    yarnCountId: number;
    colorId: number;
    netWeight: number;
    quantity: number;
    purchaseCost: number;
    lotNumber?: string;
  }>;
  totalPurchaseCost?: number;
  purchaseDate?: string; // ISO date string
  notes?: string;
}

// UpdatePurchaseInput for updating an existing purchase
export interface UpdatePurchaseInput {
  id: number;
  lotDetails?: Array<{
    yarnTypeId: number;
    yarnCountId: number;
    colorId: number;
    netWeight: number;
    quantity: number;
    purchaseCost: number;
    lotNumber?: string;
  }>;
  totalPurchaseCost?: number;
  purchaseDate?: string;
  notes?: string;
}

// PurchaseSummary for financial and operational summary
export interface PurchaseSummary {
  purchaseId: number;
  totalAmount: number;
  totalQuantity: number;
  totalLots: number;
  supplierId: number;
  purchaseDate: string;
}