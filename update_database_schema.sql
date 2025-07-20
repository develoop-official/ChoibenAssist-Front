-- Supabase PostgreSQL テーブル設計修正スクリプト
-- このSQLをSupabaseのSQL Editorで実行してください

-- ========================================
-- 1. 既存テーブルの確認と修正
-- ========================================

-- 既存のテーブル構造を確認
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'todo_items', 'timeline_posts', 'timeline_comments', 'timeline_likes', 'user_follows')
ORDER BY table_name, ordinal_position;

-- ========================================
-- 2. user_profilesテーブルの修正
-- ========================================

-- 既存のuser_profilesテーブルに必要なカラムを追加
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- usernameの制約を追加（既存のデータがある場合は注意）
-- 注意: 既存のユーザーがいる場合は、まずusernameを設定してから実行
-- ALTER TABLE user_profiles ALTER COLUMN username SET NOT NULL;

-- ========================================
-- 3. todo_itemsテーブルの確認と修正
-- ========================================

-- todo_itemsテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS todo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    due_date TEXT, -- ISO形式の日付文字列
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    study_time NUMERIC(5,2) NOT NULL DEFAULT 0, -- 学習時間（時間数、小数点2桁まで）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの追加
CREATE INDEX IF NOT EXISTS idx_todo_items_user_id ON todo_items(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_status ON todo_items(status);
CREATE INDEX IF NOT EXISTS idx_todo_items_created_at ON todo_items(created_at DESC);

-- ========================================
-- 4. タイムライン関連テーブルの修正
-- ========================================

-- timeline_postsテーブルの修正
CREATE TABLE IF NOT EXISTS timeline_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    hashtags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    todo_id UUID REFERENCES todo_items(id) ON DELETE SET NULL, -- Todoとの紐付け
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 既存のtimeline_postsテーブルにtodo_idカラムを追加（存在しない場合）
ALTER TABLE timeline_posts 
ADD COLUMN IF NOT EXISTS todo_id UUID REFERENCES todo_items(id) ON DELETE SET NULL;

-- timeline_commentsテーブルの修正
CREATE TABLE IF NOT EXISTS timeline_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- timeline_likesテーブルの修正
CREATE TABLE IF NOT EXISTS timeline_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- user_followsテーブルの修正
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- ========================================
-- 5. インデックスの最適化
-- ========================================

-- タイムライン投稿のインデックス
CREATE INDEX IF NOT EXISTS idx_timeline_posts_user_id ON timeline_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_created_at ON timeline_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_hashtags ON timeline_posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_todo_id ON timeline_posts(todo_id);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_public ON timeline_posts(is_public) WHERE is_public = true;

-- コメントのインデックス
CREATE INDEX IF NOT EXISTS idx_timeline_comments_post_id ON timeline_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_timeline_comments_user_id ON timeline_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_comments_created_at ON timeline_comments(created_at);

-- いいねのインデックス
CREATE INDEX IF NOT EXISTS idx_timeline_likes_post_id ON timeline_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_timeline_likes_user_id ON timeline_likes(user_id);

-- フォロー関係のインデックス
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at DESC);

-- ========================================
-- 7. RLS（Row Level Security）ポリシーの更新
-- ========================================

-- user_profilesテーブルのRLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "プロフィールは誰でも閲覧可能" ON user_profiles;
CREATE POLICY "プロフィールは誰でも閲覧可能" ON user_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "ユーザーは自分のプロフィールを更新可能" ON user_profiles;
CREATE POLICY "ユーザーは自分のプロフィールを更新可能" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のプロフィールを挿入可能" ON user_profiles;
CREATE POLICY "ユーザーは自分のプロフィールを挿入可能" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- todo_itemsテーブルのRLS
ALTER TABLE todo_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ユーザーは自分のTODOを閲覧可能" ON todo_items;
CREATE POLICY "ユーザーは自分のTODOを閲覧可能" ON todo_items
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のTODOを作成可能" ON todo_items;
CREATE POLICY "ユーザーは自分のTODOを作成可能" ON todo_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のTODOを更新可能" ON todo_items;
CREATE POLICY "ユーザーは自分のTODOを更新可能" ON todo_items
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のTODOを削除可能" ON todo_items;
CREATE POLICY "ユーザーは自分のTODOを削除可能" ON todo_items
    FOR DELETE USING (auth.uid() = user_id);

-- user_followsテーブルのRLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "フォロー関係は誰でも閲覧可能" ON user_follows;
CREATE POLICY "フォロー関係は誰でも閲覧可能" ON user_follows
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "ユーザーはフォロー関係を作成可能" ON user_follows;
CREATE POLICY "ユーザーはフォロー関係を作成可能" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "ユーザーは自分のフォロー関係を削除可能" ON user_follows;
CREATE POLICY "ユーザーは自分のフォロー関係を削除可能" ON user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- timeline_postsテーブルのRLS
ALTER TABLE timeline_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "公開投稿は誰でも閲覧可能、非公開投稿は投稿者のみ" ON timeline_posts;
CREATE POLICY "公開投稿は誰でも閲覧可能、非公開投稿は投稿者のみ" ON timeline_posts
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "認証ユーザーは投稿を作成可能" ON timeline_posts;
CREATE POLICY "認証ユーザーは投稿を作成可能" ON timeline_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "投稿者は自分の投稿を更新可能" ON timeline_posts;
CREATE POLICY "投稿者は自分の投稿を更新可能" ON timeline_posts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "投稿者は自分の投稿を削除可能" ON timeline_posts;
CREATE POLICY "投稿者は自分の投稿を削除可能" ON timeline_posts
    FOR DELETE USING (auth.uid() = user_id);

-- timeline_commentsテーブルのRLS
ALTER TABLE timeline_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "コメントは誰でも閲覧可能" ON timeline_comments;
CREATE POLICY "コメントは誰でも閲覧可能" ON timeline_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "認証ユーザーはコメントを作成可能" ON timeline_comments;
CREATE POLICY "認証ユーザーはコメントを作成可能" ON timeline_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "コメント投稿者は自分のコメントを更新可能" ON timeline_comments;
CREATE POLICY "コメント投稿者は自分のコメントを更新可能" ON timeline_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "コメント投稿者は自分のコメントを削除可能" ON timeline_comments;
CREATE POLICY "コメント投稿者は自分のコメントを削除可能" ON timeline_comments
    FOR DELETE USING (auth.uid() = user_id);

-- timeline_likesテーブルのRLS
ALTER TABLE timeline_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "いいねは誰でも閲覧可能" ON timeline_likes;
CREATE POLICY "いいねは誰でも閲覧可能" ON timeline_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "認証ユーザーはいいねを作成可能" ON timeline_likes;
CREATE POLICY "認証ユーザーはいいねを作成可能" ON timeline_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ユーザーは自分のいいねを削除可能" ON timeline_likes;
CREATE POLICY "ユーザーは自分のいいねを削除可能" ON timeline_likes
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 8. トリガー関数の更新
-- ========================================

-- updated_atの自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成/更新
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_todo_items_updated_at ON todo_items;
CREATE TRIGGER update_todo_items_updated_at 
    BEFORE UPDATE ON todo_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timeline_posts_updated_at ON timeline_posts;
CREATE TRIGGER update_timeline_posts_updated_at 
    BEFORE UPDATE ON timeline_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timeline_comments_updated_at ON timeline_comments;
CREATE TRIGGER update_timeline_comments_updated_at 
    BEFORE UPDATE ON timeline_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 9. データ整合性チェック
-- ========================================

-- テーブル構造の確認
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as row_count
FROM user_profiles
UNION ALL
SELECT 
    'todo_items' as table_name,
    COUNT(*) as row_count
FROM todo_items
UNION ALL
SELECT 
    'timeline_posts' as table_name,
    COUNT(*) as row_count
FROM timeline_posts
UNION ALL
SELECT 
    'timeline_comments' as table_name,
    COUNT(*) as row_count
FROM timeline_comments
UNION ALL
SELECT 
    'timeline_likes' as table_name,
    COUNT(*) as row_count
FROM timeline_likes
UNION ALL
SELECT 
    'user_follows' as table_name,
    COUNT(*) as row_count
FROM user_follows;

-- 外部キー制約の確認
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('user_profiles', 'todo_items', 'timeline_posts', 'timeline_comments', 'timeline_likes', 'user_follows')
ORDER BY tc.table_name, kcu.column_name;

-- ========================================
-- 10. 統計ビューの作成
-- ========================================

-- 既存のビューを削除（エラーが発生しても続行）
DO $$
BEGIN
    DROP VIEW IF EXISTS timeline_posts_with_stats;
    DROP VIEW IF EXISTS user_follows_with_profiles;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ビューの削除でエラーが発生しましたが、続行します: %', SQLERRM;
END $$;

-- 投稿統計ビューの作成
CREATE VIEW timeline_posts_with_stats AS
SELECT 
    p.id,
    p.user_id,
    p.content,
    p.hashtags,
    p.is_public,
    p.todo_id,
    p.created_at,
    p.updated_at,
    up.username,
    up.full_name,
    up.icon_url,
    COALESCE(likes.likes_count, 0) as likes_count,
    COALESCE(comments.comments_count, 0) as comments_count,
    CASE WHEN user_likes.post_id IS NOT NULL THEN true ELSE false END as is_liked,
    t.task as todo_task,
    t.study_time as todo_study_time,
    t.due_date as todo_due_date
FROM timeline_posts p
LEFT JOIN user_profiles up ON p.user_id = up.user_id
LEFT JOIN todo_items t ON p.todo_id = t.id
LEFT JOIN (
    SELECT post_id, COUNT(*) as likes_count
    FROM timeline_likes
    GROUP BY post_id
) likes ON p.id = likes.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as comments_count
    FROM timeline_comments
    GROUP BY post_id
) comments ON p.id = comments.post_id
LEFT JOIN timeline_likes user_likes ON p.id = user_likes.post_id AND user_likes.user_id = auth.uid()
WHERE p.is_public = true OR p.user_id = auth.uid();

-- フォロー関係ビューの作成
CREATE VIEW user_follows_with_profiles AS
SELECT 
    uf.*,
    follower.username as follower_username,
    follower.full_name as follower_full_name,
    follower.icon_url as follower_icon_url,
    following.username as following_username,
    following.full_name as following_full_name,
    following.icon_url as following_icon_url
FROM user_follows uf
LEFT JOIN user_profiles follower ON uf.follower_id = follower.user_id
LEFT JOIN user_profiles following ON uf.following_id = following.user_id;

-- ========================================
-- 11. 完了メッセージ
-- ========================================

SELECT 'テーブル設計の修正が完了しました！' as message;
