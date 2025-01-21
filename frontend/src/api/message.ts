import axios from "axios";
import { Message } from "../types/message";

const API_BASE_URL = "http://localhost:3000/api/message";

export const getMessages = async (): Promise<Message[]> => {
  const response = await axios.get<Message[]>(`${API_BASE_URL}`);
  return response.data;
};
