import axios from "axios";

export class OllamaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
  }

  async generateSQLQuery(prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: "llama3.2",
        prompt: `Convert this natural language query to SQL: ${prompt}
                The database has a 'medications' table with columns:
                - id (INTEGER PRIMARY KEY)
                - name (TEXT)
                - dosage (TEXT)
                - frequency (TEXT)
                - created_at (DATETIME)
                Return only the SQL query without any explanation.`,
        stream: false,
      });

      console.log("Ollama response:", response.data);

      return response.data.response.trim();
    } catch (error) {
      console.error("Full Ollama error:", error);
      throw new Error(`Ollama Service Error: ${error}`);
    }
  }
}
