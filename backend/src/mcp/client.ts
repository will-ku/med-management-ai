import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  ListResourcesResultSchema,
  ReadResourceResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

export class MCPClient {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    this.transport = new StdioClientTransport({
      command: "node",
      args: ["dist/mcp/MedicationMCPServer.js"],
    });

    this.client = new Client(
      {
        name: "medication-client",
        version: "0.1.0",
      },
      {
        capabilities: {},
      }
    );
  }

  async initialize() {
    console.log("MCP Client: Connecting to MCP server...");
    await this.client.connect(this.transport);
    console.log("MCP Client: Connected to MCP server!");
  }

  async listResources() {
    return await this.client.request(
      { method: "resources/list" },
      ListResourcesResultSchema
    );
  }

  async readResource(uri: string) {
    return await this.client.request(
      {
        method: "resources/read",
        params: {
          uri,
        },
      },
      ReadResourceResultSchema
    );
  }
}
