"use client";
import type { Route } from "@/lib/store";

const MODE_LABELS: Record<string, string> = { foot: "🚶 Walking", bike: "🚴 Cycling" };

function fmtDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
function fmtTime(sec: number) {
  const m = Math.round(sec / 60);
  return m < 60 ? `~${m} min` : `~${Math.floor(m / 60)} h ${m % 60} min`;
}

type Props = { route: Route; isOwn: boolean; onEdit: () => void; onRemove: () => void };

export function RoutePopup({ route, isOwn, onEdit, onRemove }: Props) {
  return (
    <div className="w-52 p-3 space-y-2">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Name</p>
        <p className="font-medium text-sm">{route.name}</p>
      </div>

      {route.type && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Transport</p>
          <p className="text-sm">{MODE_LABELS[route.type] ?? route.type}</p>
        </div>
      )}

      {(route.distance != null || route.duration != null) && (
        <div className="flex gap-4">
          {route.distance != null && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Distance</p>
              <p className="text-sm font-medium">{fmtDist(route.distance)}</p>
            </div>
          )}
          {route.duration != null && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Time</p>
              <p className="text-sm font-medium">{fmtTime(route.duration)}</p>
            </div>
          )}
        </div>
      )}

      {route.description && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Description</p>
          <p className="text-sm text-gray-600">{route.description}</p>
        </div>
      )}

      {isOwn ? (
        <div className="flex gap-2 pt-1">
          <button
            className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm hover:bg-gray-50"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="border border-red-200 text-red-500 rounded-lg px-2 py-1 text-sm hover:bg-red-50"
            onClick={onRemove}
          >
            Delete
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">Added by a colleague</p>
      )}
    </div>
  );
}
