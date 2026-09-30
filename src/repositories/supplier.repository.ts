import { PrismaClient, Supplier } from '@prisma/client';
import {
  SupplierWithRelations,
  CreateSupplierInput,
  UpdateSupplierInput,
  GetSuppliersFilter,
} from '../types/supplier.types';

const prisma = new PrismaClient();

export class SupplierRepository {
  /**
   * Create a new supplier
   */
  async createSupplier(data: CreateSupplierInput): Promise<Supplier> {
    return prisma.supplier.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        taxId: data.taxId,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  /**
   * Get a supplier by ID
   */
  async getSupplierById(id: number): Promise<Supplier | null> {
    return prisma.supplier.findUnique({
      where: { id },
    });
  }

  /**
   * Get a supplier by Name (for duplicate detection)
   */
  async getSupplierByName(name: string): Promise<Supplier | null> {
    return prisma.supplier.findFirst({
      where: {
        name: { equals: name },
      },
    });
  }

  /**
   * Get a supplier with related lots, payments, and expenses
   */
  async getSupplierWithRelations(
    id: number,
    dateRange?: { startDate?: Date; endDate?: Date }
  ): Promise<SupplierWithRelations | null> {
    const lotWhere: any = {};
    const paymentWhere: any = {};
    const expenseWhere: any = {};

    if (dateRange?.startDate || dateRange?.endDate) {
      if (dateRange.startDate) {
        lotWhere.purchaseDate = { ...lotWhere.purchaseDate, gte: dateRange.startDate };
        paymentWhere.paymentDate = { ...paymentWhere.paymentDate, gte: dateRange.startDate };
        expenseWhere.expenseDate = { ...expenseWhere.expenseDate, gte: dateRange.startDate };
      }
      if (dateRange.endDate) {
        lotWhere.purchaseDate = { ...lotWhere.purchaseDate, lte: dateRange.endDate };
        paymentWhere.paymentDate = { ...paymentWhere.paymentDate, lte: dateRange.endDate };
        expenseWhere.expenseDate = { ...expenseWhere.expenseDate, lte: dateRange.endDate };
      }
    }

    return prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseLots: {
          where: lotWhere,
          orderBy: { purchaseDate: 'desc' },
        },
        supplierPayments: {
          where: paymentWhere,
          orderBy: { paymentDate: 'desc' },
        },
        suppliedExpenses: {
          where: expenseWhere,
          orderBy: { expenseDate: 'desc' },
        },
      },
    });
  }

  /**
   * Get all suppliers matching optional search, status and pagination
   */
  async getSuppliers(filters: GetSuppliersFilter = {}): Promise<Supplier[]> {
    const where: any = {};
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { contactPerson: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search } },
        { taxId: { contains: filters.search } },
      ];
    }

    return prisma.supplier.findMany({
      where,
      skip: filters.skip,
      take: filters.take,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get total supplier count matching filters
   */
  async getSupplierCount(filters: GetSuppliersFilter = {}): Promise<number> {
    const where: any = {};
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { contactPerson: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search } },
        { taxId: { contains: filters.search } },
      ];
    }

    return prisma.supplier.count({ where });
  }

  /**
   * Update supplier details
   */
  async updateSupplier(id: number, data: Partial<CreateSupplierInput>): Promise<Supplier> {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  /**
   * Deactivate supplier (soft delete)
   */
  async deactivateSupplier(id: number): Promise<Supplier> {
    return prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Activate supplier
   */
  async activateSupplier(id: number): Promise<Supplier> {
    return prisma.supplier.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
