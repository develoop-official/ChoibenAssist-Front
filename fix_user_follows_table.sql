-- user_followsテーブルの作成と修正
-- このSQLをSupabaseのSQL Editorで実行してください

-- ========================================
-- 1. user_followsテーブルの作成
-- ========================================

-- 既存のテーブルを削除（データがある場合は注意）
DROP TABLE IF EXISTS user_follows CASCADE;

-- user_followsテーブルを新規作成
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- ========================================
-- 2. インデックスの作成
-- ========================================

CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX idx_user_follows_created_at ON user_follows(created_at DESC);

-- ========================================
-- 3. RLS（Row Level Security）の設定
-- ========================================

-- RLSを有効化
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "フォロー関係は誰でも閲覧可能" ON user_follows;
DROP POLICY IF EXISTS "ユーザーはフォロー関係を作成可能" ON user_follows;
DROP POLICY IF EXISTS "ユーザーは自分のフォロー関係を削除可能" ON user_follows;

-- 新しいポリシーを作成
CREATE POLICY "フォロー関係は誰でも閲覧可能" ON user_follows
    FOR SELECT USING (true);

CREATE POLICY "ユーザーはフォロー関係を作成可能" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "ユーザーは自分のフォロー関係を削除可能" ON user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- ========================================
-- 4. テストデータの挿入（オプション）
-- ========================================

-- テスト用のフォロー関係を挿入（必要に応じてコメントアウト）
-- INSERT INTO user_follows (follower_id, following_id) 
-- VALUES 
--     ('d4cbf2f0-d3df-4849-9d58-27e4c902eb14', 'b58567a8-7320-4397-98e3-e1fb82db66e5')
-- ON CONFLICT (follower_id, following_id) DO NOTHING;

-- ========================================
-- 5. テーブル構造の確認
-- ========================================

-- テーブルが正しく作成されたか確認
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_follows'
ORDER BY ordinal_position;

-- ポリシーの確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_follows';

-- レコード数の確認
SELECT COUNT(*) as user_follows_count FROM user_follows;

-- ========================================
-- 6. 完了メッセージ
-- ========================================

SELECT 'user_followsテーブルの作成が完了しました！' as message; 