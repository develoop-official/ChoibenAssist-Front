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
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
      setError('プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createProfile = useCallback(async () => {
    if (!supabase || !user) return;

    try {
      const profileData = {
        user_id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        full_name: user.user_metadata?.full_name || '',
        icon_url: '',
        bio: '',
        scrapbox_project_name: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('プロフィール作成エラー:', error);
        throw error;
      }

      setProfile(data);
    } catch (err) {
      console.error('プロフィール作成エラー:', err);
      if (err instanceof Error) {
        setError(`プロフィールの作成に失敗しました: ${err.message}`);
      } else {
        setError(`プロフィールの作成に失敗しました: ${JSON.stringify(err)}`);
      }
    }
  }, [user]);

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
      bg: 'gray.50',
      minH: '100vh',
      py: '8',
      px: '4'
    })}>
      <div className={css({
        maxW: '7xl',
        mx: 'auto'
      })}>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <div className={css({
            display: 'flex',
            justifyContent: 'center',
            py: '16'
          })}>
            <LoadingSpinner />
          </div>
        ) : (
          <div className={css({
            spaceY: '8'
          })}>
            {/* プロフィール情報と最近の投稿 */}
            <div className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', lg: '2fr 1fr' },
              gap: '8'
            })}>
              {/* 左側：プロフィールカード */}
              {user && profile && (
                <ProfileCard 
                  profile={profile}
                  user={user}
                  onProfileUpdate={handleProfileUpdate}
                />
              )}

              {/* 右側：最近の学習投稿 */}
              {user && (
                <StudyPosts userId={user.id} limit={5} />
              )}
            </div>

            {/* 学習アクティビティヒートマップ */}
            {user && (
              <ActivityHeatmap userId={user.id} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
