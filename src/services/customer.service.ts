import { Customer } from '@prisma/client';
import { CustomerRepository } from '../repositories/customer.repository';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  GetCustomersFilter,
} from '../types/customer.types';
import {
  createCustomerSchema,
  updateCustomerSchema,
  setCustomerStatusSchema,
} from '../utils/customer.validation';

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor(repository?: CustomerRepository) {
    this.customerRepository = repository || new CustomerRepository();
  }

  /**
   * Create a new customer
   */
  async createCustomer(input: CreateCustomerInput) {
    try {
      // Validate input
      const validatedData = createCustomerSchema.parse(input);

      // Check for duplicate name
      const existingCustomer = await this.customerRepository.getCustomerByName(validatedData.name);
      if (existingCustomer) {
        return { success: false, message: `Customer with name '${validatedData.name}' already exists.` };
      }

      const customer = await this.customerRepository.createCustomer(validatedData);
      return { success: true, message: 'Customer created successfully', data: customer };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: `Failed to create customer: ${error.message}` };
      }
      return { success: false, message: 'An unknown error occurred while creating the customer' };
    }
  }

  /**
   * Get a customer by ID
   */
  async getCustomerById(id: number) {
    try {
      if (!id || id <= 0) {
        return { success: false, message: 'Invalid customer ID' };
      }

      const customer = await this.customerRepository.getCustomerById(id);
      if (!customer) {
        return { success: false, message: `Customer with ID ${id} not found.` };
      }

      return { success: true, message: 'Customer retrieved successfully', data: customer };
    } catch (error) {
      return { success: false, message: 'Failed to retrieve customer' };
    }
  }

  /**
   * List customers with optional filtering
   */
  async listCustomers(filters: GetCustomersFilter = {}) {
    try {
      const customers = await this.customerRepository.getCustomers(filters);
      const totalCount = await this.customerRepository.getCustomerCount(filters);

      return {
        success: true,
        message: 'Customers retrieved successfully',
        data: customers,
        count: totalCount,
      };
    } catch (error) {
      return { success: false, message: 'Failed to list customers' };
    }
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(input: UpdateCustomerInput) {
    try {
      const validatedData = updateCustomerSchema.parse(input);

      // Verify existence
      const existingCustomer = await this.customerRepository.getCustomerById(validatedData.id);
      if (!existingCustomer) {
        return { success: false, message: `Customer with ID ${validatedData.id} not found.` };
      }

      // Check name collision if name is updated
      if (validatedData.name && validatedData.name !== existingCustomer.name) {
        const duplicate = await this.customerRepository.getCustomerByName(validatedData.name);
        if (duplicate) {
          return { success: false, message: `Customer with name '${validatedData.name}' already exists.` };
        }
      }

      const { id, ...updateData } = validatedData;
      const updated = await this.customerRepository.updateCustomer(id, updateData);

      return {
        success: true,
        message: 'Customer updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: `Failed to update customer: ${error.message}` };
      }
      return { success: false, message: 'An unknown error occurred while updating the customer' };
    }
  }

  /**
   * Activate or deactivate customer
   */
  async setCustomerStatus(id: number, isActive: boolean) {
    try {
      setCustomerStatusSchema.parse({ id, isActive });

      const customer = await this.customerRepository.getCustomerById(id);
      if (!customer) {
        return { success: false, message: `Customer with ID ${id} not found.` };
      }

      const updated = isActive
        ? await this.customerRepository.activateCustomer(id)
        : await this.customerRepository.deactivateCustomer(id);

      return {
        success: true,
        message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: updated,
      };
    } catch (error) {
      return { success: false, message: 'Failed to update customer status' };
    }
  }

  /**
   * Soft-delete / deactivate a customer
   */
  async deactivateCustomer(id: number) {
    return this.setCustomerStatus(id, false);
  }

  /**
   * Activate a customer
   */
  async activateCustomer(id: number) {
    return this.setCustomerStatus(id, true);
  }
}
