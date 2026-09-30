import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { StockMovementService } from '../stockMovement.service';
import { StockLotRepository } from '../../repositories/stockLot.repository';
import { StockMovementRepository } from '../../repositories/stockMovement.repository';
import { RecordMovementInput, AdjustStockInput } from '../../types/stockMovement.types';

describe('StockMovementService', () => {
  let stockMovementService: StockMovementService;
  let mockLotRepo: any;
  let mockMovementRepo: any;

  const sampleLot: any = {
    id: 1,
    lotNumber: 'LOT-2026-001',
    yarnTypeId: 1,
    yarnCountId: 1,
    colorId: 1,
    supplierId: 1,
    grossWeight: 105.0,
    netWeight: 100.0,
    costPerKg: 250.0,
    currentStatus: 'IN_STOCK',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    stockMovementService = new StockMovementService();
    mockLotRepo = (stockMovementService as any).stockLotRepository;
    mockMovementRepo = (stockMovementService as any).stockMovementRepository;
  });

  describe('recordStockMovement', () => {
    it('should reject non-positive movement quantity', async () => {
      const result = await stockMovementService.recordStockMovement({
        lotId: 1,
        movementType: 'IN',
        quantity: 0,
      });
      assert.strictEqual(result.success, false);
      assert.match(result.message, /greater than 0/i);
    });

    it('should fail if lot is not found', async () => {
      mockLotRepo.getStockLotById = async () => null;

      const result = await stockMovementService.recordStockMovement({
        lotId: 999,
        movementType: 'IN',
        quantity: 10,
      });

      assert.strictEqual(result.success, false);
      assert.match(result.message, /not found/i);
    });

    it('should reject movements on inactive lots', async () => {
      mockLotRepo.getStockLotById = async () => ({ ...sampleLot, currentStatus: 'INACTIVE' });

      const result = await stockMovementService.recordStockMovement({
        lotId: 1,
        movementType: 'IN',
        quantity: 10,
      });

      assert.strictEqual(result.success, false);
      assert.match(result.message, /inactive/i);
    });

    it('should prevent negative stock when OUT quantity exceeds current net weight', async () => {
      mockLotRepo.getStockLotById = async () => ({ ...sampleLot, netWeight: 50.0 });

      const result = await stockMovementService.recordStockMovement({
        lotId: 1,
        movementType: 'OUT',
        quantity: 60.0,
      });

      assert.strictEqual(result.success, false);
      assert.match(result.message, /Insufficient stock/i);
    });

    it('should process OUT movement and mark status as SOLD when depleted', async () => {
      mockLotRepo.getStockLotById = async () => ({ ...sampleLot, netWeight: 50.0, grossWeight: 52.0 });

      let capturedParams: any = null;
      mockMovementRepo.recordMovementAndUpdateLot = async (params: any) => {
        capturedParams = params;
        return {
          movement: { id: 101, ...params },
          updatedLot: { ...sampleLot, netWeight: params.newNetWeight, currentStatus: params.newStatus },
        };
      };

      const result = await stockMovementService.recordStockMovement({
        lotId: 1,
        movementType: 'OUT',
        quantity: 50.0,
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(capturedParams.newNetWeight, 0);
      assert.strictEqual(capturedParams.newStatus, 'SOLD');
    });

    it('should process IN movement and update balance', async () => {
      mockLotRepo.getStockLotById = async () => ({ ...sampleLot, netWeight: 100.0, grossWeight: 105.0 });

      let capturedParams: any = null;
      mockMovementRepo.recordMovementAndUpdateLot = async (params: any) => {
        capturedParams = params;
        return {
          movement: { id: 102, ...params },
          updatedLot: { ...sampleLot, netWeight: params.newNetWeight },
        };
      };

      const result = await stockMovementService.recordStockMovement({
        lotId: 1,
        movementType: 'IN',
        quantity: 25.5,
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(capturedParams.newNetWeight, 125.5);
      assert.strictEqual(capturedParams.newGrossWeight, 130.5);
    });

    it('should handle supplier return (PURCHASE reference) as outbound deduction', async () => {
      mockLotRepo.getStockLotById = async () => ({ ...sampleLot, netWeight: 100.0, grossWeight: 105.0 });

      let capturedParams: any = null;
      mockMovementRepo.recordMovementAndUpdateLot = async (params: any) => {
        capturedParams = params;
        return {
          movement: { id: 103, ...params },
          updatedLot: { ...sampleLot, netWeight: params.newNetWeight },
        };
      };

      const result = await stockMovementService.recordStockMovement({
        lotId: 1,
        movementType: 'RETURN',
        referenceType: 'PURCHASE',
        quantity: 20.0,
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(capturedParams.newNetWeight, 80.0);
    });

    it('should reject TRANSFER or ADJUSTMENT via recordStockMovement', async () => {
      mockLotRepo.getStockLotById = async () => sampleLot;

      const result = await stockMovementService.recordStockMovement({
        lotId: 1,
        movementType: 'ADJUSTMENT',
        quantity: 10,
      });

      assert.strictEqual(result.success, false);
      assert.match(result.message, /Use adjustStockLot/i);
    });
  });

  describe('adjustStock', () => {
    it('should reject negative target net weight', async () => {
      const result = await stockMovementService.adjustStock({
        lotId: 1,
        newNetWeight: -5,
        reason: 'Physical count',
      });

      assert.strictEqual(result.success, false);
      assert.match(result.message, /cannot be negative/i);
    });

    it('should return message when target weight is identical to current', async () => {
      mockLotRepo.getStockLotById = async () => sampleLot;

      const result = await stockMovementService.adjustStock({
        lotId: 1,
        newNetWeight: 100.0,
        reason: 'Physical count',
      });

      assert.strictEqual(result.success, false);
      assert.match(result.message, /No adjustment needed/i);
    });

    it('should successfully record an adjustment and compute delta correctly', async () => {
      mockLotRepo.getStockLotById = async () => sampleLot;

      let capturedParams: any = null;
      mockMovementRepo.recordMovementAndUpdateLot = async (params: any) => {
        capturedParams = params;
        return {
          movement: { id: 104, ...params },
          updatedLot: { ...sampleLot, netWeight: params.newNetWeight },
        };
      };

      const result = await stockMovementService.adjustStock({
        lotId: 1,
        newNetWeight: 95.0,
        reason: 'Moisture loss during storage',
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(capturedParams.movementType, 'ADJUSTMENT');
      assert.strictEqual(capturedParams.quantity, 5.0);
      assert.strictEqual(capturedParams.newNetWeight, 95.0);
      assert.match(capturedParams.notes, /Moisture loss/);
    });
  });

  describe('getLotBalance', () => {
    it('should compute balance summary and reconciliation properly', async () => {
      mockMovementRepo.getLotWithMovements = async () => ({
        ...sampleLot,
        netWeight: 80.0,
        grossWeight: 85.0,
        movements: [
          { movementType: 'IN', quantity: 100.0 },
          { movementType: 'OUT', quantity: 30.0 },
          { movementType: 'RETURN', referenceType: 'SALE', quantity: 10.0 },
        ],
      });

      const result = await stockMovementService.getLotBalance(1);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.totalIn, 100.0);
      assert.strictEqual(result.data?.totalOut, 30.0);
      assert.strictEqual(result.data?.totalReturns, 10.0);
      assert.strictEqual(result.data?.isConsistent, true);
    });
  });
});
