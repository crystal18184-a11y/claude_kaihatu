"use client";
import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { Search, ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { formatYen } from "@/lib/format";
import { CategoryIcon, MajorCategoryIcon, getMajorColor } from "@/lib/categoryIcon";
import type { Item, MajorCategory } from "@/types";

type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
const MAJOR_CATEGORIES: MajorCategory[] = ["食費","日用品・生活","ファッション","電化製品・家電","子ども・教育","外食・グルメ","娯楽・その他","固定費・サブスク"];

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

function dominantMajor(items: Item[]): MajorCategory {
  if (items.length === 0) return "娯楽・その他";
  const counts = new Map<MajorCategory, number>();
  for (const it of items) {
    const m = (it.majorCategory ?? "娯楽・その他") as MajorCategory;
    counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  let best: MajorCategory = "娯楽・その他";
  let max = 0;
  for (const [k, v] of counts.entries()) {
    if (v > max) { max = v; best = k; }
  }
  return best;
}

export default function HistoryPage() {
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [categoryModal, setCategoryModal] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [filterMajor, setFilterMajor] = useState<MajorCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const { getReceiptsForMonth, updateItem, deleteReceipt } = useStore();

  useEffect(() => { setMounted(true); }, []);

  const yearMonth = currentMonth.format("YYYY-MM");
  const allReceipts = getReceiptsForMonth(yearMonth);

  const visibleReceipts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allReceipts
      .filter((r) => {
        if (q && !r.store.toLowerCase().includes(q)) return false;
        if (filterMajor !== "all") {
          const major = dominantMajor(r.items as Item[]);
          if (major !== filterMajor) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case "date_asc": return a.date.localeCompare(b.date);
          case "amount_desc": return b.total - a.total;
          case "amount_asc": return a.total - b.total;
          case "date_desc":
          default: return b.date.localeCompare(a.date);
        }
      });
  }, [allReceipts, search, filterMajor, sort]);

  const totalSpent = allReceipts.reduce((sum, r) => sum + r.total, 0);

  if (!mounted) return null;

  const saveEditItem = () => {
    if (!editingItem) return;
    updateItem(editingItem.receiptId, editingItem.itemId, {
      name: editingItem.name,
      price: editingItem.price,
      quantity: editingItem.quantity,
      category: editingItem.category,
      majorCategory: MAJOR_MAP[editingItem.category] || "その他",
    });
    setEditingItem(null);
  };

  return (
    <div className="min-h-dvh bg-[#FAF7F8] w-full max-w-md mx-auto pb-28">
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
                    onClick={() => { setEditingItem(prev => prev ? { ...prev, category: cat } : null); setCategoryModal(false); }}
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
        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-xl font-bold tabular-nums">買い物履歴</div>
          <div className="text-[11px] opacity-90">{allReceipts.length}件 / 合計 <span className="font-bold tabular-nums">{formatYen(totalSpent)}</span></div>
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* Search + Filter + Sort */}
        <div className="bg-white rounded-3xl p-3 shadow-sm mb-4">
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="店名で検索"
              className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-2xl text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-200"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterMajor} onChange={(e) => setFilterMajor(e.target.value as MajorCategory | "all")}
              className="flex-1 px-3 py-2 bg-gray-50 rounded-2xl text-xs text-gray-800 focus:outline-none border-0">
              <option value="all">すべてのカテゴリ</option>
              {MAJOR_CATEGORIES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
              className="flex-1 px-3 py-2 bg-gray-50 rounded-2xl text-xs text-gray-800 focus:outline-none border-0">
              <option value="date_desc">新しい順</option>
              <option value="date_asc">古い順</option>
              <option value="amount_desc">金額が高い順</option>
              <option value="amount_asc">金額が低い順</option>
            </select>
          </div>
        </div>

        {/* Receipt list */}
        {allReceipts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-3xl mb-3">📋</div>
            <div className="text-sm">この月の記録はありません</div>
          </div>
        ) : visibleReceipts.length === 0 ? (
          <div className="text-center text-gray-500 py-10 text-sm">条件に一致する記録がありません</div>
        ) : (
          visibleReceipts.map((receipt) => {
            const major = dominantMajor(receipt.items as Item[]);
            const isExpanded = expandedId === receipt.id;
            return (
              <div key={receipt.id} className="bg-white rounded-2xl mb-2 overflow-hidden shadow-card relative">
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: getMajorColor(major) }} />
                <button onClick={() => setExpandedId(isExpanded ? null : receipt.id)}
                  className="w-full flex justify-between items-center px-4 py-3 pl-5 active:bg-gray-50 transition-colors">
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-bold text-sm text-gray-900 truncate">{receipt.store}</div>
                    <div className="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1.5">
                      <span className="tabular-nums">{dayjs(receipt.date).format("M/D")}</span>
                      <span className="text-gray-300">／</span>
                      <MajorCategoryIcon name={major} className="w-3 h-3" strokeWidth={2} />
                      <span>{major}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-gray-900 tabular-nums">{formatYen(receipt.total)}</span>
                    {isExpanded
                      ? <ChevronDown className="w-4 h-4 text-gray-400" />
                      : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 pl-5 border-t border-gray-50">
                    {receipt.items.map((item: Item, i: number) => (
                      <button key={i} onClick={() => setEditingItem({ receiptId: receipt.id, itemId: item.id, name: item.name, price: item.price, quantity: item.quantity || 1, category: item.category })}
                        className="w-full flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 text-left">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <CategoryIcon name={item.category} className="w-4 h-4 text-gray-700" strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">
                            {item.name}
                            {(item.quantity || 1) > 1 && <span className="theme-text font-bold ml-1">×{item.quantity}</span>}
                          </div>
                          <div className="text-[11px] text-gray-600">{item.category}</div>
                        </div>
                        {item.wasteTags?.length > 0 && (
                          <span className="text-[10px] bg-[#FEE7EE] text-[#F65F8B] px-2 py-0.5 rounded-full">{item.wasteTags[0]}</span>
                        )}
                        <span className="text-sm font-bold text-gray-900 tabular-nums">{formatYen((item.price || 0) * (item.quantity || 1))}</span>
                      </button>
                    ))}
                    <button onClick={() => { if (confirm("このレシートを削除しますか？")) { deleteReceipt(receipt.id); setExpandedId(null); } }}
                      className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> このレシートを削除
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
