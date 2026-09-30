import { Prisma, StockMovement } from '@prisma/client';
import { StockLotWithRelations } from './stockLot.types';

export type StockMovementWithLot = Prisma.StockMovementGetPayload<{
  include: {
    lot: {
      include: {
        yarnType: true;
        yarnCount: true;
        color: true;
        supplier: true;
      };
    };
  };
}>;

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER';
export type MovementReferenceType = 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER' | 'MANUAL';

export interface RecordMovementInput {
  lotId: number;
  movementType: MovementType;
  quantity: number; // in kg
  referenceId?: string;
  referenceType?: MovementReferenceType;
  movementDate?: Date | string;
  notes?: string;
}

export interface AdjustStockInput {
  lotId: number;
  newNetWeight: number; // target net weight in kg
  newGrossWeight?: number;
  reason: string;
  referenceId?: string;
  movementDate?: Date | string;
}

export interface GetMovementsFilter {
  lotId?: number;
  movementType?: MovementType;
  referenceType?: string;
  referenceId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  skip?: number;
  take?: number;
}

export interface LotBalanceSummary {
  lotId: number;
  lotNumber: string;
  initialWeight: number;
  currentNetWeight: number;
  currentGrossWeight: number;
  status: string;
  totalIn: number;
  totalOut: number;
  totalAdjustments: number;
  totalReturns: number;
  computedBalance: number;
  isConsistent: boolean;
}
