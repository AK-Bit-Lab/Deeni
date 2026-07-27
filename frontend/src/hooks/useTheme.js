import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "deeni_theme";

/**
 * useTheme
 * Manages light/dark mode using the Tailwind `class` strategy (toggles
 * the `dark` class on <html>). Persists the choice in localStorage and
 * falls back to the system color-scheme preference on first visit.
 *
 * Returns: { theme, toggle, setTheme, clearOverride }
 *   theme: "light" | "dark"
 *   toggle: () => void - flip between light and dark and persist.
 *   setTheme: (next: "light" | "dark") => void - set explicitly and persist.
 *   clearOverride: () => void - drop the persisted choice and follow the OS
 *     preference again (live). Useful for a "reset to system" affordance.
 */
export function useTheme() {
  const [theme, setTheme] = useState("light");
  // Tracks whether the user has explicitly chosen a theme. While false,
  // we follow the OS preference and react to live OS theme changes.
  const [userOverride, setUserOverride] = useState(false);

  // Initialise from storage or system preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      setUserOverride(true);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  // Follow OS theme changes live, but only while the user hasn't picked
  // their own theme. Once they toggle, their choice wins until they clear
  // localStorage.
  useEffect(() => {
    if (userOverride) return;
    if (!window.matchMedia) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setTheme(e.matches ? "dark" : "light");
    // addEventListener is the modern API; addListener is the legacy fallback.
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [userOverride]);

  // Apply theme to <html> and persist. Skip the very first run so we don't
  // overwrite a stored value with the default "light" before the init
  // effect has had a chance to read storage.
  const firstApply = useRef(true);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    if (firstApply.current) {
      firstApply.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore (private mode, quota, etc.)
    }
  }, [theme]);

  const toggle = () => {
    setUserOverride(true);
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  const setThemeAndOverride = (next) => {
    setUserOverride(true);
    setTheme(next);
  };

  // Drop the persisted choice and re-follow the OS preference live. We
  // also remove the localStorage entry so a future page load starts from
  // the system preference again. The current theme is immediately updated
  // to whatever the OS currently reports so the UI does not flash.
  const clearOverride = () => {
    setUserOverride(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore (private mode, quota, etc.)
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return { theme, toggle, setTheme: setThemeAndOverride, clearOverride };
}
