import { PrismaClient, Sale, SaleItem } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateSaleInput {
  customerId: number;
  saleDate: Date;
  totalAmount: number;
  status?: string;
  notes?: string;
}

export interface UpdateSaleInput {
  saleDate?: Date;
  totalAmount?: number;
  status?: string;
  notes?: string;
}

export interface SaleWithItems extends Sale {
  items?: SaleItem[];
  customer?: any;
}

export class SaleRepository {
  /**
   * Create a new sale
   */
  async createSale(data: CreateSaleInput): Promise<Sale> {
    return prisma.sale.create({
      data: {
        customerId: data.customerId,
        saleDate: data.saleDate,
        totalAmount: data.totalAmount,
        status: data.status || 'PENDING',
        notes: data.notes,
        invoiceNumber: `INV-${Date.now()}`, // Auto-generate invoice number
      },
    });
  }

  /**
   * Get a sale by ID with items
   */
  async getSaleById(id: number): Promise<SaleWithItems | null> {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            lot: true,
          },
        },
      },
    });
  }

  /**
   * Get sales with optional filters
   */
  async getSales(filter?: {
    customerId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<SaleWithItems[]> {
    const where: any = {};

    if (filter?.customerId) {
      where.customerId = filter.customerId;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.startDate || filter?.endDate) {
      where.saleDate = {};
      if (filter.startDate) {
        where.saleDate.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.saleDate.lte = filter.endDate;
      }
    }

    return prisma.sale.findMany({
      where,
      orderBy: { saleDate: 'desc' },
      include: {
        customer: true,
        items: {
          include: {
            lot: true,
          },
        },
      },
    });
  }

  /**
   * Get sale count
   */
  async getSaleCount(filter?: {
    customerId?: number;
    status?: string;
  }): Promise<number> {
    const where: any = {};

    if (filter?.customerId) {
      where.customerId = filter.customerId;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    return prisma.sale.count({ where });
  }

  /**
   * Update a sale
   */
  async updateSale(id: number, data: UpdateSaleInput): Promise<Sale> {
    return prisma.sale.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a sale (soft delete via status)
   */
  async deleteSale(id: number): Promise<Sale> {
    return prisma.sale.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Create a sale item (line item in a sale)
   */
  async createSaleItem(data: {
    saleId: number;
    lotId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }): Promise<SaleItem> {
    return prisma.saleItem.create({
      data,
    });
  }

  /**
   * Get sale items for a sale
   */
  async getSaleItems(saleId: number): Promise<SaleItem[]> {
    return prisma.saleItem.findMany({
      where: { saleId },
      include: {
        lot: true,
      },
    });
  }

  /**
   * Delete sale items (for sale cancellation)
   */
  async deleteSaleItems(saleId: number): Promise<{ count: number }> {
    return prisma.saleItem.deleteMany({
      where: { saleId },
    });
  }
}
