'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import { useAuth } from '../hooks/useAuth';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (_isFollowing: boolean) => void;
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing = false,
  onFollowChange
}: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const checkFollowStatus = useCallback(async () => {
    if (!user || !targetUserId || hasChecked) return;

    // 自分自身をフォローしようとしている場合は処理をスキップ
    if (user.id === targetUserId) {
      console.warn('自分自身をフォローしようとしています。処理をスキップします。');
      setHasChecked(true);
      return;
    }

    try {
      console.warn('フォロー状態確認開始:', {
        userId: user.id,
        targetUserId,
        userEmail: user.email,
        hasSupabase: !!supabase
      });

      // 認証状態の確認
      const { data: sessionData, error: sessionError } = await supabase!.auth.getSession();
      console.warn('セッション確認:', { sessionData, sessionError });

      // まず、user_followsテーブルが存在するかテスト
      const { data: testData, error: testError } = await supabase!
        .from('user_follows')
        .select('count')
        .limit(1);

      console.warn('テーブルアクセステスト:', { testData, testError });

      const { data, error } = await supabase!
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      console.warn('フォロー状態確認結果:', { data, error });

      if (error) {
        console.error('詳細エラー情報:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        if (error.code === 'PGRST116') {
          // レコードが見つからない場合（フォローしていない）
          console.warn('フォローしていません');
          setIsFollowing(false);
        } else {
          console.error('フォロー状態確認エラー:', error);
          // エラーの場合は初期状態を維持
          setIsFollowing(initialIsFollowing);
        }
      } else {
        // データが見つかった場合（フォローしている）
        console.warn('フォローしています');
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('フォロー状態確認エラー（例外）:', err);
      // エラーの場合は初期状態を維持
      setIsFollowing(initialIsFollowing);
    } finally {
      setHasChecked(true);
    }
  }, [user, targetUserId, hasChecked, initialIsFollowing]);

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  const handleFollowToggle = async () => {
    if (!user || !targetUserId || isLoading) return;

    // 自分自身をフォローしようとしている場合は処理をスキップ
    if (user.id === targetUserId) {
      console.warn('自分自身をフォローしようとしています。処理をスキップします。');
      return;
    }

    try {
      setIsLoading(true);
      console.warn('フォロー操作開始:', { isFollowing, userId: user.id, targetUserId });

      if (isFollowing) {
        // フォロー解除
        const { error } = await supabase!
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) {
          console.error('フォロー解除エラー:', error);
          throw error;
        }

        console.warn('フォロー解除成功');
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        // フォロー
        const { error } = await supabase!
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('フォローエラー:', error);
          throw error;
        }

        console.warn('フォロー成功');
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (err) {
      console.error('フォロー操作エラー:', err);
      alert('フォロー操作に失敗しました。データベースの設定を確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  // 自分自身はフォローできない
  if (user?.id === targetUserId) {
    return null;
  }

  // データベースが利用できない場合のフォールバック
  if (!hasChecked) {
    return (
      <button
        disabled
        className={css({
          px: '4',
          py: '2',
          rounded: 'full',
          fontSize: 'sm',
          fontWeight: 'medium',
          bg: 'gray.100',
          color: 'gray.500',
          border: '1px solid',
          borderColor: 'gray.300',
          cursor: 'not-allowed',
          opacity: '0.5'
        })}
      >
        読み込み中...
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={css({
        px: '4',
        py: '2',
        rounded: 'full',
        fontSize: 'sm',
        fontWeight: 'medium',
        transition: 'all 0.2s',
        cursor: 'pointer',
        _disabled: { opacity: '0.5', cursor: 'not-allowed' },
        ...(isFollowing
          ? {
              bg: 'gray.100',
              color: 'gray.700',
              border: '1px solid',
              borderColor: 'gray.300',
              _hover: { bg: 'gray.200' }
            }
          : {
              bg: 'blue.600',
              color: 'white',
              border: '1px solid',
              borderColor: 'blue.600',
              _hover: { bg: 'blue.700' }
            }
        )
      })}
    >
      {isLoading ? (
        <span className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
          <span className={css({
            w: '4',
            h: '4',
            border: '2px solid',
            borderColor: 'currentColor',
            borderTopColor: 'transparent',
            rounded: 'full',
            animation: 'spin 1s linear infinite'
          })} />
          {isFollowing ? 'フォロー解除中...' : 'フォロー中...'}
        </span>
      ) : (
        <span className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
          <span className={css({ fontSize: 'lg' })}>
            {isFollowing ? '👥' : '➕'}
          </span>
          {isFollowing ? 'フォロー中' : 'フォロー'}
        </span>
      )}
    </button>
  );
}
