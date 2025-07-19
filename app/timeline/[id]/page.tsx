'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { supabase } from '../../../lib/supabase';
import { css } from '../../../styled-system/css';
import FollowButton from '../../components/FollowButton';
import ShareButton from '../../components/ShareButton';
import TimelineComment from '../../components/TimelineComment';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { createPostShareData } from '../../utils/share-utils';

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
  todo_id?: string;
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

function PostDetailContent() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [post, setPost] = useState<TodoPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string>('');

  // クライアントサイドでのみbaseUrlを設定
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (!postId) return;
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase!
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
        .eq('id', postId)
        .single();

      if (error) {
        console.error('投稿取得エラー:', error);
        setError('投稿が見つかりません');
        return;
      }

      const formattedPost: TodoPost = {
        id: data.id,
        content: data.content,
        hashtags: data.hashtags || [],
        created_at: data.created_at,
        user_id: data.user_id,
        user_profile: {
          username: data.username,
          full_name: data.full_name,
          icon_url: data.icon_url
        },
        likes_count: data.likes_count || 0,
        is_liked: data.is_liked || false,
        comments_count: data.comments_count || 0,
        todo_id: data.todo_id,
        todo: data.todo_items
      };

      setPost(formattedPost);
    } catch (err) {
      console.error('投稿取得エラー:', err);
      setError('投稿の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !post) return;

    try {
      const isCurrentlyLiked = post.is_liked;

      if (isCurrentlyLiked) {
        // いいねを削除
        const { error } = await supabase!
          .from('timeline_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // いいねを追加
        const { error } = await supabase!
          .from('timeline_likes')
          .insert({
            post_id: post.id,
            user_id: user.id,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // 投稿を再取得
      fetchPost();
    } catch (err) {
      console.error('いいねエラー:', err);
      alert('いいねの操作に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (!post || !user || post.user_id !== user.id) return;
    
    if (!confirm('この投稿を削除しますか？')) return;
    
    try {
      setDeleting(true);
      
      // いいねを削除
      await supabase!
        .from('timeline_likes')
        .delete()
        .eq('post_id', post.id);
      
      // コメントを削除
      await supabase!
        .from('timeline_comments')
        .delete()
        .eq('post_id', post.id);
      
      // 投稿を削除
      const { error } = await supabase!
        .from('timeline_posts')
        .delete()
        .eq('id', post.id);
      
      if (error) throw error;
      
      router.push('/timeline');
    } catch (err) {
      console.error('投稿削除エラー:', err);
      alert('投稿の削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const handleCommentAdded = () => {
    fetchPost();
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

  // MarkdownをHTMLに変換する関数
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-gray-800 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-gray-900 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-gray-900 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs">$1</code>')
      .replace(/#(\w+)/g, '<span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2 mb-1">#$1</span>')
      .replace(/\n/g, '<br>');
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
          message="投稿詳細を閲覧するにはログインしてください。"
          type="warning"
        />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={css({
        maxW: '4xl',
        mx: 'auto',
        px: '6',
        py: '8'
      })}>
        <ErrorMessage
          title="エラーが発生しました"
          message={error || "投稿が見つかりません"}
          type="error"
        />
      </div>
    );
  }

  const shareData = createPostShareData(post, baseUrl);

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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: '8'
      })}>
        <Link
          href="/timeline"
          className={css({
            px: '4',
            py: '2',
            bg: 'gray.500',
            color: 'white',
            rounded: 'md',
            fontWeight: 'bold',
            fontSize: 'sm',
            _hover: { bg: 'gray.600' },
            transition: 'all 0.2s',
            textDecoration: 'none',
            display: 'inline-block'
          })}
        >
          ← タイムラインに戻る
        </Link>
        
        {user && post.user_id === user.id && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={css({
              px: '4',
              py: '2',
              bg: 'red.500',
              color: 'white',
              rounded: 'md',
              fontWeight: 'bold',
              fontSize: 'sm',
              _hover: { bg: 'red.600' },
              _disabled: { bg: 'gray.400', cursor: 'not-allowed' },
              transition: 'all 0.2s'
            })}
          >
            {deleting ? '削除中...' : '🗑️ 削除'}
          </button>
        )}
      </div>

      {/* 投稿詳細 */}
      <div className={css({
        bg: 'white',
        rounded: 'xl',
        p: '8',
        shadow: 'lg',
        border: '1px solid',
        borderColor: 'gray.200'
      })}>
        {/* ユーザー情報 */}
        <div className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: '6'
        })}>
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '4'
          })}>
            <div className={css({
              w: '16',
              h: '16',
              rounded: 'full',
              bg: 'blue.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2xl',
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
                fontSize: 'xl',
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
            mb: '6',
            p: '4',
            bg: 'green.50',
            border: '1px solid',
            borderColor: 'green.200',
            rounded: 'lg'
          })}>
            <div className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              mb: '2'
            })}>
              <span className={css({
                fontSize: 'xl'
              })}>
                ✅
              </span>
              <span className={css({
                fontSize: 'lg',
                fontWeight: 'bold',
                color: 'green.700'
              })}>
                Todo完了
              </span>
            </div>
            <div className={css({
              fontSize: 'md',
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
          mb: '8'
        })}>
          <div 
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            className={css({
              fontSize: 'lg',
              color: 'gray.900',
              lineHeight: 'relaxed',
              '& h1': { fontSize: '2xl', fontWeight: 'bold', color: 'gray.900', mb: '4' },
              '& h2': { fontSize: 'xl', fontWeight: 'bold', color: 'gray.800', mb: '3' },
              '& h3': { fontSize: 'lg', fontWeight: 'bold', color: 'gray.700', mb: '2' },
              '& p': { mb: '3' },
              '& strong': { fontWeight: 'bold' },
              '& em': { fontStyle: 'italic' },
              '& code': { bg: 'gray.100', px: '2', py: '1', rounded: 'md', fontSize: 'sm' },
              '& br': { display: 'block', content: '""', marginTop: '1rem' }
            })}
          />

          {/* ハッシュタグ */}
          {post.hashtags.length > 0 && (
            <div className={css({
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2',
              mt: '4'
            })}>
              {post.hashtags.map(tag => (
                <span
                  key={tag}
                  className={css({
                    px: '3',
                    py: '1',
                    bg: 'blue.50',
                    color: 'blue.700',
                    rounded: 'full',
                    fontSize: 'sm',
                    fontWeight: 'medium'
                  })}
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
          gap: '6',
          pt: '6',
          borderTop: '1px solid',
          borderColor: 'gray.200'
        })}>
          <button
            onClick={handleLike}
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '3',
              px: '4',
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
              fontSize: 'xl'
            })}>
              {post.is_liked ? '❤️' : '🤍'}
            </span>
            <span className={css({
              fontSize: 'md',
              fontWeight: 'medium'
            })}>
              {post.likes_count || 0}
            </span>
          </button>

          <TimelineComment
            postId={post.id}
            onCommentAdded={handleCommentAdded}
          />

          <ShareButton shareData={shareData} />
        </div>
      </div>
    </main>
  );
}

export default function PostDetailPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PostDetailContent />
    </Suspense>
  );
} 
