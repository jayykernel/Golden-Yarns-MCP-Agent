import { PurchaseRepository, CreatePurchaseInput, UpdatePurchaseInput } from '../repositories/purchase.repository';
import { PurchaseInput as CreatePurchaseDomainInput, UpdatePurchaseInput as DomainUpdatePurchaseInput } from '../types/purchase.types';
import { purchaseInputSchema, listPurchasesSchema } from '../utils/purchase.validation';
import { StockLotRepository } from '../repositories/stockLot.repository';
import { SupplierRepository } from '../repositories/supplier.repository';

export class PurchaseService {
  private purchaseRepository: PurchaseRepository;
  private stockLotRepository: StockLotRepository;
  private supplierRepository: SupplierRepository;

  constructor(
    purchaseRepository?: PurchaseRepository,
    stockLotRepository?: StockLotRepository,
    supplierRepository?: SupplierRepository
  ) {
    this.purchaseRepository = purchaseRepository || new PurchaseRepository();
    this.stockLotRepository = stockLotRepository || new StockLotRepository();
    this.supplierRepository = supplierRepository || new SupplierRepository();
  }

  /**
   * Create a new purchase
   */
  async createPurchase(input: CreatePurchaseDomainInput) {
    try {
      // Validate input
      const validatedData = purchaseInputSchema.parse(input);

      // Validate supplier exists
      const supplier = await this.supplierRepository.getSupplierById(validatedData.supplierId);
      if (!supplier) {
        return { success: false, message: `Supplier with ID ${validatedData.supplierId} not found.` };
      }

      // Calculate total purchase cost from lot details
      const totalAmount = validatedData.lotDetails.reduce(
        (sum, lot) => sum + (lot.purchaseCost * lot.quantity),
        0
      );

      // Validate purchase amount
      if (totalAmount <= 0) {
        return { success: false, message: 'Total purchase amount must be positive.' };
      }

      // Create purchase record
      const purchaseData: CreatePurchaseInput = {
        supplierId: validatedData.supplierId,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : new Date(),
        totalAmount,
        status: 'PENDING',
        notes: validatedData.notes,
      };

      const purchase = await this.purchaseRepository.createPurchase(purchaseData);

      // Create stock lots for each lot detail
      const stockLotPromises = validatedData.lotDetails.map(async (lotDetail, index) => {
        // Generate unique lot number if not provided
        const lotNumber = lotDetail.lotNumber || `${purchase.id}-${index + 1}-${Date.now()}`;

        return this.stockLotRepository.createStockLot({
          lotNumber,
          yarnTypeId: lotDetail.yarnTypeId,
          yarnCountId: lotDetail.yarnCountId,
          colorId: lotDetail.colorId,
          netWeight: lotDetail.netWeight,
          grossWeight: lotDetail.netWeight * 1.1, // Assume 10% packaging
          quantity: lotDetail.quantity,
          unitOfMeasurement: 'kg',
          purchaseCost: lotDetail.purchaseCost * lotDetail.quantity,
          sellingPrice: undefined, // Not set at purchase time
          purchaseDate: purchaseData.purchaseDate,
          supplierId: purchaseData.supplierId,
          currentStatus: 'IN_STOCK',
          notes: `Purchased via Purchase ID: ${purchase.id}`,
        });
      });

      const stockLots = await Promise.all(stockLotPromises);

      return {
        success: true,
        message: 'Purchase created successfully',
        data: {
          purchase,
          stockLots,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: `Failed to create purchase: ${error.message}` };
      }
      return { success: false, message: 'An unknown error occurred while creating the purchase' };
    }
  }

  /**
   * Get a purchase by ID
   */
  async getPurchase(id: number) {
    try {
      if (!id || id <= 0) {
        return { success: false, message: 'Invalid purchase ID' };
      }

      const purchase = await this.purchaseRepository.getPurchaseById(id);
      if (!purchase) {
        return { success: false, message: `Purchase with ID ${id} not found.` };
      }

      return { success: true, message: 'Purchase retrieved successfully', data: purchase };
    } catch (error) {
      return { success: false, message: 'Failed to retrieve purchase' };
    }
  }

  /**
   * List purchases with optional filtering
   */
  async listPurchases(filters: any = {}) {
    try {
      const validatedFilters = listPurchasesSchema.parse(filters);

      const dateRange = validatedFilters.startDate || validatedFilters.endDate
        ? {
            startDate: validatedFilters.startDate ? new Date(validatedFilters.startDate) : undefined,
            endDate: validatedFilters.endDate ? new Date(validatedFilters.endDate) : undefined,
          }
        : undefined;

      const purchases = await this.purchaseRepository.getPurchases({
        supplierId: validatedFilters.supplierId,
        status: validatedFilters.status,
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
      });

      const totalCount = await this.purchaseRepository.getPurchaseCount({
        supplierId: validatedFilters.supplierId,
        status: validatedFilters.status,
      });

      return {
        success: true,
        message: 'Purchases retrieved successfully',
        data: purchases,
        count: totalCount,
      };
    } catch (error) {
      return { success: false, message: 'Failed to list purchases' };
    }
  }

  /**
   * Update an existing purchase
   */
  async updatePurchase(input: DomainUpdatePurchaseInput) {
    try {
      // Validate input
      // Note: We'll need to create an updatePurchaseSchema for complete validation

      // Verify existence
      const existingPurchase = await this.purchaseRepository.getPurchaseById(input.id);
      if (!existingPurchase) {
        return { success: false, message: `Purchase with ID ${input.id} not found.` };
      }

      // Update purchase
      const updateData: UpdatePurchaseInput = {};

      if (input.purchaseDate) {
        updateData.purchaseDate = new Date(input.purchaseDate);
      }

      if (input.notes !== undefined) {
        updateData.notes = input.notes;
      }

      // Only allow status updates for now
      // Full purchase updates with lot changes require more complex logic
      const updated = await this.purchaseRepository.updatePurchase(input.id, updateData);

      return {
        success: true,
        message: 'Purchase updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: `Failed to update purchase: ${error.message}` };
      }
      return { success: false, message: 'An unknown error occurred while updating the purchase' };
    }
  }

  /**
   * Delete a purchase
   */
  async deletePurchase(id: number) {
    try {
      if (!id || id <= 0) {
        return { success: false, message: 'Invalid purchase ID' };
      }

      // Verify existence
      const existingPurchase = await this.purchaseRepository.getPurchaseById(id);
      if (!existingPurchase) {
        return { success: false, message: `Purchase with ID ${id} not found.` };
      }

      // TODO: We need to handle the associated stock lots and business logic
      // For now, we'll just prevent deletion of purchases with associated items
      // Note: The actual check would need to verify if there are associated purchase items
      // For simplicity in this implementation, we'll allow deletion and handle cascading elsewhere

      await this.purchaseRepository.deletePurchase(id);

      return {
        success: true,
        message: 'Purchase deleted successfully',
      };
    } catch (error) {
      return { success: false, message: 'Failed to delete purchase' };
    }
  }
}
