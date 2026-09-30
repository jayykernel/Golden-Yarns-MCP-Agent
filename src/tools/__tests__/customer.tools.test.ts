import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { customerManagementTools } from '../customer.tools';

describe('Customer MCP Tools', () => {
  describe('create_customer tool definition', () => {
    it('should have correct name and input schema', () => {
      assert.strictEqual(customerManagementTools.createCustomer.name, 'create_customer');
      assert.ok(customerManagementTools.createCustomer.inputSchema);
    });

    it('should validate inputs correctly on invalid payload', async () => {
      const response = await customerManagementTools.createCustomer.handler({ name: 'A' } as any);
      assert.strictEqual(response.isError, true);
      const parsed = JSON.parse(response.content[0].text);
      assert.strictEqual(parsed.success, false);
    });
  });

  describe('get_customer tool definition', () => {
    it('should have correct name and validate ID input', async () => {
      assert.strictEqual(customerManagementTools.getCustomer.name, 'get_customer');
      const response = await customerManagementTools.getCustomer.handler({ id: -5 } as any);
      assert.strictEqual(response.isError, true);
    });
  });

  describe('list_customers tool definition', () => {
    it('should have correct name and handle empty args', async () => {
      assert.strictEqual(customerManagementTools.listCustomers.name, 'list_customers');
      const response = await customerManagementTools.listCustomers.handler({});
      assert.ok(response.content);
    });
  });

  describe('set_customer_status tool definition', () => {
    it('should validate status parameters', async () => {
      assert.strictEqual(customerManagementTools.setCustomerStatus.name, 'set_customer_status');
      const response = await customerManagementTools.setCustomerStatus.handler({ id: 1, isActive: true });
      assert.ok(response.content);
    });
  });

  describe('get_customer_summary tool definition', () => {
    it('should have correct name and validate ID', async () => {
      assert.strictEqual(customerManagementTools.getCustomerSummary.name, 'get_customer_summary');
      const response = await customerManagementTools.getCustomerSummary.handler({ id: 0 } as any);
      assert.strictEqual(response.isError, true);
    });
  });

  describe('get_customer_statement tool definition', () => {
    it('should have correct name and schema', () => {
      assert.strictEqual(customerManagementTools.getCustomerStatement.name, 'get_customer_statement');
      assert.ok(customerManagementTools.getCustomerStatement.inputSchema);
    });
  });
});