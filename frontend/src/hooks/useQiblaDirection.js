import { useState, useEffect, useRef } from "react";

const MECCA_LAT = 21.422487;
const MECCA_LNG = 39.826206;

/**
 * useQiblaDirection
 * - Resolves the user's geolocation.
 * - Computes the true bearing from the user to the Kaaba (Qibla).
 * - Tracks the device compass heading so the UI can show a live needle
 *   that points toward Mecca relative to where the phone is facing.
 */
export function useQiblaDirection() {
  const [direction, setDirection] = useState(null); // true bearing to Mecca
  const [heading, setHeading] = useState(null); // device compass heading (deg from N)
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [permission, setPermission] = useState("prompt");
  const cleanupRef = useRef(null);

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

  // 2. Device orientation → live compass heading
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event) => {
      // iOS provides webkitCompassHeading (deg from North, clockwise).
      if (typeof event.webkitCompassHeading === "number") {
        setHeading(event.webkitCompassHeading);
        return;
      }
      // Android: alpha is rotation around z; heading = 360 - alpha.
      if (typeof event.alpha === "number") {
        let h = 360 - event.alpha;
        if (h >= 360) h -= 360;
        setHeading(h);
      }
    };

    const start = async () => {
      // iOS 13+ requires permission via a user gesture.
      if (typeof DeviceOrientationEvent !== "undefined" &&
          typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          const res = await DeviceOrientationEvent.requestPermission();
          setPermission(res);
          if (res === "granted") {
            window.addEventListener("deviceorientation", handler, true);
            cleanupRef.current = () =>
              window.removeEventListener("deviceorientation", handler, true);
          }
        } catch (e) {
          setPermission("denied");
        }
      } else {
        window.addEventListener("deviceorientationabsolute", handler, true);
        window.addEventListener("deviceorientation", handler, true);
        cleanupRef.current = () => {
          window.removeEventListener("deviceorientationabsolute", handler, true);
          window.removeEventListener("deviceorientation", handler, true);
        };
        setPermission("granted");
      }
    };

    // Expose a starter so the component can request permission on tap.
    useQiblaDirection._startCompass = start;

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

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
    requestCompass: () => useQiblaDirection._startCompass && useQiblaDirection._startCompass(),
  };
}
