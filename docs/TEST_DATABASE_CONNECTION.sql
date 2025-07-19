-- データベース接続とテーブル存在確認テストスクリプト
-- SupabaseのSQL Editorで実行してください

-- 1. 基本的な接続テスト
SELECT 'データベース接続テスト' as test_name, 
       CASE 
         WHEN current_database() IS NOT NULL THEN '✅ 接続成功'
         ELSE '❌ 接続失敗'
       END as result;

-- 2. スキーマ確認
SELECT 'スキーマ確認' as test_name,
       schemaname as schema_name,
       tablename as table_name
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'user_follows', 'timeline_posts', 'timeline_comments', 'timeline_likes')
ORDER BY tablename;

-- 3. user_profilesテーブル確認
SELECT 'user_profilesテーブル確認' as test_name,
       CASE 
         WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') 
         THEN '✅ テーブル存在'
         ELSE '❌ テーブル不存在'
       END as result;

-- 4. user_followsテーブル確認
SELECT 'user_followsテーブル確認' as test_name,
       CASE 
         WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_follows') 
         THEN '✅ テーブル存在'
         ELSE '❌ テーブル不存在'
       END as result;

-- 5. RLSポリシー確認
SELECT 'RLSポリシー確認' as test_name,
       schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd,
       qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'user_follows', 'timeline_posts', 'timeline_comments', 'timeline_likes')
ORDER BY tablename, policyname;

-- 6. インデックス確認
SELECT 'インデックス確認' as test_name,
       schemaname,
       tablename,
       indexname,
       indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'user_follows', 'timeline_posts', 'timeline_comments', 'timeline_likes')
ORDER BY tablename, indexname;

-- 7. テスト用のuser_followsテーブル作成（存在しない場合）
DO $$
BEGIN
  -- user_followsテーブルが存在しない場合のみ作成
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_follows') THEN
    CREATE TABLE public.user_follows (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(follower_id, following_id)
    );
    
    -- インデックス作成
    CREATE INDEX idx_user_follows_follower_id ON public.user_follows(follower_id);
    CREATE INDEX idx_user_follows_following_id ON public.user_follows(following_id);
    CREATE INDEX idx_user_follows_created_at ON public.user_follows(created_at DESC);
    
    -- RLS有効化
    ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
    
    -- ポリシー作成
    CREATE POLICY "Follow relationships are viewable by everyone"
      ON public.user_follows
      FOR SELECT USING (true);

    CREATE POLICY "Users can insert own follows"
      ON public.user_follows
      FOR INSERT WITH CHECK (auth.uid() = follower_id);

    CREATE POLICY "Users can delete own follows"
      ON public.user_follows
      FOR DELETE USING (auth.uid() = follower_id);
      
    RAISE NOTICE 'user_followsテーブルを作成しました';
  ELSE
    RAISE NOTICE 'user_followsテーブルは既に存在します';
  END IF;
END $$;

-- 8. 最終確認
SELECT '最終確認' as test_name,
       'user_followsテーブル確認' as check_item,
       CASE 
         WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_follows') 
         THEN '✅ テーブル存在'
         ELSE '❌ テーブル不存在'
       END as result;

-- 9. テスト用データ挿入（オプション）
-- 注意: 実際のユーザーIDに置き換えてください
/*
INSERT INTO public.user_follows (follower_id, following_id)
VALUES 
  ('your-actual-user-id', '550e8400-e29b-41d4-a716-446655440001'),
  ('your-actual-user-id', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (follower_id, following_id) DO NOTHING;
*/ 