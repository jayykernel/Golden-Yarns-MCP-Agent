import { z } from 'zod';
import { SupplierService } from '../services/supplier.service';
import {
  createSupplierSchema,
  getSupplierSchema,
  listSuppliersSchema,
  updateSupplierSchema,
  getSupplierStatementSchema,
} from '../utils/supplier.validation';

const supplierService = new SupplierService();

export const supplierTools = {
  createSupplier: {
    name: 'create_supplier',
    description: 'Create a new supplier with contact and tax identification details',
    inputSchema: createSupplierSchema.shape,
    handler: async (args: z.infer<typeof createSupplierSchema>) => {
      try {
        const validatedData = createSupplierSchema.parse(args);
        const result = await supplierService.createSupplier(validatedData);

        if (!result.success) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: result.message }, null, 2) }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, message: result.message, data: result.data }, null, 2) }],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Validation failed', errors: error.errors }, null, 2) }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Internal server error' }, null, 2) }],
          isError: true,
        };
      }
    },
  },

  getSupplier: {
    name: 'get_supplier',
    description: 'Retrieve detailed profile information for a supplier by ID',
    inputSchema: getSupplierSchema.shape,
    handler: async (args: z.infer<typeof getSupplierSchema>) => {
      try {
        const validatedArgs = getSupplierSchema.parse(args);
        const result = await supplierService.getSupplierById(validatedArgs.id);

        if (!result.success) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: result.message }, null, 2) }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, message: result.message, data: result.data }, null, 2) }],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Validation failed', errors: error.errors }, null, 2) }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Internal server error' }, null, 2) }],
          isError: true,
        };
      }
    },
  },

  listSuppliers: {
    name: 'list_suppliers',
    description: 'List suppliers with optional search filtering (name, contact, phone, email, taxId) and pagination',
    inputSchema: listSuppliersSchema.shape,
    handler: async (args: z.infer<typeof listSuppliersSchema>) => {
      try {
        const validatedArgs = listSuppliersSchema.parse(args);
        const result = await supplierService.listSuppliers(validatedArgs);

        if (!result.success) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: result.message }, null, 2) }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, message: result.message, data: result.data, count: result.count }, null, 2) }],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Validation failed', errors: error.errors }, null, 2) }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Internal server error' }, null, 2) }],
          isError: true,
        };
      }
    },
  },

  updateSupplier: {
    name: 'update_supplier',
    description: 'Update an existing supplier profile and contact details',
    inputSchema: updateSupplierSchema.shape,
    handler: async (args: z.infer<typeof updateSupplierSchema>) => {
      try {
        const validatedData = updateSupplierSchema.parse(args);
        const result = await supplierService.updateSupplier(validatedData);

        if (!result.success) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: result.message }, null, 2) }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, message: result.message, data: result.data }, null, 2) }],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Validation failed', errors: error.errors }, null, 2) }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Internal server error' }, null, 2) }],
          isError: true,
        };
      }
    },
  },

  getSupplierStatement: {
    name: 'get_supplier_statement',
    description: 'Retrieve comprehensive supplier statement including purchases, expenses, payments, and payable balance',
    inputSchema: getSupplierStatementSchema.shape,
    handler: async (args: z.infer<typeof getSupplierStatementSchema>) => {
      try {
        const validatedArgs = getSupplierStatementSchema.parse(args);
        const result = await supplierService.getSupplierStatement(validatedArgs.supplierId, {
          startDate: validatedArgs.startDate,
          endDate: validatedArgs.endDate,
        });

        if (!result.success) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: result.message }, null, 2) }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, message: result.message, data: result.data }, null, 2) }],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Validation failed', errors: error.errors }, null, 2) }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: false, message: 'Internal server error' }, null, 2) }],
          isError: true,
        };
      }
    },
  },
};

export const allSupplierTools = Object.values(supplierTools);
