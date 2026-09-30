import { z } from 'zod';
import { StockLotService } from '../services/stockLot.service';
import { createStockLotSchema, getStockLotSchema, getStockLotsSchema } from '../utils/stockLot.validation';

// Initialize service
const stockLotService = new StockLotService();

// MCP Tool definitions
export const stockLotTools = {
  createStockLot: {
    name: 'create_stock_lot',
    description: 'Create a new stock lot with full traceability information',
    inputSchema: createStockLotSchema.shape,
    handler: async (args: z.infer<typeof createStockLotSchema>) => {
      try {
        // Validate input
        const validatedData = createStockLotSchema.parse(args);

        // Create stock lot
        const result = await stockLotService.createStockLot(validatedData);

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: result.message
                }, null, 2)
              }
            ],
            isError: true
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: result.message,
                data: result.data
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'Validation failed',
                  errors: error.errors
                }, null, 2)
              }
            ],
            isError: true
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                message: 'Internal server error'
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    }
  },

  getStockLot: {
    name: 'get_stock_lot',
    description: 'Retrieve a stock lot by ID or lot number',
    inputSchema: getStockLotSchema.shape,
    handler: async (args: z.infer<typeof getStockLotSchema>) => {
      try {
        // Validate input
        const validatedArgs = getStockLotSchema.parse(args);

        let result;
        if (validatedArgs.id !== undefined) {
          result = await stockLotService.getStockLotById(validatedArgs.id);
        } else if (validatedArgs.lotNumber !== undefined) {
          result = await stockLotService.getStockLotByLotNumber(validatedArgs.lotNumber);
        }

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: result.message
                }, null, 2)
              }
            ],
            isError: true
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: result.message,
                data: result.data
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'Validation failed',
                  errors: error.errors
                }, null, 2)
              }
            ],
            isError: true
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                message: 'Internal server error'
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    }
  },

  getStockLots: {
    name: 'get_stock_lots',
    description: 'Retrieve multiple stock lots with optional filtering',
    inputSchema: getStockLotsSchema.shape,
    handler: async (args: z.infer<typeof getStockLotsSchema>) => {
      try {
        // Validate input
        const validatedArgs = getStockLotsSchema.parse(args);

        // Get stock lots
        const result = await stockLotService.getStockLots(validatedArgs);

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: result.message
                }, null, 2)
              }
            ],
            isError: true
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: result.message,
                data: result.data,
                count: result.count
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'Validation failed',
                  errors: error.errors
                }, null, 2)
              }
            ],
            isError: true
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                message: 'Internal server error'
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    }
  }
};

// Export all tools as an array for easy registration
export const allStockLotTools = Object.values(stockLotTools);