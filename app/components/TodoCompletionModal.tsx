'use client';

import React, { useState } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import { useAuth } from '../hooks/useAuth';
import { TodoItem } from '../types/todo-item';

interface TodoCompletionModalProps {
  todo: TodoItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function TodoCompletionModal({
  todo,
  isOpen,
  onClose,
  onPostCreated
}: TodoCompletionModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  };

  const generateDefaultContent = (todo: TodoItem) => {
    const hashtags = ['学習完了', 'TODO完了'];
    if (todo.study_time > 0) {
      hashtags.push(`${todo.study_time}分学習`);
    }
    if (todo.due_date) {
      hashtags.push('期限達成');
    }

    return `✅ ${todo.task} を完了しました！\n\n学習時間: ${todo.study_time}分\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !todo || !content.trim()) return;

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
          created_at: new Date().toISOString(),
          todo_id: todo.id // Todoとの紐付け
        });

      if (error) {
        console.error('投稿エラー:', error);
        throw error;
      }

      setContent('');
      setIsPublic(true);
      onPostCreated();
      onClose();
    } catch (err) {
      console.error('投稿エラー:', err);
      alert('投稿に失敗しました。データベースの設定を確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setIsPublic(true);
    onClose();
  };

  if (!isOpen || !todo) return null;

  return (
    <div className={css({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      bg: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000',
      p: '4'
    })}>
      <div className={css({
        bg: 'white',
        rounded: 'lg',
        p: '6',
        maxW: '2xl',
        w: 'full',
        maxH: '90vh',
        overflowY: 'auto',
        shadow: 'xl'
      })}>
        {/* ヘッダー */}
        <div className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: '4'
        })}>
          <h3 className={css({
            fontSize: 'xl',
            fontWeight: 'bold',
            color: 'green.700'
          })}>
            🎉 学習完了！投稿しましょう
          </h3>
          <button
            onClick={handleClose}
            className={css({
              p: '2',
              color: 'gray.500',
              _hover: { color: 'gray.700' }
            })}
          >
            ✕
          </button>
        </div>

        {/* 完了したTodoの情報 */}
        <div className={css({
          bg: 'green.50',
          border: '1px solid',
          borderColor: 'green.200',
          rounded: 'md',
          p: '4',
          mb: '4'
        })}>
          <h4 className={css({
            fontSize: 'lg',
            fontWeight: 'bold',
            color: 'green.800',
            mb: '2'
          })}>
            完了したタスク
          </h4>
          <div className={css({
            spaceY: '1',
            fontSize: 'sm',
            color: 'green.700'
          })}>
            <div><strong>タスク:</strong> {todo.task}</div>
                          <div><strong>学習時間:</strong> {todo.study_time}分</div>
            {todo.due_date && (
              <div><strong>期限:</strong> {todo.due_date}</div>
            )}
            <div><strong>完了日時:</strong> {new Date().toLocaleString('ja-JP')}</div>
          </div>
        </div>

        {/* 投稿フォーム */}
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
              学習成果の投稿
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={generateDefaultContent(todo)}
              rows={6}
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
            <div className={css({
              mt: '2',
              fontSize: 'xs',
              color: 'gray.500'
            })}>
              💡 学習の感想や学んだことを書いてみましょう！
            </div>
          </div>

          {/* ハッシュタグプレビュー */}
          {extractHashtags(content).length > 0 && (
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
                {extractHashtags(content).map(tag => (
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

          {/* アクションボタン */}
          <div className={css({
            display: 'flex',
            gap: '3',
            pt: '4'
          })}>
            <button
              type="button"
              onClick={handleClose}
              className={css({
                px: '4',
                py: '2',
                bg: 'gray.100',
                color: 'gray.700',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                _hover: { bg: 'gray.200' },
                transition: 'all 0.2s'
              })}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className={css({
                px: '6',
                py: '2',
                bg: 'green.600',
                color: 'white',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                _hover: { bg: 'green.700' },
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
      </div>
    </div>
  );
}
