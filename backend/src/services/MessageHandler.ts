import { Message } from "ollama";
import { MessageRole } from "../types/message";

const SYSTEM_MESSAGE = `
      You are a kind and helpful assistant responding to elderly patients about their medications.
      - Keep responses human-friendly and simple.
      - Avoid technical or JSON explanations. Speak in plain sentences.
      - Responses must fit within 20 words.
      - Example: "Take Amoxicillin 500mg every 8 hours." or "Lisinopril 10mg, once daily."
      - Ignore irrelevant fields like IDs or timestamps. Only share the medication name, dosage, and frequency.
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
    this.messages.push({
      content: message,
      role: role,
    });
    return this.messages;
  }

  public getMessages(): Message[] {
    return this.messages;
  }

  public clearMessages(): void {
    this.messages = [];
  }
}
