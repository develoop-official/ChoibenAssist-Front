'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

// 草の成長段階を定義
const GROWTH_STAGES = [
  { name: '土', emoji: '🟫', minWater: 0 },
  { name: '芽', emoji: '🌱', minWater: 5 },
  { name: '草', emoji: '🌿', minWater: 15 },
  { name: '小木', emoji: '🌲', minWater: 30 },
  { name: '木', emoji: '🌳', minWater: 50 },
  { name: '林', emoji: '🌲🌳', minWater: 80 },
  { name: '森林', emoji: '🌲🌳🌲', minWater: 120 },
  { name: 'ジャングル', emoji: '🌿🌳🌲🌿', minWater: 200 },
];

interface UserProfile {
  user_id: string;
  username?: string;
  full_name?: string;
  icon_url?: string;
  bio?: string;
  water_count?: number;
  created_at: string;
  updated_at: string;
}

export default function FarmPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWatering, setIsWatering] = useState(false);

  const createProfile = useCallback(async () => {
    if (!supabase || !user) return;

    try {
      const profileData = {
        user_id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        full_name: user.user_metadata?.full_name || '',
        icon_url: '',
        bio: '',
        water_count: 0,
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
      setError('プロフィールの作成に失敗しました');
    }
  }, [user]);

  const fetchProfile = useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // プロフィールが存在しない場合は作成
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
  }, [user, createProfile]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchProfile]);

  // 現在の成長段階を取得
  const getCurrentGrowthStage = () => {
    const waterCount = profile?.water_count || 0;
    let currentStage = GROWTH_STAGES[0];

    for (const stage of GROWTH_STAGES) {
      if (waterCount >= stage.minWater) {
        currentStage = stage;
      } else {
        break;
      }
    }

    return currentStage;
  };

  // 次の成長段階を取得
  const getNextGrowthStage = () => {
    const waterCount = profile?.water_count || 0;

    for (const stage of GROWTH_STAGES) {
      if (waterCount < stage.minWater) {
        return stage;
      }
    }

    return null; // 最大段階に達している場合
  };

  // 水やりアニメーション（実際のTODO完了時に呼ばれる想定）
  const handleWatering = async () => {
    if (!profile || !supabase || isWatering) return;

    setIsWatering(true);
    try {
      const newWaterCount = (profile.water_count || 0) + 1;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          water_count: newWaterCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile({ ...profile, water_count: newWaterCount });

      // 水やりアニメーション演出
      setTimeout(() => {
        setIsWatering(false);
      }, 1000);

    } catch (err) {
      console.error('水やりエラー:', err);
      setError('水やりに失敗しました');
      setIsWatering(false);
    }
  };

  if (authLoading || loading) {
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

  if (!user) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.50'
      })}>
        <ErrorMessage
          title="ログインが必要です"
          message="ちょい勉ファームにアクセスするにはログインしてください。"
          type="warning"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={css({
        maxW: '4xl',
        mx: 'auto',
        px: '6',
        py: '8'
      })}>
        <ErrorMessage
          title="エラーが発生しました"
          message={error}
          type="error"
        />
      </div>
    );
  }

  const currentStage = getCurrentGrowthStage();
  const nextStage = getNextGrowthStage();
  const waterCount = profile?.water_count || 0;
  const progressToNext = nextStage ?
    ((waterCount - currentStage.minWater) / (nextStage.minWater - currentStage.minWater)) * 100 : 100;

  return (
    <main className={css({
      maxW: '4xl',
      mx: 'auto',
      px: '6',
      py: '8',
      minH: '100vh'
    })}>
      {/* ヘッダー */}
      <div className={css({
        textAlign: 'center',
        mb: '8'
      })}>
        <h1 className={css({
          fontSize: '3xl',
          fontWeight: 'bold',
          color: 'green.700',
          mb: '2'
        })}>
          🌱 ちょい勉ファーム
        </h1>
        <p className={css({
          fontSize: 'lg',
          color: 'gray.600'
        })}>
          TODOを完了して草を育てよう！
        </p>
      </div>

      {/* 草の表示エリア */}
      <div className={css({
        bg: 'green.50',
        rounded: '2xl',
        p: '8',
        mb: '6',
        textAlign: 'center',
        border: '2px solid',
        borderColor: 'green.200',
        position: 'relative',
        overflow: 'hidden'
      })}>
        {/* 水やりエフェクト */}
        {isWatering && (
          <div className={css({
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            bg: 'blue.100',
            opacity: '0.7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4xl',
            animation: 'pulse 1s ease-in-out',
            zIndex: '10'
          })}>
            💧
          </div>
        )}

        {/* 現在の草 */}
        <div className={css({
          fontSize: '8xl',
          mb: '4',
          transform: isWatering ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease-in-out'
        })}>
          {currentStage.emoji}
        </div>

        <h2 className={css({
          fontSize: '2xl',
          fontWeight: 'bold',
          color: 'green.700',
          mb: '2'
        })}>
          {currentStage.name}
        </h2>

        <p className={css({
          fontSize: 'lg',
          color: 'green.600',
          mb: '4'
        })}>
          水やり回数: {waterCount}回
        </p>

        {/* 成長プログレスバー */}
        {nextStage && (
          <div className={css({
            maxW: 'md',
            mx: 'auto'
          })}>
            <div className={css({
              display: 'flex',
              justifyContent: 'space-between',
              mb: '2'
            })}>
              <span className={css({
                fontSize: 'sm',
                color: 'green.600'
              })}>
                {currentStage.name}
              </span>
              <span className={css({
                fontSize: 'sm',
                color: 'green.600'
              })}>
                {nextStage.name}まであと{nextStage.minWater - waterCount}回
              </span>
            </div>
            <div className={css({
              w: 'full',
              h: '4',
              bg: 'green.100',
              rounded: 'full',
              overflow: 'hidden'
            })}>
              <div
                className={css({
                  h: 'full',
                  bg: 'green.500',
                  rounded: 'full',
                  transition: 'width 0.3s ease-in-out'
                })}
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        )}

        {!nextStage && (
          <div className={css({
            bg: 'yellow.100',
            border: '2px solid',
            borderColor: 'yellow.300',
            rounded: 'lg',
            p: '4',
            mt: '4'
          })}>
            <p className={css({
              fontSize: 'lg',
              fontWeight: 'bold',
              color: 'yellow.700'
            })}>
              🎉 おめでとうございます！
            </p>
            <p className={css({
              color: 'yellow.600'
            })}>
              最大段階のジャングルに到達しました！
            </p>
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className={css({
        bg: 'white',
        rounded: 'lg',
        p: '6',
        shadow: 'md',
        mb: '6'
      })}>
        <h3 className={css({
          fontSize: 'xl',
          fontWeight: 'bold',
          color: 'gray.900',
          mb: '4'
        })}>
          成長統計
        </h3>

        <div className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', md: 'repeat(3, 1fr)' },
          gap: '4'
        })}>
          <div className={css({
            textAlign: 'center',
            p: '4',
            bg: 'blue.50',
            rounded: 'lg'
          })}>
            <div className={css({
              fontSize: '2xl',
              fontWeight: 'bold',
              color: 'blue.600',
              mb: '1'
            })}>
              {waterCount}
            </div>
            <div className={css({
              fontSize: 'sm',
              color: 'blue.500'
            })}>
              総水やり回数
            </div>
          </div>

          <div className={css({
            textAlign: 'center',
            p: '4',
            bg: 'green.50',
            rounded: 'lg'
          })}>
            <div className={css({
              fontSize: '2xl',
              fontWeight: 'bold',
              color: 'green.600',
              mb: '1'
            })}>
              {GROWTH_STAGES.findIndex(stage => stage.name === currentStage.name) + 1}
            </div>
            <div className={css({
              fontSize: 'sm',
              color: 'green.500'
            })}>
              現在の段階
            </div>
          </div>

          <div className={css({
            textAlign: 'center',
            p: '4',
            bg: 'purple.50',
            rounded: 'lg'
          })}>
            <div className={css({
              fontSize: '2xl',
              fontWeight: 'bold',
              color: 'purple.600',
              mb: '1'
            })}>
              {Math.round(progressToNext)}%
            </div>
            <div className={css({
              fontSize: 'sm',
              color: 'purple.500'
            })}>
              次段階への進捗
            </div>
          </div>
        </div>
      </div>

      {/* テスト用水やりボタン（開発中のみ） */}
      <div className={css({
        textAlign: 'center'
      })}>
        <button
          onClick={handleWatering}
          disabled={isWatering}
          className={css({
            px: '6',
            py: '3',
            bg: 'blue.500',
            color: 'white',
            rounded: 'lg',
            fontSize: 'lg',
            fontWeight: 'medium',
            cursor: 'pointer',
            transition: 'all 0.2s',
            _hover: {
              bg: 'blue.600',
              transform: 'translateY(-1px)'
            },
            _disabled: {
              opacity: '0.5',
              cursor: 'not-allowed',
              transform: 'none'
            }
          })}
        >
          {isWatering ? '水やり中...' : '💧 水やりテスト'}
        </button>
        <p className={css({
          fontSize: 'sm',
          color: 'gray.500',
          mt: '2'
        })}>
          ※ 実際はTODO完了時に自動で水やりされます
        </p>
      </div>
    </main>
  );
}
