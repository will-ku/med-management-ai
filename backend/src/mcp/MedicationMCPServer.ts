#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOL } from "./constants.js";

export class MedicationMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "medication-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupResourceHandlers();
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupResourceHandlers(): void {}

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: TOOL.GET_PRESCRIPTIONS,
          description:
            "Gets all prescriptions for a user. However, since there is no User table and no concepts of users, this will just get * from the Prescriptions table",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: TOOL.UPDATE_PRESCRIPTION,
          description: "Updates a prescription for a user",
          inputSchema: {
            type: "object",
            properties: {
              prescriptionId: {
                type: "number",
                description: "The ID of the prescription to update.",
              },
              frequency: {
                type: "string",
                description: "The frequency of the prescription.",
              },
              dosage: {
                type: "string",
                description: "The dosage of the prescription.",
              },
            },
            required: ["prescriptionId"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (
        request.params.name !== TOOL.GET_PRESCRIPTIONS &&
        request.params.name !== TOOL.UPDATE_PRESCRIPTION
      ) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid tool name: ${request.params.name}`
        );
      }

      switch (request.params.name) {
        case TOOL.GET_PRESCRIPTIONS:
          return {
            content: [
              {
                type: "text",
                text: "get_prescriptions tool called",
              },
            ],
          };
        case TOOL.UPDATE_PRESCRIPTION:
          return {
            content: [
              {
                type: "text",
                text: "update_prescription tool called",
              },
            ],
          };
        default:
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid tool name: ${request.params.name}`
          );
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Although this is just an informative message, we must log to stderr,
    // to avoid interfering with MCP communication that happens on stdout
    console.error("Medication MCP server running on stdio");
  }
}

// Comment out, unless debugging with MCP Inspector Tool
// const server = new MedicationMCPServer();
// server.run().catch(console.error);
