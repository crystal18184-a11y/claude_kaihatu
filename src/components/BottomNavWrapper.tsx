"use client";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

const TAB_MAP: Record<string, number> = {
  "/": 0,
  "/history": 1,
  "/analysis": 3,
  "/settings": 4,
};

export default function BottomNavWrapper() {
  const pathname = usePathname();
  const activeTab = TAB_MAP[pathname];
  if (activeTab === undefined) return null;
  return <BottomNav activeTab={activeTab} />;
}
