import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { allStockLotTools } from './tools/stockLot.tools';
import { allStockMovementTools } from './tools/stockMovement.tools';
import { allSupplierTools } from './tools/supplier.tools';
import { allCustomerTools } from './tools/customer.tools';
import { allPurchaseTools } from './tools/purchase.tools';

const allTools = [...allStockLotTools, ...allStockMovementTools, ...allSupplierTools, ...allCustomerTools, ...allPurchaseTools];

// Create the MCP server
const server = new Server(
  {
    name: 'golden-yarns-mcp-agent',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    }
  }
);

// Set up resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: []
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  throw new Error(`Resource not found: ${request.params.uri}`);
});

// Set up tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ping',
        description: 'Simple ping tool to test the server',
        inputSchema: {
          type: 'object' as const,
          properties: {},
          required: [],
        },
      },
      ...allTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: {
          type: 'object' as const,
          properties: tool.inputSchema,
        },
      })),
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'ping') {
    return {
      content: [
        {
          type: 'text',
          text: 'pong',
        },
      ],
    };
  }

  // Find the matching tool
  const tool = allTools.find(t => t.name === request.params.name);
  if (tool) {
    try {
      return await tool.handler(request.params.arguments as any);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              message: 'Tool execution failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Golden Yarns MCP Agent running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
