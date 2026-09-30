import { Customer } from '@prisma/client';
import { CustomerRepository } from '../repositories/customer.repository';
import {
  CreateCustomerInput,
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
}
