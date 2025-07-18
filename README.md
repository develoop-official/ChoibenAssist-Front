# ChoibenAssist-Front

このプロジェクトは、Next.js + TypeScript + PandaCSS + Supabase + FastAPI を用いた学習支援アプリのフロントエンドです。

## 主な機能

- ユーザープロフィール管理（Google認証/Supabase連携）
- 学習記録の投稿・一覧・削除
- AIによるTODOリスト提案（FastAPI連携）
- 提案TODOをワンクリックで自分のTODOリストに追加
- TODOリスト管理（完了・未完了・完了済みTODOの保持）
- 完了済みTODOを学習記録一覧の右側に表示
- Scrapbox連携による学習計画最適化
- レスポンシブなUI/UX（PandaCSS）

## セットアップ

1. 必要な環境変数を`.env.local`に設定
2. Supabaseプロジェクトを作成し、DBテーブル・RLS・バケットをセットアップ
3. FastAPIバックエンド（AI連携用）を`localhost:8000`で起動
4. 依存パッケージをインストール

```bash
npm install
```

5. 開発サーバー起動

```bash
npm run dev
```

6. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## ディレクトリ構成

- `app/` ... Next.js App Router構成
- `app/api/` ... API Route（AI提案TODOなど）
- `app/myPage/` ... マイページ・プロフィール・AI提案TODO
- `app/todoList/` ... TODOリスト管理
- `app/studyList/` ... 学習記録一覧
- `app/components/` ... UIコンポーネント
- `app/hooks/` ... カスタムフック
- `styled-system/` ... PandaCSS設定

## 開発Tips

- SupabaseのRLS/バケット設定は`SUPABASE_SETUP.md`参照
- FastAPI連携APIは`app/api/ai/scrapbox-todo/[project_name]/route.ts`を参照
- Next.js 15対応のAPI Route型エラーは`context: any`で回避
- コミットはファイル単位で細かく推奨

## ライセンス

MIT

---

以下はNext.js標準のREADMEです。

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
