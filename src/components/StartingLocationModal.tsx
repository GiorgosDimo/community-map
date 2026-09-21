"use client";
import { Dialog, DialogContent, DialogTitle, Box, ButtonBase, Typography } from "@mui/material";

const LOCATIONS = [
  { type: "Home", icon: "🏠" },
  { type: "Work", icon: "🏢" },
  { type: "School", icon: "🏫" },
  { type: "University", icon: "🎓" },
  { type: "Other", icon: "📍" },
];

type Props = { onTypeSelected: (type: string) => void };

export function StartingLocationModal({ onTypeSelected }: Props) {
  return (
    <Dialog open maxWidth="xs" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
      <DialogTitle sx={{ textAlign: "center", fontWeight: 700, pb: 1 }}>
        Welcome!
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 2.5 }}>
          Where are you joining from? Pick a type, then click on the map to pin your starting location.
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          {LOCATIONS.map(({ type, icon }) => (
            <ButtonBase
              key={type}
              onClick={() => onTypeSelected(type)}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                p: 2,
                flexDirection: "column",
                gap: 0.75,
                "&:hover": { bgcolor: "action.hover", borderColor: "text.primary" },
                transition: "border-color 0.15s, background-color 0.15s",
              }}
            >
              <Typography variant="h5">{icon}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{type}</Typography>
            </ButtonBase>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
