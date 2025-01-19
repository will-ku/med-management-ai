import { Ollama, Tool, Message } from "ollama";
import { MCPClient } from "../mcp/client.js";
import { MessageHandler } from "../services/MessageHandler.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

export class OllamaService {
  private static instance: OllamaService;
  private ollama: Ollama;
  private mcpClient: MCPClient;
  private messageHandler: MessageHandler;

  private constructor(
    host: string = "http://host.docker.internal:11434",
    mcpClient: MCPClient,
    messageHandler: MessageHandler
  ) {
    this.ollama = new Ollama({ host });
    this.mcpClient = mcpClient;
    this.messageHandler = messageHandler;
  }

  public static async getInstance(): Promise<OllamaService> {
    if (!OllamaService.instance) {
      const mcpClient = new MCPClient(
        { command: "node", args: ["dist/mcp/MedicationMCPServer.js"] },
        "medication-client"
      );
      await mcpClient.connect();
      console.log("mcpClient connected");

      const messageHandler = MessageHandler.getInstance();

      OllamaService.instance = new OllamaService(
        process.env.OLLAMA_HOST || "http://host.docker.internal:11434",
        mcpClient,
        messageHandler
      );
    }
    return OllamaService.instance;
  }

  async chat(messages: Message[], tools: Tool[]) {
    const response = await this.ollama.chat({
      model: process.env.ollamaModel ?? "llama3.2",
      messages,
      stream: false,
      tools,
    });
    return response;
  }

  convertMcpToolsToOllamaTools(mcpTools: any[]): Tool[] {
    return mcpTools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description ?? "",
        parameters: tool.inputSchema,
      },
    }));
  }
}
