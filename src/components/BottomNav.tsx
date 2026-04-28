"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Clock, Camera, BarChart3, Settings, Pencil } from "lucide-react";
import { useNavStore } from "@/store/navStore";

export default function BottomNav({ activeTab }: { activeTab: number }) {
  const router = useRouter();
  const setDirection = useNavStore((s) => s.setDirection);
  const [showSheet, setShowSheet] = useState(false);

  const goTo = (targetIdx: number, route: string) => {
    if (targetIdx === activeTab) return;
    setDirection(targetIdx > activeTab ? "forward" : "backward");
    router.push(route);
  };

  const goToDetail = (route: string) => {
    setDirection("forward");
    setShowSheet(false);
    router.push(route);
  };

  const tabClass = (active: boolean) =>
    `flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
      active ? "theme-text" : "text-gray-400"
    }`;

  return (
    <>
      {showSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowSheet(false)}
        >
          <div className="overlay-in absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          <div
            className="sheet-up relative z-10 bg-white rounded-t-3xl w-full max-w-md px-5 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="font-bold text-gray-800 text-center mb-4 text-lg">記録方法を選択</div>
            <button
              onClick={() => goToDetail("/scan")}
              className="w-full flex items-center gap-4 p-4 bg-[#FAF7F8] rounded-2xl mb-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 theme-grad rounded-2xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <div className="font-bold text-gray-800">レシートを撮影</div>
                <div className="text-sm text-gray-500 mt-0.5">店名・金額・日付を自動入力</div>
              </div>
            </button>
            <button
              onClick={() => goToDetail("/manual")}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-4 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Pencil className="w-6 h-6 text-gray-600" strokeWidth={2.2} />
              </div>
              <div>
                <div className="font-bold text-gray-800">手入力</div>
                <div className="text-sm text-gray-500 mt-0.5">細かく入力したいとき</div>
              </div>
            </button>
            <button
              onClick={() => setShowSheet(false)}
              className="w-full py-3 text-gray-400 text-sm font-semibold"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 pb-[env(safe-area-inset-bottom,0px)] z-40">
        <div className="flex max-w-md mx-auto items-end">
          <button onClick={() => goTo(0, "/")} className={tabClass(activeTab === 0)}>
            <Home className="w-6 h-6" strokeWidth={activeTab === 0 ? 2.4 : 1.8} />
            <span>ホーム</span>
          </button>
          <button onClick={() => goTo(1, "/history")} className={tabClass(activeTab === 1)}>
            <Clock className="w-6 h-6" strokeWidth={activeTab === 1 ? 2.4 : 1.8} />
            <span>履歴</span>
          </button>
          <button
            onClick={() => setShowSheet(true)}
            className="flex-1 py-2 flex flex-col items-center gap-1"
            aria-label="レシート読取"
          >
            <div className="-mt-6 w-14 h-14 theme-grad rounded-full flex items-center justify-center text-white shadow-lg theme-shadow active:scale-95 transition-transform">
              <Camera className="w-7 h-7" strokeWidth={2.2} />
            </div>
            <span className="text-[10px] font-medium theme-text">レシート</span>
          </button>
          <button onClick={() => goTo(3, "/analysis")} className={tabClass(activeTab === 3)}>
            <BarChart3 className="w-6 h-6" strokeWidth={activeTab === 3 ? 2.4 : 1.8} />
            <span>分析</span>
          </button>
          <button onClick={() => goTo(4, "/settings")} className={tabClass(activeTab === 4)}>
            <Settings className="w-6 h-6" strokeWidth={activeTab === 4 ? 2.4 : 1.8} />
            <span>設定</span>
          </button>
        </div>
      </div>
    </>
  );
}
