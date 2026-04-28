"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
            <div className="font-bold text-gray-800 text-center mb-4 text-lg">記録する</div>
            <button
              onClick={() => goToDetail("/scan")}
              className="w-full flex items-center gap-4 p-4 bg-rose-50 rounded-2xl mb-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 theme-grad rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                📷
              </div>
              <div>
                <div className="font-bold text-gray-800">レシートを読み取る</div>
                <div className="text-sm text-gray-500 mt-0.5">カメラまたはアルバムから</div>
              </div>
            </button>
            <button
              onClick={() => goToDetail("/manual")}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-4 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                ✏️
              </div>
              <div>
                <div className="font-bold text-gray-800">手動で入力する</div>
                <div className="text-sm text-gray-500 mt-0.5">店名・商品を直接入力</div>
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
        <div className="flex max-w-md mx-auto">
          <button
            onClick={() => goTo(0, "/")}
            className={`flex-1 py-3 flex flex-col items-center text-xs font-medium ${activeTab === 0 ? "theme-text" : "text-gray-400"}`}
          >
            <span className="text-lg mb-0.5">🏠</span>ホーム
          </button>
          <button
            onClick={() => goTo(1, "/history")}
            className={`flex-1 py-3 flex flex-col items-center text-xs font-medium ${activeTab === 1 ? "theme-text" : "text-gray-400"}`}
          >
            <span className="text-lg mb-0.5">📅</span>履歴
          </button>
          <button
            onClick={() => setShowSheet(true)}
            className="flex-1 py-2 flex flex-col items-center"
          >
            <div className="-mt-5 w-14 h-14 theme-grad rounded-full flex items-center justify-center text-white text-3xl shadow-lg shadow-rose-300/50 active:scale-95 transition-transform">
              +
            </div>
          </button>
          <button
            onClick={() => goTo(3, "/analysis")}
            className={`flex-1 py-3 flex flex-col items-center text-xs font-medium ${activeTab === 3 ? "theme-text" : "text-gray-400"}`}
          >
            <span className="text-lg mb-0.5">📊</span>分析
          </button>
          <button
            onClick={() => goTo(4, "/settings")}
            className={`flex-1 py-3 flex flex-col items-center text-xs font-medium ${activeTab === 4 ? "theme-text" : "text-gray-400"}`}
          >
            <span className="text-lg mb-0.5">⚙️</span>設定
          </button>
        </div>
      </div>
    </>
  );
}
