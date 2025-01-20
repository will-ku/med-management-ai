import { Ollama, Tool, Message, ChatResponse, ToolCall } from "ollama";
import { Tool as MCPTool } from "@modelcontextprotocol/sdk/types.js";
import { MessageHandler } from "../services/MessageHandler.js";
import { ClientManager } from "../mcp/ClientManager.js";

export class OllamaService {
  private static instance: OllamaService;

  // Allow injection for testing while maintaining default behavior
  constructor(
    private readonly ollama: Ollama = new Ollama({
      host: process.env.OLLAMA_HOST || "http://host.docker.internal:11434",
    }),
    private readonly messageHandler: MessageHandler = MessageHandler.getInstance()
  ) {}

  public static async getInstance(): Promise<OllamaService> {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  async chat(messages: Message[], tools: Tool[]) {
    const response = await this.ollama.chat({
      model: process.env.ollamaModel ?? "llama3.2",
      messages,
      stream: false,
      tools: tools,
    });

    return response;
  }

  public async handleChat(
    query: string,
    mcpTools: MCPTool[]
  ): Promise<ChatResponse> {
    console.log("Starting handleChat with query:", query);
    console.log(
      "Available MCP tools:",
      mcpTools.map((t) => t.name)
    );

    const messages = this.messageHandler.addMessage(query, "user");
    const ollamaTools = this.convertMcpToolsToOllamaTools(mcpTools);

    console.log("Converted Ollama tools:", ollamaTools);

    const chatResponse = await this.chat(messages, ollamaTools);
    console.log("Raw chat response:", JSON.stringify(chatResponse, null, 2));

    const [hasToolCalls, toolCalls] = this.getToolCalls(chatResponse);
    console.log("Tool calls detected:", { hasToolCalls, toolCalls });

    if (hasToolCalls) {
      const clientManager = await ClientManager.getInstance();
      const toolResults = [];

      for (const toolCall of toolCalls) {
        try {
          const toolCallResponse = await this.handleToolCall(
            toolCall,
            clientManager
          );
          console.log("toolCallResponse:", toolCallResponse);
          toolResults.push(toolCallResponse);
        } catch (e: unknown) {
          console.error(
            `Error calling tool inside of handleChat: ${toolCall.function.name}`
          );
        }
      }

      if (toolResults.length === 0) {
        throw new Error("Something is odd. There are no tool results.");
      }

      const finalResponse = toolResults[toolResults.length - 1];
      console.log("finalResponse", finalResponse);
      this.messageHandler.addMessage(
        finalResponse.message.content,
        "assistant"
      );
      return finalResponse;
    } else {
      this.messageHandler.addMessage(chatResponse.message.content, "assistant");
      return chatResponse;
    }
  }

  // private async handleToolCalls(
  //   toolCalls: ToolCall[],
  //   clientManager: ClientManager
  // ): Promise<ChatResponse> {
  //   const toolResults = [];
  //   for (const toolCall of toolCalls) {
  //     const toolCallResponse = await this.handleToolCall(
  //       toolCall,
  //       clientManager
  //     );
  //     toolResults.push(toolCallResponse);
  //   }
  //   return toolResults;
  // }

  private async handleToolCall(
    toolCall: ToolCall,
    clientManager: ClientManager
  ): Promise<ChatResponse> {
    try {
      console.log(
        `Calling encoded tool ${toolCall.function.name} with args: ${toolCall.function.arguments}.
        - - - - - - - - - - - - - - - 
        Detailed logs:`,
        JSON.stringify(toolCall, null, 2)
      );

      const toolContent = await clientManager.callTool(toolCall);

      console.log("toolContent", toolContent);
      const messages = this.messageHandler.addMessage(
        JSON.stringify(toolContent),
        "tool"
      );

      const chatResponseWithToolCall = await this.chat(messages, []); // TODO: Should we pass the tools here? Probably not needed.
      return chatResponseWithToolCall;
    } catch (e: unknown) {
      console.error(`Error calling tool: ${toolCall.function.name}`);
      throw e;
    }
  }

  private getToolCalls(chatResponse: ChatResponse): [boolean, ToolCall[]] {
    return [
      !!chatResponse.message?.tool_calls?.length,
      chatResponse.message?.tool_calls ?? [],
    ];
  }

  public convertMcpToolsToOllamaTools = (tools: MCPTool[]): Tool[] => {
    return tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description ?? "",
        parameters: tool.inputSchema,
      },
    })) as Tool[];
  };

  // convertMcpToolsToOllamaTools(mcpTools: MCPTool[]): Tool[] {
  //   if (mcpTools.length) {
  //     const ok = mcpTools[0].name;
  //     const okok = mcpTools[0].description;
  //     const okokok = mcpTools[0].inputSchema;
  //   }
  //   return mcpTools.map((tool) => ({
  //     type: "function",
  //     function: {
  //       name: tool.name,
  //       description: tool.description ?? "",
  //       parameters: tool.inputSchema,
  //     },
  //   }));
  // }
}
