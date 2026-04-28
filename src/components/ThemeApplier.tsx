"use client";
import { useEffect } from "react";
import { useThemeStore, THEMES } from "@/store/themeStore";

export default function ThemeApplier() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const t = THEMES[theme];
    const r = document.documentElement;
    r.style.setProperty("--c-from",   t.from);
    r.style.setProperty("--c-to",     t.to);
    r.style.setProperty("--c-accent", t.accent);
    r.style.setProperty("--c-light",  t.light);
    r.style.setProperty("--c-mid",    t.mid);
  }, [theme]);

  return null;
}
