"use client";

const LOCATIONS = [
  { type: "Home", icon: "🏠" },
  { type: "Work", icon: "🏢" },
  { type: "School", icon: "🏫" },
  { type: "University", icon: "🎓" },
  { type: "Other", icon: "📍" },
];

type Props = { onTypeSelected: (type: string) => void };

export function StartingLocationModal({ onTypeSelected }: Props) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[min(320px,calc(100vw-2rem))] space-y-6">
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-semibold tracking-tight">Welcome!</h2>
          <p className="text-sm text-gray-500">
            Where are you joining from? Pick a type, then click on the map to pin your starting location.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {LOCATIONS.map(({ type, icon }) => (
            <button
              key={type}
              onClick={() => onTypeSelected(type)}
              className="flex flex-col items-center gap-2 border border-gray-200 rounded-xl p-4 hover:border-gray-900 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <span className="text-2xl">{icon}</span>
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
