import { z } from 'zod';
import { StockMovementService } from '../services/stockMovement.service';
import {
  recordStockMovementSchema,
  adjustStockLotSchema,
  getLotMovementsSchema,
  getMovementHistorySchema,
} from '../utils/stockMovement.validation';

const stockMovementService = new StockMovementService();

export const stockMovementTools = {
  recordStockMovement: {
    name: 'record_stock_movement',
    description: 'Record a stock movement (IN, OUT, RETURN) with atomic balance update and negative-stock prevention',
    inputSchema: recordStockMovementSchema.shape,
    handler: async (args: z.infer<typeof recordStockMovementSchema>) => {
      try {
        const validatedData = recordStockMovementSchema.parse(args);
        const result = await stockMovementService.recordStockMovement(validatedData);

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    message: result.message,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: result.message,
                  data: result.data,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    message: 'Validation failed',
                    errors: error.errors,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  message: 'Internal server error',
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    },
  },

  adjustStockLot: {
    name: 'adjust_stock_lot',
    description: 'Adjust a stock lot net weight (physical count / audit adjustment) and log the adjustment movement',
    inputSchema: adjustStockLotSchema.shape,
    handler: async (args: z.infer<typeof adjustStockLotSchema>) => {
      try {
        const validatedData = adjustStockLotSchema.parse(args);
        const result = await stockMovementService.adjustStock(validatedData);

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    message: result.message,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: result.message,
                  data: result.data,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    message: 'Validation failed',
                    errors: error.errors,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  message: 'Internal server error',
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    },
  },

  getLotMovements: {
    name: 'get_lot_movements',
    description: 'Retrieve all stock movement logs and history for a specific stock lot',
    inputSchema: getLotMovementsSchema.shape,
    handler: async (args: z.infer<typeof getLotMovementsSchema>) => {
      try {
        const validatedArgs = getLotMovementsSchema.parse(args);
        const result = await stockMovementService.getLotMovements(validatedArgs.lotId);

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    message: result.message,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: result.message,
                  data: result.data,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    message: 'Validation failed',
                    errors: error.errors,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  message: 'Internal server error',
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    },
  },

  getMovementHistory: {
    name: 'get_movement_history',
    description: 'Query all stock movement records with optional filters (movementType, date range, pagination)',
    inputSchema: getMovementHistorySchema.shape,
    handler: async (args: z.infer<typeof getMovementHistorySchema>) => {
      try {
        const validatedArgs = getMovementHistorySchema.parse(args);
        const result = await stockMovementService.getMovementHistory(validatedArgs);

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    message: result.message,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: result.message,
                  data: result.data,
                  count: result.count,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    message: 'Validation failed',
                    errors: error.errors,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  message: 'Internal server error',
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    },
  },

  getLotBalance: {
    name: 'get_lot_balance',
    description: 'Calculate and verify stock balance summary and audit reconciliation for a lot',
    inputSchema: getLotMovementsSchema.shape,
    handler: async (args: z.infer<typeof getLotMovementsSchema>) => {
      try {
        const validatedArgs = getLotMovementsSchema.parse(args);
        const result = await stockMovementService.getLotBalance(validatedArgs.lotId);

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    message: result.message,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: result.message,
                  data: result.data,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    message: 'Validation failed',
                    errors: error.errors,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  message: 'Internal server error',
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    },
  },
};

export const allStockMovementTools = Object.values(stockMovementTools);
