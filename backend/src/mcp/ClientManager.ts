import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mcpServers } from "./config";
import { CallToolResultSchema, Tool } from "@modelcontextprotocol/sdk/types";
import { ToolCall } from "ollama";
import { ToolContent } from "../types/mcpTool";

const SEPARATOR = ":::"; // Random string to separate Server Name and tool

/**
 * Manages multiple MCP client-server connections and provides a unified interface
 * for accessing their tools and capabilities. Implements Singleton pattern to
 * maintain a single source of truth for all MCP connections.
 */
export class ClientManager {
  private static instance: ClientManager;
  private connections: Map<string, Client> = new Map();

  public static async getInstance(): Promise<ClientManager> {
    if (!ClientManager.instance) {
      ClientManager.instance = new ClientManager();
      await ClientManager.instance.initialize();
    }
    return ClientManager.instance;
  }

  private async initialize() {
    console.log("Initializing MCP Servers...", mcpServers);
    try {
      for (const [serverName, config] of Object.entries(mcpServers)) {
        try {
          const client = new Client(
            { name: serverName, version: "1.0.0" },
            { capabilities: { prompts: true, tools: true } }
          );
          const transport = new StdioClientTransport({
            command: config.command,
            args: config.args,
          });

          await client.connect(transport);
          this.connections.set(serverName, client);
        } catch (e) {
          console.error(
            `Error establishing client connection with server: ${serverName}.`
          );
        }
      }

      const numServersInConfig = Object.keys(mcpServers).length;
      const serverNamesInConfig = Object.keys(mcpServers).join(", ");
      console.log(
        `${numServersInConfig} MCP connections initialized successfully: ${serverNamesInConfig}`
      );
    } catch (error) {
      console.error("Error initializing MCP connections:", error);
    }
  }

  /**
   * Lists all available tools across all MCP server connections.
   * Each tool's name is prefixed with its server name to ensure uniqueness
   * and identify which server the tool belongs to.
   *
   * @returns {Promise<Tool[]>} Array of tools with encoded names that include server
   */
  public async listTools(): Promise<Tool[]> {
    if (!this.connectionsExist) {
      console.warn(
        "There are no established MCP client -> server connections."
      );
    }
    const allTools = [];

    for (const [serverName, client] of this.connections) {
      try {
        const mcpResponse = await client.listTools();
        const tools = mcpResponse.tools || [];
        const toolsWithUpdatedName = tools.map((tool) => ({
          ...tool,
          name: this.encodeToolName(serverName, tool.name),
        }));

        allTools.push(...toolsWithUpdatedName);
      } catch (e) {
        console.error(
          `There was an issue getting tools for ${serverName}. Skipping...`
        );
        continue;
      }
    }

    console.log("listTools found MCP tools: ", allTools);
    return allTools;
  }

  /**
   * Executes a tool call on the appropriate MCP server based on the encoded tool name.
   * @param toolCall - The tool call object containing function name and arguments
   * @returns Promise resolving to the tool's execution result
   */
  async callTool(toolCall: ToolCall): Promise<ToolContent> {
    const { serverName, toolName } = this.decodeToolName(
      toolCall.function.name
    );

    const client = this.connections.get(serverName);

    if (!client) {
      throw new Error(
        `Client not found for server: ${serverName} in ${this.getServerNames()}`
      );
    }

    try {
      console.log(
        `Calling MCP tool ${toolName} with arguments ${toolCall.function.arguments}`
      );

      const toolResult = await client.callTool(
        {
          name: toolName,
          arguments: toolCall.function.arguments,
        },
        CallToolResultSchema
      );

      toolResult.isError
        ? this.logAndThrowCallToolError(toolName, toolResult, toolResult.error)
        : this.logCallToolSuccess(toolName, toolResult);

      return toolResult.content as ToolContent;
    } catch (error) {
      console.error(`Tool ${toolName} failed:`, error);
      throw error;
    }
  }

  private getServerNames(): string {
    return Array.from(this.connections.keys()).join(", ");
  }

  public getConnections(): Map<string, Client> {
    return this.connections;
  }

  private connectionsExist(): Boolean {
    return !!Object.values(this.connections).length;
  }

  private encodeToolName(serverName: string, toolName: string): string {
    return `${serverName}${SEPARATOR}${toolName}`;
  }

  private decodeToolName(encodedName: string): {
    serverName: string;
    toolName: string;
  } {
    const parts = encodedName.split(SEPARATOR);
    if (parts.length !== 2) {
      throw new Error(`Invalid encoded tool name: ${encodedName}`);
    }

    console.log("Decoded server name:", parts[0]);
    console.log("Decoded tool name:", parts[1]);

    return {
      serverName: parts[0],
      toolName: parts[1],
    };
  }

  private logCallToolSuccess(toolName: string, toolResult: any) {
    console.log(
      `Tool ${toolName} completed successfully.\ntoolResult: ${toolResult}`
    );
  }
  private logAndThrowCallToolError(
    toolName: string,
    toolResult: any,
    error: unknown
  ) {
    console.error(
      `Tool ${toolName} failed. \ntoolResult was ${toolResult}\n`,
      error
    );
  }
}
