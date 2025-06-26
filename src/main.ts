#!/usr/bin/env node

/**
 * v0-mcp: MCP Server for Vercel v0 API Integration
 * Provides AI-powered UI generation tools for Claude Code
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { config, validateConfig } from './config/index.js';
import { V0Tools } from './mcp/tools.js';
import { logServerEvent } from './utils/logger.js';

/**
 * Main MCP Server implementation
 */
class V0McpServer {
  private server: Server;
  private v0Tools: V0Tools;

  constructor() {
    this.server = new Server(
      {
        name: config.mcp.serverName,
        version: config.mcp.version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.v0Tools = new V0Tools();
    this.setupHandlers();
  }

  /**
   * Set up MCP request handlers
   */
  private setupHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.v0Tools.listTools(),
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        const result = await this.v0Tools.callTool(name, args);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool "${name}": ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    try {
      // Validate configuration
      validateConfig();
      
      logServerEvent('server_starting', {
        serverName: config.mcp.serverName,
        version: config.mcp.version,
        baseUrl: config.v0.baseUrl,
        defaultModel: config.v0.defaultModel,
      });
      
      // Create transport (stdio for MCP)
      const transport = new StdioServerTransport();
      
      // Connect and start server
      await this.server.connect(transport);
      
      logServerEvent('server_started', {
        availableTools: this.v0Tools.listTools().length,
      });
      
      console.error(`✅ v0-mcp server started successfully`);
      console.error(`📡 Server: ${config.mcp.serverName} v${config.mcp.version}`);
      console.error(`🎨 Available tools: ${this.v0Tools.listTools().length}`);
      console.error(`🔗 Base URL: ${config.v0.baseUrl}`);
      console.error(`🤖 Default model: ${config.v0.defaultModel}`);
    } catch (error) {
      logServerEvent('server_start_failed', { error: String(error) });
      throw error;
    }
  }

  /**
   * Handle graceful shutdown
   */
  async shutdown(): Promise<void> {
    logServerEvent('server_shutting_down');
    console.error('🛑 Shutting down v0-mcp server...');
    
    try {
      await this.server.close();
      logServerEvent('server_shutdown_complete');
    } catch (error) {
      logServerEvent('server_shutdown_error', { error: String(error) });
      throw error;
    }
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const server = new V0McpServer();

  // Handle process signals for graceful shutdown
  process.on('SIGINT', async () => {
    await server.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.shutdown();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  try {
    await server.start();
  } catch (error) {
    console.error('❌ Failed to start v0-mcp server:', error);
    process.exit(1);
  }
}

// Start the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { V0McpServer };