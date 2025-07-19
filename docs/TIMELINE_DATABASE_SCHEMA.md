# タイムライン機能 データベーススキーマ

## 概要
ちょい勉タイムラインのSNS機能に必要なデータベーステーブルの設計です。

## 既存テーブル

### user_profiles テーブル（既存）
ユーザーのプロフィール情報を管理するテーブル

```sql
-- 1. UUID 拡張機能（既に有効ならスキップ）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. user_profiles テーブルの作成（scrapbox_project_name を追加）
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id                 UUID           PRIMARY KEY
                                        REFERENCES auth.users(id)
                                          ON DELETE CASCADE,
  username                TEXT           UNIQUE,      -- 表示用ニックネーム
  full_name               TEXT,                        -- 本名・フルネーム
  icon_url                TEXT,                        -- アイコン画像のURL
  bio                     TEXT,                        -- プロフィール文
  scrapbox_project_name   TEXT,                        -- （追加）Scrapbox プロジェクト名（任意）
  created_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- 3. updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_on_user_profiles
  ON public.user_profiles;
CREATE TRIGGER set_updated_at_on_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- 4. RLS（行レベルセキュリティ）の有効化
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. ポリシー定義：本人のみ操作を許可
CREATE POLICY "Select own profile"
  ON public.user_profiles
  FOR SELECT USING ( auth.uid() = user_id );

CREATE POLICY "Insert own profile"
  ON public.user_profiles
  FOR INSERT WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Update own profile"
  ON public.user_profiles
  FOR UPDATE USING ( auth.uid() = user_id );

CREATE POLICY "Delete own profile"
  ON public.user_profiles
  FOR DELETE USING ( auth.uid() = user_id );
```

## 追加テーブル（SNS機能用）

### 1. user_follows (フォロー関係テーブル)
ユーザー間のフォロー関係を管理するテーブル

```sql
-- フォロー関係テーブル
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
```

### 2. timeline_posts (投稿テーブル)
学習成果の投稿を管理するテーブル

```sql
-- 投稿テーブル
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
```

### 3. timeline_comments (コメントテーブル)
投稿に対するコメントを管理するテーブル

```sql
-- コメントテーブル
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
```

### 4. timeline_likes (いいねテーブル)
投稿に対するいいねを管理するテーブル

```sql
-- いいねテーブル
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
```

## ビュー

### 投稿一覧ビュー（いいね数とコメント数を含む）
```sql
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
```

### フォロー関係ビュー
```sql
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
```

## 使用例

### 投稿の取得（フォローしているユーザーと自分の投稿）
```sql
SELECT * FROM public.timeline_posts_with_stats
WHERE is_public = true
  AND (user_id = auth.uid() 
       OR user_id IN (
         SELECT following_id FROM public.user_follows 
         WHERE follower_id = auth.uid()
       ))
ORDER BY created_at DESC;
```

### 特定のハッシュタグの投稿を取得
```sql
SELECT * FROM public.timeline_posts_with_stats
WHERE is_public = true
  AND hashtags @> ARRAY['React']
ORDER BY created_at DESC;
```

### ユーザーの投稿一覧を取得
```sql
SELECT * FROM public.timeline_posts_with_stats
WHERE user_id = 'target-user-id'
  AND (is_public = true OR user_id = auth.uid())
ORDER BY created_at DESC;
```

### フォローしているユーザー一覧を取得
```sql
SELECT * FROM public.user_follows_with_profiles
WHERE follower_id = auth.uid()
ORDER BY created_at DESC;
```

### フォロワー一覧を取得
```sql
SELECT * FROM public.user_follows_with_profiles
WHERE following_id = auth.uid()
ORDER BY created_at DESC;
```

## 注意事項

1. **既存のuser_profilesテーブル**: 既に存在する場合は、新しいカラム（scrapbox_project_name）のみ追加してください
2. **RLSポリシー**: 既存のポリシーと競合しないよう、新しいポリシー名を使用しています
3. **インデックス**: パフォーマンス向上のため、適切なインデックスを設定しています
4. **外部キー制約**: データの整合性を保つため、適切な外部キー制約を設定しています 