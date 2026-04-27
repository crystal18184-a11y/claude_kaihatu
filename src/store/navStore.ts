import { create } from "zustand";

type NavDirection = "forward" | "backward" | "none";

interface NavState {
  direction: NavDirection;
  setDirection: (dir: NavDirection) => void;
}

export const useNavStore = create<NavState>()((set) => ({
  direction: "none",
  setDirection: (dir) => set({ direction: dir }),
}));
