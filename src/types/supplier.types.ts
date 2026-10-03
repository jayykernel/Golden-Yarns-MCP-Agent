import { Prisma, Supplier, StockLot, Payment, Expense, Purchase } from '@prisma/client';

export type SupplierWithRelations = Prisma.SupplierGetPayload<{
  include: {
    stockLots: true;
    purchases: true;
    supplierPayments: true;
    suppliedExpenses: true;
  };
}>;

export interface CreateSupplierInput {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive?: boolean;
}

export interface UpdateSupplierInput {
  id: number;
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive?: boolean;
}

export interface GetSuppliersFilter {
  search?: string;
  isActive?: boolean;
  skip?: number;
  take?: number;
}

export interface SupplierFinancialSummary {
  supplierId: number;
  supplierName: string;
  taxId?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  totalPurchases: number;
  totalExpenses: number;
  totalPayments: number;
  outstandingPayable: number;
}

export interface SupplierStatement {
  supplier: {
    id: number;
    name: string;
    contactPerson: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    taxId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  summary: SupplierFinancialSummary;
  purchases: Array<{
    id: number;
    lotNumber: string;
    purchaseDate: Date;
    netWeight: number;
    grossWeight: number;
    purchaseCost: number;
    currentStatus: string;
    notes: string | null;
  }>;
  expenses: Array<{
    id: number;
    description: string;
    expenseDate: Date;
    category: string;
    amount: number;
    status: string;
    notes: string | null;
  }>;
  payments: Array<{
    id: number;
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
    reference: string | null;
    status: string;
    notes: string | null;
  }>;
}
