'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

interface TodoPost {
  id: string;
  task: string;
  completed_at: string;
  user_id: string;
  user_profile?: {
    username?: string;
    full_name?: string;
    icon_url?: string;
  };
  likes_count?: number;
  is_liked?: boolean;
}

interface UserProfile {
  username?: string;
  full_name?: string;
  icon_url?: string;
}

export default function TimelinePage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<TodoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: 実際の投稿データを取得するためのテーブル設計が必要
      // 現在はダミーデータで表示
      const dummyPosts: TodoPost[] = [
        {
          id: '1',
          task: 'React Hooksの学習 (30分)',
          completed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user_id: 'user1',
          user_profile: {
            username: 'react_learner',
            full_name: '田中太郎',
            icon_url: undefined
          },
          likes_count: 5,
          is_liked: false
        },
        {
          id: '2',
          task: 'TypeScriptの型定義練習 (45分)',
          completed_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          user_id: 'user2',
          user_profile: {
            username: 'ts_master',
            full_name: '佐藤花子',
            icon_url: undefined
          },
          likes_count: 3,
          is_liked: true
        },
        {
          id: '3',
          task: 'Next.jsのAPI Routes復習 (60分)',
          completed_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          user_id: 'user3',
          user_profile: {
            username: 'nextjs_fan',
            full_name: '山田次郎',
            icon_url: undefined
          },
          likes_count: 8,
          is_liked: false
        }
      ];

      setPosts(dummyPosts);
    } catch (err) {
      console.error('投稿取得エラー:', err);
      setError('投稿の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchPosts();
    }
  }, [authLoading, fetchPosts]);

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      // TODO: いいね機能の実装
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const isLiked = post.is_liked;
          return {
            ...post,
            is_liked: !isLiked,
            likes_count: (post.likes_count || 0) + (isLiked ? -1 : 1)
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('いいねエラー:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else {
      return `${diffDays}日前`;
    }
  };

  const getUserDisplayName = (profile?: UserProfile) => {
    if (profile?.username) return profile.username;
    if (profile?.full_name) return profile.full_name;
    return '匿名ユーザー';
  };

  const getUserInitial = (profile?: UserProfile) => {
    const displayName = getUserDisplayName(profile);
    return displayName[0]?.toUpperCase() || 'U';
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
          message="ちょい勉タイムラインにアクセスするにはログインしてください。"
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

  return (
    <main className={css({
      maxW: '2xl',
      mx: 'auto',
      px: '4',
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
          color: 'blue.700',
          mb: '2'
        })}>
          📱 ちょい勉タイムライン
        </h1>
        <p className={css({
          fontSize: 'lg',
          color: 'gray.600'
        })}>
          みんなの学習成果をチェックしよう！
        </p>
      </div>

      {/* 投稿一覧 */}
      <div className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4'
      })}>
        {posts.length === 0 ? (
          <div className={css({
            bg: 'white',
            rounded: 'lg',
            p: '8',
            textAlign: 'center',
            shadow: 'md'
          })}>
            <div className={css({
              fontSize: '4xl',
              mb: '4'
            })}>
              📝
            </div>
            <h3 className={css({
              fontSize: 'xl',
              fontWeight: 'bold',
              color: 'gray.700',
              mb: '2'
            })}>
              まだ投稿がありません
            </h3>
            <p className={css({
              color: 'gray.500'
            })}>
              TODOを完了して最初の投稿をしてみましょう！
            </p>
          </div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              className={css({
                bg: 'white',
                rounded: 'lg',
                p: '6',
                shadow: 'md',
                border: '1px solid',
                borderColor: 'gray.200',
                transition: 'all 0.2s',
                _hover: {
                  shadow: 'lg',
                  transform: 'translateY(-1px)'
                }
              })}
            >
              {/* ユーザー情報 */}
              <div className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                mb: '4'
              })}>
                <div className={css({
                  w: '10',
                  h: '10',
                  rounded: 'full',
                  bg: 'blue.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'blue.600'
                })}>
                  {post.user_profile?.icon_url ? (
                    // TODO: 画像表示の実装
                    <span>{getUserInitial(post.user_profile)}</span>
                  ) : (
                    getUserInitial(post.user_profile)
                  )}
                </div>
                <div>
                  <div className={css({
                    fontWeight: 'bold',
                    color: 'gray.900'
                  })}>
                    {getUserDisplayName(post.user_profile)}
                  </div>
                  <div className={css({
                    fontSize: 'sm',
                    color: 'gray.500'
                  })}>
                    {formatTimeAgo(post.completed_at)}
                  </div>
                </div>
              </div>

              {/* 投稿内容 */}
              <div className={css({
                mb: '4'
              })}>
                <div className={css({
                  bg: 'green.50',
                  border: '1px solid',
                  borderColor: 'green.200',
                  rounded: 'lg',
                  p: '4'
                })}>
                  <div className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    mb: '2'
                  })}>
                    <span className={css({
                      fontSize: 'lg'
                    })}>
                      ✅
                    </span>
                    <span className={css({
                      fontSize: 'sm',
                      fontWeight: 'bold',
                      color: 'green.700'
                    })}>
                      TODO完了
                    </span>
                  </div>
                  <p className={css({
                    fontSize: 'md',
                    color: 'gray.900',
                    lineHeight: 'relaxed'
                  })}>
                    {post.task}
                  </p>
                </div>
              </div>

              {/* アクション */}
              <div className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '4',
                pt: '3',
                borderTop: '1px solid',
                borderColor: 'gray.100'
              })}>
                <button
                  onClick={() => handleLike(post.id)}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    px: '3',
                    py: '2',
                    rounded: 'lg',
                    bg: post.is_liked ? 'red.50' : 'gray.50',
                    color: post.is_liked ? 'red.600' : 'gray.600',
                    border: '1px solid',
                    borderColor: post.is_liked ? 'red.200' : 'gray.200',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: post.is_liked ? 'red.100' : 'gray.100'
                    }
                  })}
                >
                  <span className={css({
                    fontSize: 'lg'
                  })}>
                    {post.is_liked ? '❤️' : '🤍'}
                  </span>
                  <span className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium'
                  })}>
                    {post.likes_count || 0}
                  </span>
                </button>

                <button
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    px: '3',
                    py: '2',
                    rounded: 'lg',
                    bg: 'gray.50',
                    color: 'gray.600',
                    border: '1px solid',
                    borderColor: 'gray.200',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: 'gray.100'
                    }
                  })}
                >
                  <span className={css({
                    fontSize: 'lg'
                  })}>
                    💬
                  </span>
                  <span className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium'
                  })}>
                    コメント
                  </span>
                </button>

                <button
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    px: '3',
                    py: '2',
                    rounded: 'lg',
                    bg: 'gray.50',
                    color: 'gray.600',
                    border: '1px solid',
                    borderColor: 'gray.200',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: 'gray.100'
                    }
                  })}
                >
                  <span className={css({
                    fontSize: 'lg'
                  })}>
                    🔄
                  </span>
                  <span className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium'
                  })}>
                    シェア
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 開発中のメッセージ */}
      <div className={css({
        bg: 'yellow.50',
        border: '1px solid',
        borderColor: 'yellow.200',
        rounded: 'lg',
        p: '4',
        mt: '8',
        textAlign: 'center'
      })}>
        <h3 className={css({
          fontSize: 'lg',
          fontWeight: 'bold',
          color: 'yellow.700',
          mb: '2'
        })}>
          🚧 開発中の機能
        </h3>
        <p className={css({
          color: 'yellow.600',
          mb: '2'
        })}>
          現在表示されているのはダミーデータです。
        </p>
        <p className={css({
          fontSize: 'sm',
          color: 'yellow.500'
        })}>
          実際のTODO完了投稿、いいね機能、コメント機能は今後実装予定です。
        </p>
      </div>
    </main>
  );
}
