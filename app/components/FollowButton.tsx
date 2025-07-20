'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { supabase } from '../../lib/supabase';
import { css, cx } from '../../styled-system/css';
import { followButtonStyles } from '../styles/components';
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
  const [isAvailable, setIsAvailable] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkFollowStatus = useCallback(async () => {
    if (!user || !targetUserId || hasChecked) return;

    // 自分自身をフォローしようとしている場合は処理をスキップ
    if (user.id === targetUserId) {
      setHasChecked(true);
      return;
    }

    try {
      console.log('フォロー状態確認開始:', {
        userId: user.id,
        targetUserId,
        userEmail: user.email
      });

      // maybeSingle()を使用して、結果が0行でもエラーにならないようにする
      const { data, error } = await supabase!
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error) {
        console.error('フォロー状態確認エラー:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        // 406エラーの場合はRLSポリシーの問題
        if (error.code === '406') {
          setErrorMessage(`フォロー機能エラー: RLSポリシーの問題 (${error.message})`);
          setIsAvailable(false);
          setIsFollowing(false);
        } else {
          setErrorMessage(`フォロー機能エラー: ${error.message} (${error.code})`);
          setIsAvailable(false);
          setIsFollowing(false);
        }
      } else {
        // dataがnullの場合はフォローしていない、データがある場合はフォローしている
        setIsFollowing(!!data);
        setErrorMessage(null);
      }
    } catch (err) {
      console.error('フォロー状態確認エラー（例外）:', err);
      setErrorMessage(`フォロー機能エラー: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsAvailable(false);
      setIsFollowing(false);
    } finally {
      setHasChecked(true);
    }
  }, [user, targetUserId, hasChecked]);

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    // イベントの伝播を防ぐ（親要素のクリックイベントを防止）
    e.preventDefault();
    e.stopPropagation();

    if (!user || !targetUserId || isLoading || !isAvailable) return;

    // 自分自身をフォローしようとしている場合は処理をスキップ
    if (user.id === targetUserId) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (isFollowing) {
        // フォロー解除
        const { error } = await supabase!
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) {
          console.error('フォロー解除エラー:', error);
          setErrorMessage(`フォロー解除エラー: ${error.message}`);
          throw error;
        }

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
          setErrorMessage(`フォローエラー: ${error.message}`);
          throw error;
        }

        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (err) {
      console.error('フォロー操作エラー:', err);
      // エラーメッセージは既に設定済み
    } finally {
      setIsLoading(false);
    }
  };

  // 自分自身はフォローできない
  if (user?.id === targetUserId) {
    return null;
  }

  // エラーメッセージを表示
  if (errorMessage) {
    return (
      <div className={cx(followButtonStyles.error)}>
        エラー
      </div>
    );
  }

  // フォロー機能が利用できない場合
  if (!isAvailable) {
    return null;
  }

  // データベースが利用できない場合のフォールバック
  if (!hasChecked) {
    return (
      <button
        disabled
        className={cx(followButtonStyles.base, followButtonStyles.loading)}
      >
        <span className={css({
          w: '3',
          h: '3',
          border: '1px solid',
          borderColor: 'currentColor',
          borderTopColor: 'transparent',
          rounded: 'full',
          animation: 'spin 1s linear infinite'
        })} />
        読み込み中
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={cx(
        followButtonStyles.base,
        isFollowing ? followButtonStyles.following : followButtonStyles.notFollowing,
        isLoading && followButtonStyles.loading
      )}
    >
      {isLoading ? (
        <>
          <span className={css({
            w: '3',
            h: '3',
            border: '1px solid',
            borderColor: 'currentColor',
            borderTopColor: 'transparent',
            rounded: 'full',
            animation: 'spin 1s linear infinite'
          })} />
          <span>{isFollowing ? '解除中' : 'フォロー中'}</span>
        </>
      ) : (
        <>
          <span className={css({ fontSize: 'sm' })}>
            {isFollowing ? '✓' : '+'}
          </span>
          <span>{isFollowing ? 'フォロー中' : 'フォロー'}</span>
        </>
      )}
    </button>
  );
}
