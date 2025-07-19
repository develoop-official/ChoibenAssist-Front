-- 外部キー関係修正スクリプト
-- このSQLをSupabaseのSQL Editorで実行してください

-- ========================================
-- 1. 現在の外部キー制約を確認
-- ========================================
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('timeline_comments', 'timeline_posts', 'timeline_likes', 'user_follows')
ORDER BY tc.table_name, kcu.column_name;

-- ========================================
-- 2. timeline_commentsテーブルの外部キー修正
-- ========================================

-- 既存の外部キー制約を削除（存在する場合）
DO $$
BEGIN
    -- timeline_comments_user_id_fkey制約を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'timeline_comments_user_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE timeline_comments DROP CONSTRAINT timeline_comments_user_id_fkey;
    END IF;
    
    -- timeline_comments_post_id_fkey制約を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'timeline_comments_post_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE timeline_comments DROP CONSTRAINT timeline_comments_post_id_fkey;
    END IF;
END $$;

-- 正しい外部キー制約を追加
ALTER TABLE timeline_comments 
ADD CONSTRAINT timeline_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

ALTER TABLE timeline_comments 
ADD CONSTRAINT timeline_comments_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES timeline_posts(id) ON DELETE CASCADE;

-- ========================================
-- 3. timeline_postsテーブルの外部キー修正
-- ========================================

-- 既存の外部キー制約を削除（存在する場合）
DO $$
BEGIN
    -- timeline_posts_user_id_fkey制約を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'timeline_posts_user_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE timeline_posts DROP CONSTRAINT timeline_posts_user_id_fkey;
    END IF;
    
    -- timeline_posts_todo_id_fkey制約を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'timeline_posts_todo_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE timeline_posts DROP CONSTRAINT timeline_posts_todo_id_fkey;
    END IF;
END $$;

-- 正しい外部キー制約を追加
ALTER TABLE timeline_posts 
ADD CONSTRAINT timeline_posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- todo_itemsテーブルが存在する場合のみ追加
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'todo_items' AND table_schema = 'public') THEN
        ALTER TABLE timeline_posts 
        ADD CONSTRAINT timeline_posts_todo_id_fkey 
        FOREIGN KEY (todo_id) REFERENCES todo_items(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ========================================
-- 4. timeline_likesテーブルの外部キー修正
-- ========================================

-- 既存の外部キー制約を削除（存在する場合）
DO $$
BEGIN
    -- timeline_likes_user_id_fkey制約を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'timeline_likes_user_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE timeline_likes DROP CONSTRAINT timeline_likes_user_id_fkey;
    END IF;
    
    -- timeline_likes_post_id_fkey制約を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'timeline_likes_post_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE timeline_likes DROP CONSTRAINT timeline_likes_post_id_fkey;
    END IF;
END $$;

-- 正しい外部キー制約を追加
ALTER TABLE timeline_likes 
ADD CONSTRAINT timeline_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

ALTER TABLE timeline_likes 
ADD CONSTRAINT timeline_likes_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES timeline_posts(id) ON DELETE CASCADE;

-- ========================================
-- 5. user_followsテーブルの外部キー修正
-- ========================================

-- 既存の外部キー制約を削除（存在する場合）
DO $$
BEGIN
    -- user_follows_follower_id_fkey制約を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_follows_follower_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_follows DROP CONSTRAINT user_follows_follower_id_fkey;
    END IF;
    
    -- user_follows_following_id_fkey制約を削除
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_follows_following_id_fkey' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_follows DROP CONSTRAINT user_follows_following_id_fkey;
    END IF;
END $$;

-- 正しい外部キー制約を追加
ALTER TABLE user_follows 
ADD CONSTRAINT user_follows_follower_id_fkey 
FOREIGN KEY (follower_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

ALTER TABLE user_follows 
ADD CONSTRAINT user_follows_following_id_fkey 
FOREIGN KEY (following_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- ========================================
-- 6. 修正後の外部キー制約を確認
-- ========================================
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('timeline_comments', 'timeline_posts', 'timeline_likes', 'user_follows')
ORDER BY tc.table_name, kcu.column_name;

-- 完了メッセージ
SELECT '外部キー関係が正常に修正されました！' as message; 