import { StockLotRepository } from '../repositories/stockLot.repository';
import { StockLotWithRelations, GetStockLotsOptions } from '../types/stockLot.types';

export class StockLotService {
  private stockLotRepository: StockLotRepository;

  constructor() {
    this.stockLotRepository = new StockLotRepository();
  }

  /**
   * Create a new stock lot with validation
   */
  async createStockLot(data: {
    lotNumber: string;
    yarnTypeId: number;
    yarnCountId: number;
    colorId: number;
    netWeight: number;
    grossWeight: number;
    quantity?: number;
    unitOfMeasurement?: string;
    purchaseCost: number;
    sellingPrice?: number;
    purchaseDate: Date | string;
    manufacturingDate?: Date | string;
    expiryDate?: Date | string;
    warehouseLocation?: string;
    currentStatus?: string;
    notes?: string;
    supplierId?: number;
  }): Promise<{ success: boolean; message: string; data?: StockLotWithRelations }> {
    try {
      // Validate required fields
      if (!data.lotNumber) {
        return { success: false, message: 'Lot number is required' };
      }

      if (data.netWeight <= 0) {
        return { success: false, message: 'Net weight must be greater than 0' };
      }

      if (data.grossWeight < data.netWeight) {
        return { success: false, message: 'Gross weight cannot be less than net weight' };
      }

      if (data.purchaseCost < 0) {
        return { success: false, message: 'Purchase cost cannot be negative' };
      }

      if (data.sellingPrice !== undefined && data.sellingPrice < 0) {
        return { success: false, message: 'Selling price cannot be negative' };
      }

      // Convert string dates to Date objects if needed
      const purchaseDate = data.purchaseDate instanceof Date
        ? data.purchaseDate
        : new Date(data.purchaseDate);

      const manufacturingDate = data.manufacturingDate instanceof Date
        ? data.manufacturingDate
        : data.manufacturingDate ? new Date(data.manufacturingDate) : undefined;

      const expiryDate = data.expiryDate instanceof Date
        ? data.expiryDate
        : data.expiryDate ? new Date(data.expiryDate) : undefined;

      // Check if lot number already exists
      const existingLot = await this.stockLotRepository.getStockLotByLotNumber(data.lotNumber);
      if (existingLot) {
        return { success: false, message: 'Lot number already exists' };
      }

      // Create the stock lot
      const stockLot = await this.stockLotRepository.createStockLot({
        ...data,
        purchaseDate,
        manufacturingDate,
        expiryDate,
      });

      return {
        success: true,
        message: 'Stock lot created successfully',
        data: stockLot
      };
    } catch (error) {
      console.error('Error creating stock lot:', error);
      return {
        success: false,
        message: 'Failed to create stock lot',
      };
    }
  }

  /**
   * Get a stock lot by ID
   */
  async getStockLotById(id: number): Promise<{ success: boolean; message: string; data?: StockLotWithRelations }> {
    try {
      const stockLot = await this.stockLotRepository.getStockLotById(id);

      if (!stockLot) {
        return { success: false, message: 'Stock lot not found' };
      }

      return {
        success: true,
        message: 'Stock lot retrieved successfully',
        data: stockLot
      };
    } catch (error) {
      console.error('Error retrieving stock lot:', error);
      return {
        success: false,
        message: 'Failed to retrieve stock lot'
      };
    }
  }

  /**
   * Get a stock lot by lot number
   */
  async getStockLotByLotNumber(lotNumber: string): Promise<{ success: boolean; message: string; data?: StockLotWithRelations }> {
    try {
      const stockLot = await this.stockLotRepository.getStockLotByLotNumber(lotNumber);

      if (!stockLot) {
        return { success: false, message: 'Stock lot not found' };
      }

      return {
        success: true,
        message: 'Stock lot retrieved successfully',
        data: stockLot
      };
    } catch (error) {
      console.error('Error retrieving stock lot by lot number:', error);
      return {
        success: false,
        message: 'Failed to retrieve stock lot'
      };
    }
  }

  /**
   * Get all stock lots with filtering
   */
  async getStockLots(options: GetStockLotsOptions = {}): Promise<{ success: boolean; message: string; data?: StockLotWithRelations[]; count?: number }> {
    try {
      const stockLots = await this.stockLotRepository.getStockLots(options);

      const totalCount = await this.stockLotRepository.getStockLots({
        ...options,
        skip: undefined,
        take: undefined
      }).then(list => list.length);

      return {
        success: true,
        message: 'Stock lots retrieved successfully',
        data: stockLots,
        count: totalCount
      };
    } catch (error) {
      console.error('Error retrieving stock lots:', error);
      return {
        success: false,
        message: 'Failed to retrieve stock lots'
      };
    }
  }

  /**
   * Update a stock lot
   */
  async updateStockLot(id: number, data: Partial<{
    lotNumber: string;
    yarnTypeId: number;
    yarnCountId: number;
    colorId: number;
    netWeight: number;
    grossWeight: number;
    quantity: number;
    unitOfMeasurement: string;
    purchaseCost: number;
    sellingPrice: number;
    purchaseDate: Date | string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    warehouseLocation: string;
    currentStatus: string;
    notes: string;
    supplierId: number;
  }>): Promise<{ success: boolean; message: string; data?: StockLotWithRelations }> {
    try {
      // Validate if provided
      if (data.netWeight !== undefined && data.netWeight <= 0) {
        return { success: false, message: 'Net weight must be greater than 0' };
      }

      if (data.grossWeight !== undefined && data.netWeight !== undefined && data.grossWeight < data.netWeight) {
        return { success: false, message: 'Gross weight cannot be less than net weight' };
      }

      if (data.purchaseCost !== undefined && data.purchaseCost < 0) {
        return { success: false, message: 'Purchase cost cannot be negative' };
      }

      if (data.sellingPrice !== undefined && data.sellingPrice < 0) {
        return { success: false, message: 'Selling price cannot be negative' };
      }

      // Check if lot number already exists (if being updated)
      if (data.lotNumber) {
        const existingLot = await this.stockLotRepository.getStockLotByLotNumber(data.lotNumber);
        if (existingLot && existingLot.id !== id) {
          return { success: false, message: 'Lot number already exists' };
        }
      }

      // Convert string dates to Date objects if needed
      const purchaseDate = data.purchaseDate instanceof Date
        ? data.purchaseDate
        : data.purchaseDate ? new Date(data.purchaseDate) : undefined;

      const manufacturingDate = data.manufacturingDate instanceof Date
        ? data.manufacturingDate
        : data.manufacturingDate ? new Date(data.manufacturingDate) : undefined;

      const expiryDate = data.expiryDate instanceof Date
        ? data.expiryDate
        : data.expiryDate ? new Date(data.expiryDate) : undefined;

      // Update the stock lot
      const stockLot = await this.stockLotRepository.updateStockLot(id, {
        ...data,
        purchaseDate,
        manufacturingDate,
        expiryDate,
      });

      return {
        success: true,
        message: 'Stock lot updated successfully',
        data: stockLot
      };
    } catch (error) {
      console.error('Error updating stock lot:', error);
      return {
        success: false,
        message: 'Failed to update stock lot'
      };
    }
  }

  /**
   * Delete a stock lot (soft delete)
   */
  async deleteStockLot(id: number): Promise<{ success: boolean; message: string }> {
    try {
      await this.stockLotRepository.deleteStockLot(id);

      return {
        success: true,
        message: 'Stock lot deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting stock lot:', error);
      return {
        success: false,
        message: 'Failed to delete stock lot'
      };
    }
  }

  /**
   * Get available stock (lots with status IN_STOCK or RESERVED)
   */
  async getAvailableStock(options: {
    yarnTypeId?: number;
    yarnCountId?: number;
    colorId?: number;
  } = {}): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const stockLots = await this.stockLotRepository.getStockLots({
        ...options,
      });

      // Filter for available stock (IN_STOCK or RESERVED)
      const availableStockLots = stockLots.filter(lot =>
        lot.currentStatus === 'IN_STOCK' || lot.currentStatus === 'RESERVED'
      );

      // Calculate totals
      const totalNetWeight = availableStockLots.reduce((sum, lot) => sum + lot.netWeight, 0);
      const totalGrossWeight = availableStockLots.reduce((sum, lot) => sum + lot.grossWeight, 0);
      const totalQuantity = availableStockLots.reduce((sum, lot) => sum + (lot.quantity || 0), 0);

      // Group by yarn type, count, color for summary
      const summaryByType = availableStockLots.reduce((acc, lot) => {
        const typeName = lot.yarnType?.name || 'Unknown';
        if (!acc[typeName]) {
          acc[typeName] = { count: 0, totalWeight: 0, lots: [] };
        }
        acc[typeName].count += 1;
        acc[typeName].totalWeight += lot.netWeight;
        acc[typeName].lots.push({
          lotNumber: lot.lotNumber,
          netWeight: lot.netWeight,
          color: lot.color?.name || null,
          count: lot.yarnCount?.value || null
        });
        return acc;
      }, {} as Record<string, { count: number; totalWeight: number; lots: Array<{
        lotNumber: string;
        netWeight: number;
        color: string | null;
        count: string | null;
      }>}>);

      return {
        success: true,
        message: 'Available stock retrieved successfully',
        data: {
          lots: availableStockLots,
          summary: {
            totalLots: availableStockLots.length,
            totalNetWeight,
            totalGrossWeight,
            totalQuantity,
            byYarnType: summaryByType
          }
        }
      };
    } catch (error) {
      console.error('Error retrieving available stock:', error);
      return {
        success: false,
        message: 'Failed to retrieve available stock'
      };
    }
  }
}
