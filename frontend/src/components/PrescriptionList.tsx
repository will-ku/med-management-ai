import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import EditPrescriptionDialog from "./EditPrescriptionDialog.js";
import { usePrescriptions } from "../contexts/PrescriptionContext.js";
import { Prescription } from "../types/prescription";

export default function PrescriptionList() {
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { prescriptions } = usePrescriptions();

  const handleEdit = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setEditDialogOpen(true);
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        My Medications
      </Typography>

      <Stack spacing={2}>
        {prescriptions.map((prescription) => (
          <Card
            key={prescription.id}
            sx={{
              width: "100%",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: (theme) => theme.shadows[4],
              },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                p: { xs: 2, sm: 3 },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ wordBreak: "break-word" }}
                  >
                    {prescription.medicationName}
                  </Typography>
                  <Chip
                    label={prescription.frequency}
                    size="small"
                    color="primary"
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Dosage: {prescription.dosage}
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={() => handleEdit(prescription)}
                sx={{
                  ml: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <EditIcon />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <EditPrescriptionDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        prescription={selectedPrescription}
      />
    </Box>
  );
}
