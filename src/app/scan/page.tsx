"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useNavStore } from "@/store/navStore";
import type { MajorCategory } from "@/types";

interface ScannedItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  majorCategory: string;
  category: string;
  sub?: string;
  wasteTags?: string[];
}

interface ScannedReceipt {
  date: string;
  store: string;
  storeType: string;
  total: number;
  items: ScannedItem[];
}

const EMOJI: Record<string, string> = {"肉類":"🥩","魚介類":"🐟","卵":"🥚","乳製品":"🥛","野菜":"🥦","果物":"🍎","きのこ":"🍄","海藻・乾物":"🌿","豆腐・大豆製品":"🫘","漬物・発酵食品":"🥒","パン":"🍞","米・麺類":"🍚","調味料・油":"🧂","飲み物":"🧃","お菓子・スナック":"🍬","アイス・冷菓":"🍦","冷凍食品":"❄️","レトルト・缶詰":"🥫","日用品":"🧴","医療・薬":"💊","化粧品・美容":"💄","衣服・靴":"👟","バッグ・アクセサリー":"👜","家電":"🔌","スマホ・PC・ガジェット":"📱","子ども用品":"🧸","文具・おもちゃ":"✏️","習い事・教育費":"📚","外食・テイクアウト":"🍱","外食・ドリンク":"🥤","外食・デザート":"🍰","レジャー・観光フード":"🎡","交通・外出":"🚃","趣味・娯楽":"🎮","サブスク・定額サービス":"📺","家賃・住宅費":"🏠","水道・光熱費":"💡","通信費":"📶","保険料":"🛡️","その他固定費":"💳","その他":"📦"};
const MAJOR_MAP: Record<string, string> = {"肉類":"食費","魚介類":"食費","卵":"食費","乳製品":"食費","野菜":"食費","果物":"食費","きのこ":"食費","海藻・乾物":"食費","豆腐・大豆製品":"食費","漬物・発酵食品":"食費","パン":"食費","米・麺類":"食費","調味料・油":"食費","飲み物":"食費","お菓子・スナック":"食費","アイス・冷菓":"食費","冷凍食品":"食費","レトルト・缶詰":"食費","日用品":"日用品・生活","医療・薬":"日用品・生活","化粧品・美容":"日用品・生活","衣服・靴":"ファッション","バッグ・アクセサリー":"ファッション","家電":"電化製品・家電","スマホ・PC・ガジェット":"電化製品・家電","子ども用品":"子ども・教育","文具・おもちゃ":"子ども・教育","習い事・教育費":"子ども・教育","外食・テイクアウト":"娯楽・その他","外食・ドリンク":"娯楽・その他","外食・デザート":"娯楽・その他","レジャー・観光フード":"娯楽・その他","交通・外出":"娯楽・その他","趣味・娯楽":"娯楽・その他","サブスク・定額サービス":"固定費・サブスク","家賃・住宅費":"固定費・サブスク","水道・光熱費":"固定費・サブスク","通信費":"固定費・サブスク","保険料":"固定費・サブスク","その他固定費":"固定費・サブスク","その他":"娯楽・その他"};
const ALL_CATS = Object.keys(EMOJI);

export default function ScanPage() {
  const router = useRouter();
  const { addReceipt, getSimilarStores } = useStore();
  const setDirection = useNavStore((s) => s.setDirection);
  const cameraRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState("select");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScannedReceipt | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStore, setEditStore] = useState("");
  const [editTotal, setEditTotal] = useState(0);
  const [editItems, setEditItems] = useState<ScannedItem[]>([]);
  const [similarStores, setSimilarStores] = useState<{ name: string; type: string }[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [categoryModal, setCategoryModal] = useState<number | null>(null);

  const fixOrientation = (file: File): Promise<string> => new Promise(async (resolve, reject) => {
    // EXIF の orientation だけ先頭 64KB から読む（画像全体を展開しない）
    let orientation = 1;
    try {
      const chunk = await file.slice(0, 65536).arrayBuffer();
      const bytes = new Uint8Array(chunk);
      const view = new DataView(bytes.buffer);
      if (view.getUint16(0, false) === 0xFFD8) {
        let offset = 2;
        while (offset < bytes.length - 2) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xFFE1) {
            if (view.getUint32(offset + 2, false) === 0x45786966) {
              const little = view.getUint16(offset + 8, false) === 0x4949;
              const tags = view.getUint16(offset + 14, little);
              for (let i = 0; i < tags; i++) {
                if (view.getUint16(offset + 16 + i * 12, little) === 0x0112) {
                  orientation = view.getUint16(offset + 16 + i * 12 + 8, little);
                  break;
                }
              }
            }
            break;
          }
          const segLen = view.getUint16(offset, false);
          if (segLen < 2) break;
          offset += segLen;
        }
      }
    } catch {
      // EXIF 解析失敗時は orientation 1 のまま続行
    }

    // Image の src に ObjectURL を使い、大きな base64 文字列をメモリに展開しない
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("画像の読み込みに失敗しました")); };
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(objectUrl); reject(new Error("Canvas 2D context unavailable")); return; }
        const MAX = 1200;
        let w = img.width, h = img.height;
        const ratio = Math.min(MAX / w, MAX / h, 1);
        w = Math.round(w * ratio); h = Math.round(h * ratio);
        if ([5,6,7,8].includes(orientation)) { canvas.width = h; canvas.height = w; }
        else { canvas.width = w; canvas.height = h; }
        ctx.save();
        switch(orientation) {
          case 2: ctx.transform(-1,0,0,1,canvas.width,0); break;
          case 3: ctx.transform(-1,0,0,-1,canvas.width,canvas.height); break;
          case 4: ctx.transform(1,0,0,-1,0,canvas.height); break;
          case 5: ctx.transform(0,1,1,0,0,0); break;
          case 6: ctx.transform(0,1,-1,0,canvas.height,0); break;
          case 7: ctx.transform(0,-1,-1,0,canvas.height,canvas.width); break;
          case 8: ctx.transform(0,-1,1,0,0,canvas.width); break;
        }
        ctx.drawImage(img, 0, 0, w, h);
        ctx.restore();
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch (e) {
        URL.revokeObjectURL(objectUrl);
        reject(e instanceof Error ? e : new Error("画像処理エラー"));
      }
    };
    img.src = objectUrl;
  });

  const handleFile = async (file: File) => {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setPhase("loading");
    setProgress(10);
    try {
      setProgress(30);
      const compressed = await fixOrientation(file);
      setProgress(50);
      const base64 = compressed.slice(compressed.indexOf(",") + 1);
      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: "image/jpeg" }),
      });
      setProgress(80);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setProgress(100);
      setResult(data.data);
      setEditDate(data.data.date ?? "");
      setEditStore(data.data.store ?? "");
      setEditTotal(data.data.total ?? 0);
      setEditItems((data.data.items ?? []).map((item: ScannedItem) => ({ ...item, quantity: item.quantity || 1 })));
      setSimilarStores(getSimilarStores(data.data.store ?? ""));
      setPhase("confirm");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "エラー");
      setPhase("error");
    }
  };

  const handleSave = () => {
    if (!result) return;
    try {
      const receipt = {
        ...result,
        id: crypto.randomUUID(),
        date: editDate,
        store: editStore,
        total: editTotal,
        items: editItems.map((item) => ({ ...item, id: item.id || crypto.randomUUID(), wasteTags: item.wasteTags ?? [] })),
      };
      addReceipt(receipt);
      setDirection("backward");
      router.push("/");
    } catch (e) { alert("エラー: " + (e instanceof Error ? e.message : String(e))); }
  };

  const reset = () => {
    setPhase("select"); setProgress(0); setPreviewUrl(null);
    setResult(null); setErrorMsg(""); setEditingItemIndex(null); setCategoryModal(null);
  };

  const updateItem = (index: number, updates: Partial<ScannedItem>) => {
    const updated = [...editItems];
    updated[index] = { ...updated[index], ...updates };
    if (updates.category) updated[index].majorCategory = (MAJOR_MAP[updates.category] || "娯楽・その他") as MajorCategory;
    setEditItems(updated);
  };

  return (
    <div className="min-h-dvh bg-rose-50 w-full max-w-md mx-auto pb-28">
      {categoryModal !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCategoryModal(null)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-md p-4 pb-8 max-h-96 overflow-y-auto">
            <div className="font-bold text-gray-700 mb-3 text-center">カテゴリを選択</div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CATS.map((cat) => (
                <button key={cat}
                  onClick={() => { updateItem(categoryModal, { category: cat }); setCategoryModal(null); }}
                  className={`py-2 px-1 rounded-xl text-xs text-left ${editItems[categoryModal]?.category === cat ? "bg-rose-400 text-white" : "bg-gray-50 text-gray-700"}`}>
                  {EMOJI[cat]} {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-5 text-white">
        <button onClick={() => { setDirection("backward"); router.push("/"); }} className="text-white text-sm mb-2 opacity-80">← 戻る</button>
        <div className="text-xl font-bold">レシートを追加</div>
      </div>

      <div className="p-4">
        {/* 3択選択画面 */}
        {phase === "select" && (
          <div className="flex flex-col gap-3">
            <button onClick={() => cameraRef.current?.click()}
              className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4 text-left">
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">📸</div>
              <div>
                <div className="font-bold text-gray-700">カメラで撮影</div>
                <div className="text-xs text-gray-500 mt-1">今すぐレシートを撮影してAIが読み取ります</div>
              </div>
            </button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />

            <button onClick={() => photoRef.current?.click()}
              className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4 text-left">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">🖼️</div>
              <div>
                <div className="font-bold text-gray-700">写真から選ぶ</div>
                <div className="text-xs text-gray-500 mt-1">フォトライブラリからレシートの写真を選択します</div>
              </div>
            </button>
            <input ref={photoRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />

            <button onClick={() => router.push("/manual")}
              className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4 text-left">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">✏️</div>
              <div>
                <div className="font-bold text-gray-700">手動で入力</div>
                <div className="text-xs text-gray-500 mt-1">サブスク・固定費など手動で記録します</div>
              </div>
            </button>
          </div>
        )}

        {phase === "loading" && previewUrl && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="relative">
              <img src={previewUrl} alt="receipt" className="w-full max-h-64 object-cover" />
              <div className="absolute inset-0 bg-rose-400/80 flex flex-col items-center justify-center gap-4">
                <div className="text-white font-bold">{progress < 50 ? "📡 処理中..." : progress < 80 ? "🤖 解析中..." : "✨ 仕上げ中..."}</div>
                <div className="w-2/3 h-2 bg-white/30 rounded-full"><div className="h-2 bg-white rounded-full" style={{ width: `${progress}%` }} /></div>
                <div className="text-white font-bold text-xl">{progress}%</div>
              </div>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="font-bold text-red-500 mb-2">❌ 読み取りエラー</div>
              <div className="text-sm text-gray-500">{errorMsg}</div>
            </div>
            <button onClick={reset} className="w-full py-3 bg-gray-100 rounded-xl font-bold text-gray-600">もう一度試す</button>
          </div>
        )}

        {phase === "confirm" && result && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-rose-50">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">✅</span>
                <span className="font-bold text-green-600">読み取り完了！修正できます</span>
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-600 font-semibold mb-1 block">日付</label>
                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400" />
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-600 font-semibold mb-1 block">店名</label>
                <input type="text" value={editStore} onChange={(e) => setEditStore(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400" />
                {similarStores.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-400 mb-1">過去に登録した店舗：</div>
                    <div className="flex flex-wrap gap-2">
                      {similarStores.map((s) => (
                        <button key={s.name} onClick={() => setEditStore(s.name)} className="text-xs bg-rose-50 text-rose-400 border border-rose-200 px-3 py-1 rounded-full">{s.name}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-2">
                <label className="text-xs text-gray-600 font-semibold mb-1 block">合計金額</label>
                <input type="number" value={editTotal} onChange={(e) => setEditTotal(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400" />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {editItems.map((item, i) => (
                <div key={i} className="p-3 border-b border-gray-50">
                  {editingItemIndex === i ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => setCategoryModal(i)} className="text-2xl w-10 h-10 flex items-center justify-center bg-rose-50 rounded-xl flex-shrink-0">
                          {EMOJI[item.category] ?? "📦"}
                        </button>
                        <input type="text" value={item.name} onChange={(e) => updateItem(i, { name: e.target.value })}
                          className="flex-1 border border-rose-300 rounded-lg px-2 py-1 text-sm focus:outline-none" />
                      </div>
                      <div className="flex gap-2 ml-12">
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 mb-0.5 block">単価</label>
                          <input type="number" value={item.price} onChange={(e) => updateItem(i, { price: Number(e.target.value) })}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-rose-400" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 mb-0.5 block">個数</label>
                          <input type="number" value={item.quantity || 1} onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-rose-400" />
                        </div>
                        <button onClick={() => setEditingItemIndex(null)} className="self-end pb-1 text-xs text-rose-400 font-bold">完了</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCategoryModal(i)} className="text-2xl w-10 h-10 flex items-center justify-center bg-rose-50 rounded-xl flex-shrink-0">
                        {EMOJI[item.category] ?? "📦"}
                      </button>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditingItemIndex(i)}>
                        <div className="text-sm font-bold truncate">
                          {item.name}
                          {(item.quantity || 1) > 1 && <span className="text-rose-400 ml-1">×{item.quantity}</span>}
                          <span className="text-xs text-gray-300 ml-1">✏️</span>
                        </div>
                        <div className="text-xs text-gray-600">{item.category}</div>
                      </div>
                      <div className="font-bold text-sm text-gray-600 flex-shrink-0">
                        ¥{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 flex gap-3">
              <button onClick={reset} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">やり直す</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl font-bold shadow-lg">💾 記録する</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
