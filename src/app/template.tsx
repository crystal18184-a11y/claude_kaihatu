"use client";
import { useNavStore } from "@/store/navStore";

export default function Template({ children }: { children: React.ReactNode }) {
  const direction = useNavStore((s) => s.direction);
  const cls =
    direction === "forward"  ? "page-forward"  :
    direction === "backward" ? "page-backward" :
    "page-fade";
  return <div className={cls}>{children}</div>;
}
