import { create } from "zustand";
import { persist } from "zustand/middleware";

export const THEME_KEYS = ["pink","purple","blue","teal","green","orange","red","indigo"] as const;
export type ThemeKey = typeof THEME_KEYS[number];

export const THEMES: Record<ThemeKey, {
  label: string; from: string; to: string;
  accent: string; light: string; mid: string;
}> = {
  pink:   { label:"ピンク",    from:"#f472b6", to:"#ec4899", accent:"#ec4899", light:"#fdf2f8", mid:"#fbcfe8" },
  purple: { label:"パープル",  from:"#c084fc", to:"#a855f7", accent:"#a855f7", light:"#faf5ff", mid:"#e9d5ff" },
  blue:   { label:"ブルー",    from:"#60a5fa", to:"#3b82f6", accent:"#3b82f6", light:"#eff6ff", mid:"#bfdbfe" },
  teal:   { label:"ティール",  from:"#2dd4bf", to:"#14b8a6", accent:"#14b8a6", light:"#f0fdfa", mid:"#99f6e4" },
  green:  { label:"グリーン",  from:"#4ade80", to:"#22c55e", accent:"#22c55e", light:"#f0fdf4", mid:"#bbf7d0" },
  orange: { label:"オレンジ",  from:"#fb923c", to:"#f97316", accent:"#f97316", light:"#fff7ed", mid:"#fed7aa" },
  red:    { label:"レッド",    from:"#f87171", to:"#ef4444", accent:"#ef4444", light:"#fef2f2", mid:"#fecaca" },
  indigo: { label:"インディゴ",from:"#818cf8", to:"#6366f1", accent:"#6366f1", light:"#eef2ff", mid:"#c7d2fe" },
};

interface ThemeState {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "teal",
      setTheme: (t) => set({ theme: t }),
    }),
    { name: "kakeibo-theme" }
  )
);
