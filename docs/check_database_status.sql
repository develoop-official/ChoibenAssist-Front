-- データベースの状態確認
-- このSQLをSupabaseのSQL Editorで実行してください

-- ========================================
-- 1. テーブルの存在確認
-- ========================================

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_follows';

-- ========================================
-- 2. user_followsテーブルの構造確認
-- ========================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_follows'
ORDER BY ordinal_position;

-- ========================================
-- 3. RLSポリシーの確認
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
WHERE tablename = 'user_follows';

-- ========================================
-- 4. 現在のユーザー確認
-- ========================================

SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- ========================================
-- 5. テストクエリの実行
-- ========================================

-- フォロー関係の確認（エラーが発生する可能性あり）
SELECT 
    follower_id,
    following_id,
    created_at
FROM user_follows
LIMIT 5;

-- ========================================
-- 6. 認証状態の確認
-- ========================================

-- 現在のセッション情報
SELECT 
    session_id,
    user_id,
    created_at,
    expires_at
FROM auth.sessions
WHERE user_id = auth.uid();

-- ========================================
-- 7. 完了メッセージ
-- ========================================

SELECT 'データベース状態の確認が完了しました！' as message; 