'use client';

import React, { useState } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import { useAuth } from '../hooks/useAuth';

interface TimelinePostFormProps {
  onPostCreated: () => void;
}

export default function TimelinePostForm({ onPostCreated }: TimelinePostFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    try {
      setIsSubmitting(true);

      const hashtags = extractHashtags(content);

      const { error } = await supabase!
        .from('timeline_posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          hashtags: hashtags,
          is_public: isPublic,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('投稿エラー:', error);
        throw error;
      }

      setContent('');
      setIsPublic(true);
      onPostCreated();
    } catch (err) {
      console.error('投稿エラー:', err);
      alert('投稿に失敗しました。データベースの設定を確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hashtags = extractHashtags(content);

  return (
    <div className={css({
      bg: 'white',
      rounded: 'lg',
      p: '6',
      shadow: 'md',
      border: '1px solid',
      borderColor: 'gray.200',
      mb: '6'
    })}>
      <h3 className={css({
        fontSize: 'lg',
        fontWeight: 'bold',
        color: 'gray.900',
        mb: '4'
      })}>
        📝 学習成果を投稿
      </h3>

      <form onSubmit={handleSubmit} className={css({
        spaceY: '4'
      })}>
        {/* 投稿内容 */}
        <div>
          <label htmlFor="content" className={css({
            display: 'block',
            fontSize: 'sm',
            fontWeight: 'medium',
            color: 'gray.700',
            mb: '2'
          })}>
            学習内容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今日学んだことを共有しましょう！例: React HooksのuseEffectを理解できた！状態管理がスッキリした。#React #JavaScript #プログラミング"
            rows={4}
            className={css({
              w: 'full',
              p: '3',
              border: '1px solid',
              borderColor: 'gray.300',
              rounded: 'md',
              fontSize: 'sm',
              resize: 'vertical',
              _focus: {
                outline: 'none',
                borderColor: 'blue.500',
                ring: '1px',
                ringColor: 'blue.200'
              }
            })}
          />
        </div>

        {/* ハッシュタグプレビュー */}
        {hashtags.length > 0 && (
          <div>
            <label className={css({
              display: 'block',
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.700',
              mb: '2'
            })}>
              検出されたハッシュタグ
            </label>
            <div className={css({
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2'
            })}>
              {hashtags.map(tag => (
                <span
                  key={tag}
                  className={css({
                    px: '2',
                    py: '1',
                    bg: 'blue.50',
                    color: 'blue.700',
                    rounded: 'full',
                    fontSize: 'xs',
                    fontWeight: 'medium'
                  })}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 公開設定 */}
        <div className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '3'
        })}>
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className={css({
              w: '4',
              h: '4',
              color: 'blue.600',
              borderColor: 'gray.300',
              rounded: 'md',
              _focus: {
                ring: '2px',
                ringColor: 'blue.200'
              }
            })}
          />
          <label htmlFor="isPublic" className={css({
            fontSize: 'sm',
            color: 'gray.700',
            cursor: 'pointer'
          })}>
            {isPublic ? '🌍 公開投稿' : '🔒 非公開投稿'}
          </label>
        </div>

        {/* 投稿ボタン */}
        <div className={css({
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '3'
        })}>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={css({
              px: '6',
              py: '3',
              bg: 'blue.600',
              color: 'white',
              rounded: 'lg',
              fontSize: 'md',
              fontWeight: 'medium',
              _hover: { bg: 'blue.700' },
              _disabled: { opacity: '0.5', cursor: 'not-allowed' },
              transition: 'all 0.2s'
            })}
          >
            {isSubmitting ? (
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
                投稿中...
              </span>
            ) : (
              '📤 投稿する'
            )}
          </button>
        </div>
      </form>

      {/* 投稿のヒント */}
      <div className={css({
        mt: '4',
        p: '3',
        bg: 'blue.50',
        rounded: 'md',
        border: '1px solid',
        borderColor: 'blue.200'
      })}>
        <h4 className={css({
          fontSize: 'sm',
          fontWeight: 'bold',
          color: 'blue.800',
          mb: '2'
        })}>
          💡 投稿のヒント
        </h4>
        <ul className={css({
          fontSize: 'xs',
          color: 'blue.700',
          spaceY: '1',
          listStyle: 'disc',
          listStylePosition: 'inside'
        })}>
          <li>学んだ内容を具体的に書いてみましょう</li>
          <li>ハッシュタグ（#）を使って関連キーワードを追加</li>
          <li>非公開にすると自分だけが見られます</li>
          <li>他のユーザーの投稿にいいねやコメントをしてみましょう</li>
        </ul>
      </div>
    </div>
  );
}
