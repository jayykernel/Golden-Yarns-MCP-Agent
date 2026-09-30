import { z } from 'zod';
import { CustomerService } from '../services/customer.service';
import {
  createCustomerSchema,
  getCustomerSchema,
  listCustomersSchema,
  updateCustomerSchema,
  setCustomerStatusSchema,
} from '../utils/customer.validation';

const customerService = new CustomerService();

export const customerManagementTools = {
  createCustomer: {
    name: 'create_customer',
    description: 'Create a new customer',
    inputSchema: createCustomerSchema.shape,
    handler: async (args: z.infer<typeof createCustomerSchema>) => {
      try {
        const validatedData = createCustomerSchema.parse(args);
        const result = await customerService.createCustomer(validatedData);

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

  getCustomer: {
    name: 'get_customer',
    description: 'Retrieve detailed information for a customer by ID',
    inputSchema: getCustomerSchema.shape,
    handler: async (args: z.infer<typeof getCustomerSchema>) => {
      try {
        const validatedArgs = getCustomerSchema.parse(args);
        const result = await customerService.getCustomerById(validatedArgs.id);

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

  listCustomers: {
    name: 'list_customers',
    description: 'List customers with optional search filtering',
    inputSchema: listCustomersSchema.shape,
    handler: async (args: z.infer<typeof listCustomersSchema>) => {
      try {
        const validatedArgs = listCustomersSchema.parse(args);
        const result = await customerService.listCustomers(validatedArgs);

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

  updateCustomer: {
    name: 'update_customer',
    description: 'Update an existing customer profile and details',
    inputSchema: updateCustomerSchema.shape,
    handler: async (args: z.infer<typeof updateCustomerSchema>) => {
      try {
        const validatedData = updateCustomerSchema.parse(args);
        const result = await customerService.updateCustomer(validatedData);

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

  setCustomerStatus: {
    name: 'set_customer_status',
    description: 'Activate or deactivate a customer',
    inputSchema: setCustomerStatusSchema.shape,
    handler: async (args: z.infer<typeof setCustomerStatusSchema>) => {
      try {
        const validatedArgs = setCustomerStatusSchema.parse(args);
        const result = await customerService.setCustomerStatus(validatedArgs.id, validatedArgs.isActive);

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

export const allCustomerTools = Object.values(customerManagementTools);