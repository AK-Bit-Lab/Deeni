import { useEffect, useState } from "react";

const STORAGE_KEY = "deeni_theme";

/**
 * useTheme
 * Manages light/dark mode using the Tailwind `class` strategy (toggles
 * the `dark` class on <html>). Persists the choice in localStorage and
 * falls back to the system color-scheme preference on first visit.
 *
 * Returns: { theme, toggle, setTheme }
 *   theme: "light" | "dark"
 */
export function useTheme() {
  const [theme, setTheme] = useState("light");

  // Initialise from storage or system preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  // Apply theme to <html> and persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggle, setTheme };
}
