"use client";
import { Stack, Typography, Button } from "@mui/material";
import type { Spot } from "@/lib/store";

type Props = { spot: Spot; isOwn: boolean; onEdit: () => void; onRemove: () => void };

const label = { textTransform: "uppercase", letterSpacing: 0.5, display: "block" } as const;

export function SpotPopup({ spot, isOwn, onEdit, onRemove }: Props) {
  return (
    <Stack spacing={1.5} sx={{ width: 200, pt: 0.5 }}>
      <div>
        <Typography variant="caption" color="text.secondary" sx={label}>Name</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{spot.name}</Typography>
      </div>
      {spot.description && (
        <div>
          <Typography variant="caption" color="text.secondary" sx={label}>Description</Typography>
          <Typography variant="body2" color="text.secondary">{spot.description}</Typography>
        </div>
      )}
      {isOwn ? (
        <Stack direction="row" spacing={1} pt={0.5}>
          <Button variant="outlined" size="small" onClick={onEdit} sx={{ flex: 1 }}>Edit</Button>
          <Button variant="outlined" size="small" color="error" onClick={onRemove}>Delete</Button>
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
          Added by a colleague
        </Typography>
      )}
    </Stack>
  );
}
