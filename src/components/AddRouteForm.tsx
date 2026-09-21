"use client";
import { useState } from "react";
import { Stack, TextField, Button, Typography, FormControlLabel, Checkbox } from "@mui/material";
import type { Spot } from "@/lib/store";

type Props = {
  spots: Spot[];
  onSave: (name: string, description: string, spotIds: string[]) => void;
  onCancel: () => void;
};

export function AddRouteForm({ spots, onSave, onCancel }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  return (
    <Stack spacing={1.5} sx={{ width: 256, pt: 0.5 }}>
      <TextField
        label="Name"
        size="small"
        placeholder="Coffee and cat loop"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
        fullWidth
      />
      <TextField
        label="Description"
        size="small"
        placeholder="Short loop past two good spots"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        multiline
        rows={2}
        fullWidth
      />
      {spots.length > 0 && (
        <Stack spacing={0}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
            Include spots (in order)
          </Typography>
          {spots.map(s => (
            <FormControlLabel
              key={s.id}
              control={<Checkbox checked={selected.includes(s.id)} onChange={() => toggle(s.id)} size="small" />}
              label={<Typography variant="body2">{s.name}</Typography>}
              sx={{ my: 0 }}
            />
          ))}
        </Stack>
      )}
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="contained"
          size="small"
          disabled={!name.trim() || selected.length < 2}
          onClick={() => onSave(name.trim(), desc.trim(), selected)}
          sx={{ flex: 1 }}
        >
          Save
        </Button>
        <Button variant="text" size="small" color="inherit" onClick={onCancel}>
          Cancel
        </Button>
      </Stack>
      {selected.length < 2 && (
        <Typography variant="caption" color="text.secondary">
          Select at least 2 spots
        </Typography>
      )}
    </Stack>
  );
}
