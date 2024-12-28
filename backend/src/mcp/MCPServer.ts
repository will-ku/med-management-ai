import { db } from "../db/init.js";
import { OllamaService } from "../llm/OllamaService.js";

/**
 The hope is that in the future, this will be converted into an actual Model Context Protocol (MCP) server. Not for clean code or simplicity sakes. But just to learn.
 */
export class MCPServer {
  private ollamaService: OllamaService;

  constructor() {
    this.ollamaService = new OllamaService();
  }

  async processQuery(naturalLanguageQuery: string): Promise<any> {
    try {
      // Generate SQL query using LLM
      const sqlQuery = await this.ollamaService.generateSQLQuery(
        naturalLanguageQuery
      );

      // Execute the query
      return new Promise((resolve, reject) => {
        db.all(sqlQuery, [], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
    } catch (error) {
      throw new Error(`MCP Server Error: ${error}`);
    }
  }
}
