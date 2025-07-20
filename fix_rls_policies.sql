-- RLSポリシーの修正
-- このSQLをSupabaseのSQL Editorで実行してください

-- ========================================
-- 1. 現在のRLSポリシーの確認
-- ========================================

-- user_followsテーブルのRLSポリシーを確認
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
-- 2. 既存のポリシーを削除
-- ========================================

-- 既存のポリシーをすべて削除
DROP POLICY IF EXISTS "フォロー関係は誰でも閲覧可能" ON user_follows;
DROP POLICY IF EXISTS "ユーザーはフォロー関係を作成可能" ON user_follows;
DROP POLICY IF EXISTS "ユーザーは自分のフォロー関係を削除可能" ON user_follows;
DROP POLICY IF EXISTS "Follow relationships are viewable by everyone" ON user_follows;
DROP POLICY IF EXISTS "Users can insert own follows" ON user_follows;
DROP POLICY IF EXISTS "Users can delete own follows" ON user_follows;

-- ========================================
-- 3. 新しいRLSポリシーを作成
-- ========================================

-- RLSを有効化（念のため）
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- SELECTポリシー：誰でもフォロー関係を閲覧可能
CREATE POLICY "user_follows_select_policy" ON user_follows
    FOR SELECT USING (true);

-- INSERTポリシー：認証されたユーザーはフォロー関係を作成可能
CREATE POLICY "user_follows_insert_policy" ON user_follows
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = follower_id
        AND follower_id != following_id
    );

-- DELETEポリシー：ユーザーは自分のフォロー関係を削除可能
CREATE POLICY "user_follows_delete_policy" ON user_follows
    FOR DELETE USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = follower_id
    );

-- ========================================
-- 4. 認証状態の確認
-- ========================================

-- 現在の認証状態を確認
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email,
    auth.role() as current_role;

-- ========================================
-- 5. テストクエリの実行
-- ========================================

-- フォロー関係の確認（エラーが発生しないかテスト）
SELECT 
    follower_id,
    following_id,
    created_at
FROM user_follows
LIMIT 5;

-- ========================================
-- 6. 特定のユーザー間のフォロー関係をテスト
-- ========================================

-- テスト用のクエリ（実際のユーザーIDに置き換えてください）
-- SELECT 
--     follower_id,
--     following_id,
--     created_at
-- FROM user_follows
-- WHERE follower_id = 'd4cbf2f0-d3df-4849-9d58-27e4c902eb14'
-- AND following_id = 'b58567a8-7320-4397-98e3-e1fb82db66e5';

-- ========================================
-- 7. ポリシーの再確認
-- ========================================

-- 作成されたポリシーを確認
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
WHERE tablename = 'user_follows'
ORDER BY policyname;

-- ========================================
-- 8. 完了メッセージ
-- ========================================

SELECT 'RLSポリシーの修正が完了しました！' as message; 