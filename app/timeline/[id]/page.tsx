'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import { supabase } from '../../../lib/supabase';
import { css } from '../../../styled-system/css';
import FollowButton from '../../components/FollowButton';
import { useAuth } from '../../hooks/useAuth';

interface Post {
  id: string;
  user_id: string;
  content: string;
  hashtags: string[];
  is_public: boolean;
  todo_id: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: {
    username: string;
    full_name: string;
    icon_url: string;
  };
  todo_item?: {
    task: string;
    study_time: number;
    due_date: string;
  };
}

export default function PostDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!postId) return;

    try {
      const { data, error } = await supabase!
        .from('timeline_posts')
        .select(`
          *,
          user_profile:user_profiles(username, full_name, icon_url),
          todo_item:todo_items(task, study_time, due_date)
        `)
        .eq('id', postId)
        .single();

      if (error) {
        console.error('投稿取得エラー:', error);
        setError('投稿の取得に失敗しました。');
        return;
      }

      setPost(data);
    } catch (err) {
      console.error('投稿取得エラー:', err);
      setError('投稿の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleDelete = async () => {
    if (!user || !post || !confirm('この投稿を削除しますか？')) return;

    try {
      setIsDeleting(true);

      // 関連するコメントとライクを削除
      await supabase!
        .from('timeline_comments')
        .delete()
        .eq('post_id', post.id);

      await supabase!
        .from('timeline_likes')
        .delete()
        .eq('post_id', post.id);

      // 投稿を削除
      const { error } = await supabase!
        .from('timeline_posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('投稿削除エラー:', error);
        alert('投稿の削除に失敗しました。');
        return;
      }

      // タイムラインページにリダイレクト
      router.push('/timeline');
    } catch (err) {
      console.error('投稿削除エラー:', err);
      alert('投稿の削除に失敗しました。');
    } finally {
      setIsDeleting(false);
    }
  };

  // Markdownの基本的なレンダリング
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>');
  };

  if (isLoading) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.50'
      })}>
        <div className={css({
          textAlign: 'center'
        })}>
          <div className={css({
            w: '8',
            h: '8',
            border: '4px solid',
            borderColor: 'gray.200',
            borderTopColor: 'blue.600',
            rounded: 'full',
            animation: 'spin 1s linear infinite',
            mx: 'auto',
            mb: '4'
          })} />
          <p className={css({
            color: 'gray.600'
          })}>
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.50'
      })}>
        <div className={css({
          textAlign: 'center',
          p: '8'
        })}>
          <h1 className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '4'
          })}>
            投稿が見つかりません
          </h1>
          <p className={css({
            color: 'gray.600',
            mb: '6'
          })}>
            {error || '指定された投稿は存在しないか、削除された可能性があります。'}
          </p>
          <Link
            href="/timeline"
            className={css({
              display: 'inline-block',
              px: '6',
              py: '3',
              bg: 'blue.600',
              color: 'white',
              rounded: 'lg',
              fontSize: 'md',
              fontWeight: 'medium',
              textDecoration: 'none',
              transition: 'all 0.2s',
              _hover: { bg: 'blue.700' }
            })}
          >
            タイムラインに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={css({
      minH: '100vh',
      bg: 'gray.50',
      py: '8'
    })}>
      <div className={css({
        maxW: '4xl',
        mx: 'auto',
        px: '6'
      })}>
        {/* ヘッダー */}
        <div className={css({
          mb: '6',
          display: 'flex',
          alignItems: 'center',
          gap: '4'
        })}>
          <Link
            href="/timeline"
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              px: '4',
              py: '2',
              bg: 'white',
              color: 'gray.700',
              rounded: 'lg',
              fontSize: 'sm',
              fontWeight: 'medium',
              textDecoration: 'none',
              transition: 'all 0.2s',
              shadow: 'sm',
              _hover: {
                bg: 'gray.50',
                shadow: 'md'
              }
            })}
          >
            <span>←</span>
            タイムラインに戻る
          </Link>
        </div>

        {/* 投稿詳細 */}
        <div className={css({
          bg: 'white',
          rounded: 'lg',
          shadow: 'lg',
          overflow: 'hidden'
        })}>
          {/* 投稿ヘッダー */}
          <div className={css({
            p: '6',
            borderBottom: '1px solid',
            borderColor: 'gray.200'
          })}>
            <div className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: '4'
            })}>
              <div className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '4'
              })}>
                <div className={css({
                  w: '12',
                  h: '12',
                  bg: 'gray.200',
                  rounded: 'full',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'gray.600'
                })}>
                  {post.user_profile?.icon_url ? (
                    <img
                      src={post.user_profile.icon_url}
                      alt="ユーザーアイコン"
                      className={css({
                        w: 'full',
                        h: 'full',
                        rounded: 'full',
                        objectFit: 'cover'
                      })}
                    />
                  ) : (
                    post.user_profile?.username?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <h2 className={css({
                    fontSize: 'lg',
                    fontWeight: 'bold',
                    color: 'gray.900'
                  })}>
                    {post.user_profile?.full_name || post.user_profile?.username || '匿名ユーザー'}
                  </h2>
                  <p className={css({
                    fontSize: 'sm',
                    color: 'gray.600'
                  })}>
                    {new Date(post.created_at).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>
              <div className={css({
                display: 'flex',
                gap: '2'
              })}>
                {user && user.id !== post.user_id && (
                  <FollowButton
                    targetUserId={post.user_id}
                    initialIsFollowing={false}
                  />
                )}
                {user && user.id === post.user_id && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={css({
                      px: '4',
                      py: '2',
                      bg: 'red.600',
                      color: 'white',
                      rounded: 'md',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      transition: 'all 0.2s',
                      _disabled: {
                        opacity: '0.5',
                        cursor: 'not-allowed'
                      },
                      _hover: {
                        bg: 'red.700'
                      }
                    })}
                  >
                    {isDeleting ? '削除中...' : '削除'}
                  </button>
                )}
              </div>
            </div>

            {/* TODO完了バッジ */}
            {post.todo_item && (
              <div className={css({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2',
                px: '3',
                py: '1',
                bg: 'green.100',
                color: 'green.800',
                rounded: 'full',
                fontSize: 'sm',
                fontWeight: 'medium',
                mb: '4'
              })}>
                <span>✅</span>
                <span>完了したTODO: {post.todo_item.task}</span>
              </div>
            )}
          </div>

          {/* 投稿内容 */}
          <div className={css({
            p: '6'
          })}>
            <div
              className={css({
                maxW: 'none',
                '& h1, & h2, & h3': {
                  color: 'gray.900',
                  fontWeight: 'bold'
                },
                '& strong': {
                  color: 'gray.900'
                },
                '& code': {
                  bg: 'gray.200',
                  px: '1',
                  py: '0.5',
                  rounded: 'sm',
                  fontSize: 'sm'
                },
                '& p': {
                  mb: '4',
                  lineHeight: '1.6'
                }
              })}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />
          </div>

          {/* アクションボタン */}
          <div className={css({
            p: '6',
            borderTop: '1px solid',
            borderColor: 'gray.200',
            bg: 'gray.50'
          })}>
            <div className={css({
              display: 'flex',
              gap: '4',
              justifyContent: 'center'
            })}>
              <button className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                px: '4',
                py: '2',
                bg: 'white',
                color: 'gray.700',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                border: '1px solid',
                borderColor: 'gray.300',
                transition: 'all 0.2s',
                _hover: {
                  bg: 'gray.50'
                }
              })}>
                <span>❤️</span>
                いいね
              </button>
              <button className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                px: '4',
                py: '2',
                bg: 'white',
                color: 'gray.700',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                border: '1px solid',
                borderColor: 'gray.300',
                transition: 'all 0.2s',
                _hover: {
                  bg: 'gray.50'
                }
              })}>
                <span>💬</span>
                コメント
              </button>
              <button className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                px: '4',
                py: '2',
                bg: 'white',
                color: 'gray.700',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                border: '1px solid',
                borderColor: 'gray.300',
                transition: 'all 0.2s',
                _hover: {
                  bg: 'gray.50'
                }
              })}>
                <span>📤</span>
                シェア
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
