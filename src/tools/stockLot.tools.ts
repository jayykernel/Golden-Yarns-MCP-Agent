import { z } from 'zod';
import { StockLotService } from '../services/stockLot.service';
import { createStockLotSchema } from '../utils/stockLot.validation';

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
  }
};
