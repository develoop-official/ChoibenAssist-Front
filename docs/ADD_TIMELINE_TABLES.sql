-- タイムライン機能用テーブル追加スクリプト
-- 既存のuser_profilesテーブルにscrapbox_project_nameカラムを追加し、
-- SNS機能用のテーブルを作成します

-- 1. 既存のuser_profilesテーブルにscrapbox_project_nameカラムを追加
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS scrapbox_project_name TEXT;

-- 2. フォロー関係テーブル
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON public.user_follows(created_at DESC);

-- RLS有効化
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- フォロー関係のポリシー
CREATE POLICY "Follow relationships are viewable by everyone"
  ON public.user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own follows"
  ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON public.user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- 3. 投稿テーブル
CREATE TABLE IF NOT EXISTS public.timeline_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_timeline_posts_user_id ON public.timeline_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_created_at ON public.timeline_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_hashtags ON public.timeline_posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_public ON public.timeline_posts(is_public) WHERE is_public = true;

-- updated_at トリガー
DROP TRIGGER IF EXISTS set_updated_at_on_timeline_posts
  ON public.timeline_posts;
CREATE TRIGGER set_updated_at_on_timeline_posts
  BEFORE UPDATE ON public.timeline_posts
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- RLS有効化
ALTER TABLE public.timeline_posts ENABLE ROW LEVEL SECURITY;

-- 投稿のポリシー
CREATE POLICY "Public posts are viewable by everyone"
  ON public.timeline_posts
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own posts"
  ON public.timeline_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view followed users' posts"
  ON public.timeline_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_follows 
      WHERE follower_id = auth.uid() 
      AND following_id = public.timeline_posts.user_id
    )
  );

CREATE POLICY "Users can insert own posts"
  ON public.timeline_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.timeline_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.timeline_posts
  FOR DELETE USING (auth.uid() = user_id);

-- 4. コメントテーブル
CREATE TABLE IF NOT EXISTS public.timeline_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.timeline_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_timeline_comments_post_id ON public.timeline_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_timeline_comments_user_id ON public.timeline_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_comments_created_at ON public.timeline_comments(created_at);

-- RLS有効化
ALTER TABLE public.timeline_comments ENABLE ROW LEVEL SECURITY;

-- コメントのポリシー
CREATE POLICY "Comments on public posts are viewable"
  ON public.timeline_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.timeline_posts 
      WHERE public.timeline_posts.id = public.timeline_comments.post_id 
      AND public.timeline_posts.is_public = true
    )
  );

CREATE POLICY "Users can view own comments"
  ON public.timeline_comments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own comments"
  ON public.timeline_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.timeline_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 5. いいねテーブル
CREATE TABLE IF NOT EXISTS public.timeline_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.timeline_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_timeline_likes_post_id ON public.timeline_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_timeline_likes_user_id ON public.timeline_likes(user_id);

-- RLS有効化
ALTER TABLE public.timeline_likes ENABLE ROW LEVEL SECURITY;

-- いいねのポリシー
CREATE POLICY "Likes are viewable by everyone"
  ON public.timeline_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own likes"
  ON public.timeline_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.timeline_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 6. ビューの作成

-- 投稿一覧ビュー（いいね数とコメント数を含む）
CREATE OR REPLACE VIEW public.timeline_posts_with_stats AS
SELECT 
  tp.*,
  up.username,
  up.full_name,
  up.icon_url,
  COUNT(DISTINCT tl.id) as likes_count,
  COUNT(DISTINCT tc.id) as comments_count,
  EXISTS(
    SELECT 1 FROM public.timeline_likes 
    WHERE post_id = tp.id AND user_id = auth.uid()
  ) as is_liked
FROM public.timeline_posts tp
LEFT JOIN public.user_profiles up ON tp.user_id = up.user_id
LEFT JOIN public.timeline_likes tl ON tp.id = tl.post_id
LEFT JOIN public.timeline_comments tc ON tp.id = tc.post_id
GROUP BY tp.id, up.username, up.full_name, up.icon_url;

-- フォロー関係ビュー
CREATE OR REPLACE VIEW public.user_follows_with_profiles AS
SELECT 
  uf.*,
  follower.username as follower_username,
  follower.full_name as follower_full_name,
  follower.icon_url as follower_icon_url,
  following.username as following_username,
  following.full_name as following_full_name,
  following.icon_url as following_icon_url
FROM public.user_follows uf
LEFT JOIN public.user_profiles follower ON uf.follower_id = follower.user_id
LEFT JOIN public.user_profiles following ON uf.following_id = following.user_id;

-- 完了メッセージ
SELECT 'タイムライン機能用テーブルの作成が完了しました！' as message; 