"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Camera, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useNavStore } from "@/store/navStore";
import { formatYen, formatYenCompact } from "@/lib/format";
import { CategoryIcon } from "@/lib/categoryIcon";
import { buildHomeInsight, todayCommentary, weekCommentary, dayIntensity, type DayIntensity } from "@/lib/insights";
import type { Item, MajorCategory } from "@/types";

const EMOJI: Record<string, string> = {"肉類":"🥩","魚介類":"🐟","卵":"🥚","乳製品":"🥛","野菜":"🥦","果物":"🍎","きのこ":"🍄","海藻・乾物":"🌿","豆腐・大豆製品":"🫘","漬物・発酵食品":"🥒","パン":"🍞","米・穀物":"🍚","麺類":"🍜","調味料":"🧂","油・ドレッシング":"🫙","飲み物":"🧃","お菓子・スナック":"🍬","アイス・冷菓":"🍦","冷凍食品":"❄️","レトルト・缶詰":"🥫","日用品":"🧴","医療・薬":"💊","化粧品・美容":"💄","衣服・靴":"👟","バッグ・アクセサリー":"👜","家電":"🔌","スマホ・PC・ガジェット":"📱","子ども用品":"🧸","文具・おもちゃ":"✏️","習い事・教育費":"📚","食事・テイクアウト（外食）":"🍱","食事（外食）":"🍽️","ドリンク（外食）":"🥤","アルコール（外食）":"🍺","デザート（外食）":"🍰","飲み会・居酒屋":"🍻","交通・外出":"🚃","趣味・娯楽":"🎮","その他":"📦"};
const MAJOR_MAP: Record<string, string> = {"肉類":"食費","魚介類":"食費","卵":"食費","乳製品":"食費","野菜":"食費","果物":"食費","きのこ":"食費","海藻・乾物":"食費","豆腐・大豆製品":"食費","漬物・発酵食品":"食費","パン":"食費","米・穀物":"食費","麺類":"食費","調味料":"食費","油・ドレッシング":"食費","飲み物":"食費","お菓子・スナック":"食費","アイス・冷菓":"食費","冷凍食品":"食費","レトルト・缶詰":"食費","日用品":"日用品・生活","医療・薬":"日用品・生活","化粧品・美容":"日用品・生活","衣服・靴":"ファッション","バッグ・アクセサリー":"ファッション","家電":"電化製品・家電","スマホ・PC・ガジェット":"電化製品・家電","子ども用品":"子ども・教育","文具・おもちゃ":"子ども・教育","習い事・教育費":"子ども・教育","食事・テイクアウト（外食）":"外食・グルメ","食事（外食）":"外食・グルメ","ドリンク（外食）":"外食・グルメ","アルコール（外食）":"外食・グルメ","デザート（外食）":"外食・グルメ","飲み会・居酒屋":"外食・グルメ","交通・外出":"娯楽・その他","趣味・娯楽":"娯楽・その他","その他":"娯楽・その他"};
const ALL_CATS = Object.keys(EMOJI);

interface EditingItem {
  receiptId: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [editingReceipt, setEditingReceipt] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStore, setEditStore] = useState("");
  const [editTotal, setEditTotal] = useState(0);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [categoryModal, setCategoryModal] = useState<boolean>(false);

  const { getReceiptsForMonth, getReceiptsForDate, getBudgetForMonth, deleteReceipt, updateReceipt, updateItem } = useStore();
  const setDirection = useNavStore((s) => s.setDirection);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const yearMonth = currentMonth.format("YYYY-MM");
  const monthReceipts = getReceiptsForMonth(yearMonth);
  const budget = getBudgetForMonth(yearMonth);
  const totalSpent = monthReceipts.reduce((sum, r) => sum + r.total, 0);
  const remaining = Math.max(budget - totalSpent, 0);
  const budgetPercent = Math.min((totalSpent / budget) * 100, 100);
  const selectedReceipts = selectedDate ? getReceiptsForDate(selectedDate) : [];

  const startDay = currentMonth.startOf("month").day();
  const daysInMonth = currentMonth.endOf("month").date();
  const calendarDays = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const today = dayjs();
  const isCurrentMonth = currentMonth.isSame(today, "month");
  const todayStr = today.format("YYYY-MM-DD");
  const todayTotal = isCurrentMonth ? getReceiptsForDate(todayStr).reduce((s, r) => s + r.total, 0) : 0;
  const weekStart = today.startOf("week");
  const weekTotal = isCurrentMonth
    ? monthReceipts.filter((r) => dayjs(r.date).isAfter(weekStart.subtract(1, "day"))).reduce((s, r) => s + r.total, 0)
    : 0;
  const todayDate = today.date();
  const daysPassed = isCurrentMonth ? todayDate : daysInMonth;
  const daysLeft = isCurrentMonth ? Math.max(daysInMonth - todayDate + 1, 1) : daysInMonth;
  const dailyAllowance = Math.max(Math.floor(remaining / daysLeft), 0);
  const dailyAvg = daysPassed > 0 ? totalSpent / daysPassed : 0;

  const insight = buildHomeInsight({
    isCurrentMonth, totalSpent, budget, daysInMonth, todayDate, daysLeft, dailyAllowance,
    monthLabel: currentMonth.format("M月"),
  });
  const todayNote = isCurrentMonth ? todayCommentary(todayTotal) : "";
  const weekNote = isCurrentMonth ? weekCommentary({ weekTotal, totalSpent, daysPassed }) : "";

  const recentReceipts = [...monthReceipts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  const goToScan = () => { setDirection("forward"); router.push("/scan"); };

  const intensityClass = (intensity: DayIntensity, isSelected: boolean): string => {
    if (isSelected) return "";
    switch (intensity) {
      case "low":  return "bg-[var(--c-light)] theme-text";
      case "mid":  return "bg-[var(--c-mid)]/60 theme-text";
      case "high": return "bg-[#FEE7EE] text-[#F65F8B]";
      default:     return "";
    }
  };

  const getDayTotal = (day: number) => {
    const date = currentMonth.format(`YYYY-MM-${String(day).padStart(2, "0")}`);
    return getReceiptsForDate(date).reduce((sum, r) => sum + r.total, 0);
  };

  const toggleExpand = (id: string) => setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const startEditReceipt = (receipt: { id: string; date: string; store: string; total: number }) => {
    setEditingReceipt(receipt.id);
    setEditDate(receipt.date);
    setEditStore(receipt.store);
    setEditTotal(receipt.total);
  };

  const saveEditReceipt = () => {
    if (!editingReceipt) return;
    updateReceipt(editingReceipt, { date: editDate, store: editStore, total: editTotal });
    setEditingReceipt(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("このレシートを削除しますか？")) deleteReceipt(id);
  };

  const startEditItem = (receiptId: string, item: Item) => {
    setEditingItem({ receiptId, itemId: item.id, name: item.name, price: item.price, quantity: item.quantity || 1, category: item.category });
  };

  const saveEditItem = () => {
    if (!editingItem) return;
    updateItem(editingItem.receiptId, editingItem.itemId, {
      name: editingItem.name,
      price: editingItem.price,
      quantity: editingItem.quantity,
      category: editingItem.category,
      majorCategory: (MAJOR_MAP[editingItem.category] || "その他") as MajorCategory,
    });
    setEditingItem(null);
  };

  return (
    <div className="min-h-dvh bg-[#FAF7F8] w-full max-w-md mx-auto pb-32">
      {/* カテゴリモーダル */}
      {categoryModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCategoryModal(false)} />
          <div className="relative z-10 bg-white rounded-t-3xl w-full max-w-md p-4 pb-8 max-h-96 overflow-y-auto">
            <div className="font-bold text-gray-900 mb-3 text-center">カテゴリを選択</div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CATS.map((cat) => {
                const active = editingItem?.category === cat;
                return (
                  <button key={cat}
                    onClick={() => {
                      setEditingItem(prev => prev ? { ...prev, category: cat } : null);
                      setCategoryModal(false);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs text-left flex items-center gap-1.5 ${active ? "theme-solid text-white" : "bg-gray-50 text-gray-700"}`}>
                    <CategoryIcon name={cat} className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                    <span className="truncate">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 商品編集モーダル */}
      {editingItem && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingItem(null)} />
          <div
            className="absolute bottom-0 inset-x-0 mx-auto max-w-md bg-white rounded-t-3xl z-10"
            style={{ height: "min(500px, 85vh)" }}
          >
            <div className="absolute inset-0 overflow-y-auto px-4 pt-4" style={{ paddingBottom: "120px" }}>
              <div className="font-bold text-gray-800 mb-4 text-center">商品を編集</div>
              <div className="mb-3">
                <label className="text-xs text-gray-700 font-semibold mb-1 block">商品名</label>
                <input type="text" value={editingItem.name} onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[var(--c-accent)]" />
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-700 font-semibold mb-1 block">カテゴリ</label>
                <button onClick={() => setCategoryModal(true)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-left flex items-center gap-2 text-gray-800">
                  <CategoryIcon name={editingItem.category} className="w-4 h-4 text-gray-700" strokeWidth={1.8} />
                  <span>{editingItem.category}</span>
                </button>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-700 font-semibold mb-1 block">単価</label>
                  <input type="number" value={editingItem.price} onChange={(e) => setEditingItem(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[var(--c-accent)]" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-700 font-semibold mb-1 block">個数</label>
                  <input type="number" value={editingItem.quantity} onChange={(e) => setEditingItem(prev => prev ? { ...prev, quantity: Number(e.target.value) } : null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[var(--c-accent)]" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-white rounded-b-3xl border-t border-gray-100 px-4 pt-3 pb-6">
              <div className="flex gap-2">
                <button onClick={() => setEditingItem(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">キャンセル</button>
                <button onClick={saveEditItem} className="flex-1 py-3 theme-solid rounded-xl font-bold text-white">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="theme-grad px-5 pt-4 pb-5 text-white">
        <div className="flex items-center justify-between">
          <div className="text-[10px] opacity-80 tracking-[0.2em] font-medium">MY KAKEIBO</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))} className="text-white/90 text-xl px-2 active:scale-90 transition-transform">&#8249;</button>
            <div className="font-bold text-sm tabular-nums">{currentMonth.format("YYYY年M月")}</div>
            <button onClick={() => setCurrentMonth(currentMonth.add(1, "month"))} className="text-white/90 text-xl px-2 active:scale-90 transition-transform">&#8250;</button>
          </div>
        </div>
        <div className="mt-2.5">
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <span className="text-[11px] opacity-85">今月の支出</span>
              <span className="ml-2 text-xl font-bold tabular-nums">{formatYen(totalSpent)}</span>
            </div>
            <span className="text-[11px] opacity-80 tabular-nums">予算 {formatYen(budget)}</span>
          </div>
          <div className="h-1.5 bg-white/25 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${budgetPercent}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px]">
            <span className="opacity-90">残り <span className="font-bold tabular-nums">{formatYen(remaining)}</span></span>
            <span className="opacity-90">1日あたり <span className="font-bold tabular-nums">{formatYen(dailyAllowance)}</span></span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* 一言診断 */}
        {insight && (
          <div className="text-[12px] text-gray-700 mb-3 px-1">{insight}</div>
        )}

        {/* Today / Week stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-3xl p-4 shadow-card">
            <div className="text-[11px] text-gray-500 font-medium mb-1">今日の支出</div>
            <div className="text-lg font-bold text-gray-900 tabular-nums">{formatYen(todayTotal)}</div>
            {todayNote && <div className="text-[10px] text-gray-500 mt-1">{todayNote}</div>}
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-card">
            <div className="text-[11px] text-gray-500 font-medium mb-1">今週の支出</div>
            <div className="text-lg font-bold text-gray-900 tabular-nums">{formatYen(weekTotal)}</div>
            {weekNote && <div className="text-[10px] text-gray-500 mt-1">{weekNote}</div>}
          </div>
        </div>

        {/* Receipt CTA */}
        <button onClick={goToScan}
          className="w-full bg-white rounded-3xl p-4 shadow-card mb-4 flex items-center gap-4 active:scale-[0.99] transition-transform text-left">
          <div className="w-12 h-12 theme-grad rounded-2xl flex items-center justify-center flex-shrink-0">
            <Camera className="w-6 h-6 text-white" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 text-sm">レシートを撮るだけで自動登録</div>
            <div className="text-[11px] text-gray-500 mt-0.5">店名・日付・金額・カテゴリを自動入力</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </button>

        {/* Calendar */}
        <div className="bg-white rounded-3xl p-4 shadow-card">
          <div className="grid grid-cols-7 mb-2">
            {["日","月","火","水","木","金","土"].map((d) => (<div key={d} className="text-center text-[11px] text-gray-500 font-bold">{d}</div>))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (!day) return <div key={i} />;
              const date = currentMonth.format(`YYYY-MM-${String(day).padStart(2, "0")}`);
              const dayTotal = getDayTotal(day);
              const isSelected = selectedDate === date;
              const isToday = date === dayjs().format("YYYY-MM-DD");
              const intensity = dayIntensity(dayTotal, dailyAvg);
              const hasReceipt = dayTotal > 0;
              const heatClass = intensityClass(intensity, isSelected);
              return (
                <button key={i} onClick={() => setSelectedDate(isSelected ? null : date)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs text-gray-700 transition-all ${isSelected ? "theme-solid text-white" : heatClass} ${isToday && !isSelected ? "ring-2 ring-[var(--c-accent)] font-bold" : ""}`}>
                  <span className={hasReceipt ? "font-bold" : ""}>{day}</span>
                  {hasReceipt && <span className={`text-[9px] tabular-nums leading-none ${isSelected ? "text-white" : ""}`}>{formatYenCompact(dayTotal)}</span>}
                </button>
              );
            })}
          </div>
          {/* heatmap legend */}
          <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
            <span>少</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded bg-[var(--c-light)]" />
              <div className="w-3 h-3 rounded bg-[var(--c-mid)]/60" />
              <div className="w-3 h-3 rounded bg-[#FEE7EE]" />
            </div>
            <span>多</span>
          </div>
        </div>

        {selectedDate && (
          <div className="mt-4">
            <div className="font-bold text-gray-800 mb-2">{dayjs(selectedDate).format("M月D日")}の買い物</div>
            {selectedReceipts.length === 0 ? (
              <div className="text-center text-gray-400 py-8">この日の記録はありません</div>
            ) : (
              selectedReceipts.map((receipt) => (
                <div key={receipt.id} className="bg-white rounded-2xl mb-3 overflow-hidden shadow-sm">
                  {editingReceipt === receipt.id ? (
                    <div className="p-4">
                      <div className="mb-3">
                        <label className="text-xs text-gray-700 font-semibold mb-1 block">日付</label>
                        <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[var(--c-accent)]" />
                      </div>
                      <div className="mb-3">
                        <label className="text-xs text-gray-700 font-semibold mb-1 block">店名</label>
                        <input type="text" value={editStore} onChange={(e) => setEditStore(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[var(--c-accent)]" />
                      </div>
                      <div className="mb-4">
                        <label className="text-xs text-gray-700 font-semibold mb-1 block">合計金額</label>
                        <input type="number" value={editTotal} onChange={(e) => setEditTotal(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[var(--c-accent)]" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingReceipt(null)} className="flex-1 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-600">キャンセル</button>
                        <button onClick={saveEditReceipt} className="flex-1 py-2 theme-solid rounded-xl text-sm font-bold text-white">保存</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center p-4 border-b border-gray-50">
                        <div>
                          <div className="font-bold text-sm text-gray-900">{receipt.store}</div>
                          <div className="text-xs text-gray-500">{receipt.storeType}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-gray-900 text-base tabular-nums">{formatYen(receipt.total)}</div>
                          <button onClick={() => startEditReceipt(receipt)} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">編集</button>
                          <button onClick={() => handleDelete(receipt.id)} className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg">削除</button>
                        </div>
                      </div>
                      <div className="p-3">
                        {(expandedIds.includes(receipt.id) ? receipt.items : receipt.items.slice(0, 3)).map((item: Item, i: number) => (
                          <button key={i} onClick={() => startEditItem(receipt.id, item)}
                            className="w-full flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0 text-left">
                            <CategoryIcon name={item.category} className="w-4 h-4 text-gray-600 flex-shrink-0" strokeWidth={1.8} />
                            <span className="flex-1 text-xs text-gray-800 truncate">
                              {item.name}
                              {(item.quantity || 1) > 1 && <span className="theme-text font-bold ml-1">×{item.quantity}</span>}
                            </span>
                            {item.wasteTags?.length > 0 && <span className="text-[10px] bg-[#FEE7EE] text-[#F65F8B] px-2 py-0.5 rounded-full">{item.wasteTags[0]}</span>}
                            <span className="text-xs font-bold text-gray-900 tabular-nums">{formatYen((item.price || 0) * (item.quantity || 1))}</span>
                          </button>
                        ))}
                        {receipt.items.length > 3 && (
                          <button onClick={() => toggleExpand(receipt.id)} className="w-full text-xs text-center theme-text mt-2 py-1 font-medium">
                            {expandedIds.includes(receipt.id) ? "閉じる" : `他${receipt.items.length - 3}件を見る`}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {!selectedDate && recentReceipts.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="font-bold text-gray-900 text-sm">最近の記録</div>
              <span className="text-[11px] text-gray-500">{monthReceipts.length}件</span>
            </div>
            {recentReceipts.map((receipt) => (
              <button key={receipt.id} onClick={() => setSelectedDate(receipt.date)}
                className="w-full bg-white rounded-2xl px-4 py-3 mb-2 shadow-sm flex items-center justify-between text-left active:scale-[0.99] transition-transform">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-gray-900 truncate">{receipt.store}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{dayjs(receipt.date).format("M/D")} ／ {receipt.storeType}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="font-bold text-gray-900 tabular-nums">{formatYen(receipt.total)}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}

        {monthReceipts.length === 0 && !selectedDate && (
          <div className="text-center text-gray-500 py-10 mt-2">
            <div className="text-3xl mb-3">📸</div>
            <div className="text-sm">レシートを撮影して記録を始めましょう</div>
          </div>
        )}
      </div>

    </div>
  );
}
