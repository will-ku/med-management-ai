#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOL } from "./constants.js";
import { PrescriptionService } from "../services/PrescriptionService.js";
import { db } from "../db/init.js";

export class MedicationMCPServer {
  private server: Server;
  private prescriptionService: PrescriptionService;

  constructor() {
    console.log("=== MCP Server Initializing ===");
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

    this.setupErrorHandling();
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.prescriptionService = new PrescriptionService(db);
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

  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: `prescription://`,
          name: `Gets all prescriptions for a user`,
          mimeType: "application/json",
          description:
            "Gets all prescriptions for a user. However, since there is no User table and no concepts of users, this will just get * from the Prescriptions table. This will allow the LLM to understand the medications a user is taking.",
        },
      ],
    }));

    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        if (request.params.uri !== `prescription://`) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Unknown resource: ${request.params.uri}`
          );
        }
        try {
          const response = await this.prescriptionService.getPrescriptions();
          return {
            content: [
              {
                uri: request.params.uri,
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Error fetching prescriptions: ${error}`
          );
        }
      }
    );
  }

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
          try {
            const prescriptions =
              await this.prescriptionService.getPrescriptions();
            const prescriptionsStringified = prescriptions
              .map(
                (med) =>
                  `${med.medicationName}: ${med.dosage}, ${med.frequency}`
              )
              .join("; ");
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(prescriptionsStringified, null, 2),
                },
              ],
            };
          } catch (error) {
            console.error("Error in get_prescriptions:", error);
            throw new McpError(
              ErrorCode.InternalError,
              `Error fetching prescriptions: ${error}`
            );
          }
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
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error("Medication MCP server running on stdio");
    } catch (error) {
      console.error("Failed to initialize MCP server:", error);
      throw error;
    }
  }
}

const server = new MedicationMCPServer();
server
  .run()
  .then((ok) => console.log(`MCP Server started successfully ${ok}`))
  .catch((error) => {
    console.error("Fatal error running MCP server:", error);
    process.exit(1);
  });
