import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { CustomerService } from '../customer.service';

describe('CustomerService', () => {
  let customerService: CustomerService;
  let mockCustomerRepo: any;

  const sampleCustomer: any = {
    id: 1,
    name: 'Yarns Customer Ltd',
    company: 'Yarns Client Inc',
    contactPerson: 'John Doe',
    email: 'john@yarnclient.co',
    phone: '1234567890',
    address: '123 Cotton St, Fabric City',
    taxId: 'TAX123456',
    creditLimit: 5000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Create a mock repository
    mockCustomerRepo = {
      createCustomer: async (data: any) => ({ id: 2, ...data }),
      getCustomerById: async (id: number) => null,
      getCustomerByName: async (name: string) => null,
      getCustomerWithRelations: async (id: number) => null,
      getCustomers: async () => [],
      getCustomerCount: async () => 0,
      updateCustomer: async (id: number, data: any) => ({ ...sampleCustomer, ...data }),
      deactivateCustomer: async (id: number) => ({ ...sampleCustomer, isActive: false }),
      activateCustomer: async (id: number) => ({ ...sampleCustomer, isActive: true }),
    };
    customerService = new CustomerService(mockCustomerRepo);
  });

  describe('createCustomer', () => {
    it('should reject customer name shorter than 2 characters', async () => {
      const result = await customerService.createCustomer({ name: 'A' } as any);
      assert.strictEqual(result.success, false);
      assert.match(result.message, /at least 2 characters/i);
    });

    it('should successfully create a customer', async () => {
      const result = await customerService.createCustomer({
        name: 'New Customer',
        contactPerson: 'Jane Doe',
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.name, 'New Customer');
    });

    it('should reject duplicate customer name', async () => {
      mockCustomerRepo.getCustomerByName = async () => sampleCustomer;
      const result = await customerService.createCustomer({ name: sampleCustomer.name });
      assert.strictEqual(result.success, false);
      assert.match(result.message, /already exists/i);
    });
  });

  describe('getCustomerById', () => {
    it('should return error if customer not found', async () => {
      const result = await customerService.getCustomerById(999);
      assert.strictEqual(result.success, false);
      assert.match(result.message, /not found/i);
    });

    it('should retrieve customer successfully', async () => {
      mockCustomerRepo.getCustomerById = async () => sampleCustomer;
      const result = await customerService.getCustomerById(1);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.name, sampleCustomer.name);
    });
  });

  describe('updateCustomer', () => {
    it('should reject duplicate customer name upon update', async () => {
      mockCustomerRepo.getCustomerById = async () => sampleCustomer;
      mockCustomerRepo.getCustomerByName = async () => ({ ...sampleCustomer, id: 3 });

      const result = await customerService.updateCustomer({ id: 1, name: 'Other Customer' });
      assert.strictEqual(result.success, false);
      assert.match(result.message, /already exists/i);
    });

    it('should successfully update a customer', async () => {
      mockCustomerRepo.getCustomerById = async () => sampleCustomer;
      const result = await customerService.updateCustomer({
        id: 1,
        company: 'Updated Company',
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.company, 'Updated Company');
    });
  });

  describe('setCustomerStatus', () => {
    it('should deactivate customer', async () => {
      mockCustomerRepo.getCustomerById = async () => sampleCustomer;
      const result = await customerService.setCustomerStatus(1, false);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.isActive, false);
    });
  });

  describe('getCustomerStatement', () => {
    it('should calculate financial summary properly', async () => {
      mockCustomerRepo.getCustomerWithRelations = async () => ({
        ...sampleCustomer,
        sales: [
          { id: 1, totalAmount: 1000.0, saleDate: new Date(), invoiceNumber: 'INV01', status: 'COMPLETED' },
          { id: 2, totalAmount: 500.0, saleDate: new Date(), invoiceNumber: 'INV02', status: 'PENDING' },
        ],
        payments: [
          { id: 1, amount: 800.0, paymentDate: new Date(), status: 'CLEARED', paymentMethod: 'BANK' },
        ],
      });

      const result = await customerService.getCustomerStatement(1);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.summary.totalSales, 1500.0);
      assert.strictEqual(result.data?.summary.totalPayments, 800.0);
      assert.strictEqual(result.data?.summary.outstandingReceivable, 700.0);
    });
  });
});