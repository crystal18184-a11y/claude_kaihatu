import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { Item } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `このレシート画像を解析してください。以下のJSON形式のみで返してください。

{
  "date": "YYYY-MM-DD",
  "store": "店舗名（短く簡潔に、住所や番号は含めない）",
  "storeType": "スーパー/コンビニ/ドラッグストア/カフェ/レストラン/ファッション/家電量販店/テーマパーク/その他",
  "total": 合計金額の数値,
  "items": [
    {
      "name": "商品名（短く簡潔に）",
      "price": 1個あたりの価格の数値,
      "quantity": 数量（個数・本数など、不明な場合は1）,
      "majorCategory": "食費/日用品・生活/ファッション/電化製品・家電/子ども・教育/娯楽・その他",
      "category": "肉類/魚介類/卵/乳製品/野菜/果物/きのこ/海藻・乾物/豆腐・大豆製品/漬物・発酵食品/パン/米・麺類/調味料・油/飲み物/お菓子・スナック/アイス・冷菓/冷凍食品/レトルト・缶詰/日用品/医療・薬/化粧品・美容/衣服・靴/バッグ・アクセサリー/家電/スマホ・PC・ガジェット/子ども用品/文具・おもちゃ/習い事・教育費/外食・テイクアウト/外食・ドリンク/外食・デザート/レジャー・観光フード/交通・外出/趣味・娯楽/その他",
      "sub": "サブカテゴリ名",
      "wasteTags": ["衝動買い/賞味期限切れリスク/ストック過剰/高カロリー/不要品 から該当するもの、なければ空配列"]
    }
  ]
}

重要なルール：
- 同じ商品が複数行ある場合はまとめてquantityに反映（例：コカコーラが2行→name:コカコーラ, price:200, quantity:2）
- priceは1個あたりの単価
- 店名は短く簡潔に（例：「イオン」「セブンイレブン」「だしとこな」）
- 肉類：牛・豚・鶏・ハム・ソーセージなど
- 魚介類：魚・刺身・貝・えび・いかなど
- 乳製品：牛乳・チーズ・ヨーグルト・バターなど
- 漬物・発酵食品：キムチ・漬物・味噌・醤油など
- アイス・冷菓：アイスクリーム・シャーベットなど（冷凍食品とは別）
- 外食・テイクアウト：レストラン・食堂での食事・持ち帰り料理
- 外食・ドリンク：カフェ・レストランでの飲み物
- レジャー・観光フード：テーマパーク・観光地での食べ歩き`,
            },
          ],
        },
      ],
    });

    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const parsed = JSON.parse(text.slice(start, end + 1));

    // 同じ商品名をまとめる処理
    const mergedItems: Omit<Item, "id">[] = [];
    parsed.items.forEach((item: Omit<Item, "id">) => {
      const existing = mergedItems.find((m) => m.name === item.name && m.category === item.category);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
      } else {
        mergedItems.push({ ...item, quantity: item.quantity || 1 });
      }
    });
    parsed.items = mergedItems;

    return NextResponse.json({ success: true, data: parsed });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
