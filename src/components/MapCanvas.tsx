"use client";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline, LayerGroup, Rectangle, useMapEvents, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Box, Paper, Stack, Typography, Button, TextField, ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import { useSpots } from "@/hooks/useSpots";
import { useRoutes } from "@/hooks/useRoutes";
import { withinBbox, homeBbox, type HomeLocation, type Spot, type Route } from "@/lib/store";
import { getSessionToken } from "@/lib/session";
import { SpotPopup } from "./SpotPopup";
import { RoutePopup } from "./RoutePopup";
import { AddSpotForm } from "./AddSpotForm";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const makeIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const pendingIcon = makeIcon("gold");
const homeIcon = makeIcon("green");
const routeSpotIcon = makeIcon("red");

const waypointDivIcon = L.divIcon({
  html: '<div style="width:10px;height:10px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>',
  className: "",
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const ROUTE_COLOURS = ["#e63946", "#2a9d8f", "#e9c46a", "#f4a261", "#264653", "#6a4c93", "#1982c4"];

type TransportMode = "foot" | "bike";
const TRANSPORT_LABELS: Record<TransportMode, string> = { foot: "🚶 Walk", bike: "🚴 Cycle" };
// ponytail: Valhalla uses 1e6 precision; OSRM was 1e5 via geojson
const VALHALLA_COSTING: Record<TransportMode, string> = { foot: "pedestrian", bike: "bicycle" };
const MODE_COLOR: Record<TransportMode, string> = { foot: "#f4a261", bike: "#2a9d8f" };

function decodeShape(s: string): [number, number][] {
  const pts: [number, number][] = [];
  let i = 0, lat = 0, lng = 0;
  while (i < s.length) {
    let b, shift = 0, r = 0;
    do { b = s.charCodeAt(i++) - 63; r |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += r & 1 ? ~(r >> 1) : r >> 1;
    shift = 0; r = 0;
    do { b = s.charCodeAt(i++) - 63; r |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += r & 1 ? ~(r >> 1) : r >> 1;
    pts.push([lng / 1e6, lat / 1e6]);
  }
  return pts;
}

type Props = {
  spotsVisible: boolean;
  routesVisible: boolean;
  mode: "idle" | "addSpot" | "addRoute";
  onModeChange: (m: "idle") => void;
  pickingHome: boolean;
  onHomePicked: (latlng: L.LatLng) => void;
  homeLocation: HomeLocation | null;
  onHomeEdit: () => void;
  onHomeDelete: () => void;
  onPopupOpen?: (open: boolean) => void;
};

const CENTER: [number, number] = [52.0907, 5.1214];

function PopupTracker({ onOpen }: { onOpen?: (open: boolean) => void }) {
  useMapEvents({
    popupopen: () => onOpen?.(true),
    popupclose: () => onOpen?.(false),
  });
  return null;
}

function BoundsController({ home, pickingHome }: { home: HomeLocation | null | undefined; pickingHome: boolean }) {
  const map = useMap();
  const mounted = useRef(false);
  useEffect(() => {
    if (!home || pickingHome) {
      map.setMaxBounds(null as unknown as L.LatLngBoundsExpression);
      return;
    }
    const b = homeBbox(home);
    const bounds = L.latLngBounds([b.minLat, b.minLng], [b.maxLat, b.maxLng]);
    map.setMaxBounds(bounds.pad(0.15));
    if (mounted.current) map.fitBounds(bounds, { animate: true });
    mounted.current = true;
  }, [home, pickingHome, map]);
  return null;
}

function ClickHandler({ onMapClick, onClearEdit, skipRef }: {
  onMapClick: (latlng: L.LatLng) => void;
  onClearEdit: () => void;
  skipRef: { current: boolean };
}) {
  const map = useMap();
  useMapEvents({
    click(e) {
      if (skipRef.current) { skipRef.current = false; return; }
      map.closePopup();
      onClearEdit();
      onMapClick(e.latlng);
    },
  });
  return null;
}

function MapAutoCenter({ home, spots, routes }: { home: HomeLocation; spots: Spot[]; routes: Route[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    const id = setTimeout(() => {
      if (done.current) return;
      done.current = true;
      const pts: [number, number][] = [[home.coordinates[1], home.coordinates[0]]];
      spots.forEach(s => pts.push([s.coordinates[1], s.coordinates[0]]));
      routes.forEach(r => {
        const path = (r.geometry?.length ? r.geometry : r.waypoints) ?? [];
        path.forEach(([lng, lat]: [number, number]) => pts.push([lat, lng]));
      });
      if (pts.length === 1) map.setView(pts[0] as L.LatLngExpression, 16);
      else map.fitBounds(pts as L.LatLngBoundsExpression, { padding: [60, 60], maxZoom: 17 });
    }, 0);
    return () => clearTimeout(id);
  }, [spots, routes]);
  return null;
}

function InlineEditForm({
  name, onNameChange, desc, onDescChange, onSave, onCancel,
}: {
  name: string; onNameChange: (v: string) => void;
  desc: string; onDescChange: (v: string) => void;
  onSave: () => void; onCancel: () => void;
}) {
  return (
    <Stack spacing={1.5} sx={{ width: 200, pt: 0.5 }}>
      <TextField
        label="Name"
        size="small"
        value={name}
        onChange={e => onNameChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSave()}
        autoFocus
        fullWidth
      />
      <TextField
        label="Description"
        size="small"
        value={desc}
        onChange={e => onDescChange(e.target.value)}
        multiline
        rows={2}
        fullWidth
      />
      <Stack direction="row" spacing={1}>
        <Button variant="contained" size="small" disabled={!name.trim()} onClick={onSave} sx={{ flex: 1 }}>
          Save
        </Button>
        <Button variant="outlined" size="small" color="inherit" onClick={onCancel}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
}

export function MapCanvas({
  spotsVisible, routesVisible, mode, onModeChange,
  pickingHome, onHomePicked, homeLocation, onHomeEdit, onHomeDelete,
  onPopupOpen,
}: Props) {
  const { spots, add: addSpot, update: updateSpot, remove: removeSpot } = useSpots();
  const { routes, add: addRoute, update: updateRoute, remove: removeRoute } = useRoutes();
  const sessionToken = getSessionToken();

  const skipNextClose = useRef(false);
  const [pendingLatLng, setPendingLatLng] = useState<L.LatLng | null>(null);
  const [pendingHomeLatLng, setPendingHomeLatLng] = useState<L.LatLng | null>(null);

  const [transportMode, setTransportMode] = useState<TransportMode>("foot");
  const [routeWaypoints, setRouteWaypoints] = useState<[number, number][]>([]);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeSummary, setRouteSummary] = useState<{ distance: number; duration: number } | null>(null);
  const [savingRoute, setSavingRoute] = useState(false);
  const [routeName, setRouteName] = useState("");
  const [routeDesc, setRouteDesc] = useState("");

  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);
  const [editSpotName, setEditSpotName] = useState("");
  const [editSpotDesc, setEditSpotDesc] = useState("");
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editRouteName, setEditRouteName] = useState("");
  const [editRouteDesc, setEditRouteDesc] = useState("");

  useEffect(() => {
    if (mode !== "addRoute") {
      setRouteWaypoints([]);
      setRouteGeometry([]);
      setRouteSummary(null);
      setSavingRoute(false);
      setRouteName("");
      setRouteDesc("");
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "addRoute" || routeWaypoints.length < 2) { setRouteGeometry([]); return; }
    let cancelled = false;
    setRouteLoading(true);
    fetch("https://valhalla1.openstreetmap.de/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locations: routeWaypoints.map(([lng, lat]) => ({ lat, lon: lng })),
        costing: VALHALLA_COSTING[transportMode],
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const legs: { shape: string }[] = data.trip?.legs ?? [];
        if (!legs.length) { setRouteGeometry(routeWaypoints); return; }
        const summary = data.trip?.summary;
        if (summary) setRouteSummary({ distance: summary.length as number, duration: summary.time as number });
        // Each leg shares its last point with the next leg's first — drop the overlap
        const pts: [number, number][] = [];
        legs.forEach((leg, i) => {
          const decoded = decodeShape(leg.shape);
          pts.push(...(i < legs.length - 1 ? decoded.slice(0, -1) : decoded));
        });
        setRouteGeometry(pts.length ? pts : routeWaypoints);
      })
      .catch(() => { if (!cancelled) setRouteGeometry(routeWaypoints); })
      .finally(() => { if (!cancelled) setRouteLoading(false); });
    return () => { cancelled = true; };
  }, [routeWaypoints, transportMode, mode]);

  const addWaypoint = (lngLat: [number, number]) => setRouteWaypoints(prev => [...prev, lngLat]);

  const handleMapClick = (latlng: L.LatLng) => {
    if (pickingHome) { setPendingHomeLatLng(latlng); return; }
    if (mode === "addRoute") { addWaypoint([latlng.lng, latlng.lat]); return; }
    if (mode === "addSpot") {
      if (homeLocation && !withinBbox(latlng.lng, latlng.lat, homeLocation)) {
        alert("That location is outside the allowed area. Please drop pins near your chosen location.");
        return;
      }
      setPendingLatLng(latlng);
    }
  };

  const handleSaveRoute = () => {
    if (!routeName.trim() || routeWaypoints.length < 2) return;
    addRoute.mutate({
      name: routeName.trim(),
      description: routeDesc.trim(),
      type: transportMode,
      colour: ROUTE_COLOURS[routes.length % ROUTE_COLOURS.length],
      waypoints: routeWaypoints,
      geometry: routeGeometry,
      distance: routeSummary?.distance,
      duration: routeSummary?.duration,
    });
    onModeChange("idle");
  };

  const toLatlng = (coords: [number, number][]): [number, number][] =>
    coords.map(([lng, lat]) => [lat, lng]);

  return (
    <div className="absolute inset-0">
      <MapContainer center={CENTER} zoom={14} className="h-full w-full" zoomControl={false} closePopupOnClick={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        <PopupTracker onOpen={onPopupOpen} />
        <BoundsController home={homeLocation} pickingHome={pickingHome} />
        {homeLocation && (() => {
          const b = homeBbox(homeLocation);
          return (
            <Rectangle
              bounds={[[b.minLat, b.minLng], [b.maxLat, b.maxLng]]}
              pathOptions={{ color: "#2563eb", weight: 2, fillOpacity: 0.04, dashArray: "8 6" }}
            />
          );
        })()}
        <ClickHandler
          onMapClick={handleMapClick}
          onClearEdit={() => { setEditingSpot(null); setEditingRoute(null); }}
          skipRef={skipNextClose}
        />

        {homeLocation && <MapAutoCenter home={homeLocation} spots={spots} routes={routes} />}

        {homeLocation && (
          <Marker position={[homeLocation.coordinates[1], homeLocation.coordinates[0]]} icon={homeIcon}>
            <Popup minWidth={208}>
              <Stack spacing={1.5} sx={{ width: 192, pt: 0.5 }}>
                <div>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block" }}>
                    Starting Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{homeLocation.type}</Typography>
                </div>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" onClick={onHomeEdit} sx={{ flex: 1 }}>Edit</Button>
                  <Button variant="outlined" size="small" color="error" onClick={onHomeDelete}>Delete</Button>
                </Stack>
              </Stack>
            </Popup>
          </Marker>
        )}

        {pendingHomeLatLng && (
          <Marker
            position={pendingHomeLatLng}
            icon={homeIcon}
            eventHandlers={{ add: e => (e.target as L.Marker).openPopup() }}
          >
            <Popup minWidth={200} closeButton={false}>
              <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Save this as your starting location?
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => { onHomePicked(pendingHomeLatLng); setPendingHomeLatLng(null); }}
                  >
                    Save
                  </Button>
                  <Button variant="text" size="small" color="inherit" onClick={() => setPendingHomeLatLng(null)}>
                    Try again
                  </Button>
                </Stack>
              </Stack>
            </Popup>
          </Marker>
        )}

        {spotsVisible && spots.map(spot => (
          <Marker
            key={spot.id}
            position={[spot.coordinates[1], spot.coordinates[0]]}
            {...(mode === "addRoute" ? { icon: routeSpotIcon } : {})}
            eventHandlers={mode === "addRoute" ? {
              click: e => { L.DomEvent.stop(e); addWaypoint(spot.coordinates); },
            } : {}}
          >
            <Tooltip>{spot.name}{spot.description ? ` — ${spot.description}` : ""}</Tooltip>
            {mode === "idle" && (
              <Popup minWidth={216}>
                {editingSpot?.id === spot.id ? (
                  <InlineEditForm
                    name={editSpotName} onNameChange={setEditSpotName}
                    desc={editSpotDesc} onDescChange={setEditSpotDesc}
                    onSave={() => {
                      updateSpot.mutate({ id: spot.id, patch: { name: editSpotName.trim(), description: editSpotDesc.trim() } });
                      setEditingSpot(null);
                    }}
                    onCancel={() => setEditingSpot(null)}
                  />
                ) : (
                  <SpotPopup
                    spot={spot}
                    isOwn={spot.sessionToken === sessionToken}
                    onEdit={() => {
                      skipNextClose.current = true;
                      setTimeout(() => { skipNextClose.current = false; }, 200);
                      setEditingSpot(spot); setEditSpotName(spot.name); setEditSpotDesc(spot.description);
                    }}
                    onRemove={() => removeSpot.mutate(spot.id)}
                  />
                )}
              </Popup>
            )}
          </Marker>
        ))}

        {routesVisible && routes.map(route => {
          const geo = route.geometry ?? [];
          const wpts = route.waypoints ?? [];
          const positions = toLatlng(geo.length ? geo : wpts);
          if (positions.length <= 1) return null;
          return (
            <LayerGroup key={route.id}>
              <Polyline positions={positions} weight={20} opacity={0}>
                {mode === "idle" && (
                  <Popup minWidth={216}>
                    {editingRoute?.id === route.id ? (
                      <InlineEditForm
                        name={editRouteName} onNameChange={setEditRouteName}
                        desc={editRouteDesc} onDescChange={setEditRouteDesc}
                        onSave={() => {
                          updateRoute.mutate({ id: route.id, patch: { name: editRouteName.trim(), description: editRouteDesc.trim() } });
                          setEditingRoute(null);
                        }}
                        onCancel={() => setEditingRoute(null)}
                      />
                    ) : (
                      <RoutePopup
                        route={route}
                        isOwn={route.sessionToken === sessionToken}
                        onEdit={() => {
                          skipNextClose.current = true;
                          setTimeout(() => { skipNextClose.current = false; }, 200);
                          setEditingRoute(route); setEditRouteName(route.name); setEditRouteDesc(route.description);
                        }}
                        onRemove={() => removeRoute.mutate(route.id)}
                      />
                    )}
                  </Popup>
                )}
              </Polyline>
              <Polyline positions={positions} color={route.colour} weight={4} interactive={false} />
            </LayerGroup>
          );
        })}

        {mode === "addRoute" && routeGeometry.length > 1 && (
          <Polyline positions={toLatlng(routeGeometry)} color={MODE_COLOR[transportMode]} dashArray="4 4" weight={3} />
        )}
        {mode === "addRoute" && routeWaypoints.map(([lng, lat], i) => (
          <Marker key={i} position={[lat, lng]} icon={waypointDivIcon} />
        ))}

        {mode === "addSpot" && pendingLatLng && (
          <Marker
            position={pendingLatLng}
            icon={pendingIcon}
            eventHandlers={{ add: e => (e.target as L.Marker).openPopup() }}
          >
            <Popup minWidth={236} closeButton={false}>
              <AddSpotForm
                saving={addSpot.isPending}
                error={addSpot.error ? (addSpot.error as Error).message : null}
                onSave={(name, desc) => {
                  addSpot.mutate(
                    { name, description: desc, coordinates: [pendingLatLng.lng, pendingLatLng.lat] },
                    {
                      onSuccess: () => { setPendingLatLng(null); onModeChange("idle"); },
                      onError: err => console.error("[MapCanvas] spot save failed", err),
                    },
                  );
                }}
                onCancel={() => { setPendingLatLng(null); onModeChange("idle"); }}
              />
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {mode === "addRoute" && (
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            bottom: 20,
            left: { xs: 0, sm: "50%" },
            right: { xs: 0, sm: "auto" },
            transform: { xs: "none", sm: "translateX(-50%)" },
            minWidth: { sm: 320 },
            zIndex: 1000,
            borderRadius: { xs: "12px 12px 0 0", sm: 3 },
            px: 3,
            pt: 2.5,
            pb: "calc(20px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <ToggleButtonGroup
            value={transportMode}
            exclusive
            onChange={(_, v) => v && setTransportMode(v)}
            size="small"
            fullWidth
            sx={{ mb: 2 }}
          >
            {(["foot", "bike"] as TransportMode[]).map(m => (
              <ToggleButton key={m} value={m} sx={{ flex: 1, fontSize: "0.75rem" }}>
                {TRANSPORT_LABELS[m]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {!savingRoute ? (
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {routeLoading ? "Routing…" : `${routeWaypoints.length} point${routeWaypoints.length !== 1 ? "s" : ""}`}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
                {routeWaypoints.length > 0 && (
                  <Button variant="text" size="small" color="inherit" onClick={() => setRouteWaypoints(p => p.slice(0, -1))}>
                    Undo
                  </Button>
                )}
                {routeWaypoints.length >= 2 && (
                  <Button variant="contained" size="small" onClick={() => setSavingRoute(true)}>
                    Save route
                  </Button>
                )}
                <Button variant="text" size="small" color="inherit" onClick={() => onModeChange("idle")}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <TextField
                autoFocus
                size="small"
                label="Route name"
                value={routeName}
                onChange={e => setRouteName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveRoute()}
                fullWidth
              />
              <TextField
                size="small"
                label="Description"
                placeholder="Optional"
                value={routeDesc}
                onChange={e => setRouteDesc(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveRoute()}
                fullWidth
              />
              <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                <Button variant="text" size="small" color="inherit" onClick={() => setSavingRoute(false)}>
                  Back
                </Button>
                <Button variant="contained" size="small" disabled={!routeName.trim()} onClick={handleSaveRoute}>
                  Save
                </Button>
              </Stack>
            </Stack>
          )}
        </Paper>
      )}
    </div>
  );
}
