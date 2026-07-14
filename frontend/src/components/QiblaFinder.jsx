import { Link } from "react-router-dom";
import { ChevronLeft, Navigation } from "lucide-react";
import { useQiblaDirection } from "../hooks/useQiblaDirection";

export default function QiblaFinder() {
  const { direction, heading, needleAngle, location, error, permission, requestCompass } =
    useQiblaDirection();

  const aligned =
    direction !== null &&
    heading !== null &&
    Math.abs(((direction - heading + 540) % 360) - 180) < 5;

  return (
    <div className="p-5 max-w-md mx-auto pt-6 flex flex-col items-center">
      <Link to="/" className="self-start flex items-center gap-1 text-sm text-gray-500 mb-4">
        <ChevronLeft className="w-4 h-4" /> Home
      </Link>
      <h2 className="text-2xl font-extrabold text-emerald-800 mb-1">Qibla Direction</h2>
      <p className="text-gray-500 text-sm mb-6 text-center">
        Hold your phone flat and rotate until the needle points to the Kaaba.
      </p>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center w-full">
          <p className="font-semibold">Could not detect location</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : direction === null ? (
        <div className="flex flex-col items-center py-16">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Detecting your location…</p>
        </div>
      ) : (
        <>
          {/* Compass */}
          <div className="relative w-64 h-64 rounded-full bg-white shadow-xl border-4 border-emerald-200 flex items-center justify-center">
            {/* Cardinal labels */}
            <div className="absolute top-2 text-gray-400 font-bold text-sm">N</div>
            <div className="absolute right-3 text-gray-400 font-bold text-sm">E</div>
            <div className="absolute bottom-2 text-gray-400 font-bold text-sm">S</div>
            <div className="absolute left-3 text-gray-400 font-bold text-sm">W</div>

            {/* Rotating dial that follows device heading */}
            <div
              className="absolute inset-0 compass-needle"
              style={{ transform: `rotate(${heading ? -heading : 0}deg)` }}
            >
              {/* tick marks */}
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 origin-bottom"
                  style={{
                    width: i % 6 === 0 ? 2 : 1,
                    height: i % 6 === 0 ? 14 : 8,
                    background: i % 6 === 0 ? "#10b981" : "#d1d5db",
                    transform: `translate(-50%, -120px) rotate(${i * 15}deg)`,
                    transformOrigin: "center 120px",
                  }}
                />
              ))}
            </div>

            {/* Qibla needle — points to Mecca relative to phone heading */}
            <div
              className="absolute left-1/2 top-1/2 compass-needle"
              style={{
                transform: `translate(-50%, -100%) rotate(${needleAngle ?? 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div className="w-1.5 h-28 bg-gradient-to-t from-emerald-700 to-emerald-400 rounded-full mx-auto" />
              <div className="w-5 h-5 bg-emerald-700 rounded-full -mt-1 mx-auto border-2 border-white shadow" />
            </div>

            {/* Center hub */}
            <div className="w-5 h-5 bg-emerald-800 rounded-full z-10 shadow" />
          </div>

          {/* Aligned indicator */}
          <div
            className={`mt-5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              aligned
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {aligned ? "✅ Aligned with Qibla" : "Rotate to align"}
          </div>

          <p className="mt-4 text-center text-gray-600 font-medium">
            Bearing to Mecca:{" "}
            <span className="text-emerald-700 text-lg font-bold">
              {Math.round(direction)}°
            </span>
          </p>

          {location && (
            <p className="mt-1 text-xs text-gray-400">
              Your location: {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
            </p>
          )}

          {permission !== "granted" && (
            <button
              onClick={requestCompass}
              className="mt-5 inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-700"
            >
              <Navigation className="w-4 h-4" /> Enable live compass
            </button>
          )}
        </>
      )}
    </div>
  );
}
