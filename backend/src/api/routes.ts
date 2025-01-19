import express from "express";
import { db } from "../db/init.js";
import { Ollama, Tool, Message } from "ollama";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { PrescriptionService } from "../services/PrescriptionService.js";

export const apiRouter = express.Router();

const messages = [
  {
    role: "system",
    content: `
      You are a kind and helpful assistant responding to elderly patients about their medications.
      - Keep responses human-friendly and simple.
      - Avoid technical or JSON explanations. Speak in plain sentences.
      - Responses must fit within 20 words.
      - Example: "Take Amoxicillin 500mg every 8 hours." or "Lisinopril 10mg, once daily."
      - Ignore irrelevant fields like IDs or timestamps. Only share the medication name, dosage, and frequency.
      `,
  },
];
const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/mcp/MedicationMCPServer.js"],
});

const client = new Client(
  { name: "medication-mcp", version: "1.0.0" },
  { capabilities: { prompts: true, tools: true } }
);

await client.connect(transport);

// Health Check
apiRouter.get("/", async (req, res) => {
  res.json({ hello: "world" });
});

// Natural language query endpoint to LLM
apiRouter.post("/query", async (req, res) => {
  try {
    const { query } = req.body;

    const mcpRes = await client.listTools();
    const tools = mcpRes.tools || [];
    console.log("Tools are ", tools);

    const convertMcpToolsToOllamaTools = (
      mcpTools: {
        name: string;
        description: string;
        inputSchema: {
          type: string;
          properties: {
            [key: string]: {
              type: string;
              description: string;
              enum?: string[];
            };
          };
          required: string[];
        };
      }[]
    ): Tool[] => {
      const tools = [];

      for (const mcpTool of mcpTools) {
        const tool = {
          type: "function",
          function: {
            name: mcpTool.name,
            description: mcpTool.description || "",
            parameters: mcpTool.inputSchema,
          },
        };
        console.log("this is the mcpTool pushed: ", tool);
        tools.push(tool);
      }
      return tools;
    };

    const ollamaTools = tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description ?? "",
        parameters: tool.inputSchema,
      },
    })) as Tool[];

    const ollama = new Ollama({
      host: "http://host.docker.internal:11434", // TODO: Make this an env var
    });

    // Update messages state
    messages.push({ role: "user", content: query });

    const chatResponse = await ollama.chat({
      model: "llama3.2",
      messages: messages,
      stream: false,
      tools: ollamaTools,
    });

    let toolResult: any = {}; // TODO: This is just for logging

    let chatResponseWithToolResults = null;
    if (chatResponse.message?.tool_calls) {
      try {
        for (const toolCall of chatResponse.message.tool_calls) {
          console.log("about to callTool ", toolCall);
          try {
            toolResult = await client.callTool(
              {
                name: toolCall.function.name,
                arguments: toolCall.function.arguments,
              },
              CallToolResultSchema
            );

            if (toolResult?.isError)
              throw new Error(
                `Server responded with error when calling tool ${toolCall.function.name}`
              );

            const toolResultsMessageForOllama: Message = {
              role: "tool",
              content: JSON.stringify(toolResult.content),
            };

            // Update messages state with tool results
            messages.push(toolResultsMessageForOllama);
            console.log("messages after toolResults", messages);

            chatResponseWithToolResults = await ollama.chat({
              model: "llama3.2",
              messages: messages,
              stream: false,
              tools: ollamaTools,
            });
          } catch (error) {
            throw new Error(
              `Issue calling tool ${toolCall.function.name}: ${error}`
            );
          }
        }
      } catch (e) {
        console.error("Something happened while calling tool...", e);
      }
    }
    const chatResponseMessage = chatResponse.message.content;
    res.json({ chatResponseWithToolResults });
  } catch (error: unknown) {
    console.error("This is the error ", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message }); // TODO: Handle error codes correctly
    } else {
      res.status(500).json({ error: "An unknown error occurred" }); // TODO: Handle error codes correctly
    }
  }
});

// Medication CRUD operations
apiRouter.get("/medication", (req, res) => {
  db.all("SELECT * FROM medications", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message }); // TODO: Handle error
      return;
    }
    res.json(rows);
  });
});

apiRouter.get("/medication/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM medications WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message }); // TODO: Handle error
      return;
    }
    res.json(row);
  });
});

// Prescription CRUD operations
apiRouter.get("/prescription", (req, res) => {
  const prescriptionService = new PrescriptionService(db);
  prescriptionService.getPrescriptions().then((prescriptions) => {
    res.json(prescriptions);
  });
});
