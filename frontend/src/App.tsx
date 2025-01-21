import {
  Box,
  CssBaseline,
  Paper,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import MedicationList from "./components/PrescriptionList.js";
import ChatInterface from "./components/ChatInterface.js";
import { PrescriptionProvider } from "./contexts/PrescriptionContext";

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2196f3",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f5f5f5",
    },
  },
});

// Drawer width for chat interface
const DRAWER_WIDTH = 400;

function App() {
  return (
    <PrescriptionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          {/* Main content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: `calc(100% - ${DRAWER_WIDTH}px)`,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                height: "100%",
                backgroundColor: "transparent",
              }}
            >
              <MedicationList />
            </Paper>
          </Box>

          {/* Fixed chat interface */}
          <Box
            sx={{
              width: DRAWER_WIDTH,
              position: "fixed",
              right: 0,
              top: 0,
              height: "100vh",
              borderLeft: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <ChatInterface />
          </Box>
        </Box>
      </ThemeProvider>
    </PrescriptionProvider>
  );
}

export default App;
