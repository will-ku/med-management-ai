import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useState, useRef } from "react";
import { usePrescriptions } from "../contexts/PrescriptionContext";
import { postQuery } from "../api/query";
import { getMessages } from "../api/message";
import { Message } from "../types/message";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { getPrescriptions } = usePrescriptions();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const messages = await getMessages();
        setMessages(messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { content: input, role: "user" as const };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await postQuery(input);
      if (data?.message?.content) {
        if (data.wasToolCalled) await getPrescriptions(); // Hacky way to refresh prescriptions, regardless of which tool was called.

        const text = data.message.content;
        setMessages((prev) => [...prev, { content: text, role: "assistant" }]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { content: "Sorry, something went wrong.", role: "assistant" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Chat with Charty
      </Typography>

      {/* Messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mb: 2,
          gap: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((message, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              maxWidth: "80%",
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              backgroundColor:
                message.role === "user" ? "primary.main" : "grey.100",
              color: message.role === "user" ? "white" : "text.primary",
            }}
          >
            <Typography>{message.content}</Typography>
          </Paper>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Loading indicator and input area */}
      <Box sx={{ position: "relative", mb: 2 }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              mb: 1,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        )}
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 2,
            display: "flex",
            gap: 1,
            alignItems: "center",
            boxShadow: "none",
          }}
        >
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
            multiline
          />
          <IconButton type="submit" color="primary">
            <SendIcon />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
}
