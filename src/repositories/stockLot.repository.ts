import { PrismaClient, StockLot } from '@prisma/client';
import { StockLotWithRelations, GetStockLotsOptions } from '../types/stockLot.types';

const prisma = new PrismaClient();

export class StockLotRepository {
  /**
   * Create a new stock lot
   */
  async createStockLot(data: {
    lotNumber: string;
    yarnTypeId: number;
    yarnCountId: number;
    colorId: number;
    netWeight: number;
    grossWeight: number;
    quantity?: number;
    unitOfMeasurement?: string;
    purchaseCost: number;
    sellingPrice?: number;
    purchaseDate: Date;
    manufacturingDate?: Date;
    expiryDate?: Date;
    warehouseLocation?: string;
    currentStatus?: string;
    notes?: string;
    supplierId?: number;
  }): Promise<StockLotWithRelations> {
    return prisma.stockLot.create({
      data: {
        lotNumber: data.lotNumber,
        yarnTypeId: data.yarnTypeId,
        yarnCountId: data.yarnCountId,
        colorId: data.colorId,
        netWeight: data.netWeight,
        grossWeight: data.grossWeight,
        quantity: data.quantity ?? 0,
        unitOfMeasurement: data.unitOfMeasurement ?? 'kg',
        purchaseCost: data.purchaseCost,
        sellingPrice: data.sellingPrice,
        purchaseDate: data.purchaseDate,
        manufacturingDate: data.manufacturingDate,
        expiryDate: data.expiryDate,
        warehouseLocation: data.warehouseLocation,
        currentStatus: data.currentStatus || 'IN_STOCK',
        notes: data.notes,
        supplierId: data.supplierId,
      },
      include: {
        yarnType: true,
        yarnCount: true,
        color: true,
        supplier: true,
      }
    });
  }

  /**
   * Get a stock lot by its ID
   */
  async getStockLotById(id: number): Promise<StockLotWithRelations | null> {
    return prisma.stockLot.findUnique({
      where: { id },
      include: {
        yarnType: true,
        yarnCount: true,
        color: true,
        supplier: true,
      }
    });
  }

  /**
   * Get a stock lot by its lot number
   */
  async getStockLotByLotNumber(lotNumber: string): Promise<StockLotWithRelations | null> {
    return prisma.stockLot.findUnique({
      where: { lotNumber },
      include: {
        yarnType: true,
        yarnCount: true,
        color: true,
        supplier: true,
      }
    });
  }

  /**
   * Get all stock lots with optional filtering
   */
  async getStockLots(options: GetStockLotsOptions = {}): Promise<StockLotWithRelations[]> {
    const where: any = {};

    if (options.yarnTypeId !== undefined) where.yarnTypeId = options.yarnTypeId;
    if (options.yarnCountId !== undefined) where.yarnCountId = options.yarnCountId;
    if (options.colorId !== undefined) where.colorId = options.colorId;
    if (options.currentStatus !== undefined) where.currentStatus = options.currentStatus;
    if (options.supplierId !== undefined) where.supplierId = options.supplierId;

    return prisma.stockLot.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { createdAt: 'desc' },
      include: {
        yarnType: true,
        yarnCount: true,
        color: true,
        supplier: true,
      }
    });
  }

  /**
   * Update a stock lot
   */
  async updateStockLot(id: number, data: Partial<{
    lotNumber: string;
    yarnTypeId: number;
    yarnCountId: number;
    colorId: number;
    netWeight: number;
    grossWeight: number;
    quantity: number;
    unitOfMeasurement: string;
    purchaseCost: number;
    sellingPrice: number;
    purchaseDate: Date;
    manufacturingDate: Date;
    expiryDate: Date;
    warehouseLocation: string;
    currentStatus: string;
    notes: string;
    supplierId: number;
  }>): Promise<StockLotWithRelations> {
    return prisma.stockLot.update({
      where: { id },
      data,
      include: {
        yarnType: true,
        yarnCount: true,
        color: true,
        supplier: true,
      }
    });
  }

  /**
   * Delete a stock lot (soft delete by setting status to INACTIVE)
   */
  async deleteStockLot(id: number): Promise<StockLotWithRelations> {
    return prisma.stockLot.update({
      where: { id },
      data: { currentStatus: 'INACTIVE' },
      include: {
        yarnType: true,
        yarnCount: true,
        color: true,
        supplier: true,
      }
    });
  }
}
