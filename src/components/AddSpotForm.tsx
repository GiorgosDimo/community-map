"use client";
import { useState } from "react";

type Props = {
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
  saving?: boolean;
  error?: string | null;
};

export function AddSpotForm({ onSave, onCancel, saving, error }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <div className="w-56 p-3 space-y-2">
      <div>
        <label className="text-xs text-gray-500">Name</label>
        <input
          className="w-full border rounded px-2 py-1 text-sm"
          placeholder="Good coffee spot"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-gray-500">Description</label>
        <textarea
          className="w-full border rounded px-2 py-1 text-sm"
          placeholder="Small espresso bar, quiet in the mornings"
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          className="flex-1 bg-blue-500 text-white rounded px-2 py-1 text-sm disabled:opacity-40"
          disabled={!name.trim() || saving}
          onClick={() => onSave(name.trim(), desc.trim())}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button className="text-sm text-gray-500" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
