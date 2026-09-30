import { Prisma, Customer, Sale, Payment } from '@prisma/client';

export type CustomerWithRelations = Prisma.CustomerGetPayload<{
  include: {
    sales: true;
    payments: true;
  };
}>;

export interface CreateCustomerInput {
  name: string;
  contactPerson?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number;
}

export interface UpdateCustomerInput {
  id: number;
  name?: string;
  contactPerson?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number;
}

export interface GetCustomersFilter {
  search?: string;
  isActive?: boolean;
  skip?: number;
  take?: number;
}

export interface CustomerSummary {
  customerId: number;
  customerName: string;
  company?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  taxId?: string | null;
  creditLimit?: number | null;
  totalSales: number;
  totalPayments: number;
  outstandingReceivable: number;
}

export interface CustomerStatement {
  customer: {
    id: number;
    name: string;
    contactPerson: string | null;
    company: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    taxId: string | null;
    creditLimit: number | null;
    createdAt: Date;
    updatedAt: Date;
  };
  summary: CustomerSummary;
  sales: Array<{
    id: number;
    invoiceNumber: string;
    saleDate: Date;
    dueDate: Date | null;
    totalAmount: number;
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