import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { PurchaseService } from '../purchase.service';
import { PurchaseRepository } from '../../repositories/purchase.repository';
import { StockLotRepository } from '../../repositories/stockLot.repository';
import { SupplierRepository } from '../../repositories/supplier.repository';

describe('PurchaseService', () => {
  let purchaseService: PurchaseService;
  let mockPurchaseRepo: any;
  let mockStockLotRepo: any;
  let mockSupplierRepo: any;

  const sampleSupplier: any = {
    id: 1,
    name: 'Yarns Supplier Ltd',
    contactPerson: 'John Doe',
    email: 'john@yarndef.co',
    phone: '1234567890',
    address: '123 Cotton St, Bales City',
    taxId: 'TAX123456',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const samplePurchaseInput: any = {
    supplierId: 1,
    purchaseDate: new Date().toISOString(),
    notes: 'Test purchase',
    lotDetails: [
      {
        yarnTypeId: 1,
        yarnCountId: 1,
        colorId: 1,
        netWeight: 100,
        quantity: 10,
        purchaseCost: 50,
        lotNumber: 'LOT-001'
      },
      {
        yarnTypeId: 2,
        yarnCountId: 2,
        colorId: 2,
        netWeight: 50,
        quantity: 5,
        purchaseCost: 30,
        lotNumber: 'LOT-002'
      }
    ]
  };

  beforeEach(() => {
    // Create mock repositories
    mockPurchaseRepo = {
      createPurchase: async (data: any) => ({ id: 1, ...data, createdAt: new Date(), updatedAt: new Date() }),
      getPurchaseById: async (id: number) => null,
      getPurchases: async () => [],
      getPurchaseCount: async () => 0,
      updatePurchase: async (id: number, data: any) => ({ id, ...data }),
      deletePurchase: async (id: number) => ({ id }),
    };
    mockStockLotRepo = {
      createStockLot: async (data: any) => ({ id: 1, ...data, createdAt: new Date(), updatedAt: new Date() }),
    };
    mockSupplierRepo = {
      getSupplierById: async (id: number) => (id === 1 ? sampleSupplier : null),
    };

    purchaseService = new PurchaseService(
      mockPurchaseRepo,
      mockStockLotRepo,
      mockSupplierRepo
    );
  });

  describe('createPurchase', () => {
    it('should reject purchase with invalid supplier ID', async () => {
      const result = await purchaseService.createPurchase({
        ...samplePurchaseInput,
        supplierId: 999,
      });
      assert.strictEqual(result.success, false);
      assert.match(result.message, /not found/i);
    });

    it('should successfully create a purchase with stock lots', async () => {
      const result = await purchaseService.createPurchase(samplePurchaseInput);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Purchase created successfully');
      assert.ok(result.data?.purchase);
      assert.ok(result.data?.stockLots);
      assert.strictEqual(result.data?.stockLots.length, 2);
    });

    it('should reject purchase with non-positive total amount', async () => {
      const result = await purchaseService.createPurchase({
        ...samplePurchaseInput,
        lotDetails: [
          {
            yarnTypeId: 1,
            yarnCountId: 1,
            colorId: 1,
            netWeight: 100,
            quantity: 10,
            purchaseCost: 0, // Zero cost
            lotNumber: 'LOT-001'
          }
        ]
      });

      assert.strictEqual(result.success, false);
      assert.match(result.message, /Total purchase amount must be positive/i);
    });
  });

  describe('getPurchase', () => {
    it('should return error if purchase not found', async () => {
      mockPurchaseRepo.getPurchaseById = async () => null;
      const result = await purchaseService.getPurchase(999);
      assert.strictEqual(result.success, false);
      assert.match(result.message, /not found/i);
    });

    it('should retrieve purchase successfully', async () => {
      const samplePurchase = {
        id: 1,
        supplierId: 1,
        purchaseDate: new Date(),
        totalAmount: 1500,
        status: 'PENDING',
        notes: 'Test purchase',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPurchaseRepo.getPurchaseById = async () => samplePurchase;
      const result = await purchaseService.getPurchase(1);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Purchase retrieved successfully');
      assert.strictEqual(result.data?.id, 1);
    });
  });

  describe('listPurchases', () => {
    it('should retrieve purchases successfully', async () => {
      const samplePurchases = [
        {
          id: 1,
          supplierId: 1,
          purchaseDate: new Date(),
          totalAmount: 1500,
          status: 'PENDING',
          notes: 'Test purchase 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          supplierId: 1,
          purchaseDate: new Date(),
          totalAmount: 2000,
          status: 'RECEIVED',
          notes: 'Test purchase 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      mockPurchaseRepo.getPurchases = async () => samplePurchases;
      mockPurchaseRepo.getPurchaseCount = async () => 2;
      const result = await purchaseService.listPurchases({});
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Purchases retrieved successfully');
      assert.strictEqual(result.data?.length, 2);
      assert.strictEqual(result.count, 2);
    });
  });

  describe('updatePurchase', () => {
    it('should return error if purchase not found', async () => {
      mockPurchaseRepo.getPurchaseById = async () => null;
      const result = await purchaseService.updatePurchase({ id: 999, notes: 'Updated' });
      assert.strictEqual(result.success, false);
      assert.match(result.message, /not found/i);
    });

    it('should update purchase successfully', async () => {
      const existingPurchase = {
        id: 1,
        supplierId: 1,
        purchaseDate: new Date(),
        totalAmount: 1500,
        status: 'PENDING',
        notes: 'Original notes',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPurchaseRepo.getPurchaseById = async () => existingPurchase;
      mockPurchaseRepo.updatePurchase = async (id: number, data: any) => ({
        ...existingPurchase,
        ...data,
        updatedAt: new Date(),
      });
      const result = await purchaseService.updatePurchase({ id: 1, notes: 'Updated notes' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Purchase updated successfully');
      assert.strictEqual(result.data?.notes, 'Updated notes');
    });
  });

  describe('deletePurchase', () => {
    it('should return error if purchase not found', async () => {
      mockPurchaseRepo.getPurchaseById = async () => null;
      const result = await purchaseService.deletePurchase(999);
      assert.strictEqual(result.success, false);
      assert.match(result.message, /not found/i);
    });

    it('should delete purchase successfully', async () => {
      const existingPurchase = {
        id: 1,
        supplierId: 1,
        purchaseDate: new Date(),
        totalAmount: 1500,
        status: 'PENDING',
        notes: 'Test purchase',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPurchaseRepo.getPurchaseById = async () => existingPurchase;
      mockPurchaseRepo.deletePurchase = async (id: number) => ({ id });
      const result = await purchaseService.deletePurchase(1);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Purchase deleted successfully');
    });
  });
});