import { useState, useEffect, useRef, useCallback } from "react";

const MECCA_LAT = 21.422487;
const MECCA_LNG = 39.826206;

/**
 * useQiblaDirection
 * - Resolves the user's geolocation.
 * - Computes the true bearing from the user to the Kaaba (Qibla).
 * - Tracks the device compass heading so the UI can show a live needle
 *   that points toward Mecca relative to where the phone is facing.
 *
 * Robustness fixes:
 * 1. Prefers `deviceorientationabsolute` (true compass on Android) and
 *    does NOT let relative `deviceorientation` overwrite it.
 * 2. Auto-starts the compass on non-iOS browsers (no permission needed).
 * 3. Smooths the heading with a low-pass filter to reduce jitter.
 * 4. Exposes `requestCompass()` for iOS 13+ permission (must be called
 *    from a user gesture / tap).
 * 5. Falls back gracefully when no orientation sensor is available
 *    (desktop, denied permission, etc.) — still shows the bearing to
 *    Mecca so the user can manually rotate.
 * 6. Adds a timeout: if no orientation event arrives within 6s of
 *    starting, we mark the compass as "unavailable" so the UI stops
 *    showing "Calibrating compass…" forever.
 */
export function useQiblaDirection() {
  const [direction, setDirection] = useState(null); // true bearing to Mecca
  const [heading, setHeading] = useState(null); // device compass heading (deg from N)
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [permission, setPermission] = useState("prompt");
  const [compassState, setCompassState] = useState("idle"); // idle | starting | active | unavailable

  const cleanupRef = useRef(null);
  const smoothRef = useRef(null); // smoothed heading for low-pass filter
  const hasAbsoluteRef = useRef(false); // track if we've got absolute data
  const startCompassRef = useRef(null); // stable ref to start function

  // 1. Geolocation → bearing to Mecca
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });

        const lat1 = (latitude * Math.PI) / 180;
        const lng1 = (longitude * Math.PI) / 180;
        const lat2 = (MECCA_LAT * Math.PI) / 180;
        const lng2 = (MECCA_LNG * Math.PI) / 180;
        const dLon = lng2 - lng1;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x =
          Math.cos(lat1) * Math.sin(lat2) -
          Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        let brng = (Math.atan2(y, x) * 180) / Math.PI;
        brng = (brng + 360) % 360;
        setDirection(brng);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  // Low-pass filter: smooth the heading to reduce sensor jitter.
  // Handles wrap-around (0/360 boundary).
  const smoothHeading = useCallback((raw) => {
    const prev = smoothRef.current;
    if (prev === null) {
      smoothRef.current = raw;
      return raw;
    }
    // Compute shortest angular difference
    let diff = raw - prev;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    // Low-pass factor — lower = smoother but more lag
    const smoothed = prev + diff * 0.3;
    let result = (smoothed + 360) % 360;
    smoothRef.current = result;
    return result;
  }, []);

  // 2. Device orientation → live compass heading
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event) => {
      // iOS provides webkitCompassHeading (deg from North, clockwise).
      // This is already absolute (true compass heading).
      if (typeof event.webkitCompassHeading === "number") {
        hasAbsoluteRef.current = true;
        setCompassState("active");
        setHeading(smoothHeading(event.webkitCompassHeading));
        return;
      }

      // `deviceorientationabsolute` provides an absolute alpha (true compass).
      if (event.absolute === true || event.type === "deviceorientationabsolute") {
        if (typeof event.alpha === "number") {
          hasAbsoluteRef.current = true;
          setCompassState("active");
          // alpha is counter-clockwise from East on some devices, but
          // for absolute events it's typically compass heading = 360 - alpha.
          let h = 360 - event.alpha;
          if (h >= 360) h -= 360;
          setHeading(smoothHeading(h));
        }
        return;
      }

      // Regular `deviceorientation` — alpha is RELATIVE on Android.
      // Only use it if we haven't received any absolute data yet.
      if (!hasAbsoluteRef.current && typeof event.alpha === "number") {
        let h = 360 - event.alpha;
        if (h >= 360) h -= 360;
        setCompassState("active");
        setHeading(smoothHeading(h));
      }
    };

    const start = async () => {
      // iOS 13+ requires permission via a user gesture.
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const res = await DeviceOrientationEvent.requestPermission();
          setPermission(res);
          if (res === "granted") {
            window.addEventListener("deviceorientation", handler, true);
            cleanupRef.current = () =>
              window.removeEventListener("deviceorientation", handler, true);
            setCompassState("starting");
          } else {
            setCompassState("unavailable");
          }
        } catch (e) {
          setPermission("denied");
          setCompassState("unavailable");
        }
      } else {
        // Android / other — no permission needed, auto-start.
        // Register absolute first (preferred), then regular as fallback.
        window.addEventListener("deviceorientationabsolute", handler, true);
        window.addEventListener("deviceorientation", handler, true);
        cleanupRef.current = () => {
          window.removeEventListener("deviceorientationabsolute", handler, true);
          window.removeEventListener("deviceorientation", handler, true);
        };
        setPermission("granted");
        setCompassState("starting");
      }
    };

    startCompassRef.current = start;

    // Auto-start on non-iOS (Android, desktop). On iOS, the component
    // will call requestCompass() from a tap.
    const needsPermission =
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function";

    if (!needsPermission) {
      start();
    }

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [smoothHeading]);

  // Timeout: if no orientation event arrives within 6s, mark unavailable.
  useEffect(() => {
    if (compassState !== "starting") return;
    const t = setTimeout(() => {
      setCompassState((prev) => (prev === "starting" ? "unavailable" : prev));
    }, 6000);
    return () => clearTimeout(t);
  }, [compassState]);

  // Relative angle the needle should rotate so it points to Mecca
  // given the phone's current heading.
  const needleAngle =
    direction !== null && heading !== null ? direction - heading : direction;

  return {
    direction,
    heading,
    needleAngle,
    location,
    error,
    permission,
    compassState,
    requestCompass: () =>
      startCompassRef.current && startCompassRef.current(),
  };
}
