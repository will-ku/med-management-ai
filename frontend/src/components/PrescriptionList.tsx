import {
  Grid2,
  Card,
  CardContent,
  Typography,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import EditMedicationDialog from "./EditPrescriptionDialog.js";
import { usePrescriptions } from "../contexts/PrescriptionContext.js";

interface Prescription {
  id: number;
  medicationName: string;
  dosage: string;
  frequency: string;
}

export default function MedicationList() {
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { prescriptions } = usePrescriptions();

  const handleEdit = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setEditDialogOpen(true);
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        My Medications
      </Typography>

      <Grid2 container spacing={3}>
        {prescriptions.map((prescription) => (
          <Grid2 component="div" key={prescription.id}>
            <Card
              sx={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                minHeight: "180px",
                minWidth: "200px",
                "&:hover": {
                  boxShadow: 3,
                  transition: "all 0.2s ease-in-out",
                },
              }}
            >
              <IconButton
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
                onClick={() => handleEdit(prescription)}
              >
                <EditIcon />
              </IconButton>

              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  pt: 4,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {prescription.medicationName}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  Dosage: {prescription.dosage}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  Frequency: {prescription.frequency}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      <EditMedicationDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        prescription={selectedPrescription}
      />
    </>
  );
}
