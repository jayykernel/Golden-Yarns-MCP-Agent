import { Supplier } from '@prisma/client';
import { SupplierRepository } from '../repositories/supplier.repository';
import {
  CreateSupplierInput,
  UpdateSupplierInput,
  GetSuppliersFilter,
  SupplierStatement,
  SupplierFinancialSummary,
} from '../types/supplier.types';
import {
  createSupplierSchema,
  updateSupplierSchema,
  listSuppliersSchema,
  setSupplierStatusSchema,
  getSupplierStatementSchema,
} from '../utils/supplier.validation';

export class SupplierService {
  private supplierRepository: SupplierRepository;

  constructor(repository?: SupplierRepository) {
    this.supplierRepository = repository || new SupplierRepository();
  }

  /**
   * Create a new supplier with duplicate name detection
   */
  async createSupplier(input: CreateSupplierInput): Promise<{
    success: boolean;
    message: string;
    data?: Supplier;
  }> {
    try {
      const validation = createSupplierSchema.safeParse(input);
      if (!validation.success) {
        return {
          success: false,
          message: validation.error.errors.map((e) => e.message).join(', '),
        };
      }

      const trimmedName = input.name.trim();

      // Check for duplicate supplier name
      const existing = await this.supplierRepository.getSupplierByName(trimmedName);
      if (existing) {
        return {
          success: false,
          message: `Supplier with name "${trimmedName}" already exists`,
        };
      }

      const supplier = await this.supplierRepository.createSupplier({
        name: trimmedName,
        contactPerson: input.contactPerson?.trim() || undefined,
        email: input.email?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        address: input.address?.trim() || undefined,
        taxId: input.taxId?.trim() || undefined,
        isActive: input.isActive !== undefined ? input.isActive : true,
      });

      return {
        success: true,
        message: `Supplier "${supplier.name}" created successfully`,
        data: supplier,
      };
    } catch (error) {
      console.error('Error creating supplier:', error);
      return { success: false, message: 'Failed to create supplier' };
    }
  }

  /**
   * Get a supplier by ID
   */
  async getSupplierById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: Supplier;
  }> {
    try {
      if (!id || id <= 0) {
        return { success: false, message: 'Invalid supplier ID' };
      }

      const supplier = await this.supplierRepository.getSupplierById(id);
      if (!supplier) {
        return { success: false, message: `Supplier with ID ${id} not found` };
      }

      return {
        success: true,
        message: 'Supplier retrieved successfully',
        data: supplier,
      };
    } catch (error) {
      console.error('Error retrieving supplier:', error);
      return { success: false, message: 'Failed to retrieve supplier' };
    }
  }

  /**
   * List suppliers with search, status filtering, and pagination
   */
  async listSuppliers(filters: GetSuppliersFilter = {}): Promise<{
    success: boolean;
    message: string;
    data?: Supplier[];
    count?: number;
  }> {
    try {
      const validation = listSuppliersSchema.safeParse(filters);
      if (!validation.success) {
        return {
          success: false,
          message: validation.error.errors.map((e) => e.message).join(', '),
        };
      }

      const suppliers = await this.supplierRepository.getSuppliers(filters);
      const count = await this.supplierRepository.getSupplierCount(filters);

      return {
        success: true,
        message: `Retrieved ${suppliers.length} suppliers`,
        data: suppliers,
        count,
      };
    } catch (error) {
      console.error('Error listing suppliers:', error);
      return { success: false, message: 'Failed to list suppliers' };
    }
  }

  /**
   * Update an existing supplier with duplicate name protection
   */
  async updateSupplier(input: UpdateSupplierInput): Promise<{
    success: boolean;
    message: string;
    data?: Supplier;
  }> {
    try {
      const validation = updateSupplierSchema.safeParse(input);
      if (!validation.success) {
        return {
          success: false,
          message: validation.error.errors.map((e) => e.message).join(', '),
        };
      }

      const existing = await this.supplierRepository.getSupplierById(input.id);
      if (!existing) {
        return { success: false, message: `Supplier with ID ${input.id} not found` };
      }

      if (input.name !== undefined) {
        const trimmedName = input.name.trim();
        if (trimmedName.toLowerCase() !== existing.name.toLowerCase()) {
          const duplicate = await this.supplierRepository.getSupplierByName(trimmedName);
          if (duplicate && duplicate.id !== input.id) {
            return {
              success: false,
              message: `Supplier with name "${trimmedName}" already exists`,
            };
          }
        }
      }

      const updateData: UpdateSupplierInput = {
        id: input.id,
      };
      if (input.name !== undefined) updateData.name = input.name.trim();
      if (input.contactPerson !== undefined) updateData.contactPerson = input.contactPerson.trim() || undefined;
      if (input.email !== undefined) updateData.email = input.email.trim() || undefined;
      if (input.phone !== undefined) updateData.phone = input.phone.trim() || undefined;
      if (input.address !== undefined) updateData.address = input.address.trim() || undefined;
      if (input.taxId !== undefined) updateData.taxId = input.taxId.trim() || undefined;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      const updated = await this.supplierRepository.updateSupplier(input.id, updateData);

      return {
        success: true,
        message: `Supplier "${updated.name}" updated successfully`,
        data: updated,
      };
    } catch (error) {
      console.error('Error updating supplier:', error);
      return { success: false, message: 'Failed to update supplier' };
    }
  }

  /**
   * Set supplier active / inactive status
   */
  async setSupplierStatus(
    id: number,
    isActive: boolean
  ): Promise<{
    success: boolean;
    message: string;
    data?: Supplier;
  }> {
    try {
      const validation = setSupplierStatusSchema.safeParse({ id, isActive });
      if (!validation.success) {
        return {
          success: false,
          message: validation.error.errors.map((e) => e.message).join(', '),
        };
      }

      const existing = await this.supplierRepository.getSupplierById(id);
      if (!existing) {
        return { success: false, message: `Supplier with ID ${id} not found` };
      }

      const updated = isActive
        ? await this.supplierRepository.activateSupplier(id)
        : await this.supplierRepository.deactivateSupplier(id);

      const action = isActive ? 'activated' : 'deactivated';
      return {
        success: true,
        message: `Supplier "${updated.name}" has been ${action} successfully`,
        data: updated,
      };
    } catch (error) {
      console.error('Error updating supplier status:', error);
      return { success: false, message: 'Failed to update supplier status' };
    }
  }

  /**
   * Deactivate a supplier (soft deletion)
   */
  async deactivateSupplier(id: number): Promise<{
    success: boolean;
    message: string;
    data?: Supplier;
  }> {
    return this.setSupplierStatus(id, false);
  }

  /**
   * Activate a supplier
   */
  async activateSupplier(id: number): Promise<{
    success: boolean;
    message: string;
    data?: Supplier;
  }> {
    return this.setSupplierStatus(id, true);
  }

  /**
   * Generate comprehensive supplier account statement and payable balance reconciliation
   */
  async getSupplierStatement(
    supplierId: number,
    options?: { startDate?: string; endDate?: string }
  ): Promise<{
    success: boolean;
    message: string;
    data?: SupplierStatement;
  }> {
    try {
      const validation = getSupplierStatementSchema.safeParse({
        supplierId,
        startDate: options?.startDate,
        endDate: options?.endDate,
      });

      if (!validation.success) {
        return {
          success: false,
          message: validation.error.errors.map((e) => e.message).join(', '),
        };
      }

      const startDate = options?.startDate ? new Date(options.startDate) : undefined;
      const endDate = options?.endDate ? new Date(options.endDate) : undefined;

      const supplier = await this.supplierRepository.getSupplierWithRelations(supplierId, {
        startDate,
        endDate,
      });

      if (!supplier) {
        return { success: false, message: `Supplier with ID ${supplierId} not found` };
      }

      // Calculate total purchases
      const totalPurchases = (supplier.purchases || []).reduce(
        (sum, purchase) => sum + Number(purchase.totalAmount),
        0
      );

      // Calculate total expenses
      const totalExpenses = supplier.suppliedExpenses.reduce(
        (sum, exp) => sum + Number(exp.amount),
        0
      );

      // Calculate total payments made to supplier (excluding BOUNCED payments)
      const validPayments = supplier.supplierPayments.filter((p) => p.status !== 'BOUNCED');
      const totalPayments = validPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      // Outstanding payable balance
      const outstandingPayable = Number((totalPurchases + totalExpenses - totalPayments).toFixed(2));

      const summary: SupplierFinancialSummary = {
        supplierId: supplier.id,
        supplierName: supplier.name,
        taxId: supplier.taxId,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        isActive: supplier.isActive,
        totalPurchases: Number(totalPurchases.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        totalPayments: Number(totalPayments.toFixed(2)),
        outstandingPayable,
      };

      const statement: SupplierStatement = {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          contactPerson: supplier.contactPerson,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          taxId: supplier.taxId,
          isActive: supplier.isActive,
          createdAt: supplier.createdAt,
          updatedAt: supplier.updatedAt,
        },
        summary,
        purchases: supplier.purchases.map((purchase) => ({
          id: purchase.id,
          lotNumber: `PUR-${purchase.id}`,
          purchaseDate: purchase.purchaseDate,
          netWeight: 0, // Not directly available on Purchase
          grossWeight: 0,
          purchaseCost: Number(purchase.totalAmount),
          currentStatus: purchase.status,
          notes: purchase.notes,
        })),
        expenses: supplier.suppliedExpenses.map((exp) => ({
          id: exp.id,
          description: exp.description,
          expenseDate: exp.expenseDate,
          category: exp.category,
          amount: Number(exp.amount),
          status: exp.status,
          notes: exp.notes,
        })),
        payments: supplier.supplierPayments.map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          paymentDate: p.paymentDate,
          paymentMethod: p.paymentMethod,
          reference: p.reference,
          status: p.status,
          notes: p.notes,
        })),
      };

      return {
        success: true,
        message: `Supplier statement for "${supplier.name}" retrieved successfully`,
        data: statement,
      };
    } catch (error) {
      console.error('Error generating supplier statement:', error);
      return { success: false, message: 'Failed to generate supplier statement' };
    }
  }
}
