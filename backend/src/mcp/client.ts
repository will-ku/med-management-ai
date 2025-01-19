import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  StdioClientTransport,
  StdioServerParameters,
} from "@modelcontextprotocol/sdk/client/stdio.js";

export class MCPClient {
  private client: Client;
  private transport: StdioClientTransport;
  private name: String;

  constructor(transport: StdioServerParameters, name: string) {
    this.transport = new StdioClientTransport({
      command: transport.command,
      args: transport.args,
    });
    this.name = name;
    this.client = new Client(
      {
        name: name,
        version: "0.1.0",
      },
      {
        capabilities: {},
      }
    );
  }

  async connect(): Promise<void> {
    console.log(`MCP Client: Connecting to ${this.name} MCP server...`);
    await this.client.connect(this.transport); // Initialization handled by SDK
    console.log(`MCP Client: Connected to ${this.name} MCP server!`);
  }
}
