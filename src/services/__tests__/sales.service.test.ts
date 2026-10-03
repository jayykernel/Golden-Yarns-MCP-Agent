import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { SaleService } from '../sales.service';

describe('SaleService', () => {
  let saleService: SaleService;
  let mockSaleRepo: any;
  let mockStockLotRepo: any;
  let mockCustomerRepo: any;
  let mockStockMovementService: any;

  const sampleCustomer: any = {
    id: 1,
    name: 'Textiles Corp',
    email: 'hello@textiles.corp',
    phone: '1234567890',
    isActive: true,
  };

  const sampleSaleInput: any = {
    customerId: 1,
    saleDate: new Date().toISOString(),
    notes: 'Test sale',
    lotDetails: [
      {
        lotId: 1,
        quantity: 10,
        sellingPrice: 150
      },
      {
        lotId: 2,
        quantity: 5,
        sellingPrice: 120
      }
    ]
  };

  beforeEach(() => {
    // Create mock repositories
    mockSaleRepo = {
      createSale: async (data: any) => ({ id: 1, ...data, invoiceNumber: 'INV-123' }),
      createSaleItem: async (data: any) => ({ id: 1, ...data }),
      getSaleById: async (id: number) => null,
      getSales: async () => [],
      getSaleCount: async () => 0,
      updateSale: async (id: number, data: any) => ({ id, ...data }),
      getSaleItems: async (id: number) => [],
    };

    mockStockLotRepo = {
      getStockLotById: async (id: number) => {
        if (id === 1) return { id: 1, lotNumber: 'LOT-1', currentStatus: 'IN_STOCK', netWeight: 100 };
        if (id === 2) return { id: 2, lotNumber: 'LOT-2', currentStatus: 'IN_STOCK', netWeight: 50 };
        return null; // For invalid lots
      }
    };

    mockCustomerRepo = {
      getCustomerById: async (id: number) => (id === 1 ? sampleCustomer : null),
    };

    mockStockMovementService = {
      recordStockMovement: async () => ({ id: 1 }),
    };

    saleService = new SaleService(
      mockSaleRepo,
      mockStockLotRepo,
      mockCustomerRepo,
      mockStockMovementService
    );
  });

  describe('createSale', () => {
    it('should reject sale with invalid customer ID', async () => {
      const result = await saleService.createSale({
        ...sampleSaleInput,
        customerId: 999,
      });
      assert.strictEqual(result.success, false);
      assert.match(result.message || '', /not found/i);
    });

    it('should successfully create a sale with valid lot details', async () => {
      const result = await saleService.createSale(sampleSaleInput);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Sale created successfully');
      assert.ok(result.data?.sale);
      assert.ok(result.data?.items);
      assert.strictEqual(result.data?.items.length, 2);
    });

    it('should reject sale if a lot has insufficient quantity', async () => {
      const result = await saleService.createSale({
        ...sampleSaleInput,
        lotDetails: [
          {
            lotId: 1,
            quantity: 500, // lot 1 only has 100
            sellingPrice: 150
          }
        ]
      });

      assert.strictEqual(result.success, false);
      assert.match(result.message || '', /Insufficient stock/i);
    });
  });

  describe('getSale', () => {
    it('should return error if sale not found', async () => {
      mockSaleRepo.getSaleById = async () => null;
      const result = await saleService.getSale(999);
      assert.strictEqual(result.success, false);
      assert.match(result.message, /not found/i);
    });

    it('should retrieve sale successfully', async () => {
      const sampleSale = {
        id: 1,
        customerId: 1,
        saleDate: new Date(),
        totalAmount: 2100,
        status: 'PENDING',
        notes: 'Test sale',
        invoiceNumber: 'INV-123',
      };
      mockSaleRepo.getSaleById = async () => sampleSale;
      const result = await saleService.getSale(1);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Sale retrieved successfully');
      assert.strictEqual(result.data?.id, 1);
    });
  });

  describe('cancelSale', () => {
    it('should return error if sale not found', async () => {
      mockSaleRepo.getSaleById = async () => null;
      const result = await saleService.cancelSale(999);
      assert.strictEqual(result.success, false);
      assert.match(result.message, /not found/i);
    });

    it('should cancel sale and restore inventory successfully', async () => {
      const existingSale = {
        id: 1,
        customerId: 1,
        saleDate: new Date(),
        totalAmount: 2100,
        status: 'PENDING',
        invoiceNumber: 'INV-123',
      };
      const existingItems = [
        { lotId: 1, quantity: 10 },
        { lotId: 2, quantity: 5 }
      ];

      mockSaleRepo.getSaleById = async () => existingSale;
      mockSaleRepo.getSaleItems = async () => existingItems;

      let updateCalledWithStatus = '';
      mockSaleRepo.updateSale = async (id: number, data: any) => {
        if (data.status) updateCalledWithStatus = data.status;
        return { ...existingSale, ...data };
      };

      const result = await saleService.cancelSale(1);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'Sale cancelled successfully and inventory restored');
      assert.strictEqual(updateCalledWithStatus, 'CANCELLED');
    });
  });
});