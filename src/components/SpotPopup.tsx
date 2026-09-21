"use client";
import type { Spot } from "@/lib/store";

type Props = {
  spot: Spot;
  isOwn: boolean;
  onEdit: () => void;
  onRemove: () => void;
};

export function SpotPopup({ spot, isOwn, onEdit, onRemove }: Props) {
  return (
    <div className="w-52 p-3 space-y-2">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Name</p>
        <p className="font-medium text-sm">{spot.name}</p>
      </div>
      {spot.description && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Description</p>
          <p className="text-sm text-gray-600">{spot.description}</p>
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
