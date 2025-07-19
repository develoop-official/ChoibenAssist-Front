-- Supabaseテーブル構造確認スクリプト
-- このSQLをSupabaseのSQL Editorで実行してください

-- ========================================
-- 1. テーブル一覧の確認
-- ========================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%profile%' OR table_name LIKE '%follow%'
ORDER BY table_name;

-- ========================================
-- 2. user_profilesテーブルの構造確認
-- ========================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- ========================================
-- 3. user_followsテーブルの構造確認
-- ========================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_follows'
ORDER BY ordinal_position;

-- ========================================
-- 4. RLSポリシーの確認
-- ========================================
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
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'user_follows')
ORDER BY tablename, policyname;

-- ========================================
-- 5. サンプルデータの確認
-- ========================================
-- user_profilesテーブルのサンプルデータ
SELECT 
    id,
    username,
    full_name,
    created_at
FROM user_profiles 
LIMIT 5;

-- user_followsテーブルのサンプルデータ
SELECT 
    id,
    follower_id,
    following_id,
    created_at
FROM user_follows 
LIMIT 5;

-- ========================================
-- 6. 認証ユーザーの確認
-- ========================================
SELECT 
    id,
    email,
    created_at
FROM auth.users 
LIMIT 5; 