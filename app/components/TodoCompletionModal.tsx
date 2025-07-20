'use client';

import React, { useState, useEffect } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import MarkdownRenderer from './ui/MarkdownRenderer';
import { useAuth } from '../hooks/useAuth';
import { TodoItem } from '../types/todo-item';

interface TodoCompletionModalProps {
  todo: TodoItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

// パーティクルコンポーネント
const ConfettiParticle = ({ delay, duration, left, color }: {
  delay: number;
  duration: number;
  left: number;
  color: string;
}) => (
  <div
    className={css({
      position: 'absolute',
      top: '-10px',
      left: `${left}%`,
      width: '8px',
      height: '8px',
      backgroundColor: color,
      borderRadius: '50%',
      zIndex: '1001'
    })}
    style={{
      animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`
    }}
  />
);

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // モーダルが開いた時にパーティクルアニメーションを開始
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // 3秒後にパーティクルを停止
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // taskフィールドからタイトルと内容を分離
  const parseTask = (task: string) => {
    const parts = task.split(' - ');
    return {
      title: parts[0],
      content: parts.slice(1).join(' - ')
    };
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  };

  const generateDefaultContent = (todo: TodoItem) => {
    const { title, content } = parseTask(todo.task);
    const hashtags = ['学習完了', 'TODO完了'];
    if (todo.study_time > 0) {
      hashtags.push(`${todo.study_time}分学習`);
    }
    if (todo.due_date) {
      hashtags.push('期限達成');
    }

    return `## 📚 学習完了報告

### ✅ 完了したタスク
${title}

${content ? `### 📝 タスク詳細\n${content}\n` : ''}
### ⏱️ 学習時間
${todo.study_time}分

${todo.goal ? `### 🎯 学習目標\n${todo.goal}\n` : ''}
### 💡 学習内容・感想
（ここに学習内容や感想を書いてください）

### 🏷️ タグ
#学習完了 #${todo.study_time}分学習${todo.goal ? ' #目標達成' : ''}`;
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
    setShowPreview(false);
    setIsFocused(false);
    onClose();
  };

  if (!isOpen || !todo) return null;

  // パーティクルの色と位置をランダムに生成
  const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    left: Math.random() * 100,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
  }));

  const hashtags = extractHashtags(content);

  return (
    <>
      {/* グローバルCSSアニメーション */}
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg);
          }
        }
        
        @keyframes modal-bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-50px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes text-glow {
          0% {
            text-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
          }
          100% {
            text-shadow: 0 0 20px rgba(34, 197, 94, 0.8);
          }
        }
        
        @keyframes slide-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes tag-bounce {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>

      {/* パーティクルアニメーション */}
      {showConfetti && (
        <div className={css({
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          pointerEvents: 'none',
          zIndex: '1002'
        })}>
          {particles.map(particle => (
            <ConfettiParticle
              key={particle.id}
              delay={particle.delay}
              duration={particle.duration}
              left={particle.left}
              color={particle.color}
            />
          ))}
        </div>
      )}

      {/* メインモーダル */}
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
        <div 
          className={css({
            bg: 'white',
            rounded: 'lg',
            p: '6',
            maxW: '2xl',
            w: 'full',
            maxH: '90vh',
            overflowY: 'auto',
            shadow: 'xl',
            transform: 'scale(1)'
          })}
          style={{ animation: 'modal-bounce-in 0.6s ease-out' }}
        >
          {/* ヘッダー */}
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: '4'
          })}>
            <h3 
              className={css({
                fontSize: 'xl',
                fontWeight: 'bold',
                color: 'green.700'
              })}
              style={{ animation: 'text-glow 2s ease-in-out infinite alternate' }}
            >
              🎉 学習完了！投稿しましょう
            </h3>
            <button
              onClick={handleClose}
              className={css({
                p: '2',
                color: 'gray.500',
                _hover: { color: 'gray.700' },
                transition: 'color 0.2s'
              })}
            >
              ✕
            </button>
          </div>

          {/* 完了したTodoの情報 */}
          <div 
            className={css({
              bg: 'green.50',
              border: '1px solid',
              borderColor: 'green.200',
              rounded: 'md',
              p: '4',
              mb: '4'
            })}
            style={{ animation: 'slide-in-up 0.8s ease-out' }}
          >
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
              <div>
                <MarkdownRenderer 
                  content={parseTask(todo.task).title}
                  className={css({
                    fontSize: 'inherit',
                    color: 'inherit',
                    display: 'inline',
                    ml: '0'
                  })}
                />
              </div>
              {parseTask(todo.task).content && (
                <div>
                  <MarkdownRenderer 
                    content={parseTask(todo.task).content}
                    className={css({
                      fontSize: 'inherit',
                      color: 'inherit',
                      display: 'inline',
                      ml: '0'
                    })}
                  />
                </div>
              )}
              <div><strong>学習時間:</strong> {todo.study_time}分</div>
              {todo.due_date && (
                <div><strong>期限:</strong> {todo.due_date}</div>
              )}
              <div><strong>完了日時:</strong> {new Date().toLocaleString('ja-JP')}</div>
            </div>
          </div>

          {/* 投稿フォーム */}
          <form 
            onSubmit={handleSubmit} 
            className={css({
              spaceY: '4'
            })}
            style={{ animation: 'slide-in-up 1s ease-out' }}
          >
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
                  学習成果の投稿
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
                  placeholder={generateDefaultContent(todo)}
                  rows={isFocused || content.trim() ? 12 : 6}
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
              <div className={css({
                mt: '2',
                fontSize: 'xs',
                color: 'gray.500'
              })}>
                💡 マークダウンで書けて、ハッシュタグ(#)も使えます！
              </div>
            </div>

            {/* ハッシュタグプレビュー */}
            {hashtags.length > 0 && (
              <div style={{ animation: 'fade-in 0.5s ease-out' }}>
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
                      style={{ animation: 'tag-bounce 0.6s ease-out' }}
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
                style={{ animation: 'pulse 2s infinite' }}
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
    </>
  );
}
