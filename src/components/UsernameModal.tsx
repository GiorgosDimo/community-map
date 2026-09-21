"use client";
import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, Stack, TextField,
  Button, Typography, CircularProgress,
} from "@mui/material";
import { getSessionToken } from "@/lib/session";

type Step = "input" | "conflict" | "loading";
type User = { id: string; username: string };

export function UsernameModal({ onSuccess }: { onSuccess: (user: User) => void }) {
  const [step, setStep] = useState<Step>("input");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    const name = username.trim();
    if (!name) { setError("Please enter a username."); return; }
    setStep("loading");
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: getSessionToken(), username: name }),
    });

    if (res.status === 201) { onSuccess((await res.json()).user); return; }
    if (res.status === 409) { setStep("conflict"); return; }

    setError("Something went wrong. Please try again.");
    setStep("input");
  }

  async function handleDifferentDevice() {
    setStep("loading");
    const res = await fetch("/api/auth/add-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: getSessionToken(), username: username.trim() }),
    });
    if (res.ok) { onSuccess((await res.json()).user); return; }
    setError("Could not link session. Please try again.");
    setStep("input");
  }

  return (
    <Dialog open sx={{ "& .MuiDialog-paper": { borderRadius: 3, p: 1, width: 340 } }}>
      <DialogTitle sx={{ pb: 0.5 }}>
        {step === "conflict" ? "Username already in use" : "Choose a username"}
      </DialogTitle>
      <DialogContent>
        {step === "conflict" ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>{username.trim()}</strong> is already taken. Are you connecting from a different device with the same account?
            </Typography>
            <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
              <Button variant="outlined" size="small" onClick={() => { setStep("input"); setUsername(""); }}>
                No, pick another name
              </Button>
              <Button variant="contained" size="small" onClick={handleDifferentDevice}>
                Yes, link this device
              </Button>
            </Stack>
          </Stack>
        ) : step === "loading" ? (
          <Stack sx={{ alignItems: "center", py: 2 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              This name identifies you as the author of spots and routes you create. You will need it on any new device.
            </Typography>
            <TextField
              autoFocus
              size="small"
              label="Username"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              error={!!error}
              helperText={error}
              fullWidth
            />
            <Button variant="contained" onClick={handleSubmit} fullWidth>
              Continue
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
