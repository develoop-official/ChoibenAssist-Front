# Supabase設定手順

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトの設定から以下を取得：
   - Project URL
   - anon/public key

## 2. 環境変数の設定

プロジェクトのルートディレクトリに`.env.local`ファイルを作成し、以下を設定：

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 例：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. データベーステーブルの作成

Supabaseのダッシュボードで以下のSQLを実行：

```sql
-- 学習記録テーブル
CREATE TABLE study_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) を有効化
ALTER TABLE study_records ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の記録のみアクセス可能
CREATE POLICY "Users can view own records" ON study_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON study_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON study_records
  FOR DELETE USING (auth.uid() = user_id);

-- プロフィールテーブル（オプション）
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プロフィールのRLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## 4. 認証設定

1. Supabaseダッシュボードで「Authentication」→「Settings」を開く
2. Site URLに`http://localhost:3000`を追加
3. Redirect URLsに`http://localhost:3000/redirect`を追加
4. 必要に応じてOAuthプロバイダー（Google、GitHub、Twitter）を設定

## 5. 開発サーバーの再起動

環境変数を設定した後、開発サーバーを再起動：

```bash
npm run dev
```

## トラブルシューティング

### エラー: "Missing Supabase environment variables"
- `.env.local`ファイルが正しく作成されているか確認
- 環境変数の値が正しく設定されているか確認
- 開発サーバーを再起動

### エラー: "Invalid URL"
- `NEXT_PUBLIC_SUPABASE_URL`の形式が正しいか確認（https://で始まる必要があります）
- プロジェクトURLをコピーする際に余分な文字が含まれていないか確認 