"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useState } from "react";

const theme = createTheme({
  palette: {
    primary: { main: "#2563eb" },
    error: { main: "#ef4444" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: "none" } },
    },
    MuiToggleButton: {
      styleOverrides: { root: { textTransform: "none" } },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
