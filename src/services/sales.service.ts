import { SaleRepository, CreateSaleInput, UpdateSaleInput } from '../repositories/sales.repository';
import { CreateSaleInput as DomainCreateSaleInput, UpdateSaleInput as DomainUpdateSaleInput } from '../types/sales.types';
import { createSaleSchema, listSalesSchema } from '../utils/sales.validation';
import { StockLotRepository } from '../repositories/stockLot.repository';
import { CustomerRepository } from '../repositories/customer.repository';
import { StockMovementService } from './stockMovement.service';

export class SaleService {
  private saleRepository: SaleRepository;
  private stockLotRepository: StockLotRepository;
  private customerRepository: CustomerRepository;
  private stockMovementService: StockMovementService;

  constructor(
    saleRepository?: SaleRepository,
    stockLotRepository?: StockLotRepository,
    customerRepository?: CustomerRepository,
    stockMovementService?: StockMovementService
  ) {
    this.saleRepository = saleRepository || new SaleRepository();
    this.stockLotRepository = stockLotRepository || new StockLotRepository();
    this.customerRepository = customerRepository || new CustomerRepository();
    this.stockMovementService = stockMovementService || new StockMovementService();
  }

  /**
   * Create a new sale
   * - Validates customer exists
   * - Validates available stock for all lots
   * - Creates sale record
   * - Records stock OUT movements
   * - Updates stock lot statuses
   */
  async createSale(input: DomainCreateSaleInput) {
    try {
      // Validate input
      const validatedData = createSaleSchema.parse(input);

      // Validate customer exists
      const customer = await this.customerRepository.getCustomerById(validatedData.customerId);
      if (!customer) {
        return { success: false, message: `Customer with ID ${validatedData.customerId} not found.` };
      }

      // Validate all lots exist and have sufficient stock
      let totalSaleAmount = 0;
      const lotValidations = await Promise.all(
        validatedData.lotDetails.map(async (detail) => {
          const lot = await this.stockLotRepository.getStockLotById(detail.lotId);
          if (!lot) {
            return { valid: false, error: `Stock lot with ID ${detail.lotId} not found.` };
          }

          if (lot.currentStatus !== 'IN_STOCK' && lot.currentStatus !== 'RESERVED') {
            return { valid: false, error: `Stock lot ${lot.lotNumber} is not available (status: ${lot.currentStatus}).` };
          }

          if (lot.netWeight < detail.quantity) {
            return { valid: false, error: `Insufficient stock in lot ${lot.lotNumber}. Available: ${lot.netWeight}kg, Requested: ${detail.quantity}kg` };
          }

          totalSaleAmount += detail.quantity * detail.sellingPrice;
          return { valid: true, lot };
        })
      );

      // Check for validation errors
      const invalidValidation = lotValidations.find(v => !v.valid);
      if (invalidValidation && !invalidValidation.valid) {
        return { success: false, message: invalidValidation.error };
      }

      if (totalSaleAmount <= 0) {
        return { success: false, message: 'Total sale amount must be positive.' };
      }

      // Create sale record
      const saleData: CreateSaleInput = {
        customerId: validatedData.customerId,
        saleDate: validatedData.saleDate ? new Date(validatedData.saleDate) : new Date(),
        totalAmount: totalSaleAmount,
        status: 'PENDING',
        notes: validatedData.notes,
      };

      const sale = await this.saleRepository.createSale(saleData);

      // Create sale items and record stock OUT movements
      const saleItems = await Promise.all(
        validatedData.lotDetails.map(async (detail, index) => {
          const totalPrice = detail.quantity * detail.sellingPrice;

          // Create sale item
          const saleItem = await this.saleRepository.createSaleItem({
            saleId: sale.id,
            lotId: detail.lotId,
            quantity: detail.quantity,
            unitPrice: detail.sellingPrice,
            totalPrice,
          });

          // Record stock OUT movement
          await this.stockMovementService.recordStockMovement({
            lotId: detail.lotId,
            movementType: 'OUT',
            quantity: detail.quantity,
            referenceType: 'SALE',
            referenceId: `${sale.id}`,
            notes: `Sold via Sale ID: ${sale.id}`,
          });

          return saleItem;
        })
      );

      return {
        success: true,
        message: 'Sale created successfully',
        data: {
          sale,
          items: saleItems,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: `Failed to create sale: ${error.message}` };
      }
      return { success: false, message: 'An unknown error occurred while creating the sale' };
    }
  }

  /**
   * Get a sale by ID
   */
  async getSale(id: number) {
    try {
      if (!id || id <= 0) {
        return { success: false, message: 'Invalid sale ID' };
      }

      const sale = await this.saleRepository.getSaleById(id);
      if (!sale) {
        return { success: false, message: `Sale with ID ${id} not found.` };
      }

      return { success: true, message: 'Sale retrieved successfully', data: sale };
    } catch (error) {
      return { success: false, message: 'Failed to retrieve sale' };
    }
  }

  /**
   * List sales with optional filtering
   */
  async listSales(filters: any = {}) {
    try {
      const validatedFilters = listSalesSchema.parse(filters);

      const dateRange = validatedFilters.startDate || validatedFilters.endDate
        ? {
            startDate: validatedFilters.startDate ? new Date(validatedFilters.startDate) : undefined,
            endDate: validatedFilters.endDate ? new Date(validatedFilters.endDate) : undefined,
          }
        : undefined;

      const sales = await this.saleRepository.getSales({
        customerId: validatedFilters.customerId,
        status: validatedFilters.status,
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
      });

      const totalCount = await this.saleRepository.getSaleCount({
        customerId: validatedFilters.customerId,
        status: validatedFilters.status,
      });

      return {
        success: true,
        message: 'Sales retrieved successfully',
        data: sales,
        count: totalCount,
      };
    } catch (error) {
      return { success: false, message: 'Failed to list sales' };
    }
  }

  /**
   * Update an existing sale
   */
  async updateSale(input: DomainUpdateSaleInput & { id: number }) {
    try {
      if (!input.id || input.id <= 0) {
        return { success: false, message: 'Invalid sale ID' };
      }

      // Verify existence
      const existingSale = await this.saleRepository.getSaleById(input.id);
      if (!existingSale) {
        return { success: false, message: `Sale with ID ${input.id} not found.` };
      }

      // Update sale
      const updateData: UpdateSaleInput = {};

      if (input.saleDate) {
        updateData.saleDate = new Date(input.saleDate);
      }

      if (input.notes !== undefined) {
        updateData.notes = input.notes;
      }

      if (input.status) {
        updateData.status = input.status;
      }

      const updated = await this.saleRepository.updateSale(input.id, updateData);

      return {
        success: true,
        message: 'Sale updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: `Failed to update sale: ${error.message}` };
      }
      return { success: false, message: 'An unknown error occurred while updating the sale' };
    }
  }

  /**
   * Cancel a sale (reverse stock OUT movements, restore stock)
   */
  async cancelSale(id: number) {
    try {
      if (!id || id <= 0) {
        return { success: false, message: 'Invalid sale ID' };
      }

      // Verify existence
      const existingSale = await this.saleRepository.getSaleById(id);
      if (!existingSale) {
        return { success: false, message: `Sale with ID ${id} not found.` };
      }

      // Get all sale items
      const saleItems = await this.saleRepository.getSaleItems(id);

      // Record reverse stock IN movements for each item
      await Promise.all(
        saleItems.map(item =>
          this.stockMovementService.recordStockMovement({
            lotId: item.lotId,
            movementType: 'IN',
            quantity: item.quantity,
            referenceType: 'RETURN',
            referenceId: `${id}`,
            notes: `Sale cancelled. Reversing Sale ID: ${id}`,
          })
        )
      );

      // Mark sale as cancelled
      await this.saleRepository.updateSale(id, { status: 'CANCELLED' });

      return {
        success: true,
        message: 'Sale cancelled successfully and inventory restored',
      };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: `Failed to cancel sale: ${error.message}` };
      }
      return { success: false, message: 'An unknown error occurred while cancelling the sale' };
    }
  }
}
