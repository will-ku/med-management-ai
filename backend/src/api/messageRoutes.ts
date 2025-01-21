import express from "express";
import { MessageHandler } from "../services/MessageHandler.js";

export const messageRouter = express.Router();

messageRouter.delete("/", (req, res) => {
  const messageHandler = MessageHandler.getInstance();
  messageHandler.clearMessages();
  res.json({ message: "Messages cleared" });
});

messageRouter.get("/", (req, res) => {
  const messageHandler = MessageHandler.getInstance();
  const messages = messageHandler.getMessages();
  const filteredMessages = messages.filter(
    (message) => message.role === "user" || message.role === "assistant"
  );

  res.json(filteredMessages);
});

messageRouter.get("/admin", (req, res) => {
  const messageHandler = MessageHandler.getInstance();
  const messages = messageHandler.getMessages();
  res.json(messages);
});
