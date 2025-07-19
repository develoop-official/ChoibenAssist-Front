'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import { useAuth } from '../hooks/useAuth';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_profile?: {
    username?: string;
    full_name?: string;
    icon_url?: string;
  };
}

interface TimelineCommentProps {
  postId: string;
  onCommentAdded: () => void;
}

export default function TimelineComment({ postId, onCommentAdded }: TimelineCommentProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase!
        .from('timeline_comments')
        .select(`
          *,
          user_profiles!timeline_comments_user_id_fkey (
            username,
            full_name,
            icon_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('コメント取得エラー:', error);
        return;
      }

      const formattedComments: Comment[] = (data || []).map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        user_profile: comment.user_profiles
      }));

      setComments(formattedComments);
    } catch (err) {
      console.error('コメント取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      setIsSubmitting(true);

      const { error: insertError } = await supabase!
        .from('timeline_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      setNewComment('');
      onCommentAdded();

      // コメント一覧を更新
      fetchComments();
    } catch (err) {
      console.error('コメント投稿エラー:', err);
      alert('コメントの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
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

  const getUserDisplayName = (profile?: {
    username?: string;
    full_name?: string;
    icon_url?: string;
  }) => {
    if (profile?.username) return profile.username;
    if (profile?.full_name) return profile.full_name;
    return '匿名ユーザー';
  };

  const getUserInitial = (profile?: {
    username?: string;
    full_name?: string;
    icon_url?: string;
  }) => {
    const displayName = getUserDisplayName(profile);
    return displayName[0]?.toUpperCase() || 'U';
  };

  return (
    <div>
      {/* コメント表示切り替えボタン */}
      <button
        onClick={() => setShowComments(!showComments)}
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
          コメント ({comments.length})
        </span>
      </button>

      {/* コメント一覧 */}
      {showComments && (
        <div className={css({
          mt: '4',
          spaceY: '4'
        })}>
          {/* コメント投稿フォーム */}
          <form onSubmit={handleSubmitComment} className={css({
            display: 'flex',
            gap: '3'
          })}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="コメントを入力..."
              className={css({
                flex: '1',
                p: '2',
                border: '1px solid',
                borderColor: 'gray.300',
                rounded: 'md',
                fontSize: 'sm',
                _focus: {
                  outline: 'none',
                  borderColor: 'blue.500',
                  ring: '1px',
                  ringColor: 'blue.200'
                }
              })}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className={css({
                px: '4',
                py: '2',
                bg: 'blue.600',
                color: 'white',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                _hover: { bg: 'blue.700' },
                _disabled: { opacity: '0.5', cursor: 'not-allowed' }
              })}
            >
              {isSubmitting ? '送信中...' : '送信'}
            </button>
          </form>

          {/* コメント一覧 */}
          <div className={css({
            spaceY: '3'
          })}>
            {loading ? (
              <div className={css({
                textAlign: 'center',
                py: '4',
                color: 'gray.500',
                fontSize: 'sm'
              })}>
                読み込み中...
              </div>
            ) : comments.length === 0 ? (
              <div className={css({
                textAlign: 'center',
                py: '4',
                color: 'gray.500',
                fontSize: 'sm'
              })}>
                まだコメントがありません
              </div>
            ) : (
              comments.map(comment => (
                <div
                  key={comment.id}
                  className={css({
                    bg: 'gray.50',
                    rounded: 'lg',
                    p: '3'
                  })}
                >
                  <div className={css({
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '3'
                  })}>
                    <div className={css({
                      w: '8',
                      h: '8',
                      rounded: 'full',
                      bg: 'blue.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'sm',
                      fontWeight: 'bold',
                      color: 'blue.600',
                      flexShrink: '0'
                    })}>
                      {comment.user_profile?.icon_url ? (
                        // TODO: 画像表示の実装
                        <span>{getUserInitial(comment.user_profile)}</span>
                      ) : (
                        getUserInitial(comment.user_profile)
                      )}
                    </div>
                    <div className={css({
                      flex: '1',
                      minW: '0'
                    })}>
                      <div className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        mb: '1'
                      })}>
                        <span className={css({
                          fontSize: 'sm',
                          fontWeight: 'bold',
                          color: 'gray.900'
                        })}>
                          {getUserDisplayName(comment.user_profile)}
                        </span>
                        <span className={css({
                          fontSize: 'xs',
                          color: 'gray.500'
                        })}>
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className={css({
                        fontSize: 'sm',
                        color: 'gray.800',
                        lineHeight: 'relaxed'
                      })}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
