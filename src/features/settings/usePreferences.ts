import { useEffect, useState } from "react";
import { copy } from "../../i18n/zh-CN";
export type Preferences = {
  theme: "system" | "light" | "dark";
  reduceTransparency: boolean;
  reduceMotion: boolean;
};
const defaults: Preferences = {
  theme: "system",
  reduceTransparency: false,
  reduceMotion: false,
};
const key = "ui.preferences.v1";
function read(): { value: Preferences; error: string } {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { value: defaults, error: "" };
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== "object" ||
      !("theme" in value) ||
      typeof value.theme !== "string" ||
      !["system", "light", "dark"].includes(value.theme) ||
      !("reduceTransparency" in value) ||
      typeof value.reduceTransparency !== "boolean" ||
      !("reduceMotion" in value) ||
      typeof value.reduceMotion !== "boolean"
    )
      throw new Error("Invalid preferences");
    return {
      value: {
        theme: value.theme as Preferences["theme"],
        reduceTransparency: value.reduceTransparency,
        reduceMotion: value.reduceMotion,
      },
      error: "",
    };
  } catch {
    return { value: defaults, error: copy.preferenceReadError };
  }
}
export function usePreferences() {
  const [initial] = useState(read);
  const [preferences, setPreferences] = useState(initial.value);
  const [preferenceError, setError] = useState(initial.error);
  useEffect(() => {
    const dark = matchMedia("(prefers-color-scheme: dark)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const transparency = matchMedia("(prefers-reduced-transparency: reduce)");
    const apply = () => {
      const root = document.documentElement;
      root.dataset.theme =
        preferences.theme === "system"
          ? dark.matches
            ? "dark"
            : "light"
          : preferences.theme;
      root.dataset.transparency =
        preferences.reduceTransparency || transparency.matches
          ? "reduced"
          : "normal";
      root.dataset.motion =
        preferences.reduceMotion || motion.matches ? "reduced" : "normal";
    };
    apply();
    dark.addEventListener("change", apply);
    motion.addEventListener("change", apply);
    transparency.addEventListener("change", apply);
    return () => {
      dark.removeEventListener("change", apply);
      motion.removeEventListener("change", apply);
      transparency.removeEventListener("change", apply);
    };
  }, [preferences]);
  function changePreferences(patch: Partial<Preferences>) {
    const next = { ...preferences, ...patch };
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setPreferences(next);
      setError("");
    } catch {
      setError(copy.preferenceWriteError);
    }
  }
  return { preferences, preferenceError, changePreferences };
}
