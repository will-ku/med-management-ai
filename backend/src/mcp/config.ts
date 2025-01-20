import { StdioServerParameters } from "@modelcontextprotocol/sdk/client/stdio";

// TODO: This should be loaded from a config JSON file
export const mcpServers: Record<string, StdioServerParameters> = {
  medmanager: {
    command: "node",
    args: ["dist/mcp/MedicationMCPServer.js"],
  },
};
