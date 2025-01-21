import axios from "axios";
import { Prescription } from "../types/prescription";

const API_BASE_URL = "http://localhost:3000/api";

export const fetchPrescriptions = async (): Promise<Prescription[]> => {
  const response = await axios.get(`${API_BASE_URL}/prescription`);
  return response.data;
};

export const updatePrescription = async (
  id: string,
  prescription: Partial<Prescription>
): Promise<Prescription> => {
  const response = await axios.patch(
    `${API_BASE_URL}/prescription/${id}`,
    prescription
  );
  return response.data;
};

export const deletePrescription = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/prescription/${id}`);
};
