import { PrismaClient, Customer } from '@prisma/client';
import {
  CustomerWithRelations,
  CreateCustomerInput,
  GetCustomersFilter,
} from '../types/customer.types';

const prisma = new PrismaClient();

export class CustomerRepository {
  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerInput): Promise<Customer> {
    return prisma.customer.create({
      data: {
        name: data.name,
        company: data.company,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        taxId: data.taxId,
        creditLimit: data.creditLimit,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  /**
   * Get a customer by ID
   */
  async getCustomerById(id: number): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { id },
    });
  }

  /**
   * Get a customer by Name (for duplicate detection)
   */
  async getCustomerByName(name: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: {
        name: { equals: name },
      },
    });
  }

  /**
   * Get a customer with related sales and payments
   */
  async getCustomerWithRelations(
    id: number,
    dateRange?: { startDate?: Date; endDate?: Date }
  ): Promise<CustomerWithRelations | null> {
    const saleWhere: any = {};
    const paymentWhere: any = {};

    if (dateRange?.startDate || dateRange?.endDate) {
      if (dateRange.startDate) {
        saleWhere.saleDate = { ...saleWhere.saleDate, gte: dateRange.startDate };
        paymentWhere.paymentDate = { ...paymentWhere.paymentDate, gte: dateRange.startDate };
      }
      if (dateRange.endDate) {
        saleWhere.saleDate = { ...saleWhere.saleDate, lte: dateRange.endDate };
        paymentWhere.paymentDate = { ...paymentWhere.paymentDate, lte: dateRange.endDate };
      }
    }

    return prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          where: saleWhere,
          orderBy: { saleDate: 'desc' },
        },
        payments: {
          where: paymentWhere,
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
  }

  /**
   * Get all customers matching optional search, status and pagination
   */
  async getCustomers(filters: GetCustomersFilter = {}): Promise<Customer[]> {
    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { company: { contains: filters.search } },
        { contactPerson: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search } },
        { taxId: { contains: filters.search } },
      ];
    }

    return prisma.customer.findMany({
      where,
      skip: filters.skip,
      take: filters.take,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get total customer count matching filters
   */
  async getCustomerCount(filters: GetCustomersFilter = {}): Promise<number> {
    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { company: { contains: filters.search } },
        { contactPerson: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search } },
        { taxId: { contains: filters.search } },
      ];
    }

    return prisma.customer.count({ where });
  }

  /**
   * Update customer details
   */
  async updateCustomer(id: number, data: Partial<CreateCustomerInput>): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  /**
   * Deactivate customer (soft delete)
   */
  async deactivateCustomer(id: number): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Activate customer
   */
  async activateCustomer(id: number): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
