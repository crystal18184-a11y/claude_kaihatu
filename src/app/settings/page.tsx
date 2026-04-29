"use client";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { AlertTriangle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useThemeStore, THEMES, THEME_KEYS } from "@/store/themeStore";
import { formatYen } from "@/lib/format";
import { CategoryIcon } from "@/lib/categoryIcon";
import type { MajorCategory } from "@/types";

const EMOJI: Record<string, string> = {"肉類":"🥩","魚介類":"🐟","卵":"🥚","乳製品":"🥛","野菜":"🥦","果物":"🍎","きのこ":"🍄","海藻・乾物":"🌿","豆腐・大豆製品":"🫘","漬物・発酵食品":"🥒","パン":"🍞","米・穀物":"🍚","麺類":"🍜","調味料":"🧂","油・ドレッシング":"🫙","飲み物":"🧃","お菓子・スナック":"🍬","アイス・冷菓":"🍦","冷凍食品":"❄️","レトルト・缶詰":"🥫","日用品":"🧴","医療・薬":"💊","化粧品・美容":"💄","衣服・靴":"👟","バッグ・アクセサリー":"👜","家電":"🔌","スマホ・PC・ガジェット":"📱","子ども用品":"🧸","文具・おもちゃ":"✏️","習い事・教育費":"📚","食事・テイクアウト（外食）":"🍱","食事（外食）":"🍽️","ドリンク（外食）":"🥤","アルコール（外食）":"🍺","デザート（外食）":"🍰","飲み会・居酒屋":"🍻","交通・外出":"🚃","趣味・娯楽":"🎮","サブスク・定額サービス":"📺","家賃・住宅費":"🏠","水道・光熱費":"💡","通信費":"📶","保険料":"🛡️","その他固定費":"💳","その他":"📦"};
const MAJOR_MAP: Record<string, string> = {"肉類":"食費","魚介類":"食費","卵":"食費","乳製品":"食費","野菜":"食費","果物":"食費","きのこ":"食費","海藻・乾物":"食費","豆腐・大豆製品":"食費","漬物・発酵食品":"食費","パン":"食費","米・穀物":"食費","麺類":"食費","調味料":"食費","油・ドレッシング":"食費","飲み物":"食費","お菓子・スナック":"食費","アイス・冷菓":"食費","冷凍食品":"食費","レトルト・缶詰":"食費","日用品":"日用品・生活","医療・薬":"日用品・生活","化粧品・美容":"日用品・生活","衣服・靴":"ファッション","バッグ・アクセサリー":"ファッション","家電":"電化製品・家電","スマホ・PC・ガジェット":"電化製品・家電","子ども用品":"子ども・教育","文具・おもちゃ":"子ども・教育","習い事・教育費":"子ども・教育","食事・テイクアウト（外食）":"外食・グルメ","食事（外食）":"外食・グルメ","ドリンク（外食）":"外食・グルメ","アルコール（外食）":"外食・グルメ","デザート（外食）":"外食・グルメ","飲み会・居酒屋":"外食・グルメ","交通・外出":"娯楽・その他","趣味・娯楽":"娯楽・その他","サブスク・定額サービス":"固定費・サブスク","家賃・住宅費":"固定費・サブスク","水道・光熱費":"固定費・サブスク","通信費":"固定費・サブスク","保険料":"固定費・サブスク","その他固定費":"固定費・サブスク","その他":"娯楽・その他"};
const ALL_CATS = Object.keys(EMOJI);
const STORE_TYPES = ["スーパー","コンビニ","ドラッグストア","カフェ","レストラン","ファッション","家電量販店","テーマパーク","サブスク","公共料金","その他"];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { getBudgetForMonth, setBudget, fixedCosts, addFixedCost, updateFixedCost, deleteFixedCost, applyFixedCostsForMonth } = useStore();
  const { theme: currentTheme, setTheme } = useThemeStore();

  const yearMonth = dayjs().format("YYYY-MM");
  const currentBudget = getBudgetForMonth(yearMonth);
  const [budgetInput, setBudgetInput] = useState(currentBudget);
  const [saved, setSaved] = useState(false);
  const [showAddFixed, setShowAddFixed] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
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
    <div className="min-h-dvh bg-[#FAF7F8] w-full max-w-md mx-auto pb-28">
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCategoryModal(false)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-md p-4 pb-8 max-h-96 overflow-y-auto">
            <div className="font-bold text-gray-800 mb-3 text-center">カテゴリを選択</div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CATS.map((cat) => {
                const active = newFixed.category === cat;
                return (
                  <button key={cat} onClick={() => { setNewFixed(prev => ({ ...prev, category: cat })); setCategoryModal(false); }}
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

      <div className="theme-grad px-5 pt-4 pb-5 text-white">
        <div className="text-[10px] opacity-80 tracking-[0.2em] font-medium">MY KAKEIBO</div>
        <div className="mt-2 text-xl font-bold">設定</div>
      </div>

      <div className="px-5 pt-5">
        {/* 予算設定 */}
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">予算設定</div>
        <div className="bg-white rounded-3xl p-5 shadow-sm mb-5">
          <div className="font-bold text-gray-900 mb-3">今月の予算</div>
          <div className="flex gap-2 mb-3">
            <input type="number" value={budgetInput} onChange={(e) => setBudgetInput(Number(e.target.value))}
              className="flex-1 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[var(--c-accent)]" />
            <span className="flex items-center text-sm text-gray-600">円</span>
          </div>
          <button onClick={handleSaveBudget}
            className="w-full py-3 theme-grad text-white rounded-2xl font-bold shadow-sm active:scale-[0.98] transition-transform">
            {saved ? "✓ 保存しました" : "保存する"}
          </button>
        </div>

        {/* 見た目 */}
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">見た目</div>
        <div className="bg-white rounded-3xl p-5 shadow-sm mb-5">
          <div className="font-bold text-gray-900 mb-4">テーマカラー</div>
          <div className="grid grid-cols-4 gap-3">
            {THEME_KEYS.map((key) => {
              const t = THEMES[key];
              const isActive = currentTheme === key;
              return (
                <button key={key} onClick={() => setTheme(key)}
                  className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
                  <div
                    className={`w-14 h-14 rounded-2xl shadow-sm relative ${isActive ? "ring-4 ring-offset-2 ring-gray-400 scale-105" : ""} transition-all`}
                    style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xl font-bold drop-shadow">✓</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? "text-gray-900" : "text-gray-500"}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 支出管理 */}
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">支出管理</div>
        <div className="bg-white rounded-3xl p-5 shadow-sm mb-5">
          <div className="flex justify-between items-center mb-3">
            <div className="font-bold text-gray-900">固定費・サブスク</div>
            <button onClick={handleApply}
              className="text-xs theme-bg-light theme-text border border-[var(--c-mid)] px-3 py-1.5 rounded-full font-bold">
              今月分を記録
            </button>
          </div>

          {fixedCosts?.length === 0 && (
            <div className="text-center text-gray-500 py-4 text-sm">固定費が登録されていません</div>
          )}

          {fixedCosts?.map((f) => (
            <div key={f.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 rounded-xl theme-bg-light flex items-center justify-center flex-shrink-0">
                <CategoryIcon name={f.category} className="w-4 h-4 theme-text" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-900 truncate">{f.name}</div>
                <div className="text-xs text-gray-500 tabular-nums">毎月{f.dayOfMonth}日 {formatYen(f.amount)}</div>
              </div>
              <button onClick={() => updateFixedCost(f.id, { enabled: !f.enabled })}
                className={`text-xs px-2 py-1 rounded-lg font-bold ${f.enabled ? "theme-bg-light theme-text" : "bg-gray-100 text-gray-400"}`}>
                {f.enabled ? "ON" : "OFF"}
              </button>
              <button onClick={() => { if (confirm("削除しますか？")) deleteFixedCost(f.id); }}
                className="text-xs text-red-400 bg-red-50 px-2 py-1 rounded-lg">削除</button>
            </div>
          ))}

          {showAddFixed ? (
            <div className="mt-4 p-4 bg-[#FAF7F8] rounded-2xl">
              <div className="mb-2">
                <label className="text-xs text-gray-700 font-semibold mb-1 block">サービス名</label>
                <input type="text" value={newFixed.name} onChange={(e) => setNewFixed(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例：Netflix、電気代"
                  className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[var(--c-accent)] bg-white" />
              </div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-700 font-semibold mb-1 block">金額</label>
                  <input type="number" value={newFixed.amount} onChange={(e) => setNewFixed(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[var(--c-accent)] bg-white" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-700 font-semibold mb-1 block">毎月何日</label>
                  <input type="number" min="1" max="31" value={newFixed.dayOfMonth} onChange={(e) => setNewFixed(prev => ({ ...prev, dayOfMonth: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[var(--c-accent)] bg-white" />
                </div>
              </div>
              <div className="mb-2">
                <label className="text-xs text-gray-700 font-semibold mb-1 block">カテゴリ</label>
                <button onClick={() => setCategoryModal(true)}
                  className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm text-left flex items-center gap-2 bg-white">
                  <CategoryIcon name={newFixed.category} className="w-4 h-4 text-gray-700" strokeWidth={1.8} />
                  <span className="text-gray-800">{newFixed.category}</span>
                </button>
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-700 font-semibold mb-1 block">種類</label>
                <select value={newFixed.storeType} onChange={(e) => setNewFixed(prev => ({ ...prev, storeType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[var(--c-accent)] bg-white">
                  {STORE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddFixed(false)} className="flex-1 py-2 bg-white rounded-2xl font-bold text-gray-600 text-sm">キャンセル</button>
                <button onClick={handleAddFixed} className="flex-1 py-2 theme-solid rounded-2xl font-bold text-white text-sm">追加</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddFixed(true)}
              className="w-full mt-3 py-3 border-2 border-dashed border-[var(--c-mid)] rounded-2xl theme-text font-bold text-sm">
              ＋ 固定費を追加
            </button>
          )}
        </div>

        {/* データ */}
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1 mt-8">データ</div>
        <div className="bg-white rounded-3xl p-5 shadow-sm mb-2">
          <div className="font-bold text-gray-900 mb-1">データ削除</div>
          <div className="text-xs text-gray-500 mb-3">記録したすべてのレシート・予算・固定費が削除されます。</div>
          <button onClick={() => setConfirmReset(true)}
            className="w-full py-3 bg-red-50 text-red-500 rounded-2xl font-bold border border-red-100 active:scale-[0.98] transition-transform">
            全データを削除する
          </button>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {confirmReset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmReset(false)} />
          <div className="relative z-10 bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={2.2} />
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg mb-2">本当にすべてのデータを削除しますか？</div>
              <div className="text-sm text-gray-600 mb-5">この操作は取り消せません。</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="flex-1 py-3 bg-gray-100 rounded-2xl font-bold text-gray-700">キャンセル</button>
              <button onClick={() => {
                localStorage.removeItem("kakeibo-storage");
                window.location.href = "/";
              }} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold">削除する</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
