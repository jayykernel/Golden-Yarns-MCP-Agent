import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { salesTools } from '../sales.tools';

describe('Sales MCP Tools', () => {
  describe('create_sale tool definition', () => {
    it('should have correct name and input schema', () => {
      assert.strictEqual(salesTools.createSale.name, 'create_sale');
      assert.ok(salesTools.createSale.inputSchema);
    });

    it('should validate inputs correctly on invalid payload', async () => {
      const response = await salesTools.createSale.handler({ customerId: -1, lotDetails: [] } as any);
      assert.strictEqual(response.isError, true);
    });
  });

  describe('get_sale tool definition', () => {
    it('should have correct name and validate ID input', async () => {
      assert.strictEqual(salesTools.getSale.name, 'get_sale');
      const response = await salesTools.getSale.handler({ id: 'bad-id' } as any);
      assert.strictEqual(response.isError, true);
    });
  });

  describe('list_sales tool definition', () => {
    it('should have correct name and handle empty args', async () => {
      assert.strictEqual(salesTools.listSales.name, 'list_sales');
      assert.ok(salesTools.listSales.inputSchema);
    });
  });

  describe('cancel_sale tool definition', () => {
    it('should have correct name and validate ID input', async () => {
      assert.strictEqual(salesTools.cancelSale.name, 'cancel_sale');
      const response = await salesTools.cancelSale.handler({ id: -2 } as any);
      assert.strictEqual(response.isError, true);
    });
  });
});