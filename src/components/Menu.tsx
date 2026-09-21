"use client";
import { useState } from "react";

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

export function Menu({ spotsVisible, routesVisible, onToggleSpots, onToggleRoutes, mode, onAddSpot, onAddRoute, hasLocation }: Props) {
  const [open, setOpen] = useState(false);

  const addSpotDisabled = !hasLocation;
  // Add route also requires routes layer to be on (matches presentation)
  const addRouteDisabled = !hasLocation || !routesVisible;

  return (
    <>
      {open && <div className="fixed inset-0 z-[999]" onClick={() => setOpen(false)} aria-hidden />}
      <div className="absolute top-4 left-4 z-[1000]">
        {!open ? (
          <button
            className="bg-white rounded-lg shadow-md p-2.5 hover:bg-gray-50 border border-gray-100"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>
        ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-56 overflow-hidden">
          {/* Header row */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <HamburgerIcon />
          </button>

          <div className="px-4 py-3 space-y-4">
            {/* Layer toggles */}
            <div className="space-y-3">
              <Toggle label="Spots layer" checked={spotsVisible} onChange={onToggleSpots} />
              <Toggle label="Routes layer" checked={routesVisible} onChange={onToggleRoutes} />
            </div>

            <div className="h-px bg-gray-100" />

            {/* Action buttons */}
            <div className="space-y-2">
              <ActionButton
                label="+ Add spot"
                active={mode === "addSpot"}
                disabled={addSpotDisabled}
                onClick={onAddSpot}
                title={addSpotDisabled ? "Choose your starting location first" : undefined}
              />
              <ActionButton
                label="∼ Add route"
                active={mode === "addRoute"}
                disabled={addRouteDisabled}
                onClick={onAddRoute}
                title={!hasLocation ? "Choose your starting location first" : !routesVisible ? "Enable Routes layer first" : undefined}
              />
            </div>
          </div>
        </div>
        )}
      </div>
    </>
  );
}

function HamburgerIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
      <rect width="18" height="2" rx="1" fill="#374151" />
      <rect y="6" width="18" height="2" rx="1" fill="#374151" />
      <rect y="12" width="18" height="2" rx="1" fill="#374151" />
    </svg>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-150 ${checked ? "bg-blue-500" : "bg-gray-300"}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-150 mt-0.5 ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function ActionButton({ label, active, disabled, onClick, title }: { label: string; active: boolean; disabled: boolean; onClick: () => void; title?: string }) {
  return (
    <button
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
        disabled
          ? "text-gray-400 bg-gray-50 cursor-not-allowed"
          : active
          ? "bg-gray-900 text-white"
          : "text-gray-700 border border-gray-200 hover:bg-gray-50"
      }`}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {label}
    </button>
  );
}
