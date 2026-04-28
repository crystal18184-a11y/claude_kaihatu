"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useStore } from "@/store/useStore";
import type { Item } from "@/types";

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

export default function HistoryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [categoryModal, setCategoryModal] = useState<boolean>(false);
  const { getReceiptsForMonth, updateItem, deleteReceipt } = useStore();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const yearMonth = currentMonth.format("YYYY-MM");
  const receipts = getReceiptsForMonth(yearMonth);
  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);

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
    <div className="min-h-dvh bg-rose-50 w-full max-w-md mx-auto pb-28">
      {/* カテゴリモーダル */}
      {categoryModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCategoryModal(false)} />
          <div className="relative z-10 bg-white rounded-t-3xl w-full max-w-md p-4 pb-8 max-h-96 overflow-y-auto">
            <div className="font-bold text-gray-700 mb-3 text-center">カテゴリを選択</div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CATS.map((cat) => (
                <button key={cat}
                  onClick={() => { setEditingItem(prev => prev ? { ...prev, category: cat } : null); setCategoryModal(false); }}
                  className={`py-2 px-1 rounded-xl text-xs text-left ${editingItem?.category === cat ? "bg-rose-400 text-white" : "bg-gray-50 text-gray-700"}`}>
                  {EMOJI[cat]} {cat}
                </button>
              ))}
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
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-rose-400" />
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-700 font-semibold mb-1 block">カテゴリ</label>
                <button onClick={() => setCategoryModal(true)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-left flex items-center gap-2">
                  <span>{EMOJI[editingItem.category] ?? "📦"}</span>
                  <span>{editingItem.category}</span>
                </button>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-700 font-semibold mb-1 block">単価</label>
                  <input type="number" value={editingItem.price} onChange={(e) => setEditingItem(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-rose-400" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-700 font-semibold mb-1 block">個数</label>
                  <input type="number" value={editingItem.quantity} onChange={(e) => setEditingItem(prev => prev ? { ...prev, quantity: Number(e.target.value) } : null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-rose-400" />
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

      <div className="theme-grad p-5 text-white">
        <div className="text-xs opacity-80 tracking-widest">MY KAKEIBO</div>
        <div className="text-2xl font-bold">買い物履歴</div>
        <div className="flex items-center justify-between mt-3">
          <button onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))} className="text-white text-2xl px-2">&#8249;</button>
          <div className="font-bold text-lg">{currentMonth.format("YYYY年M月")}</div>
          <button onClick={() => setCurrentMonth(currentMonth.add(1, "month"))} className="text-white text-2xl px-2">&#8250;</button>
        </div>
        <div className="mt-3 bg-white/20 rounded-2xl p-3 flex justify-between items-center">
          <span className="text-sm opacity-80">{receipts.length}件の買い物</span>
          <span className="font-bold text-xl">¥{totalSpent.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-4">
        {receipts.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-3">📋</div>
            <div>この月の記録はありません</div>
          </div>
        ) : (
          [...receipts].sort((a, b) => b.date.localeCompare(a.date)).map((receipt) => (
            <div key={receipt.id} className="bg-white rounded-2xl mb-3 overflow-hidden shadow-sm">
              <button onClick={() => setExpandedId(expandedId === receipt.id ? null : receipt.id)}
                className="w-full flex justify-between items-center p-4">
                <div className="text-left">
                  <div className="font-bold text-sm text-gray-900">{receipt.store}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{dayjs(receipt.date).format("M月D日")} ／ {receipt.storeType}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-bold text-rose-400 text-lg">¥{receipt.total.toLocaleString()}</div>
                  <span className="text-gray-500">{expandedId === receipt.id ? "▲" : "▼"}</span>
                </div>
              </button>
              {expandedId === receipt.id && (
                <div className="px-3 pb-3">
                  {receipt.items.map((item: Item, i: number) => (
                    <button key={i} onClick={() => setEditingItem({ receiptId: receipt.id, itemId: item.id, name: item.name, price: item.price, quantity: item.quantity || 1, category: item.category })}
                      className="w-full flex items-center gap-2 py-2 border-t border-gray-50 text-left">
                      <span className="text-lg">{EMOJI[item.category] ?? "📦"}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800">
                          {item.name}
                          {(item.quantity || 1) > 1 && <span className="text-rose-400 font-bold ml-1">×{item.quantity}</span>}
                        </div>
                        <div className="text-xs text-gray-600">{item.category}</div>
                      </div>
                      {item.wasteTags?.length > 0 && (
                        <span className="text-xs bg-rose-100 text-rose-400 px-2 py-0.5 rounded-full">{item.wasteTags[0]}</span>
                      )}
                      <span className="text-sm font-bold text-gray-800">¥{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
