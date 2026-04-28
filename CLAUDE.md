@AGENTS.md

# おうち家計簿（kakeibo-app）

## プロジェクト概要
- **アプリ名**: おうち家計簿（MY KAKEIBO）
- **概要**: スマホ向け家計簿PWA。レシートをカメラで撮影するとAIが品目・カテゴリを自動分類して記録する
- **GitHub**: https://github.com/crystal18184-a11y/claude_kaihatu
- **技術スタック**:
  - Next.js 16.2.3（App Router）+ React 19.2.4
  - TypeScript 5
  - Tailwind CSS v4
  - Zustand 5（状態管理 / `persist` ミドルウェアで localStorage 保存）
  - Anthropic Claude API（`@anthropic-ai/sdk`）でレシートOCR・分類
  - dayjs / date-fns
- **データ保存**: ブラウザ localStorage（`kakeibo-storage` / `kakeibo-theme`）。サーバー保存なし

## 開発ルール
- **型は明示**: `any` を新規導入しない。型は `src/types/index.ts` に集約
- **ビルドチェック**: コミット前に `npm run build` が通ることを確認（型エラー・lintエラーを残さない）
- **デプロイフロー**:
  1. ローカルで動作確認
  2. `npm run build` で型・ビルド確認
  3. `git add . && git commit -m "..." && git push`（main 直push）
- **カテゴリ追加・変更時**: 以下7ファイルすべての `EMOJI` / `MAJOR_MAP` を必ず同期
  - `src/types/index.ts`
  - `src/app/page.tsx`, `history/page.tsx`, `manual/page.tsx`, `settings/page.tsx`, `scan/page.tsx`
  - `src/app/api/scan-receipt/route.ts`（AIプロンプトのカテゴリ列挙も更新）

## コードスタイル
- **コメント**: 原則書かない。WHY が非自明な場合のみ最小限
- **テキスト色**: 本文は `text-gray-700` 以上、プレースホルダーは `text-gray-500` 以上（薄すぎる文字は禁止）
- **テーマカラー**: ハードコードした `rose` / `pink` を新規追加しない。`theme-grad` / `theme-solid` / `theme-text` などのカスタムクラス（CSS変数）を使う
- **モーダル z-index**:
  - BottomNav: `z-40`
  - 通常モーダル: `z-50`
  - 入れ子モーダル（カテゴリ選択など）: `z-[60]` 以上
- **モーダル構造**: 保存ボタンは必ず常時表示。スクロールが必要な場合は `absolute bottom-0` でパネル下部に固定
- **画面遷移**: ページ遷移は `useNavStore` の `setDirection` で direction を設定してから `router.push` / `router.back`

## 禁止事項
- `.env.local` は読み取り禁止
- APIキーを含むファイルは絶対に読まない
- `git push --force` / `git reset --hard` などの破壊的操作は明示的な指示なしに実行しない
- `--no-verify` で pre-commit hook をスキップしない

## 動作テスト
- Webサイト変更後は **PlaywrightMCP** でブラウザ動作確認すること（グローバルルールに準拠）
