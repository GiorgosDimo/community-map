"use client";
import { useState } from "react";
import { Stack, TextField, Button, Typography } from "@mui/material";

type Props = {
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
  saving?: boolean;
  error?: string | null;
};

export function AddSpotForm({ onSave, onCancel, saving, error }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <Stack spacing={1.5} sx={{ width: 220, pt: 0.5 }}>
      <TextField
        label="Name"
        size="small"
        placeholder="Good coffee spot"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
        fullWidth
      />
      <TextField
        label="Description"
        size="small"
        placeholder="Small espresso bar, quiet in the mornings"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        multiline
        rows={2}
        fullWidth
      />
      {error && <Typography variant="caption" color="error">{error}</Typography>}
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          disabled={!name.trim() || saving}
          onClick={() => onSave(name.trim(), desc.trim())}
          sx={{ flex: 1 }}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="text" size="small" color="inherit" onClick={onCancel}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
}
