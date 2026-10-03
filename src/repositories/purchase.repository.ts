import { PrismaClient, Purchase } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreatePurchaseInput {
  supplierId: number;
  purchaseDate: Date;
  totalAmount: number;
  status?: string;
  notes?: string;
}

export interface UpdatePurchaseInput {
  supplierId?: number;
  purchaseDate?: Date;
  totalAmount?: number;
  status?: string;
  notes?: string;
}

export class PurchaseRepository {
  /**
   * Create a new purchase
   */
  async createPurchase(data: CreatePurchaseInput): Promise<Purchase> {
    return prisma.purchase.create({
      data: {
        supplierId: data.supplierId,
        purchaseDate: data.purchaseDate,
        totalAmount: data.totalAmount,
        status: data.status || 'PENDING',
        notes: data.notes,
      },
    });
  }

  /**
   * Get a purchase by ID
   */
  async getPurchaseById(id: number): Promise<Purchase | null> {
    return prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            lot: true,
          },
        },
      },
    });
  }

  /**
   * Get purchases with optional filters
   */
  async getPurchases(filter?: {
    supplierId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Purchase[]> {
    const where: any = {};

    if (filter?.supplierId) {
      where.supplierId = filter.supplierId;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.startDate || filter?.endDate) {
      where.purchaseDate = {};
      if (filter.startDate) {
        where.purchaseDate.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.purchaseDate.lte = filter.endDate;
      }
    }

    return prisma.purchase.findMany({
      where,
      orderBy: { purchaseDate: 'desc' },
      include: {
        supplier: true,
        items: {
          include: {
            lot: true,
          },
        },
      },
    });
  }

  /**
   * Get purchase count
   */
  async getPurchaseCount(filter?: {
    supplierId?: number;
    status?: string;
  }): Promise<number> {
    const where: any = {};

    if (filter?.supplierId) {
      where.supplierId = filter.supplierId;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    return prisma.purchase.count({ where });
  }

  /**
   * Update a purchase
   */
  async updatePurchase(id: number, data: UpdatePurchaseInput): Promise<Purchase> {
    return prisma.purchase.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a purchase
   */
  async deletePurchase(id: number): Promise<Purchase> {
    return prisma.purchase.delete({
      where: { id },
    });
  }
}
