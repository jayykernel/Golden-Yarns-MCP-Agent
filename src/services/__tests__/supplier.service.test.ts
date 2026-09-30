import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { SupplierService } from '../supplier.service';
import { SupplierRepository } from '../../repositories/supplier.repository';

describe('SupplierService', () => {
  let supplierService: SupplierService;
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

  beforeEach(() => {
    // Create a mock repository
    mockSupplierRepo = {
      createSupplier: async (data: any) => ({ id: 2, ...data }),
      getSupplierById: async (id: number) => null,
      getSupplierByName: async (name: string) => null,
      getSupplierWithRelations: async (id: number) => null,
      getSuppliers: async () => [],
      getSupplierCount: async () => 0,
      updateSupplier: async (id: number, data: any) => ({ ...sampleSupplier, ...data }),
      deactivateSupplier: async (id: number) => ({ ...sampleSupplier, isActive: false }),
      activateSupplier: async (id: number) => ({ ...sampleSupplier, isActive: true }),
    };
    supplierService = new SupplierService(mockSupplierRepo);
  });

  describe('createSupplier', () => {
    it('should reject supplier name shorter than 2 characters', async () => {
      const result = await supplierService.createSupplier({ name: 'A' } as any);
      assert.strictEqual(result.success, false);
      assert.match(result.message, /at least 2 characters/i);
    });

    it('should successfully create a supplier', async () => {
      const result = await supplierService.createSupplier({
        name: 'New Supplier',
        contactPerson: 'Jane Doe',
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.name, 'New Supplier');
    });

    it('should reject duplicate supplier name', async () => {
      mockSupplierRepo.getSupplierByName = async () => sampleSupplier;
      const result = await supplierService.createSupplier({ name: sampleSupplier.name });
      assert.strictEqual(result.success, false);
      assert.match(result.message, /already exists/i);
    });
  });

  describe('getSupplierById', () => {
    it('should return error if supplier not found', async () => {
      const result = await supplierService.getSupplierById(999);
      assert.strictEqual(result.success, false);
      assert.match(result.message, /not found/i);
    });

    it('should retrieve supplier successfully', async () => {
      mockSupplierRepo.getSupplierById = async () => sampleSupplier;
      const result = await supplierService.getSupplierById(1);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.name, sampleSupplier.name);
    });
  });

  describe('setSupplierStatus', () => {
    it('should deactivate supplier', async () => {
      mockSupplierRepo.getSupplierById = async () => sampleSupplier;
      const result = await supplierService.setSupplierStatus(1, false);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.isActive, false);
    });
  });

  describe('getSupplierStatement', () => {
    it('should calculate financial summary properly', async () => {
      mockSupplierRepo.getSupplierWithRelations = async () => ({
        ...sampleSupplier,
        purchaseLots: [
          { id: 1, purchaseCost: 1000.0, netWeight: 100, purchaseDate: new Date(), lotNumber: 'L1', grossWeight: 110, currentStatus: 'IN_STOCK', notes: 'lot1' },
          { id: 2, purchaseCost: 500.0, netWeight: 50, purchaseDate: new Date(), lotNumber: 'L2', grossWeight: 55, currentStatus: 'IN_STOCK', notes: 'lot2' },
        ],
        suppliedExpenses: [
          { id: 1, amount: 200.0, expenseDate: new Date(), category: 'TRANSPORT', status: 'PAID', description: 'exp1', notes: 'exp1' },
        ],
        supplierPayments: [
          { id: 1, amount: 800.0, paymentDate: new Date(), status: 'CLEARED', paymentMethod: 'BANK', reference: 'ref1', notes: 'p1' },
        ],
      });

      const result = await supplierService.getSupplierStatement(1);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.summary.totalPurchases, 1500.0);
      assert.strictEqual(result.data?.summary.totalExpenses, 200.0);
      assert.strictEqual(result.data?.summary.totalPayments, 800.0);
      assert.strictEqual(result.data?.summary.outstandingPayable, 900.0);
    });
  });
});
