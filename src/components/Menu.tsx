"use client";
import { useState } from "react";
import {
  Box, Paper, IconButton, Stack, Divider, Button, Typography, Switch, FormControlLabel,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  spotsVisible: boolean;
  routesVisible: boolean;
  onToggleSpots: () => void;
  onToggleRoutes: () => void;
  mode: "idle" | "addSpot" | "addRoute";
  onAddSpot: () => void;
  onAddRoute: () => void;
  hasLocation: boolean;
};

export function Menu({
  spotsVisible, routesVisible, onToggleSpots, onToggleRoutes,
  mode, onAddSpot, onAddRoute, hasLocation,
}: Props) {
  const [open, setOpen] = useState(false);
  const addSpotDisabled = !hasLocation;
  const addRouteDisabled = !hasLocation || !routesVisible;

  return (
    <>
      {open && (
        <Box
          sx={{ position: "fixed", inset: 0, zIndex: 999 }}
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 1000 }}>
        {!open ? (
          <Paper elevation={3} sx={{ borderRadius: 2, display: "inline-flex" }}>
            <IconButton
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              size="small"
              sx={{ p: 1.25 }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Paper>
        ) : (
          <Paper elevation={6} sx={{ borderRadius: 2.5, width: 224, overflow: "hidden" }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: "divider" }}>
              <IconButton onClick={() => setOpen(false)} aria-label="Close menu" size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Stack sx={{ px: 2, py: 2 }} spacing={2}>
              <Stack spacing={0.25}>
                <FormControlLabel
                  control={<Switch checked={spotsVisible} onChange={onToggleSpots} size="small" color="primary" />}
                  label={<Typography variant="body2">Spots layer</Typography>}
                  labelPlacement="start"
                  sx={{ mx: 0, justifyContent: "space-between" }}
                />
                <FormControlLabel
                  control={<Switch checked={routesVisible} onChange={onToggleRoutes} size="small" color="primary" />}
                  label={<Typography variant="body2">Routes layer</Typography>}
                  labelPlacement="start"
                  sx={{ mx: 0, justifyContent: "space-between" }}
                />
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Button
                  variant={mode === "addSpot" ? "contained" : "outlined"}
                  size="small"
                  disabled={addSpotDisabled}
                  onClick={onAddSpot}
                  title={addSpotDisabled ? "Choose your starting location first" : undefined}
                  fullWidth
                >
                  + Add spot
                </Button>
                <Button
                  variant={mode === "addRoute" ? "contained" : "outlined"}
                  size="small"
                  disabled={addRouteDisabled}
                  onClick={onAddRoute}
                  title={
                    !hasLocation
                      ? "Choose your starting location first"
                      : !routesVisible
                      ? "Enable Routes layer first"
                      : undefined
                  }
                  fullWidth
                >
                  ∼ Add route
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}
      </Box>
    </>
  );
}
