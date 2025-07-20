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

## 🐳 Docker & GitLab CI/CD デプロイメント

このプロジェクトは、GitLab CI/CDパイプラインとDockerを使用したデプロイメントをサポートしています。

### Docker設定

#### ローカルでのDocker実行
```bash
# Dockerイメージのビルド
docker build -t choibenassist-front .

# コンテナの実行
docker run -p 3001:3001 --env-file .env.local choibenassist-front
```

### GitLab CI/CD パイプライン

#### パイプライン構成
1. **Build**: Dockerイメージのビルド
2. **Test**: ビルドしたイメージのヘルスチェック
3. **Deploy**: 
   - **Staging**: `develop`ブランチへのプッシュで自動デプロイ
   - **Production**: `main`ブランチでの手動デプロイ

#### 必要な設定

##### GitLab Runner要件
- **Executor**: Shell
- **Docker**: インストール済み
- **権限**: Docker操作権限

##### 環境変数設定（GitLab CI/CD Variables）
GitLabプロジェクトの Settings > CI/CD > Variables で以下を設定：

```bash
# 本番環境用変数
PRODUCTION_SUPABASE_URL=your_production_supabase_url
PRODUCTION_SUPABASE_ANON_KEY=your_production_supabase_anon_key
PRODUCTION_BACKEND_API_URL=your_production_backend_api_url
PRODUCTION_API_SECRET_KEY=your_production_api_secret_key

# ステージング環境用変数
STAGING_SUPABASE_URL=your_staging_supabase_url
STAGING_SUPABASE_ANON_KEY=your_staging_supabase_anon_key
STAGING_BACKEND_API_URL=your_staging_backend_api_url
STAGING_API_SECRET_KEY=your_staging_api_secret_key
```

#### デプロイメント手順
1. GitLabプロジェクトに上記の環境変数を設定
2. `develop`ブランチにプッシュ → ステージング環境に自動デプロイ（ポート3002）
3. `main`ブランチにプッシュ → 本番環境への手動デプロイが可能（ポート3001）

#### ヘルスチェック
デプロイ後のヘルスチェックは以下のエンドポイントで確認できます：
```
# 本番環境
GET http://localhost:3001/api/health

# ステージング環境  
GET http://localhost:3002/api/health
```

#### ログ確認
```bash
# 本番環境のログ
docker logs choibenassist-front-prod

# ステージング環境のログ  
docker logs choibenassist-front-staging
```

#### クリーンアップ
古いDockerイメージとコンテナのクリーンアップは、GitLab CI/CDで手動実行できます：
```bash
# GitLab UI上で手動実行
Variables: CLEANUP=true
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
API_SECRET_KEY=Bw65Dz6nT9vY
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

## 💼 技術的課題と解決事例

### 📊 ActivityHeatmapコンポーネントの開発

#### 🎯 課題
学習進捗を可視化するヒートマップコンポーネントにおいて、横軸の月ラベル表示に技術的課題が発生しました。

**主な問題点:**
- 月ラベルが画面に表示されない
- データの実際の位置とラベルの位置がずれる
- 7月の学習データが2月の位置に誤表示される

#### 🔍 解決プロセス

##### **Phase 1: 複雑な絶対配置アプローチ**
```javascript
// 週の幅を精密計算
const cellWidth = 16; // w: '4'
const cellGap = 4; // gap: '1'  
const weekGap = 4; // gap: '1'
const weekWidth = cellWidth * 7 + cellGap * 6 + weekGap; // 140px
const leftPx = weekIndex * weekWidth;
```

**結果**: 計算値と実際のレンダリング結果に乖離が発生

##### **Phase 2: データ駆動型配置**
```javascript
// 7月20日のデータ位置を基準とした動的配置
const july20Index = activityData.findIndex(data => data.date === '2025-07-20');
const july20WeekIndex = Math.floor(july20Index / 7);
```

**結果**: ロジックが複雑化し、デバッグが困難

##### **Phase 3: シンプルなフレックスボックス配置（最終解決策）**
```javascript
{['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'].map((month) => (
  <div key={month} className={css({
    fontSize: 'lg',
    fontWeight: 'bold',
    color: 'green.800',
    bg: 'green.100',
    px: '4',
    py: '3',
    rounded: 'xl',
    border: '2px solid',
    borderColor: 'green.400',
    whiteSpace: 'nowrap',
    flexShrink: 0
  })}>
    {month}
  </div>
))}
```

#### 🏆 成果
- ✅ 月ラベルが確実に表示される
- ✅ 1月から12月まで全ての月が正しく表示
- ✅ レスポンシブデザインに対応
- ✅ ユーザビリティの大幅向上

#### 📚 技術的学び
1. **シンプルな実装の優位性**: 複雑な計算より保守性の高いシンプルなアプローチを選択
2. **段階的デバッグの重要性**: 詳細なログ出力と視覚的フィードバックによる効率的な問題解決
3. **CSSレイアウトの深い理解**: z-index、overflow、positioningの適切な使い分け
4. **ユーザー中心の開発**: ユーザーフィードバックに基づく迅速な修正と改善

#### 🛠️ 開発手法
- **詳細なログ出力**: 各段階でのデータ状態を可視化
- **視覚的デバッグ**: 色変更やテストラベルによる即座のフィードバック
- **段階的改善**: 機能を段階的に実装し、問題を早期発見

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
