import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Prescription } from "../contexts/PrescriptionContext";

interface EditPrescriptionDialogProps {
  open: boolean;
  onClose: () => void;
  prescription: Prescription | null;
}

export default function EditPrescriptionDialog({
  open,
  onClose,
  prescription,
}: EditPrescriptionDialogProps) {
  const [formData, setFormData] = useState({
    dosage: "",
    frequency: "",
  });

  useEffect(() => {
    if (prescription) {
      setFormData({
        dosage: prescription.dosage,
        frequency: prescription.frequency,
      });
    }
  }, [prescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement the API call to update medication
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Medication</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Dosage"
            fullWidth
            value={formData.dosage}
            onChange={(e) =>
              setFormData({ ...formData, dosage: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Frequency"
            fullWidth
            value={formData.frequency}
            onChange={(e) =>
              setFormData({ ...formData, frequency: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
