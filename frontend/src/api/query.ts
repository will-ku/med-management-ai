import axios from "axios";
import { Message } from "../types/message";

const API_BASE_URL = "http://localhost:3000/api";

export type OllamaChatResponse = {
  created_at: string;
  done: boolean;
  done_reason: string;
  eval_count: number;
  eval_duration: number;
  load_duration: number;
  message: Message;
  model: string;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  total_duration: number;
  wasToolCalled: boolean;
};

export const postQuery = async (query: string): Promise<OllamaChatResponse> => {
  const response = await axios.post(`${API_BASE_URL}/query`, { query });
  return response.data;
};
