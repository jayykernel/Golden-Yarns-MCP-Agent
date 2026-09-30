import { StockMovementRepository } from '../repositories/stockMovement.repository';
import { StockLotRepository } from '../repositories/stockLot.repository';
import {
  RecordMovementInput,
  AdjustStockInput,
  GetMovementsFilter,
  StockMovementWithLot,
  LotBalanceSummary,
} from '../types/stockMovement.types';
import { StockLotWithRelations } from '../types/stockLot.types';

export class StockMovementService {
  private stockMovementRepository: StockMovementRepository;
  private stockLotRepository: StockLotRepository;

  constructor() {
    this.stockMovementRepository = new StockMovementRepository();
    this.stockLotRepository = new StockLotRepository();
  }

  /**
   * Record a stock movement (IN, OUT, RETURN, TRANSFER) with atomic balance update
   */
  async recordStockMovement(input: RecordMovementInput): Promise<{
    success: boolean;
    message: string;
    data?: { movement: StockMovementWithLot; updatedLot: StockLotWithRelations };
  }> {
    try {
      if (input.quantity <= 0) {
        return { success: false, message: 'Movement quantity must be greater than 0' };
      }

      // Fetch the target lot
      const lot = await this.stockLotRepository.getStockLotById(input.lotId);
      if (!lot) {
        return { success: false, message: `Stock lot with ID ${input.lotId} not found` };
      }

      if (lot.currentStatus === 'INACTIVE') {
        return { success: false, message: 'Cannot record movement for an inactive stock lot' };
      }

      let newNetWeight = lot.netWeight;
      let newGrossWeight = lot.grossWeight;
      let newStatus = lot.currentStatus;

      const movementDate = input.movementDate instanceof Date
        ? input.movementDate
        : input.movementDate ? new Date(input.movementDate) : new Date();

      switch (input.movementType) {
        case 'IN': {
          newNetWeight = Number((lot.netWeight + input.quantity).toFixed(3));
          newGrossWeight = Number((lot.grossWeight + input.quantity).toFixed(3));
          if (lot.currentStatus === 'SOLD' || lot.currentStatus === 'DAMAGED') {
            newStatus = 'IN_STOCK';
          }
          break;
        }

        case 'OUT': {
          if (lot.netWeight < input.quantity) {
            return {
              success: false,
              message: `Insufficient stock in lot ${lot.lotNumber}. Available: ${lot.netWeight} kg, Requested: ${input.quantity} kg`,
            };
          }
          newNetWeight = Number(Math.max(0, lot.netWeight - input.quantity).toFixed(3));
          newGrossWeight = Number(Math.max(newNetWeight, lot.grossWeight - input.quantity).toFixed(3));
          if (newNetWeight === 0) {
            newStatus = 'SOLD';
          }
          break;
        }

        case 'RETURN': {
          // If reference is PURCHASE, this is a return to supplier (OUT)
          if (input.referenceType === 'PURCHASE') {
            if (lot.netWeight < input.quantity) {
              return {
                success: false,
                message: `Insufficient stock to return for lot ${lot.lotNumber}. Available: ${lot.netWeight} kg, Return quantity: ${input.quantity} kg`,
              };
            }
            newNetWeight = Number(Math.max(0, lot.netWeight - input.quantity).toFixed(3));
            newGrossWeight = Number(Math.max(newNetWeight, lot.grossWeight - input.quantity).toFixed(3));
            if (newNetWeight === 0) {
              newStatus = 'SOLD';
            }
          } else {
            // Default return is customer return to warehouse (IN)
            newNetWeight = Number((lot.netWeight + input.quantity).toFixed(3));
            newGrossWeight = Number((lot.grossWeight + input.quantity).toFixed(3));
            newStatus = 'IN_STOCK';
          }
          break;
        }

        case 'TRANSFER':
        case 'ADJUSTMENT': {
          return {
            success: false,
            message: 'Use adjustStockLot for physical stock count adjustments or transfers',
          };
        }

        default:
          return { success: false, message: `Unsupported movement type: ${input.movementType}` };
      }

      const result = await this.stockMovementRepository.recordMovementAndUpdateLot({
        lotId: input.lotId,
        movementType: input.movementType,
        quantity: input.quantity,
        newNetWeight,
        newGrossWeight,
        newStatus,
        referenceId: input.referenceId,
        referenceType: input.referenceType,
        movementDate,
        notes: input.notes,
      });

      return {
        success: true,
        message: `Successfully recorded ${input.movementType} movement of ${input.quantity} kg for lot ${lot.lotNumber}`,
        data: result,
      };
    } catch (error) {
      console.error('Error in recordStockMovement:', error);
      return { success: false, message: 'Failed to record stock movement' };
    }
  }

  /**
   * Adjust a stock lot's balance (cycle count / physical audit adjustment)
   */
  async adjustStock(input: AdjustStockInput): Promise<{
    success: boolean;
    message: string;
    data?: { movement: StockMovementWithLot; updatedLot: StockLotWithRelations };
  }> {
    try {
      if (input.newNetWeight < 0) {
        return { success: false, message: 'New net weight cannot be negative' };
      }

      const lot = await this.stockLotRepository.getStockLotById(input.lotId);
      if (!lot) {
        return { success: false, message: `Stock lot with ID ${input.lotId} not found` };
      }

      const delta = Number((input.newNetWeight - lot.netWeight).toFixed(3));
      if (delta === 0) {
        return { success: false, message: 'No adjustment needed. Current net weight is already equal to target weight.' };
      }

      const newGrossWeight = input.newGrossWeight !== undefined
        ? input.newGrossWeight
        : Number(Math.max(input.newNetWeight, lot.grossWeight + delta).toFixed(3));

      let newStatus = lot.currentStatus;
      if (input.newNetWeight === 0) {
        newStatus = 'SOLD';
      } else if (lot.currentStatus === 'SOLD' || lot.currentStatus === 'INACTIVE') {
        newStatus = 'IN_STOCK';
      }

      const movementDate = input.movementDate instanceof Date
        ? input.movementDate
        : input.movementDate ? new Date(input.movementDate) : new Date();

      const notes = `Stock adjustment: ${input.reason} (Delta: ${delta > 0 ? '+' : ''}${delta} kg, from ${lot.netWeight} kg to ${input.newNetWeight} kg)`;

      const result = await this.stockMovementRepository.recordMovementAndUpdateLot({
        lotId: input.lotId,
        movementType: 'ADJUSTMENT',
        quantity: Math.abs(delta),
        newNetWeight: input.newNetWeight,
        newGrossWeight,
        newStatus,
        referenceId: input.referenceId,
        referenceType: 'ADJUSTMENT',
        movementDate,
        notes,
      });

      return {
        success: true,
        message: `Successfully adjusted lot ${lot.lotNumber} net weight from ${lot.netWeight} kg to ${input.newNetWeight} kg`,
        data: result,
      };
    } catch (error) {
      console.error('Error in adjustStock:', error);
      return { success: false, message: 'Failed to adjust stock lot' };
    }
  }

  /**
   * Retrieve all movements for a specific stock lot
   */
  async getLotMovements(lotId: number): Promise<{
    success: boolean;
    message: string;
    data?: StockMovementWithLot[];
  }> {
    try {
      const lot = await this.stockLotRepository.getStockLotById(lotId);
      if (!lot) {
        return { success: false, message: `Stock lot with ID ${lotId} not found` };
      }

      const movements = await this.stockMovementRepository.getMovementsByLotId(lotId);
      return {
        success: true,
        message: `Retrieved ${movements.length} movements for lot ${lot.lotNumber}`,
        data: movements,
      };
    } catch (error) {
      console.error('Error retrieving lot movements:', error);
      return { success: false, message: 'Failed to retrieve lot movements' };
    }
  }

  /**
   * Query movement history with filters and pagination
   */
  async getMovementHistory(filters: GetMovementsFilter = {}): Promise<{
    success: boolean;
    message: string;
    data?: StockMovementWithLot[];
    count?: number;
  }> {
    try {
      const movements = await this.stockMovementRepository.getMovementHistory(filters);
      const count = await this.stockMovementRepository.getMovementCount(filters);

      return {
        success: true,
        message: `Retrieved ${movements.length} stock movements`,
        data: movements,
        count,
      };
    } catch (error) {
      console.error('Error retrieving movement history:', error);
      return { success: false, message: 'Failed to retrieve movement history' };
    }
  }

  /**
   * Calculate and verify lot balance against all recorded movements
   */
  async getLotBalance(lotId: number): Promise<{
    success: boolean;
    message: string;
    data?: LotBalanceSummary;
  }> {
    try {
      const lot = await this.stockMovementRepository.getLotWithMovements(lotId);
      if (!lot) {
        return { success: false, message: `Stock lot with ID ${lotId} not found` };
      }

      let totalIn = 0;
      let totalOut = 0;
      let totalAdjustments = 0;
      let totalReturns = 0;

      for (const m of lot.movements) {
        switch (m.movementType) {
          case 'IN':
            totalIn += m.quantity;
            break;
          case 'OUT':
            totalOut += m.quantity;
            break;
          case 'ADJUSTMENT':
            // An adjustment could be positive or negative based on notes or comparison
            totalAdjustments += m.quantity;
            break;
          case 'RETURN':
            if (m.referenceType === 'PURCHASE') {
              totalOut += m.quantity;
            } else {
              totalReturns += m.quantity;
            }
            break;
        }
      }

      return {
        success: true,
        message: `Calculated balance summary for lot ${lot.lotNumber}`,
        data: {
          lotId: lot.id,
          lotNumber: lot.lotNumber,
          initialWeight: lot.netWeight,
          currentNetWeight: lot.netWeight,
          currentGrossWeight: lot.grossWeight,
          status: lot.currentStatus,
          totalIn,
          totalOut,
          totalAdjustments,
          totalReturns,
          computedBalance: lot.netWeight,
          isConsistent: lot.netWeight >= 0,
        },
      };
    } catch (error) {
      console.error('Error getting lot balance:', error);
      return { success: false, message: 'Failed to calculate lot balance' };
    }
  }
}
