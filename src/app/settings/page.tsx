"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useStore } from "@/store/useStore";
import type { MajorCategory } from "@/types";

const EMOJI: Record<string, string> = {"肉類":"🥩","魚介類":"🐟","卵":"🥚","乳製品":"🥛","野菜":"🥦","果物":"🍎","きのこ":"🍄","海藻・乾物":"🌿","豆腐・大豆製品":"🫘","漬物・発酵食品":"🥒","パン":"🍞","米・麺類":"🍚","調味料・油":"🧂","飲み物":"🧃","お菓子・スナック":"🍬","アイス・冷菓":"🍦","冷凍食品":"❄️","レトルト・缶詰":"🥫","日用品":"🧴","医療・薬":"💊","化粧品・美容":"💄","衣服・靴":"👟","バッグ・アクセサリー":"👜","家電":"🔌","スマホ・PC・ガジェット":"📱","子ども用品":"🧸","文具・おもちゃ":"✏️","習い事・教育費":"📚","外食・テイクアウト":"🍱","外食・ドリンク":"🥤","外食・デザート":"🍰","レジャー・観光フード":"🎡","交通・外出":"🚃","趣味・娯楽":"🎮","サブスク・定額サービス":"📺","家賃・住宅費":"🏠","水道・光熱費":"💡","通信費":"📶","保険料":"🛡️","その他固定費":"💳","その他":"📦"};
const MAJOR_MAP: Record<string, string> = {"肉類":"食費","魚介類":"食費","卵":"食費","乳製品":"食費","野菜":"食費","果物":"食費","きのこ":"食費","海藻・乾物":"食費","豆腐・大豆製品":"食費","漬物・発酵食品":"食費","パン":"食費","米・麺類":"食費","調味料・油":"食費","飲み物":"食費","お菓子・スナック":"食費","アイス・冷菓":"食費","冷凍食品":"食費","レトルト・缶詰":"食費","日用品":"日用品・生活","医療・薬":"日用品・生活","化粧品・美容":"日用品・生活","衣服・靴":"ファッション","バッグ・アクセサリー":"ファッション","家電":"電化製品・家電","スマホ・PC・ガジェット":"電化製品・家電","子ども用品":"子ども・教育","文具・おもちゃ":"子ども・教育","習い事・教育費":"子ども・教育","外食・テイクアウト":"娯楽・その他","外食・ドリンク":"娯楽・その他","外食・デザート":"娯楽・その他","レジャー・観光フード":"娯楽・その他","交通・外出":"娯楽・その他","趣味・娯楽":"娯楽・その他","サブスク・定額サービス":"固定費・サブスク","家賃・住宅費":"固定費・サブスク","水道・光熱費":"固定費・サブスク","通信費":"固定費・サブスク","保険料":"固定費・サブスク","その他固定費":"固定費・サブスク","その他":"娯楽・その他"};
const ALL_CATS = Object.keys(EMOJI);
const STORE_TYPES = ["スーパー","コンビニ","ドラッグストア","カフェ","レストラン","ファッション","家電量販店","テーマパーク","サブスク","公共料金","その他"];

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { getBudgetForMonth, setBudget, fixedCosts, addFixedCost, updateFixedCost, deleteFixedCost, applyFixedCostsForMonth } = useStore();

  const yearMonth = dayjs().format("YYYY-MM");
  const currentBudget = getBudgetForMonth(yearMonth);
  const [budgetInput, setBudgetInput] = useState(currentBudget);
  const [saved, setSaved] = useState(false);
  const [showAddFixed, setShowAddFixed] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [newFixed, setNewFixed] = useState({ name: "", amount: 0, dayOfMonth: 1, category: "サブスク・定額サービス", storeType: "サブスク", enabled: true });

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleSaveBudget = () => {
    setBudget({ yearMonth, amount: Number(budgetInput) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddFixed = () => {
    if (!newFixed.name) { alert("名前を入力してください"); return; }
    addFixedCost({
      id: crypto.randomUUID(),
      ...newFixed,
      majorCategory: (MAJOR_MAP[newFixed.category] || "固定費・サブスク") as MajorCategory,
    });
    setNewFixed({ name: "", amount: 0, dayOfMonth: 1, category: "サブスク・定額サービス", storeType: "サブスク", enabled: true });
    setShowAddFixed(false);
  };

  const handleApply = () => {
    const count = applyFixedCostsForMonth(yearMonth);
    if (count > 0) alert(`${count}件の固定費を今月分として記録しました！`);
    else alert("今月分はすでに記録済みです");
  };

  return (
    <div className="min-h-dvh bg-rose-50 w-full max-w-md mx-auto pb-28">
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCategoryModal(false)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-md p-4 pb-8 max-h-96 overflow-y-auto">
            <div className="font-bold text-gray-700 mb-3 text-center">カテゴリを選択</div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CATS.map((cat) => (
                <button key={cat} onClick={() => { setNewFixed(prev => ({ ...prev, category: cat })); setCategoryModal(false); }}
                  className={`py-2 px-1 rounded-xl text-xs text-left ${newFixed.category === cat ? "bg-rose-400 text-white" : "bg-gray-50 text-gray-700"}`}>
                  {EMOJI[cat]} {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-5 text-white">
        <div className="text-xs opacity-80 tracking-widest">MY KAKEIBO</div>
        <div className="text-2xl font-bold">設定</div>
      </div>

      <div className="p-4">
        {/* 予算設定 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="font-bold text-gray-700 mb-4">💰 今月の予算</div>
          <div className="flex gap-2 mb-3">
            <input type="number" value={budgetInput} onChange={(e) => setBudgetInput(Number(e.target.value))}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400" />
            <span className="flex items-center text-sm text-gray-600">円</span>
          </div>
          <button onClick={handleSaveBudget}
            className="w-full py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl font-bold shadow-sm">
            {saved ? "✅ 保存しました！" : "保存する"}
          </button>
        </div>

        {/* 固定費・サブスク */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-gray-700">💳 固定費・サブスク</div>
            <button onClick={handleApply}
              className="text-xs bg-rose-50 text-rose-400 border border-rose-200 px-3 py-1.5 rounded-full font-bold">
              今月分を記録
            </button>
          </div>

          {fixedCosts?.length === 0 && (
            <div className="text-center text-gray-400 py-4 text-sm">固定費が登録されていません</div>
          )}

          {fixedCosts?.map((f) => (
            <div key={f.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              <span className="text-2xl">{EMOJI[f.category] ?? "💳"}</span>
              <div className="flex-1">
                <div className="font-bold text-sm">{f.name}</div>
                <div className="text-xs text-gray-600">毎月{f.dayOfMonth}日 ¥{f.amount.toLocaleString()}</div>
              </div>
              <button onClick={() => updateFixedCost(f.id, { enabled: !f.enabled })}
                className={`text-xs px-2 py-1 rounded-lg font-bold ${f.enabled ? "bg-rose-100 text-rose-400" : "bg-gray-100 text-gray-400"}`}>
                {f.enabled ? "ON" : "OFF"}
              </button>
              <button onClick={() => { if (confirm("削除しますか？")) deleteFixedCost(f.id); }}
                className="text-xs text-red-400 bg-red-50 px-2 py-1 rounded-lg">削除</button>
            </div>
          ))}

          {showAddFixed ? (
            <div className="mt-4 p-3 bg-rose-50 rounded-xl">
              <div className="mb-2">
                <label className="text-xs text-gray-600 font-semibold mb-1 block">サービス名</label>
                <input type="text" value={newFixed.name} onChange={(e) => setNewFixed(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例：Netflix、電気代"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400 bg-white" />
              </div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-600 font-semibold mb-1 block">金額</label>
                  <input type="number" value={newFixed.amount} onChange={(e) => setNewFixed(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400 bg-white" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600 font-semibold mb-1 block">毎月何日</label>
                  <input type="number" min="1" max="31" value={newFixed.dayOfMonth} onChange={(e) => setNewFixed(prev => ({ ...prev, dayOfMonth: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400 bg-white" />
                </div>
              </div>
              <div className="mb-2">
                <label className="text-xs text-gray-600 font-semibold mb-1 block">カテゴリ</label>
                <button onClick={() => setCategoryModal(true)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-left flex items-center gap-2 bg-white">
                  <span>{EMOJI[newFixed.category] ?? "📦"}</span>
                  <span>{newFixed.category}</span>
                </button>
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-600 font-semibold mb-1 block">種類</label>
                <select value={newFixed.storeType} onChange={(e) => setNewFixed(prev => ({ ...prev, storeType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400 bg-white">
                  {STORE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddFixed(false)} className="flex-1 py-2 bg-white rounded-xl font-bold text-gray-600 text-sm">キャンセル</button>
                <button onClick={handleAddFixed} className="flex-1 py-2 bg-rose-400 rounded-xl font-bold text-white text-sm">追加</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddFixed(true)}
              className="w-full mt-3 py-3 border-2 border-dashed border-rose-200 rounded-xl text-rose-400 font-bold text-sm">
              ＋ 固定費を追加
            </button>
          )}
        </div>

        {/* データ管理 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="font-bold text-gray-700 mb-3">🗂️ データ管理</div>
          <button onClick={() => {
            if (confirm("全てのデータを削除しますか？この操作は取り消せません。")) {
              localStorage.removeItem("kakeibo-storage");
              window.location.href = "/";
            }
          }} className="w-full py-3 bg-red-50 text-red-400 rounded-xl font-bold border border-red-100">
            全データを削除する
          </button>
        </div>
      </div>

    </div>
  );
}
