import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  fetchPrescriptions,
  updatePrescription,
  deletePrescription,
} from "../api/prescription";
import { Prescription } from "../types/prescription";

interface PrescriptionContextType {
  prescriptions: Prescription[];
  loading: boolean;
  error: string | null;
  updatePrescription: (
    id: string,
    updatedPrescription: Partial<Prescription>
  ) => Promise<void>;
  deletePrescription: (id: string) => Promise<void>;
  getPrescriptions: () => Promise<void>;
}

const PrescriptionContext = createContext<PrescriptionContextType | undefined>(
  undefined
);

interface PrescriptionProviderProps {
  children: ReactNode;
}

export const PrescriptionProvider: React.FC<PrescriptionProviderProps> = ({
  children,
}) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await fetchPrescriptions();
      setPrescriptions(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch prescriptions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrescription = async (
    id: string,
    updatedPrescription: Partial<Prescription>
  ) => {
    try {
      await updatePrescription(id, updatedPrescription);
      setPrescriptions((prevPrescriptions) =>
        prevPrescriptions.map((prescription) =>
          Number(prescription.id) === Number(id)
            ? { ...prescription, ...updatedPrescription }
            : prescription
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update prescription"
      );
      throw err;
    }
  };

  const handleDeletePrescription = async (id: string) => {
    try {
      await deletePrescription(id);
      setPrescriptions((prevPrescriptions) =>
        prevPrescriptions.filter(
          (prescription) => Number(prescription.id) !== Number(id)
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete prescription"
      );
      throw err;
    }
  };

  useEffect(() => {
    getPrescriptions();
  }, []);

  return (
    <PrescriptionContext.Provider
      value={{
        prescriptions,
        loading,
        error,
        updatePrescription: handleUpdatePrescription,
        deletePrescription: handleDeletePrescription,
        getPrescriptions,
      }}
    >
      {children}
    </PrescriptionContext.Provider>
  );
};

export const usePrescriptions = () => {
  const context = useContext(PrescriptionContext);
  if (context === undefined) {
    throw new Error(
      "usePrescriptions must be used within a PrescriptionProvider"
    );
  }
  return context;
};
