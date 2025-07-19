'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import FollowButton from '../components/FollowButton';
import HashtagSearch from '../components/HashtagSearch';
import ShareButton from '../components/ShareButton';
import TimelineComment from '../components/TimelineComment';
import TimelinePostForm from '../components/TimelinePostForm';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { createPostShareData } from '../utils/share-utils';

interface TodoPost {
  id: string;
  content: string;
  hashtags: string[];
  created_at: string;
  user_id: string;
  user_profile?: {
    username?: string;
    full_name?: string;
    icon_url?: string;
  };
  likes_count?: number;
  is_liked?: boolean;
  comments_count?: number;
  todo_id?: string; // Todoとの紐付け
  todo?: {
    id: string;
    task: string;
    study_time: number;
    due_date?: string;
  };
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
  const [selectedHashtag, setSelectedHashtag] = useState<string>('');
  const [showPostForm, setShowPostForm] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 実際の投稿データを取得（Todoとの紐付けも含む）
      let query = supabase
        .from('timeline_posts_with_stats')
        .select(`
          *,
          todo_items (
            id,
            task,
            study_time,
            due_date
          )
        `)
        .order('created_at', { ascending: false });

      // ハッシュタグフィルタリング
      if (selectedHashtag) {
        query = query.contains('hashtags', [selectedHashtag]);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) {
        console.error('投稿取得エラー:', postsError);
        setError('投稿の取得に失敗しました');
        return;
      }

      // 投稿データを整形
      const formattedPosts: TodoPost[] = (postsData || []).map(post => ({
        id: post.id,
        content: post.content,
        hashtags: post.hashtags || [],
        created_at: post.created_at,
        user_id: post.user_id,
        user_profile: {
          username: post.username,
          full_name: post.full_name,
          icon_url: post.icon_url
        },
        likes_count: post.likes_count || 0,
        is_liked: post.is_liked || false,
        comments_count: post.comments_count || 0,
        todo_id: post.todo_id,
        todo: post.todo_items
      }));

      setPosts(formattedPosts);
    } catch (err) {
      console.error('投稿取得エラー:', err);
      setError('投稿の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [selectedHashtag]);

  useEffect(() => {
    if (!authLoading) {
      fetchPosts();
    }
  }, [authLoading, fetchPosts]);

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      // 現在のいいね状態を確認
      const currentPost = posts.find(post => post.id === postId);
      if (!currentPost) return;

      const isCurrentlyLiked = currentPost.is_liked;

      if (isCurrentlyLiked) {
        // いいねを削除
        const { error } = await supabase!
          .from('timeline_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // いいねを追加
        const { error } = await supabase!
          .from('timeline_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // 投稿一覧を更新
      fetchPosts();
    } catch (err) {
      console.error('いいねエラー:', err);
      alert('いいねの操作に失敗しました');
    }
  };

  const handlePostCreated = () => {
    setShowPostForm(false);
    fetchPosts();
  };

  const handleCommentAdded = () => {
    fetchPosts();
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
      maxW: '4xl',
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
          color: 'gray.600',
          mb: '4'
        })}>
          みんなの学習成果をチェックしよう！
        </p>
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          className={css({
            px: '6',
            py: '3',
            bg: 'blue.600',
            color: 'white',
            rounded: 'lg',
            fontSize: 'md',
            fontWeight: 'medium',
            _hover: { bg: 'blue.700' },
            transition: 'all 0.2s'
          })}
        >
          {showPostForm ? '投稿フォームを閉じる' : '📝 学習成果を投稿'}
        </button>
      </div>

      <div className={css({
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '6',
        alignItems: 'start'
      })}>
        {/* サイドバー */}
        <div className={css({
          spaceY: '6'
        })}>
          {/* ハッシュタグ検索 */}
          <HashtagSearch
            onHashtagSelect={setSelectedHashtag}
            selectedHashtag={selectedHashtag}
          />

          {/* 統計情報 */}
          <div className={css({
            bg: 'white',
            rounded: 'lg',
            p: '4',
            shadow: 'md',
            border: '1px solid',
            borderColor: 'gray.200'
          })}>
            <h3 className={css({
              fontSize: 'lg',
              fontWeight: 'bold',
              color: 'gray.900',
              mb: '3'
            })}>
              📊 統計
            </h3>
            <div className={css({
              spaceY: '2',
              fontSize: 'sm',
              color: 'gray.600'
            })}>
              <div className={css({
                display: 'flex',
                justifyContent: 'space-between'
              })}>
                <span>投稿数</span>
                <span className={css({ fontWeight: 'bold' })}>{posts.length}</span>
              </div>
              <div className={css({
                display: 'flex',
                justifyContent: 'space-between'
              })}>
                <span>総いいね数</span>
                <span className={css({ fontWeight: 'bold' })}>
                  {posts.reduce((sum, post) => sum + (post.likes_count || 0), 0)}
                </span>
              </div>
              <div className={css({
                display: 'flex',
                justifyContent: 'space-between'
              })}>
                <span>総コメント数</span>
                <span className={css({ fontWeight: 'bold' })}>
                  {posts.reduce((sum, post) => sum + (post.comments_count || 0), 0)}
                </span>
              </div>
              <div className={css({
                display: 'flex',
                justifyContent: 'space-between'
              })}>
                <span>Todo完了投稿</span>
                <span className={css({ fontWeight: 'bold' })}>
                  {posts.filter(post => post.todo_id).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className={css({
          spaceY: '6'
        })}>
          {/* 投稿フォーム */}
          {showPostForm && (
            <TimelinePostForm onPostCreated={handlePostCreated} />
          )}

          {/* 投稿一覧 */}
          <div className={css({
            spaceY: '4'
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
                  {selectedHashtag ? `#${selectedHashtag}の投稿がありません` : 'まだ投稿がありません'}
                </h3>
                <p className={css({
                  color: 'gray.500'
                })}>
                  {selectedHashtag
                    ? '他のハッシュタグを試してみましょう！'
                    : '学習成果を投稿して最初の投稿をしてみましょう！'
                  }
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
                    justifyContent: 'space-between',
                    mb: '4'
                  })}>
                    <div className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3'
                    })}>
                      <div className={css({
                        w: '12',
                        h: '12',
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
                          {formatTimeAgo(post.created_at)}
                        </div>
                      </div>
                    </div>
                    <FollowButton targetUserId={post.user_id} />
                  </div>

                  {/* Todo完了バッジ */}
                  {post.todo && (
                    <div className={css({
                      mb: '3',
                      p: '3',
                      bg: 'green.50',
                      border: '1px solid',
                      borderColor: 'green.200',
                      rounded: 'md'
                    })}>
                      <div className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        mb: '1'
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
                          Todo完了
                        </span>
                      </div>
                      <div className={css({
                        fontSize: 'sm',
                        color: 'green.600'
                      })}>
                        <div><strong>タスク:</strong> {post.todo.task}</div>
                        <div><strong>学習時間:</strong> {post.todo.study_time}時間</div>
                        {post.todo.due_date && (
                          <div><strong>期限:</strong> {post.todo.due_date}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 投稿内容 */}
                  <div className={css({
                    mb: '4'
                  })}>
                    <p className={css({
                      fontSize: 'md',
                      color: 'gray.900',
                      lineHeight: 'relaxed',
                      mb: '3'
                    })}>
                      {post.content}
                    </p>

                    {/* ハッシュタグ */}
                    {post.hashtags.length > 0 && (
                      <div className={css({
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '2'
                      })}>
                        {post.hashtags.map(tag => (
                          <span
                            key={tag}
                            className={css({
                              px: '2',
                              py: '1',
                              bg: 'blue.50',
                              color: 'blue.700',
                              rounded: 'full',
                              fontSize: 'xs',
                              fontWeight: 'medium',
                              cursor: 'pointer',
                              _hover: { bg: 'blue.100' }
                            })}
                            onClick={() => setSelectedHashtag(tag)}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
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

                    <TimelineComment
                      postId={post.id}
                      onCommentAdded={handleCommentAdded}
                    />

                    <ShareButton
                      shareData={createPostShareData(
                        post,
                        `${window.location.origin}/timeline/post/${post.id}`
                      )}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
