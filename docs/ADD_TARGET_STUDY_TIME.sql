-- user_profilesテーブルにtarget_study_timeカラムを追加
-- 学習目標時間を設定するためのカラム

-- カラムが存在しない場合のみ追加
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'target_study_time'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN target_study_time NUMERIC NOT NULL DEFAULT 0;
        
        -- 既存のレコードに対してデフォルト値を設定
        UPDATE public.user_profiles 
        SET target_study_time = 0 
        WHERE target_study_time IS NULL;
        
        -- コメントを追加
        COMMENT ON COLUMN public.user_profiles.target_study_time IS 'ユーザーの学習目標時間（分単位）';
        
        RAISE NOTICE 'target_study_timeカラムが正常に追加されました';
    ELSE
        RAISE NOTICE 'target_study_timeカラムは既に存在します';
    END IF;
END $$; 