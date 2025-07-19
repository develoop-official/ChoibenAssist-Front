-- user_profilesテーブル構造確認スクリプト
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
-- 2. user_profilesテーブルのサンプルデータ確認
-- ========================================
SELECT * FROM user_profiles LIMIT 5;

-- ========================================
-- 3. 主キー制約の確認
-- ========================================
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'user_profiles'
AND tc.constraint_type = 'PRIMARY KEY';

-- ========================================
-- 4. 外部キー制約の確認
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

-- ========================================
-- 5. auth.usersテーブルとの関係確認
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
AND ccu.table_name = 'users'
AND ccu.table_schema = 'auth'; 