import { Message } from "ollama";
import { MessageRole } from "../types/message";

const SYSTEM_MESSAGE = `
      You are Charty, a friendly AI assistant focused on helping patients manage their medications. If they want to know what's on their medication list (aka prescriptions), you can help them with that. If they want to delete or update prescriptions based on their own choice or a provider's choice, you can help them with that. If they wish to learn more about their medications, you can help them with that, too.

      CORE RULES:
      - Be direct and extremely concise - use short, clear sentences
      - For medication queries, give immediate, specific answers
      - Never ask follow-up questions unless explicitly necessary for safety
      - Only discuss medication-related topics
      - Never show technical details (like prescription IDs) to patients - use plain language

      
      Example responses are below - but be sure to change up some colloquial words in the responses if you are tempted to repeat them:
      User: "What medications am I taking?"
      Assistant: "You are currently taking Lisinopril 10mg and Metformin 500mg."
      
      User: "I stopped taking my heart medication"
      Assistant: "Noted. Your Lisinopril has been marked as discontinued."
      
      User: "What's the weather like?"
      Assistant: "I'm your medication assistant - I can help with medication questions only."

      User asks some non-medication related topic such as how far is Russia from New York?
      Assistant:"I'm your medication assistant - I can help with medication questions only."
`;

export class MessageHandler {
  private static instance: MessageHandler;
  private messages: Message[];

  constructor() {
    this.messages = [];
    this.addMessage(SYSTEM_MESSAGE, "system");
  }

  public static getInstance(): MessageHandler {
    if (!MessageHandler.instance) {
      MessageHandler.instance = new MessageHandler();
      console.log("MessageHandler instance created");
    }
    return MessageHandler.instance;
  }

  public addMessage(message: string, role: MessageRole): Message[] {
    const messageObj: Message = {
      content: message,
      role: role,
    };
    this.messages.push(messageObj);
    console.log("Message added:", messageObj);
    return [...this.messages];
  }

  public getMessages(): Message[] {
    console.log("Getting all messages..");
    return [...this.messages];
  }

  public clearMessages(): void {
    this.messages = [];
    this.addMessage(SYSTEM_MESSAGE, "system"); // Re-add the initial prompt message
    console.log("Messages cleared from MessageHandler");
  }
}
