# ちょい勉アシスト 📚✨

> AIを活用した楽な学習管理ツール

**ちょい勉アシスト**は、勉強の習慣化に悩むユーザー向けの学習管理ツールです。AIによる勉強計画提案と直感的な記録システムで、継続的な学習をサポートします。

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![PandaCSS](https://img.shields.io/badge/PandaCSS-0.54.0-orange)](https://panda-css.com/)

## ✨ 主な機能

### 🎯 学習管理
- **学習記録の投稿・管理** - 科目・時間・メモを手軽に記録
- **学習履歴の閲覧** - カード形式での一覧表示＋詳細ページ
- **進捗の可視化** - グラフでの学習時間推移表示
- **学習記録の編集・削除** - 投稿後の内容修正機能
- **TODOリスト管理** - TODOリストを作成・編集・削除

### 🤖 AI機能
- **AIによるTODOリスト提案** - 学習時間・目標・進捗に基づく個別提案
- **Scrapbox連携** - 既存の学習ノートを活用した計画最適化
- **提案TODOのワンクリック追加** - AI提案をTODOリストに即座に反映

### 📱 ユーザビリティ
- **レスポンシブデザイン** - スマホ・タブレット・PCに対応
- **Google認証** - Supabaseによる安全なユーザー管理
- **プロフィール管理** - アバター・自己紹介・scrapbox連携設定
- **TODOリスト管理** - 完了・未完了の進捗追跡

## 🎨 デザインシステム

優しい緑色を基調とした学習に集中しやすいカラーパレット：
- **プライマリ**: 緑系グラデーション（#7FB582 〜 #2D6B5D）
- **アクセント**: 科目別カラーコーディング
- **UI**: PandaCSSによる統一されたコンポーネントデザイン

## 🚀 始め方

### 環境要件
- Node.js 18.0以上
- npm または yarn
- Supabaseアカウント

### 1. リポジトリのクローン
```bash
git clone https://github.com/develoop-official/ChoibenAssist-Front.git
cd ChoibenAssist-Front
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.local`ファイルを作成：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BACKEND_API_URL=https://choiben-back.youkan.uk
```

### 4. Supabaseの設定
詳細な設定手順は [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) を参照してください。

主要テーブル：
- `study_records` - 学習記録
- `user_profiles` - ユーザープロフィール
- `todo_items` - TODOリスト

### 5. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📁 プロジェクト構成

```
ChoibenAssist-Front/
├── app/                     # Next.js App Router
│   ├── api/                 # API Routes
│   │   └── ai/             # AI機能（TODO提案など）
│   ├── components/         # UIコンポーネント
│   │   ├── ui/            # 基本UIコンポーネント
│   │   ├── Header.tsx     # ヘッダーナビゲーション
│   │   ├── StudyRecord*.tsx # 学習記録関連
│   │   └── ...
│   ├── hooks/              # カスタムフック
│   │   ├── useAuth.ts     # 認証管理
│   │   └── useStudyRecords.ts # 学習記録管理
│   ├── lib/                # ライブラリ設定
│   │   └── supabase.ts    # Supabaseクライアント
│   ├── styles/             # スタイル定義
│   │   └── components.ts  # 共通スタイル
│   ├── types/              # TypeScript型定義
│   ├── myPage/             # マイページ・プロフィール
│   ├── studyList/          # 学習記録一覧・詳細
│   ├── studyGraph/         # 進捗グラフ
│   ├── todoList/           # TODOリスト管理
│   └── post/               # 学習記録投稿
├── styled-system/          # PandaCSS生成ファイル
├── public/                 # 静的ファイル
├── panda.config.ts         # PandaCSS設定
└── docs/                   # ドキュメント
    ├── PRD.md             # プロダクト要求仕様
    ├── SUPABASE_SETUP.md  # Supabase設定手順
    └── DEVELOPMENT_RULES.md # 開発ルール
```

## 🛠️ 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **フレームワーク** | Next.js | 15.3.5 | フルスタックReactアプリケーション |
| **言語** | TypeScript | 5.0+ | 型安全な開発 |
| **スタイリング** | PandaCSS | 0.54.0 | ユーティリティファーストCSS |
| **データベース** | Supabase | - | PostgreSQL + リアルタイム機能 |
| **認証** | Supabase Auth | - | Google認証 + セッション管理 |
| **グラフ** | Recharts | 3.1.0 | 学習進捗の可視化 |
| **日付処理** | Day.js | 1.11.13 | 軽量な日付ライブラリ |
| **開発** | Concurrently | 9.2.0 | 並行タスク実行 |

## 📊 主要ページ

### 🏠 ホーム（ログイン）
- Google認証によるサインイン
- ゲストユーザー向けの機能説明

### 📝 学習記録投稿
- 科目・学習時間・メモの入力フォーム
- リアルタイムバリデーション
- 投稿後の自動リダイレクト

### 📚 学習記録一覧
- カード形式での記録表示
- 科目別カラーコーディング
- 完了済みTODOリストとの2カラムレイアウト
- 詳細ページへの遷移

### 📈 学習グラフ
- 月間学習時間の積み上げ棒グラフ
- 科目別の色分け表示
- インタラクティブなツールチップ

### 🎯 マイページ
- プロフィール情報の管理
- AI TODO提案機能
- Scrapbox連携設定
- 編集時/非編集時のUI差別化

### ✅ TODOリスト
- 未完了・完了済みタスクの管理
- AI提案からの自動追加機能
- ドラッグ&ドロップでの操作（予定）

## 🎯 AI機能の詳細

### TODO提案システム
1. **入力パラメータ**
   - 学習可能時間（必須）
   - 最近の学習進捗
   - 弱点科目
   - 1日の目標

2. **Scrapbox連携**
   - プロジェクト名の設定で既存ノートを活用
   - 個人の学習履歴に基づく最適化

3. **提案形式**
   - 時間配分を含む具体的なTODOリスト
   - 優先度と学習効果を考慮した順序
   - ワンクリックでTODOリストに追加可能

## 📈 今後の展開

### 計画中の機能
- **育成ゲーム要素** - 学習継続をゲーミフィケーション
- **学習仲間機能** - 同じ目標を持つユーザーとの交流
- **詳細な進捗分析** - 週次・月次レポート
- **カレンダービュー** - 学習予定と実績の可視化
- **音声入力対応** - 学習記録の音声登録

### 技術的改善
- PWA対応によるオフライン機能
- プッシュ通知による学習リマインダー
- より高度なAI分析機能
- マルチ言語対応

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. フォークしてください
2. フィーチャーブランチを作成 (`git checkout -b feature/新機能`)
3. 変更をコミット (`git commit -am 'feat: 新機能を追加'`)
4. ブランチにプッシュ (`git push origin feature/新機能`)
5. プルリクエストを作成

詳細な開発ルールは [`DEVELOPMENT_RULES.md`](./DEVELOPMENT_RULES.md) を参照してください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙋‍♂️ サポート

質問や問題がある場合は、GitHubのIssuesページでお気軽にお問い合わせください。
