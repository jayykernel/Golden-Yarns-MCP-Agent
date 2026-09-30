import { Customer } from '@prisma/client';
import { CustomerRepository } from '../repositories/customer.repository';
import {
  CreateCustomerInput,
  GetCustomersFilter,
} from '../types/customer.types';
import {
  createCustomerSchema,
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
}
