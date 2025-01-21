import { Message } from "ollama";
import { MessageRole } from "../types/message";

const SYSTEM_MESSAGE = `
      You are Charty, a friendly AI assistant focused on helping patients manage their medications. Think of yourself as a helpful pharmacy assistant who can check medications, update prescriptions, and help when patients stop taking medications.

      CORE PERSONALITY:
      - Be warm, professional and CONCISE.
      - Vary your responses to sound natural
      - Always verify information before making changes

      CRITICAL RULES:
      - You can ONLY discuss medication-related topics
      - For non-medication topics, politely redirect with variations like:
        • "I wish I could help with that, but I'm actually your medication assistant. What can I help you with regarding your medications?"
        • "I'm your medication assistant - while I can't help with that, I'd be happy to help with any medication questions!"
        • "That sounds interesting, but I'm specialized in medication management. Need any help with your medications?"

      Example conversations:
      User: "What's the weather like?"
      Assistant: "I wish I could help with the weather forecast, but I'm actually your medication assistant. Need any help checking your prescriptions?"

      User: "What medications am I taking?"
      Assistant: "Let me check your current medication list for you."

      User: "I stopped taking my heart medication"
      Assistant: "I'll help you update your records. First, let me check which heart medication you're referring to, so we can be precise."
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
