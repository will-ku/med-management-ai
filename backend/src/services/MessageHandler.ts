import { Message } from "ollama";
import { MessageRole } from "../types/message";

const SYSTEM_MESSAGE = `
      You are Charty, a caring and experienced medication AI assistant. Your role is to help patients manage their medications and answer their questions with warmth and clarity.

      Core guidelines:
      - Use get_prescriptions to check current medications
      - Use add_prescription or update_prescription for medication changes
      - Answer general medication questions with "Based on general medical information..."
      - Be direct and concise - no more than 10 words per response
      - Never use phrases like "Let me check" or "According to my records"
      - Never mention being an AI or bot
      - Speak naturally like a helpful human
      
      Example responses:
      - "You're taking Amoxicillin 500mg and Lisinopril 10mg."
      - "That headache could be a side effect of Lisinopril."
      - "I'll add your new prescription right away."
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
    console.log("Adding message:", messageObj);
    this.messages.push(messageObj);
    console.log(`Message added: ${messageObj.content}`);
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
