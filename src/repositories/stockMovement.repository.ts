import { PrismaClient, StockMovement } from '@prisma/client';
import {
  StockMovementWithLot,
  RecordMovementInput,
  GetMovementsFilter,
  MovementType,
} from '../types/stockMovement.types';
import { StockLotWithRelations } from '../types/stockLot.types';

const prisma = new PrismaClient();

export class StockMovementRepository {
  /**
   * Execute atomic transaction to record a stock movement and update the associated lot balance
   */
  async recordMovementAndUpdateLot(params: {
    lotId: number;
    movementType: MovementType;
    quantity: number;
    newNetWeight: number;
    newGrossWeight?: number;
    newStatus?: string;
    referenceId?: string;
    referenceType?: string;
    movementDate?: Date;
    notes?: string;
  }): Promise<{ movement: StockMovementWithLot; updatedLot: StockLotWithRelations }> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the stock movement entry
      const movement = await tx.stockMovement.create({
        data: {
          lotId: params.lotId,
          movementType: params.movementType,
          quantity: params.quantity,
          referenceId: params.referenceId,
          referenceType: params.referenceType,
          movementDate: params.movementDate || new Date(),
          notes: params.notes,
        },
        include: {
          lot: {
            include: {
              yarnType: true,
              yarnCount: true,
              color: true,
              supplier: true,
            },
          },
        },
      });

      // 2. Update the lot with new balance and status
      const updateData: any = {
        netWeight: params.newNetWeight,
      };

      if (params.newGrossWeight !== undefined) {
        updateData.grossWeight = params.newGrossWeight;
      }

      if (params.newStatus !== undefined) {
        updateData.currentStatus = params.newStatus;
      }

      const updatedLot = await tx.stockLot.update({
        where: { id: params.lotId },
        data: updateData,
        include: {
          yarnType: true,
          yarnCount: true,
          color: true,
          supplier: true,
        },
      });

      return { movement, updatedLot };
    });
  }

  /**
   * Retrieve all movements for a specific stock lot
   */
  async getMovementsByLotId(lotId: number): Promise<StockMovementWithLot[]> {
    return prisma.stockMovement.findMany({
      where: { lotId },
      orderBy: { movementDate: 'desc' },
      include: {
        lot: {
          include: {
            yarnType: true,
            yarnCount: true,
            color: true,
            supplier: true,
          },
        },
      },
    });
  }

  /**
   * Retrieve movements with filtering and pagination
   */
  async getMovementHistory(filters: GetMovementsFilter = {}): Promise<StockMovementWithLot[]> {
    const where: any = {};

    if (filters.lotId !== undefined) where.lotId = filters.lotId;
    if (filters.movementType !== undefined) where.movementType = filters.movementType;
    if (filters.referenceType !== undefined) where.referenceType = filters.referenceType;
    if (filters.referenceId !== undefined) where.referenceId = filters.referenceId;

    if (filters.startDate || filters.endDate) {
      where.movementDate = {};
      if (filters.startDate) where.movementDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.movementDate.lte = new Date(filters.endDate);
    }

    return prisma.stockMovement.findMany({
      where,
      skip: filters.skip,
      take: filters.take,
      orderBy: { movementDate: 'desc' },
      include: {
        lot: {
          include: {
            yarnType: true,
            yarnCount: true,
            color: true,
            supplier: true,
          },
        },
      },
    });
  }

  /**
   * Count movements matching filter criteria
   */
  async getMovementCount(filters: GetMovementsFilter = {}): Promise<number> {
    const where: any = {};

    if (filters.lotId !== undefined) where.lotId = filters.lotId;
    if (filters.movementType !== undefined) where.movementType = filters.movementType;
    if (filters.referenceType !== undefined) where.referenceType = filters.referenceType;
    if (filters.referenceId !== undefined) where.referenceId = filters.referenceId;

    if (filters.startDate || filters.endDate) {
      where.movementDate = {};
      if (filters.startDate) where.movementDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.movementDate.lte = new Date(filters.endDate);
    }

    return prisma.stockMovement.count({ where });
  }

  /**
   * Get single stock lot with its movements for reconciliation
   */
  async getLotWithMovements(lotId: number): Promise<(StockLotWithRelations & { movements: StockMovement[] }) | null> {
    return prisma.stockLot.findUnique({
      where: { id: lotId },
      include: {
        yarnType: true,
        yarnCount: true,
        color: true,
        supplier: true,
        movements: {
          orderBy: { movementDate: 'asc' },
        },
      },
    });
  }
}
