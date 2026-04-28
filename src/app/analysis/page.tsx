"use client";
import { useState } from "react";
import dayjs from "dayjs";
import { useStore } from "@/store/useStore";
import { formatYen } from "@/lib/format";
import type { Item } from "@/types";

const MAJOR_EMOJI: Record<string, string> = {"食費":"🛒","日用品・生活":"🏠","ファッション":"👗","電化製品・家電":"📱","子ども・教育":"🎒","外食・グルメ":"🍽️","娯楽・その他":"🎡","固定費・サブスク":"💳"};
const MAJOR_COLOR: Record<string, string> = {"食費":"#20C7B5","日用品・生活":"#4A9FD4","ファッション":"#F65F8B","電化製品・家電":"#7B61D4","子ども・教育":"#F0A500","外食・グルメ":"#F59E0B","娯楽・その他":"#FF7043","固定費・サブスク":"#94A3B8"};

export default function AnalysisPage() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const { getReceiptsForMonth, getBudgetForMonth } = useStore();

  const yearMonth = currentMonth.format("YYYY-MM");
  const prevYearMonth = currentMonth.subtract(1, "month").format("YYYY-MM");
  const receipts = getReceiptsForMonth(yearMonth);
  const prevReceipts = getReceiptsForMonth(prevYearMonth);
  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const prevTotalSpent = prevReceipts.reduce((sum, r) => sum + r.total, 0);
  const diffFromPrev = totalSpent - prevTotalSpent;
  const budget = getBudgetForMonth(yearMonth);
  const budgetPercent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  // カテゴリ別集計
  const majorTotals: Record<string, number> = {};
  receipts.forEach(r => r.items.forEach((item: Item) => {
    const cat = item.majorCategory || "娯楽・その他";
    majorTotals[cat] = (majorTotals[cat] || 0) + (item.price * (item.quantity || 1));
  }));
  const sortedMajors = Object.entries(majorTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedMajors[0]?.[0] ?? "—";

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
    <div className="min-h-dvh bg-[#FAF7F8] w-full max-w-md mx-auto pb-28">
      <div className="theme-grad px-5 pt-4 pb-5 text-white">
        <div className="flex items-center justify-between">
          <div className="text-[10px] opacity-80 tracking-[0.2em] font-medium">MY KAKEIBO</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))} className="text-white/90 text-xl px-2 active:scale-90 transition-transform">&#8249;</button>
            <div className="font-bold text-sm tabular-nums">{currentMonth.format("YYYY年M月")}</div>
            <button onClick={() => setCurrentMonth(currentMonth.add(1, "month"))} className="text-white/90 text-xl px-2 active:scale-90 transition-transform">&#8250;</button>
          </div>
        </div>
        <div className="mt-2 text-xl font-bold">分析</div>
      </div>

      <div className="px-5 pt-4">
        {receipts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-3xl mb-3">📊</div>
            <div className="text-sm">この月の記録はありません</div>
          </div>
        ) : (
          <>
            {/* サマリーカード */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="text-[11px] text-gray-500 font-medium mb-1">今月の支出</div>
                <div className="text-lg font-bold text-gray-900 tabular-nums">{formatYen(totalSpent)}</div>
              </div>
              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="text-[11px] text-gray-500 font-medium mb-1">先月との差</div>
                <div className={`text-lg font-bold tabular-nums ${diffFromPrev > 0 ? "text-[#F65F8B]" : diffFromPrev < 0 ? "theme-text" : "text-gray-900"}`}>
                  {diffFromPrev > 0 ? "+" : ""}{formatYen(diffFromPrev)}
                </div>
              </div>
              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="text-[11px] text-gray-500 font-medium mb-1">最多カテゴリ</div>
                <div className="text-base font-bold text-gray-900 truncate">
                  {MAJOR_EMOJI[topCategory] ?? "📦"} {topCategory}
                </div>
              </div>
              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="text-[11px] text-gray-500 font-medium mb-1">予算達成率</div>
                <div className={`text-lg font-bold tabular-nums ${budgetPercent >= 100 ? "text-[#F65F8B]" : "text-gray-900"}`}>
                  {budgetPercent}%
                </div>
              </div>
            </div>

            {/* カテゴリ別グラフ */}
            <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
              <div className="font-bold text-gray-900 mb-4">カテゴリ別支出</div>
              {sortedMajors.map(([cat, amt]) => {
                const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
                return (
                  <div key={cat} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm text-gray-800">{MAJOR_EMOJI[cat] || "📦"} {cat}</span>
                      <span className="text-xs text-gray-500 tabular-nums">
                        <span className="font-bold text-gray-900 mr-2">{formatYen(amt)}</span>{pct}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: MAJOR_COLOR[cat] || "#9CA3AF" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 買いすぎアラート */}
            {alerts.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
                <div className="font-bold text-gray-900 mb-3">⚠️ 買いすぎアラート</div>
                {alerts.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-800">{name}</span>
                    <span className="text-sm font-bold text-[#F65F8B]">今月{count}回</span>
                  </div>
                ))}
              </div>
            )}

            {/* 店頻度ランキング */}
            <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
              <div className="font-bold text-gray-900 mb-3">🏪 よく行くお店</div>
              {storeCountRank.map(([store, count], i) => (
                <div key={store} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-base font-bold theme-text w-5">{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-800 truncate">{store}</span>
                  <span className="text-sm font-bold text-gray-700 tabular-nums">{count}回</span>
                </div>
              ))}
            </div>

            {/* 店金額ランキング */}
            <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
              <div className="font-bold text-gray-900 mb-3">💰 支出が多いお店</div>
              {storeAmountRank.map(([store, amt], i) => (
                <div key={store} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-base font-bold theme-text w-5">{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-800 truncate">{store}</span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums">{formatYen(amt)}</span>
                </div>
              ))}
            </div>

            {/* 商品ランキング */}
            <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
              <div className="font-bold text-gray-900 mb-3">🛍️ よく買う商品</div>
              {itemRank.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-base font-bold theme-text w-5">{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-800 truncate">{name}</span>
                  <span className="text-sm font-bold text-gray-700 tabular-nums">{count}回</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
