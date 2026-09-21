"use client";
import { useState } from "react";
import type { Spot } from "@/lib/store";

type Props = {
  spots: Spot[];
  onSave: (name: string, description: string, spotIds: string[]) => void;
  onCancel: () => void;
};

export function AddRouteForm({ spots, onSave, onCancel }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  return (
    <div className="w-64 p-3 space-y-2">
      <div>
        <label className="text-xs text-gray-500">Name</label>
        <input
          className="w-full border rounded px-2 py-1 text-sm"
          placeholder="Coffee and cat loop"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-gray-500">Description</label>
        <textarea
          className="w-full border rounded px-2 py-1 text-sm"
          placeholder="Short loop past two good coffee spots"
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      {spots.length > 0 && (
        <div>
          <label className="text-xs text-gray-500">Include spots (in order)</label>
          <div className="space-y-1 mt-1">
            {spots.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() => toggle(s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button
          className="flex-1 bg-blue-500 text-white rounded px-2 py-1 text-sm disabled:opacity-40"
          disabled={!name.trim() || selected.length < 2}
          onClick={() => onSave(name.trim(), desc.trim(), selected)}
        >
          Save
        </button>
        <button className="text-sm text-gray-500" onClick={onCancel}>Cancel</button>
      </div>
      {selected.length < 2 && <p className="text-xs text-gray-400">Select at least 2 spots</p>}
    </div>
  );
}
