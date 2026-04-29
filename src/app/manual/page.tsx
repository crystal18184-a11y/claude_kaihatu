"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useNavStore } from "@/store/navStore";
import { CategoryIcon } from "@/lib/categoryIcon";
import { formatYen } from "@/lib/format";
import type { Item, MajorCategory, Category } from "@/types";

const EMOJI: Record<string, string> = {"肉類":"🥩","魚介類":"🐟","卵":"🥚","乳製品":"🥛","野菜":"🥦","果物":"🍎","きのこ":"🍄","海藻・乾物":"🌿","豆腐・大豆製品":"🫘","漬物・発酵食品":"🥒","パン":"🍞","米・穀物":"🍚","麺類":"🍜","調味料":"🧂","油・ドレッシング":"🫙","飲み物":"🧃","お菓子・スナック":"🍬","アイス・冷菓":"🍦","冷凍食品":"❄️","レトルト・缶詰":"🥫","日用品":"🧴","医療・薬":"💊","化粧品・美容":"💄","衣服・靴":"👟","バッグ・アクセサリー":"👜","家電":"🔌","スマホ・PC・ガジェット":"📱","子ども用品":"🧸","文具・おもちゃ":"✏️","習い事・教育費":"📚","食事・テイクアウト（外食）":"🍱","食事（外食）":"🍽️","ドリンク（外食）":"🥤","アルコール（外食）":"🍺","デザート（外食）":"🍰","飲み会・居酒屋":"🍻","交通・外出":"🚃","趣味・娯楽":"🎮","サブスク・定額サービス":"📺","家賃・住宅費":"🏠","水道・光熱費":"💡","通信費":"📶","保険料":"🛡️","その他固定費":"💳","その他":"📦"};
const MAJOR_MAP: Record<string, string> = {"肉類":"食費","魚介類":"食費","卵":"食費","乳製品":"食費","野菜":"食費","果物":"食費","きのこ":"食費","海藻・乾物":"食費","豆腐・大豆製品":"食費","漬物・発酵食品":"食費","パン":"食費","米・穀物":"食費","麺類":"食費","調味料":"食費","油・ドレッシング":"食費","飲み物":"食費","お菓子・スナック":"食費","アイス・冷菓":"食費","冷凍食品":"食費","レトルト・缶詰":"食費","日用品":"日用品・生活","医療・薬":"日用品・生活","化粧品・美容":"日用品・生活","衣服・靴":"ファッション","バッグ・アクセサリー":"ファッション","家電":"電化製品・家電","スマホ・PC・ガジェット":"電化製品・家電","子ども用品":"子ども・教育","文具・おもちゃ":"子ども・教育","習い事・教育費":"子ども・教育","食事・テイクアウト（外食）":"外食・グルメ","食事（外食）":"外食・グルメ","ドリンク（外食）":"外食・グルメ","アルコール（外食）":"外食・グルメ","デザート（外食）":"外食・グルメ","飲み会・居酒屋":"外食・グルメ","交通・外出":"娯楽・その他","趣味・娯楽":"娯楽・その他","サブスク・定額サービス":"固定費・サブスク","家賃・住宅費":"固定費・サブスク","水道・光熱費":"固定費・サブスク","通信費":"固定費・サブスク","保険料":"固定費・サブスク","その他固定費":"固定費・サブスク","その他":"娯楽・その他"};
const ALL_CATS = Object.keys(EMOJI);
const STORE_TYPES = ["スーパー","コンビニ","ドラッグストア","カフェ","レストラン","ファッション","家電量販店","テーマパーク","サブスク","公共料金","その他"];

export default function ManualPage() {
  const router = useRouter();
  const { addReceipt } = useStore();
  const setDirection = useNavStore((s) => s.setDirection);
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [store, setStore] = useState("");
  const [storeType, setStoreType] = useState("その他");
  const [items, setItems] = useState<Item[]>([{ id: "1", name: "", price: 0, quantity: 1, category: "その他", majorCategory: "娯楽・その他", sub: "", wasteTags: [] }]);
  const [categoryModal, setCategoryModal] = useState<number | null>(null);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), name: "", price: 0, quantity: 1, category: "その他", majorCategory: "娯楽・その他", sub: "", wasteTags: [] }]);
  };

  const updateItem = (index: number, updates: Partial<Item>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates };
    if (updates.category) updated[index].majorCategory = (MAJOR_MAP[updates.category] || "娯楽・その他") as MajorCategory;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!store) { alert("店名を入力してください"); return; }
    if (items.some(i => !i.name)) { alert("商品名を入力してください"); return; }
    const receipt = {
      id: crypto.randomUUID(),
      date,
      store,
      storeType,
      total,
      items,
    };
    addReceipt(receipt);
    setDirection("backward");
    router.push("/");
  };

  return (
    <div className="min-h-dvh bg-[#FAF7F8] w-full max-w-md mx-auto pb-28">
      {categoryModal !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCategoryModal(null)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-md p-4 pb-8 max-h-96 overflow-y-auto">
            <div className="font-bold text-gray-700 mb-3 text-center">カテゴリを選択</div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CATS.map((cat) => {
                const active = items[categoryModal]?.category === cat;
                return (
                  <button key={cat}
                    onClick={() => { updateItem(categoryModal!, { category: cat as Category }); setCategoryModal(null); }}
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

      <div className="theme-grad p-5 text-white">
        <button onClick={() => { setDirection("backward"); router.back(); }} className="text-white text-sm mb-2 opacity-80">← 戻る</button>
        <div className="text-xl font-bold">手動で入力</div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="mb-3">
            <label className="text-xs text-gray-700 font-semibold mb-1 block">日付</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[var(--c-accent)]" />
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-700 font-semibold mb-1 block">店名・サービス名</label>
            <input type="text" value={store} onChange={(e) => setStore(e.target.value)} placeholder="例：Netflix、東京電力"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[var(--c-accent)]" />
          </div>
          <div>
            <label className="text-xs text-gray-700 font-semibold mb-1 block">店の種類</label>
            <select value={storeType} onChange={(e) => setStoreType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[var(--c-accent)]">
              {STORE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-gray-800 text-sm">商品・内容</div>
            <div className="text-sm font-bold text-gray-900 tabular-nums">合計 {formatYen(total)}</div>
          </div>

          {items.map((item, i) => (
            <div key={item.id} className="bg-white rounded-2xl p-3 shadow-card mb-2">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setCategoryModal(i)}
                  className="w-10 h-10 flex items-center justify-center theme-bg-light rounded-xl flex-shrink-0">
                  <CategoryIcon name={item.category} className="w-5 h-5 theme-text" strokeWidth={1.8} />
                </button>
                <input type="text" value={item.name} onChange={(e) => updateItem(i, { name: e.target.value })}
                  placeholder="商品名・内容"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[var(--c-accent)]" />
                {items.length > 1 && (
                  <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                    <X className="w-5 h-5" strokeWidth={2} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 ml-12">
                <div className="flex-1">
                  <label className="text-xs text-gray-700 font-medium mb-0.5 block">単価</label>
                  <input type="number" value={item.price} onChange={(e) => updateItem(i, { price: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[var(--c-accent)]" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-700 font-medium mb-0.5 block">個数</label>
                  <input type="number" value={item.quantity} onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[var(--c-accent)]" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-700 font-medium mb-0.5 block">小計</label>
                  <div className="px-3 py-1.5 text-sm font-bold text-gray-900 tabular-nums">
                    {formatYen(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-[var(--c-mid)] rounded-2xl theme-text font-bold text-sm">
            ＋ 商品を追加
          </button>
        </div>

        <button onClick={handleSave}
          className="w-full py-4 theme-grad text-white rounded-2xl font-bold text-lg shadow-lg">
          💾 記録する
        </button>
      </div>
    </div>
  );
}
