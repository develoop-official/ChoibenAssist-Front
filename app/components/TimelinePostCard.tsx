'use client';

import React from 'react';
import Link from 'next/link';

import { css } from '../../styled-system/css';
import FollowButton from './FollowButton';
import MarkdownRenderer from './ui/MarkdownRenderer';
import ShareButton from './ShareButton';
import TimelineComment from './TimelineComment';

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

interface TimelinePostCardProps {
  post: TodoPost;
  onLike: (postId: string) => void;
  onCommentAdded: () => void;
  onHashtagClick: (hashtag: string) => void;
  baseUrl: string;
  createPostShareData: (post: TodoPost, url: string) => any;
}

export default function TimelinePostCard({
  post,
  onLike,
  onCommentAdded,
  onHashtagClick,
  baseUrl,
  createPostShareData
}: TimelinePostCardProps) {
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
    <Link
      href={`/timeline/${post.id}`}
      className={css({
        textDecoration: 'none',
        color: 'inherit'
      })}
    >
      <div
        className={css({
          bg: 'white',
          rounded: 'lg',
          p: '4',
          shadow: 'sm',
          border: '1px solid',
          borderColor: 'gray.200',
          transition: 'all 0.2s',
          _hover: {
            shadow: 'md',
            transform: 'translateY(-1px)',
            borderColor: 'gray.300'
          }
        })}
      >
        {/* ユーザー情報 */}
        <div className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: '3'
        })}>
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '3'
          })}>
            <div className={css({
              w: '10',
              h: '10',
              rounded: 'full',
              bg: 'blue.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'md',
              fontWeight: 'bold',
              color: 'blue.600'
            })}>
              {post.user_profile?.icon_url ? (
                <span>{getUserInitial(post.user_profile)}</span>
              ) : (
                getUserInitial(post.user_profile)
              )}
            </div>
            <div>
              <div className={css({
                fontWeight: 'bold',
                color: 'gray.900',
                fontSize: 'sm'
              })}>
                {getUserDisplayName(post.user_profile)}
              </div>
              <div className={css({
                fontSize: 'xs',
                color: 'gray.500'
              })}>
                {formatTimeAgo(post.created_at)}
              </div>
            </div>
          </div>
          <div onClick={(e) => e.preventDefault()}>
            <FollowButton targetUserId={post.user_id} />
          </div>
        </div>

        {/* Todo完了バッジ */}
        {post.todo && (
          <div className={css({
            mb: '3',
            p: '2',
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
                fontSize: 'md'
              })}>
                ✅
              </span>
              <span className={css({
                fontSize: 'xs',
                fontWeight: 'bold',
                color: 'green.700'
              })}>
                Todo完了
              </span>
            </div>
            <div className={css({
              fontSize: 'xs',
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
          mb: '3'
        })}>
          <MarkdownRenderer
            content={post.content}
            onHashtagClick={onHashtagClick}
            className={css({
              fontSize: 'sm',
              color: 'gray.900',
              lineHeight: 'relaxed'
            })}
          />

          {/* ハッシュタグ */}
          {post.hashtags.length > 0 && (
            <div className={css({
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1',
              mt: '2'
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
                  onClick={(e) => {
                    e.preventDefault();
                    onHashtagClick(tag);
                  }}
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
          gap: '3',
          pt: '2',
          borderTop: '1px solid',
          borderColor: 'gray.100'
        })}>
          <button
            onClick={(e) => {
              e.preventDefault();
              onLike(post.id);
            }}
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '1',
              px: '2',
              py: '1',
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
              fontSize: 'md'
            })}>
              {post.is_liked ? '❤️' : '🤍'}
            </span>
            <span className={css({
              fontSize: 'xs',
              fontWeight: 'medium'
            })}>
              {post.likes_count || 0}
            </span>
          </button>

          <div onClick={(e) => e.preventDefault()}>
            <TimelineComment
              postId={post.id}
              onCommentAdded={onCommentAdded}
            />
          </div>

          <div onClick={(e) => e.preventDefault()}>
            <ShareButton
              shareData={createPostShareData(
                post,
                `${baseUrl}/timeline/post/${post.id}`
              )}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
