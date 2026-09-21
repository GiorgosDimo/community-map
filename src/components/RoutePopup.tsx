"use client";
import { Stack, Typography, Button, Chip } from "@mui/material";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import type { Route } from "@/lib/store";

const MODE_LABELS: Record<string, string> = { foot: "Walking", bike: "Cycling" };
const MODE_ICONS: Record<string, React.ReactElement> = {
  foot: <DirectionsWalkIcon sx={{ fontSize: "1rem !important" }} />,
  bike: <DirectionsBikeIcon sx={{ fontSize: "1rem !important" }} />,
};

function fmtDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
function fmtTime(sec: number) {
  const m = Math.round(sec / 60);
  return m < 60 ? `~${m} min` : `~${Math.floor(m / 60)} h ${m % 60} min`;
}

const label = { textTransform: "uppercase", letterSpacing: 0.5, display: "block" } as const;

type Props = { route: Route; isOwn: boolean; onEdit: () => void; onRemove: () => void };

export function RoutePopup({ route, isOwn, onEdit, onRemove }: Props) {
  return (
    <Stack spacing={1.5} sx={{ width: 200, pt: 0.5 }}>
      <div>
        <Typography variant="caption" color="text.secondary" sx={label}>Name</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{route.name}</Typography>
      </div>

      {route.type && (
        <Chip
          size="small"
          icon={MODE_ICONS[route.type]}
          label={MODE_LABELS[route.type] ?? route.type}
          variant="outlined"
          sx={{ alignSelf: "flex-start" }}
        />
      )}

      {(route.distance != null || route.duration != null) && (
        <Stack direction="row" spacing={3}>
          {route.distance != null && (
            <div>
              <Typography variant="caption" color="text.secondary" sx={label}>Distance</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmtDist(route.distance)}</Typography>
            </div>
          )}
          {route.duration != null && (
            <div>
              <Typography variant="caption" color="text.secondary" sx={label}>Time</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmtTime(route.duration)}</Typography>
            </div>
          )}
        </Stack>
      )}

      {route.description && (
        <div>
          <Typography variant="caption" color="text.secondary" sx={label}>Description</Typography>
          <Typography variant="body2" color="text.secondary">{route.description}</Typography>
        </div>
      )}

      {isOwn ? (
        <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
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
