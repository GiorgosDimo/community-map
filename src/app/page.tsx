"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Paper, Typography } from "@mui/material";
import { Menu } from "@/components/Menu";
import { StartingLocationModal } from "@/components/StartingLocationModal";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { useHomeLocation } from "@/hooks/useHomeLocation";
import type { HomeLocation } from "@/lib/store";
import type L from "leaflet";

const MapCanvas = dynamic(() => import("@/components/MapCanvas").then((m) => m.MapCanvas), { ssr: false });

type Mode = "idle" | "addSpot" | "addRoute";

export default function Home() {
  const [spotsVisible, setSpotsVisible] = useState(true);
  const [routesVisible, setRoutesVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const { homeLocation, hasLocation, save: saveHome, deleteHome } = useHomeLocation();
  // Start false on both server and client to avoid hydration mismatch; flip after mount if needed
  const [showWelcome, setShowWelcome] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (!hasLocation) setShowWelcome(true);
  }, []);
  const [pickingHomeType, setPickingHomeType] = useState<string | null>(null);

  const toggleMode = (next: "addSpot" | "addRoute") =>
    setMode((cur) => (cur === next ? "idle" : next));

  const handleTypeSelected = (type: string) => {
    setShowModal(false);
    setPickingHomeType(type);
  };

  const handleHomePicked = (latlng: L.LatLng) => {
    saveHome({ type: pickingHomeType!, coordinates: [latlng.lng, latlng.lat] });
    setPickingHomeType(null);
  };

  const handleHomeEdit = () => {
    if (homeLocation) setPickingHomeType(homeLocation.type);
  };

  const handleHomeDelete = () => {
    deleteHome();
    setShowWelcome(true);
  };

  const hintText = pickingHomeType
    ? `Click on the map to pin your ${pickingHomeType} location`
    : mode === "addSpot"
    ? "Click on the map to drop a spot"
    : mode === "addRoute"
    ? "Click the map or spot markers to add waypoints"
    : mounted && homeLocation
    ? `Click the menu icon to add a new spot or route close to your ${homeLocation.type}`
    : "Click the menu icon to get started";

  return (
    <main className="relative h-screen w-full">
      {showWelcome && (
        <WelcomeScreen onGetStarted={() => { setShowWelcome(false); setShowModal(true); }} />
      )}
      {showModal && <StartingLocationModal onTypeSelected={handleTypeSelected} />}

      <Menu
        spotsVisible={spotsVisible}
        routesVisible={routesVisible}
        onToggleSpots={() => setSpotsVisible((v) => !v)}
        onToggleRoutes={() => setRoutesVisible((v) => !v)}
        mode={mode}
        onAddSpot={() => toggleMode("addSpot")}
        onAddRoute={() => toggleMode("addRoute")}
        hasLocation={hasLocation}
      />

      <Paper
        elevation={2}
        sx={{
          position: "absolute",
          top: 16,
          left: { xs: 64, sm: "50%" },
          right: { xs: 16, sm: "auto" },
          transform: { xs: "none", sm: "translateX(-50%)" },
          zIndex: 1000,
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1, sm: 1.25 },
          pointerEvents: "none",
          borderRadius: 2.5,
          whiteSpace: { sm: "nowrap" },
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          {hintText}
        </Typography>
      </Paper>

      <MapCanvas
        spotsVisible={spotsVisible}
        routesVisible={routesVisible}
        mode={mode}
        onModeChange={setMode}
        pickingHome={!!pickingHomeType}
        onHomePicked={handleHomePicked}
        homeLocation={homeLocation}
        onHomeEdit={handleHomeEdit}
        onHomeDelete={handleHomeDelete}
      />
    </main>
  );
}
