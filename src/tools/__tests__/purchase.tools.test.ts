import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { purchaseTools } from '../purchase.tools';

describe('Purchase MCP Tools', () => {
  describe('create_purchase tool definition', () => {
    it('should have correct name and input schema', () => {
      assert.strictEqual(purchaseTools.createPurchase.name, 'create_purchase');
      assert.ok(purchaseTools.createPurchase.inputSchema);
    });

    it('should validate inputs correctly on invalid payload', async () => {
      const response = await purchaseTools.createPurchase.handler({ supplierId: 0 } as any);
      assert.strictEqual(response.isError, true);
      const parsed = JSON.parse(response.content[0].text);
      assert.strictEqual(parsed.success, false);
    });
  });

  describe('get_purchase tool definition', () => {
    it('should have correct name and validate ID input', async () => {
      assert.strictEqual(purchaseTools.getPurchase.name, 'get_purchase');
      const response = await purchaseTools.getPurchase.handler({ id: -5 } as any);
      assert.strictEqual(response.isError, true);
    });
  });

  describe('list_purchases tool definition', () => {
    it('should have correct name and handle empty args', async () => {
      assert.strictEqual(purchaseTools.listPurchases.name, 'list_purchases');
      const response = await purchaseTools.listPurchases.handler({});
      assert.ok(response.content);
    });
  });
});