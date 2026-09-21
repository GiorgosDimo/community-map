"use client";

type Props = { onGetStarted: () => void };

export function WelcomeScreen({ onGetStarted }: Props) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[min(320px,calc(100vw-2rem))] space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-2">🗺️</div>
          <h1 className="text-xl font-semibold tracking-tight">Community Map</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Discover and share interesting spots and routes around where you live, work, or study.
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">📍</span>
            <p>Pin hidden gems, favourite cafés, parks, or any place worth visiting near you.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">🚶</span>
            <p>Draw walking, cycling, or driving routes your colleagues and neighbours will love.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">🤝</span>
            <p>See what others have added and turn shared spots into places to meet and socialise.</p>
          </div>
        </div>

        <button
          onClick={onGetStarted}
          className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Get started
        </button>
      </div>
    </div>
  );
}
