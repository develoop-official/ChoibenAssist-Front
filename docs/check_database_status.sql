-- データベース状態確認スクリプト
-- このSQLをSupabaseのSQL Editorで実行してください

-- ========================================
-- 1. user_profilesテーブルの構造確認
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
-- 2. user_profilesテーブルのRLSポリシー確認
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
AND tablename = 'user_profiles'
ORDER BY policyname;

-- ========================================
-- 3. user_profilesテーブルのサンプルデータ確認
-- ========================================
SELECT 
    user_id,
    username,
    full_name,
    created_at,
    updated_at
FROM user_profiles 
LIMIT 5;

-- ========================================
-- 4. 認証ユーザーの確認
-- ========================================
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 5. RLSの有効化状態確認
-- ========================================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- ========================================
-- 6. 外部キー制約の確認
-- ========================================
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'user_profiles'
AND tc.constraint_type = 'FOREIGN KEY'; 