'use client';

import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import { useAuth } from '../hooks/useAuth';

import ActivityHeatmap from '../components/ActivityHeatmap';
import ProfileCard from '../components/ProfileCard';
import StudyPosts from '../components/StudyPosts';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface UserProfile {
  user_id: string;
  username: string;
  full_name?: string;
  icon_url?: string;
  bio?: string;
  scrapbox_project_name?: string;
  target_study_time?: number;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 仮のプロフィールを作成するヘルパー関数
  const createFallbackProfile = useCallback((user: any): UserProfile => {
    return {
      user_id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
      full_name: user.user_metadata?.full_name || '',
      icon_url: '',
      bio: '',
      scrapbox_project_name: '',
      target_study_time: 120, // デフォルト2時間
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }, []);

  const createProfile = useCallback(async () => {
    if (!supabase || !user) return;

    try {
      // 最小限のデータでプロフィールを作成
      const profileData = {
        user_id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        full_name: user.user_metadata?.full_name || '',
        icon_url: '',
        bio: '',
        scrapbox_project_name: ''
        // created_at と updated_at はデータベースのデフォルト値に任せる
      };

      console.log('プロフィール作成データ:', profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.warn('プロフィール作成エラー詳細:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // プロフィール作成に失敗した場合、仮のプロフィールを作成
        console.log('プロフィール作成に失敗したため、仮のプロフィールを作成します');
        const fallbackProfile = createFallbackProfile(user);
        setProfile(fallbackProfile);
        setError(''); // エラー状態をクリア
        return;
      }

      console.log('プロフィール作成成功:', data);

      // target_study_timeカラムが存在しない場合のフォールバック
      const profileWithDefaults = {
        ...data,
        target_study_time: data.target_study_time || 120 // デフォルト値
      };

      setProfile(profileWithDefaults);
    } catch (err) {
      console.warn('プロフィール作成エラー:', err);
      
      // エラーが発生した場合も仮のプロフィールを作成
      console.log('プロフィール作成でエラーが発生したため、仮のプロフィールを作成します');
      const fallbackProfile = createFallbackProfile(user);
      setProfile(fallbackProfile);
      setError(''); // エラー状態をクリア
    }
  }, [user, createFallbackProfile]);

  const fetchProfile = useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(''); // エラー状態をクリア

      console.log('プロフィール取得開始 - ユーザーID:', user.id);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('プロフィール取得エラー詳細:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        if (error.code === 'PGRST116') {
          console.log('プロフィールが存在しないため、新規作成を試行します');
          await createProfile();
        } else {
          // その他のエラーの場合も仮のプロフィールを作成
          console.log('プロフィール取得でエラーが発生したため、仮のプロフィールを作成します');
          const fallbackProfile = createFallbackProfile(user);
          setProfile(fallbackProfile);
          setError(''); // エラー状態をクリア
        }
      } else {
        console.log('プロフィール取得成功:', data);
        setProfile(data);
      }
    } catch (err) {
      console.warn('プロフィール取得エラー:', err);
      
      // エラーが発生した場合も仮のプロフィールを作成
      console.log('プロフィール取得でエラーが発生したため、仮のプロフィールを作成します');
      const fallbackProfile = createFallbackProfile(user);
      setProfile(fallbackProfile);
      setError(''); // エラー状態をクリア
    } finally {
      setLoading(false);
    }
  }, [user, createProfile, createFallbackProfile]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchProfile]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (authLoading) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      })}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className={css({
      bg: 'primary.50',
      minH: '100vh',
      py: { base: '4', md: '8' },
      px: { base: '2', md: '4' }
    })}>
      <div className={css({
        maxW: '6xl',
        w: 'full',
        mx: 'auto'
      })}>

        {error && (
          <div className={css({
            w: 'full',
            maxW: '4xl',
            mx: 'auto',
            mb: '6'
          })}>
            <ErrorMessage message={error} />
          </div>
        )}

        {loading ? (
          <div className={css({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: '16',
            w: 'full'
          })}>
            <LoadingSpinner />
          </div>
        ) : (
          <div className={css({
            w: 'full',
            maxW: '4xl',
            mx: 'auto',
            spaceY: { base: '6', md: '8' }
          })}>
            {/* プロフィールカード */}
            {user && profile && (
              <div className={css({
                w: 'full',
                justifyContent: 'center',
                alignItems: 'center'
              })}>
                <ProfileCard 
                  profile={profile}
                  user={user}
                  onProfileUpdate={handleProfileUpdate}
                />
              </div>
            )}

            {/* 最近の学習投稿 */}
            {user && (
              <div className={css({
                w: 'full'
              })}>
                <StudyPosts userId={user.id} limit={5} />
              </div>
            )}

            {/* 学習アクティビティヒートマップ */}
            {user && (
              <div className={css({
                w: 'full',
                display: 'flex',
                justifyContent: 'center'
              })}>
                <ActivityHeatmap userId={user.id} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
