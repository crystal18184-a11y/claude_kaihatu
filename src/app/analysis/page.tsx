"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useStore } from "@/store/useStore";
import type { Item } from "@/types";

const MAJOR_EMOJI: Record<string, string> = {"食費":"🛒","日用品・生活":"🏠","ファッション":"👗","電化製品・家電":"📱","子ども・教育":"🎒","娯楽・その他":"🎡"};
const MAJOR_COLOR: Record<string, string> = {"食費":"#e8657a","日用品・生活":"#4a9fd4","ファッション":"#d45fa0","電化製品・家電":"#7b61d4","子ども・教育":"#f0a500","娯楽・その他":"#ff7043"};

export default function AnalysisPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const { getReceiptsForMonth } = useStore();

  const yearMonth = currentMonth.format("YYYY-MM");
  const receipts = getReceiptsForMonth(yearMonth);
  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);

  // カテゴリ別集計
  const majorTotals: Record<string, number> = {};
  receipts.forEach(r => r.items.forEach((item: Item) => {
    const cat = item.majorCategory || "娯楽・その他";
    majorTotals[cat] = (majorTotals[cat] || 0) + item.price;
  }));

  // 店頻度ランキング
  const storeCount: Record<string, number> = {};
  receipts.forEach(r => { storeCount[r.store] = (storeCount[r.store] || 0) + 1; });
  const storeCountRank = Object.entries(storeCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // 店金額ランキング
  const storeAmount: Record<string, number> = {};
  receipts.forEach(r => { storeAmount[r.store] = (storeAmount[r.store] || 0) + r.total; });
  const storeAmountRank = Object.entries(storeAmount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // 商品ランキング
  const itemCount: Record<string, number> = {};
  receipts.forEach(r => r.items.forEach((item: Item) => {
    itemCount[item.name] = (itemCount[item.name] || 0) + 1;
  }));
  const itemRank = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // 買いすぎアラート（3回以上）
  const alerts = Object.entries(itemCount).filter(([, count]) => count >= 3).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-dvh bg-rose-50 w-full max-w-md mx-auto pb-28">
      <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-5 text-white">
        <div className="text-xs opacity-80 tracking-widest">MY KAKEIBO</div>
        <div className="text-2xl font-bold">分析</div>
        <div className="flex items-center justify-between mt-3">
          <button onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))} className="text-white text-2xl px-2">&#8249;</button>
          <div className="font-bold text-lg">{currentMonth.format("YYYY年M月")}</div>
          <button onClick={() => setCurrentMonth(currentMonth.add(1, "month"))} className="text-white text-2xl px-2">&#8250;</button>
        </div>
      </div>

      <div className="p-4">
        {receipts.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-3">📊</div>
            <div>この月の記録はありません</div>
          </div>
        ) : (
          <>
            {/* カテゴリ別グラフ */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="font-bold text-gray-800 mb-3">🛒 カテゴリ別支出</div>
              {Object.entries(majorTotals).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                <div key={cat} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{MAJOR_EMOJI[cat] || "📦"} {cat}</span>
                    <span className="text-sm font-bold">¥{amt.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 rounded-full" style={{ width: `${(amt/totalSpent)*100}%`, background: MAJOR_COLOR[cat] || "#9e9e9e" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 買いすぎアラート */}
            {alerts.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <div className="font-bold text-gray-800 mb-3">⚠️ 買いすぎアラート</div>
                {alerts.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{name}</span>
                    <span className="text-sm font-bold text-rose-400">今月{count}回</span>
                  </div>
                ))}
              </div>
            )}

            {/* 店頻度ランキング */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="font-bold text-gray-800 mb-3">🏪 よく行ったお店</div>
              {storeCountRank.map(([store, count], i) => (
                <div key={store} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-lg font-bold text-rose-400">{i + 1}</span>
                  <span className="flex-1 text-sm">{store}</span>
                  <span className="text-sm font-bold text-gray-700">{count}回</span>
                </div>
              ))}
            </div>

            {/* 店金額ランキング */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="font-bold text-gray-800 mb-3">💰 お金を使ったお店</div>
              {storeAmountRank.map(([store, amt], i) => (
                <div key={store} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-lg font-bold text-rose-400">{i + 1}</span>
                  <span className="flex-1 text-sm">{store}</span>
                  <span className="text-sm font-bold text-rose-400">¥{amt.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* 商品ランキング */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="font-bold text-gray-800 mb-3">🛍️ よく買ったもの</div>
              {itemRank.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-lg font-bold text-rose-400">{i + 1}</span>
                  <span className="flex-1 text-sm">{name}</span>
                  <span className="text-sm font-bold text-gray-700">{count}回</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
