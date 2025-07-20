'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import MarkdownRenderer from './ui/MarkdownRenderer';
import { useAuth } from '../hooks/useAuth';

interface TimelinePostFormProps {
  onPostCreated: () => void;
}

export default function TimelinePostForm({ onPostCreated }: TimelinePostFormProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTodo, setCompletedTodo] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // URLパラメータから完了したTODOの情報を取得
  useEffect(() => {
    const todoId = searchParams.get('completed_todo');
    if (todoId) {
      fetchCompletedTodo(todoId);
    }
  }, [searchParams]);

  const fetchCompletedTodo = async (todoId: string) => {
    try {
      const { data, error } = await supabase!
        .from('todo_items')
        .select('*')
        .eq('id', todoId)
        .single();
      
      if (!error && data) {
        setCompletedTodo(data);
        // 完了したTODOの情報を投稿内容に自動的に追加
        const todoContent = `## 📚 学習完了報告

### ✅ 完了したタスク
${data.task}

### ⏱️ 学習時間
${data.study_time}分

${data.goal ? `### 🎯 学習目標\n${data.goal}\n` : ''}
### 💡 学習内容・感想
（ここに学習内容や感想を書いてください）

### 🏷️ タグ
#学習完了 #${data.study_time}分学習${data.goal ? ' #目標達成' : ''}`;
        setContent(todoContent);
      }
    } catch (err) {
      console.error('完了したTODOの取得エラー:', err);
    }
  };

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
          todo_id: completedTodo?.id || null,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('投稿エラー:', error);
        throw error;
      }

      setContent('');
      setIsPublic(true);
      setCompletedTodo(null);
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
      mb: '6',
      transition: 'all 0.3s ease-in-out',
      ...(isFocused && {
        shadow: 'xl',
        borderColor: 'blue.300'
      })
    })}>
      <h3 className={css({
        fontSize: 'lg',
        fontWeight: 'bold',
        color: 'gray.900',
        mb: '4'
      })}>
        📝 学習成果を投稿
      </h3>

      {/* 完了したTODOの情報 */}
      {completedTodo && (
        <div className={css({
          bg: 'green.50',
          border: '1px solid',
          borderColor: 'green.200',
          rounded: 'lg',
          p: '4',
          mb: '4'
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
              完了したTODOの情報が自動的に含まれています
            </span>
          </div>
          <div className={css({
            fontSize: 'xs',
            color: 'green.600'
          })}>
            タスク: {completedTodo.task} | 学習時間: {completedTodo.study_time}分
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={css({
        spaceY: '4'
      })}>
        {/* 投稿内容 */}
        <div>
          <div className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: '2'
          })}>
            <label htmlFor="content" className={css({
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.700'
            })}>
              学習内容
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={css({
                px: '3',
                py: '1',
                bg: 'blue.500',
                color: 'white',
                rounded: 'md',
                fontSize: 'xs',
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center',
                gap: '1',
                _hover: { bg: 'blue.600' },
                transition: 'all 0.2s'
              })}
            >
              {showPreview ? (
                <>
                  <span>✏️</span>
                  <span>編集</span>
                </>
              ) : (
                <>
                  <span>👁️</span>
                  <span>プレビュー</span>
                </>
              )}
            </button>
          </div>
          
          {!showPreview ? (
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={`どんなタスクをやりとげた? 
マークダウンでかけて ハッシュタグ(#)を使えるよ! `}
              rows={isFocused || content.trim() ? 12 : 4}
              className={css({
                w: 'full',
                p: '4',
                border: '1px solid',
                borderColor: 'gray.300',
                color: 'black',
                rounded: 'lg',
                fontSize: 'sm',
                fontFamily: 'monospace',
                resize: 'vertical',
                transition: 'all 0.3s ease-in-out',
                _focus: {
                  outline: 'none',
                  borderColor: 'blue.500',
                  ring: '1px',
                  ringColor: 'blue.200'
                }
              })}
            />
          ) : (
            <div className={css({
              w: 'full',
              p: '4',
              border: '1px solid',
              borderColor: 'gray.300',
              rounded: 'lg',
              bg: 'white',
              minH: '200px',
              maxH: '400px',
              overflowY: 'auto'
            })}>
              {content.trim() ? (
                <MarkdownRenderer
                  content={content}
                  className={css({
                    fontSize: 'sm',
                    lineHeight: 'relaxed'
                  })}
                />
              ) : (
                <p className={css({
                  color: 'gray.500',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  py: '8'
                })}>
                  プレビューするには内容を入力してください
                </p>
              )}
            </div>
          )}
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
              fontWeight: 'bold',
              _hover: { bg: 'blue.700' },
              _disabled: { bg: 'gray.400', cursor: 'not-allowed' },
              transition: 'all 0.2s'
            })}
          >
            {isSubmitting ? '投稿中...' : '📤 投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
}
