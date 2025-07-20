-- user_profilesテーブルにtarget_study_timeカラムを追加
-- 学習目標時間を設定するためのカラム

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS target_study_time NUMERIC NOT NULL DEFAULT 0;

-- 既存のレコードに対してデフォルト値を設定
UPDATE public.user_profiles 
SET target_study_time = 0 
WHERE target_study_time IS NULL;

-- コメントを追加
COMMENT ON COLUMN public.user_profiles.target_study_time IS 'ユーザーの学習目標時間（分単位）'; 