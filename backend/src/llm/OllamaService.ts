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
  ): Promise<ChatResponse & { wasToolCalled: boolean }> {
    console.log("Starting handleChat with query:", query);
    console.log(
      "Available MCP tools:",
      mcpTools.map((t) => t.name)
    );

    const messages = this.messageHandler.addMessage(query, "user");
    const ollamaTools = this.convertMcpToolsToOllamaTools(mcpTools);

    console.log(
      "Converted Ollama tools:",
      ollamaTools.map((o) => JSON.stringify(o, null, 2))
    );

    const chatResponse = await this.chat(messages, ollamaTools);
    console.log("Raw chat response:", JSON.stringify(chatResponse, null, 2));

    const [hasToolCalls, toolCalls] = this.getToolCalls(chatResponse);
    console.log(
      "Tool calls detected:",
      JSON.stringify({ hasToolCalls, toolCalls }, null, 2)
    );

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
            `Error calling tool ${toolCall.function.name} inside of handleChat: ${e}`
          );

          const errorMessageContent = this.createErrorMessageContent(
            toolCall,
            e
          );

          const errorMessage = this.messageHandler.addMessage(
            errorMessageContent,
            "tool"
          );

          const errorResponse = await this.chat(errorMessage, ollamaTools);
          this.messageHandler.addMessage(
            errorResponse.message.content,
            "assistant"
          );
          return { ...errorResponse, wasToolCalled: false };
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
      return { ...finalResponse, wasToolCalled: true };
    } else {
      this.messageHandler.addMessage(chatResponse.message.content, "assistant");
      return { ...chatResponse, wasToolCalled: false };
    }
  }

  private async handleToolCall(
    toolCall: ToolCall,
    clientManager: ClientManager
  ): Promise<ChatResponse> {
    try {
      console.log(
        `Calling encoded tool ${toolCall.function.name} with args: ${toolCall.function.arguments}.`
      );

      const toolContent = await clientManager.callTool(toolCall);
      console.log("toolContent", toolContent);

      // Extract the human-readable message from the tool response
      const readableMessage =
        toolContent.type === "text"
          ? toolContent.text
          : JSON.stringify(toolContent);

      const messages = this.messageHandler.addMessage(readableMessage, "tool");

      const chatResponseWithToolCall = await this.chat(messages, []); // TODO: Should we pass the tools here? Probably not needed.
      return chatResponseWithToolCall;
    } catch (e: unknown) {
      console.error(`Error calling tool: ${toolCall.function.name}`);
      throw new Error(
        `Failed to execute ${toolCall.function.name}: ${
          e instanceof Error ? e.message : "Unknown error occurred"
        }`
      );
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

  private createErrorMessageContent(toolCall: ToolCall, e: unknown): string {
    const content = `TOOL_EXECUTION_FAILED: The operation could not be completed.
              Tool: ${toolCall.function.name}
              Error: ${
                e instanceof Error ? e.message : "Unknown error occurred"
              }

              IMPORTANT:
              - Be concise. Keep responses under three sentences.
              - The user is not technical and does not want to debug. Keep responses simple and human-friendly.
              - Do not make assumptions about the current state.
              - Do not pretend the operation succeeded.
              - Do not ask the user to try again or ask follow up questions.
              
              REQUIRED RESPONSE FORMAT:
              1. Acknowledge the error occurred
              2. Explain what went wrong in user-friendly terms`;
    return content;
  }
}
