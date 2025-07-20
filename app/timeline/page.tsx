'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import HashtagSearch from '../components/HashtagSearch';
import TimelinePostCard from '../components/TimelinePostCard';
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

function TimelineContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<TodoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');

  // クライアントサイドでのみbaseUrlを設定
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);



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

    // 現在のいいね状態を確認
    const currentPost = posts.find(post => post.id === postId);
    if (!currentPost) return;

    const isCurrentlyLiked = currentPost.is_liked;
    const originalLikesCount = currentPost.likes_count;

    try {
      // UIを即座に更新（楽観的更新）
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                is_liked: !isCurrentlyLiked,
                likes_count: isCurrentlyLiked
                  ? (post.likes_count || 0) - 1
                  : (post.likes_count || 0) + 1
              }
            : post
        )
      );

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
    } catch (err) {
      console.error('いいねエラー:', err);
      // エラーが発生した場合、状態を元に戻す
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                is_liked: isCurrentlyLiked,
                likes_count: originalLikesCount
              }
            : post
        )
      );
      alert('いいねの操作に失敗しました');
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handlePostUpdated = () => {
    fetchPosts();
  };

  const handlePostDeleted = () => {
    fetchPosts();
  };

  const handleCommentAdded = () => {
    fetchPosts();
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
        mb: '6'
      })}>
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
              color: 'primary.800',
              mb: '3'
            })}>
              📊 統計
            </h3>
            <div className={css({
              spaceY: '2',
              fontSize: 'sm',
              color: 'primary.700'
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
          spaceY: '4'
        })}>
          {/* 投稿フォーム */}
          <TimelinePostForm 
            onPostCreated={handlePostCreated}
          />

          {/* 投稿一覧 */}
          <div className={css({
            spaceY: '3'
          })}>
            {posts.length === 0 ? (
              <div className={css({
                bg: 'white',
                rounded: 'lg',
                p: '8',
                textAlign: 'center',
                shadow: 'md',
                border: '1px solid',
                borderColor: 'gray.200'
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
                  color: 'primary.700',
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
                <TimelinePostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onCommentAdded={handleCommentAdded}
                  onHashtagClick={setSelectedHashtag}
                  onPostUpdated={handlePostUpdated}
                  onPostDeleted={handlePostDeleted}
                  baseUrl={baseUrl}
                  createPostShareData={createPostShareData}
                />
              ))
            )}
          </div>
        </div>
      </div>


    </main>
  );
}

export default function TimelinePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TimelineContent />
    </Suspense>
  );
}
