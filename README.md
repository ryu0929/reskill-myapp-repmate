# RepMate

RepMateは、トレーニングの相談、実績の記録、成長の確認を一つにまとめたAIトレーニング支援アプリです。記録アプリと生成AIを別々に使う手間を減らし、過去の実績を見ながら次の目標を決められる体験を目指しています。

## デモ

- URL: <https://reskill-myapp-repmate.vercel.app/>
- メールアドレス: `test@gmail.com`
- パスワード: レビュー test1234

ログイン後、ホーム、AI相談、トレーニング報告、成長レポート、マイページを確認できます。

## 主な機能

- Supabase Authによるサインアップ、ログイン、ログアウト
- Gemini APIを使ったAIトレーナーへの相談
- 会話内容に基づく当日の目標候補生成と目標設定
- トレーニング記録の登録、一覧表示、編集、削除
- 重量と回数から算出した推定1RM、推移グラフ、自己ベストの表示
- 名前、性別、パスワードのプロフィール編集
- スマートフォンとデスクトップに対応したレスポンシブ表示

## 技術スタック

| 分類           | 使用技術                 |
| -------------- | ------------------------ |
| フレームワーク | Next.js 16（App Router） |
| UI             | React 19、Tailwind CSS 4 |
| 言語           | TypeScript               |
| フォーム       | React Hook Form、Zod     |
| データベース   | Supabase PostgreSQL      |
| ORM            | Prisma                   |
| 認証           | Supabase Auth            |
| 生成AI         | Gemini API               |
| デプロイ       | Vercel                   |

## 外部サービス

### Gemini API

AI相談と目標候補の生成に使用します。`USE_MOCK_AI=true`にすると、ローカル開発用の固定応答へ切り替わります。本番環境では`USE_MOCK_AI=false`と`GEMINI_API_KEY`を設定してください。

### Supabase

メールアドレスとパスワードによる認証、PostgreSQLデータベースを提供します。サーバー処理は認証ユーザーIDと記録の`user_id`を照合し、本人のデータだけを操作します。

## ローカル環境の構築

必要環境はNode.js 20以降です。

```bash
npm install
cp .env.example .env.local
```

`.env.example`を参考にSupabase、Prisma、Geminiの値を設定します。Prisma CLIはルートの`.env`からデータベース接続情報を読み込むため、必要に応じて`DATABASE_URL`と`DIRECT_URL`を`.env`にも設定してください。

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

<http://localhost:3000>を開いて動作を確認します。

## 環境変数

| 変数                            | 用途                            |
| ------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | SupabaseプロジェクトURL         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase公開Anon Key            |
| `DATABASE_URL`                  | Prisma用のPostgreSQL接続URL     |
| `DIRECT_URL`                    | マイグレーション用の直接接続URL |
| `GEMINI_API_KEY`                | Gemini APIキー                  |
| `GEMINI_MODEL`                  | 使用するGeminiモデル            |
| `USE_MOCK_AI`                   | `true`のときだけ固定応答を使用  |

## コマンド

```bash
npm run dev          # 開発サーバー
npm run build        # 本番ビルド
npm run lint         # ESLint
npm run format       # Prettierで整形
npm run format:check # 整形状態の確認
npx tsc --noEmit     # TypeScript型チェック
```

## データベース

Prismaスキーマは[prisma/schema.prisma](prisma/schema.prisma)、現在のテーブル構成と役割は[docs/database-design.md](docs/database-design.md)に記載しています。

## 今後の改善

- AIによる成長フィードバックの生成と履歴保存
- 報告チャット履歴の永続化
- 種目別デモデータの拡充
- トレーニング歴や継続期間の実データ表示
