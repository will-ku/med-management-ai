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
import { isValidDeletePrescriptionArgs } from "../types/prescription.js";

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
            "Lists all current medications a patient is taking. Use this tool first before making any changes to verify current prescriptions. Returns medication names, dosages, and frequencies in an easy-to-read format. Always use this tool when: 1) Patient asks about their medications 2) Before updating/deleting to verify details 3) To get prescription IDs needed for other operations.",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: TOOL.UPDATE_PRESCRIPTION,
          description:
            "Updates dosage or frequency for an existing medication. REQUIREMENTS: 1) Must have prescription ID (get it from get_prescriptions first) 2) Can only modify existing prescriptions 3) Cannot add new medications or delete existing ones. If patient wants to stop a medication, use delete_prescription instead.",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "number",
                description:
                  "The ID of the prescription to update (required, get this from get_prescriptions first).",
              },
              frequency: {
                type: "string",
                description:
                  "How often to take the medication (e.g., 'twice daily', 'every morning').",
              },
              dosage: {
                type: "string",
                description:
                  "Amount of medication to take (e.g., '10mg', '2 tablets').",
              },
            },
            required: ["id"],
          },
        },
        {
          name: TOOL.DELETE_PRESCRIPTION,
          description:
            "Removes a medication from patient's current list. CRITICAL: Only use when patient explicitly states they stopped taking a specific medication. REQUIRED STEPS: 1) Always use get_prescriptions first to confirm medication details 2) Verify with patient before deleting 3) Must have correct prescription ID. Never guess the ID.",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "number",
                description:
                  "The ID of the prescription to delete (required, get this from get_prescriptions first).",
              },
            },
            required: ["id"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (
        request.params.name !== TOOL.GET_PRESCRIPTIONS &&
        request.params.name !== TOOL.UPDATE_PRESCRIPTION &&
        request.params.name !== TOOL.DELETE_PRESCRIPTION
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

            console.error("prescriptions", prescriptions);
            console.error("prescriptions.length", prescriptions.length);
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
        case TOOL.DELETE_PRESCRIPTION:
          console.error(
            "Delete prescription arguments:",
            request.params.arguments
          );
          try {
            if (!isValidDeletePrescriptionArgs(request.params.arguments)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid delete_prescription arguments"
              );
            }
            const { id } = request.params.arguments;
            await this.prescriptionService.deletePrescription(id);

            return {
              content: [
                {
                  type: "text",
                  text: `delete_prescription tool deleted prescription ID ${id}`,
                },
              ],
            };
          } catch (error) {
            console.error("Error in delete_prescription:", error);
            throw new McpError(
              ErrorCode.InternalError,
              `Error deleting prescription: ${error}`
            );
          }

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
