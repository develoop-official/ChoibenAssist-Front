-- RLSポリシー修正スクリプト
-- このSQLをSupabaseのSQL Editorで実行してください

-- ========================================
-- 1. user_profilesテーブルのRLSポリシー修正
-- ========================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "プロフィールは誰でも閲覧可能" ON user_profiles;
DROP POLICY IF EXISTS "ユーザーは自分のプロフィールを更新可能" ON user_profiles;
DROP POLICY IF EXISTS "ユーザーは自分のプロフィールを挿入可能" ON user_profiles;

-- 正しいポリシーを作成（idカラムを使用）
CREATE POLICY "プロフィールは誰でも閲覧可能" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "ユーザーは自分のプロフィールを更新可能" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のプロフィールを挿入可能" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 2. user_followsテーブルのRLSポリシー確認と修正
-- ========================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "フォロー関係は誰でも閲覧可能" ON user_follows;
DROP POLICY IF EXISTS "ユーザーはフォロー関係を作成可能" ON user_follows;
DROP POLICY IF EXISTS "ユーザーは自分のフォロー関係を削除可能" ON user_follows;

-- 正しいポリシーを作成
CREATE POLICY "フォロー関係は誰でも閲覧可能" ON user_follows
    FOR SELECT USING (true);

CREATE POLICY "ユーザーはフォロー関係を作成可能" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "ユーザーは自分のフォロー関係を削除可能" ON user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- ========================================
-- 3. RLSの有効化確認
-- ========================================

-- user_profilesテーブルのRLSを有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- user_followsテーブルのRLSを有効化
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. ポリシーの確認
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
-- 5. テストクエリ
-- ========================================

-- 現在のユーザーIDを確認
SELECT auth.uid() as current_user_id;

-- user_followsテーブルへのアクセステスト
SELECT COUNT(*) as follow_relationships_count FROM user_follows;

-- user_profilesテーブルへのアクセステスト
SELECT COUNT(*) as profiles_count FROM user_profiles;

-- 完了メッセージ
SELECT 'RLSポリシーが正常に修正されました！' as message; 