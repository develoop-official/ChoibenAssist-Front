-- study_recordsテーブルを削除するSQLコマンド

-- 1. study_recordsテーブルを削除
DROP TABLE IF EXISTS public.study_records;

-- 2. 関連するポリシーも自動的に削除されます（テーブル削除時に）

-- 3. 確認用クエリ（テーブルが存在しないことを確認）
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'study_records';
