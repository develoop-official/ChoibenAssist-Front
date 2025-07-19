-- タイムライン機能用のテーブル作成SQL
-- このSQLをSupabaseのSQL Editorで実行してください

-- 1. ユーザープロフィールテーブル（既存のprofilesテーブルを拡張）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. フォロー関係テーブル
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- 3. タイムライン投稿テーブル
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

-- 4. タイムラインコメントテーブル
CREATE TABLE IF NOT EXISTS timeline_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. タイムラインいいねテーブル
CREATE TABLE IF NOT EXISTS timeline_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 6. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_timeline_posts_user_id ON timeline_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_created_at ON timeline_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_hashtags ON timeline_posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_todo_id ON timeline_posts(todo_id);
CREATE INDEX IF NOT EXISTS idx_timeline_comments_post_id ON timeline_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_timeline_likes_post_id ON timeline_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

-- 7. 統計ビューの作成（投稿、いいね数、コメント数を含む）
CREATE OR REPLACE VIEW timeline_posts_with_stats AS
SELECT 
    p.*,
    up.username,
    up.full_name,
    up.icon_url,
    COALESCE(likes.likes_count, 0) as likes_count,
    COALESCE(comments.comments_count, 0) as comments_count,
    CASE WHEN user_likes.post_id IS NOT NULL THEN true ELSE false END as is_liked
FROM timeline_posts p
LEFT JOIN profiles up ON p.user_id = up.id
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

-- 8. RLS（Row Level Security）ポリシーの設定

-- プロフィールのRLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "プロフィールは誰でも閲覧可能" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "ユーザーは自分のプロフィールを更新可能" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "ユーザーは自分のプロフィールを挿入可能" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- フォロー関係のRLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "フォロー関係は誰でも閲覧可能" ON user_follows
    FOR SELECT USING (true);

CREATE POLICY "ユーザーはフォロー関係を作成可能" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "ユーザーは自分のフォロー関係を削除可能" ON user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- 投稿のRLS
ALTER TABLE timeline_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "公開投稿は誰でも閲覧可能、非公開投稿は投稿者のみ" ON timeline_posts
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "認証ユーザーは投稿を作成可能" ON timeline_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "投稿者は自分の投稿を更新可能" ON timeline_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "投稿者は自分の投稿を削除可能" ON timeline_posts
    FOR DELETE USING (auth.uid() = user_id);

-- コメントのRLS
ALTER TABLE timeline_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "コメントは誰でも閲覧可能" ON timeline_comments
    FOR SELECT USING (true);

CREATE POLICY "認証ユーザーはコメントを作成可能" ON timeline_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "コメント投稿者は自分のコメントを更新可能" ON timeline_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "コメント投稿者は自分のコメントを削除可能" ON timeline_comments
    FOR DELETE USING (auth.uid() = user_id);

-- いいねのRLS
ALTER TABLE timeline_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "いいねは誰でも閲覧可能" ON timeline_likes
    FOR SELECT USING (true);

CREATE POLICY "認証ユーザーはいいねを作成可能" ON timeline_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のいいねを削除可能" ON timeline_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 9. トリガー関数の作成（updated_atの自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_posts_updated_at BEFORE UPDATE ON timeline_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_comments_updated_at BEFORE UPDATE ON timeline_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. サンプルデータの挿入（テスト用）
-- 注意: 実際のユーザーIDに置き換えてください
-- INSERT INTO timeline_posts (user_id, content, hashtags, is_public) VALUES
--     ('your-user-id-here', '今日はReactの勉強を頑張りました！', ARRAY['React', '学習'], true),
--     ('your-user-id-here', 'TypeScriptの型システムについて理解が深まりました', ARRAY['TypeScript', 'プログラミング'], true);

-- 完了メッセージ
SELECT 'タイムライン機能のテーブルとポリシーが正常に作成されました！' as message; 