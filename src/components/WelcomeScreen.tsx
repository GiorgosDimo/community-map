"use client";
import { Dialog, DialogContent, Typography, Button, Stack, Box } from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import GroupsIcon from "@mui/icons-material/Groups";

const FEATURES = [
  { Icon: PlaceIcon, text: "Pin hidden gems, favourite cafés, parks, or any place worth visiting near you." },
  { Icon: DirectionsWalkIcon, text: "Draw walking or cycling routes your colleagues and neighbours will love." },
  { Icon: GroupsIcon, text: "See what others have added and turn shared spots into places to meet and socialise." },
];

type Props = { onGetStarted: () => void };

export function WelcomeScreen({ onGetStarted }: Props) {
  return (
    <Dialog open maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogContent>
        <Stack spacing={3} alignItems="center">
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" mb={0.5}>🗺️</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Community Map</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Discover and share interesting spots and routes around where you live, work, or study.
            </Typography>
          </Box>

          <Stack spacing={1.5} width="100%">
            {FEATURES.map(({ Icon, text }, i) => (
              <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                <Icon color="primary" sx={{ mt: 0.25, flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">{text}</Typography>
              </Stack>
            ))}
          </Stack>

          <Button variant="contained" fullWidth size="large" onClick={onGetStarted}>
            Get started
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
