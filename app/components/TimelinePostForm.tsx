'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
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
${data.study_time}時間

${data.goal ? `### 🎯 学習目標\n${data.goal}\n` : ''}
### 💡 学習内容・感想
（ここに学習内容や感想を書いてください）

### 🏷️ タグ
#学習完了 #${data.study_time}時間学習${data.goal ? ' #目標達成' : ''}`;
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

  // MarkdownをHTMLに変換する簡単な関数
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-800 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/#(\w+)/g, '<span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2 mb-1">#$1</span>')
      .replace(/\n/g, '<br>');
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
            タスク: {completedTodo.task} | 学習時間: {completedTodo.study_time}時間
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
            <div className={css({
              display: 'flex',
              gap: '2'
            })}>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className={css({
                  px: '3',
                  py: '1',
                  bg: !showPreview ? 'blue.500' : 'gray.200',
                  color: !showPreview ? 'white' : 'gray.700',
                  rounded: 'md',
                  fontSize: 'xs',
                  fontWeight: 'medium',
                  _hover: { bg: !showPreview ? 'blue.600' : 'gray.300' }
                })}
              >
                編集
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className={css({
                  px: '3',
                  py: '1',
                  bg: showPreview ? 'blue.500' : 'gray.200',
                  color: showPreview ? 'white' : 'gray.700',
                  rounded: 'md',
                  fontSize: 'xs',
                  fontWeight: 'medium',
                  _hover: { bg: showPreview ? 'blue.600' : 'gray.300' }
                })}
              >
                プレビュー
              </button>
            </div>
          </div>
          
          {!showPreview ? (
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`## 📚 学習完了報告

### ✅ 完了したタスク
（完了したタスクを書いてください）

### ⏱️ 学習時間
（学習時間を書いてください）

### 💡 学習内容・感想
（学習内容や感想を書いてください）

### 🏷️ タグ
#学習完了 #プログラミング`}
              rows={12}
              className={css({
                w: 'full',
                p: '4',
                border: '1px solid',
                borderColor: 'gray.300',
                rounded: 'lg',
                fontSize: 'sm',
                fontFamily: 'monospace',
                resize: 'vertical',
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
              <div 
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                className={css({
                  '& h1': { fontSize: 'xl', fontWeight: 'bold', color: 'gray.900', mb: '3' },
                  '& h2': { fontSize: 'lg', fontWeight: 'bold', color: 'gray.800', mb: '2' },
                  '& h3': { fontSize: 'md', fontWeight: 'bold', color: 'gray.700', mb: '2' },
                  '& p': { mb: '2', lineHeight: 'relaxed' },
                  '& strong': { fontWeight: 'bold' },
                  '& em': { fontStyle: 'italic' },
                  '& code': { bg: 'gray.100', px: '1', py: '0.5', rounded: 'sm', fontSize: 'xs' },
                  '& br': { display: 'block', content: '""', marginTop: '0.5rem' }
                })}
              />
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

        {/* 投稿ガイド */}
        <div className={css({
          bg: 'blue.50',
          border: '1px solid',
          borderColor: 'blue.200',
          rounded: 'lg',
          p: '3'
        })}>
          <h4 className={css({
            fontSize: 'sm',
            fontWeight: 'bold',
            color: 'blue.800',
            mb: '2'
          })}>
            📝 投稿のコツ
          </h4>
          <ul className={css({
            spaceY: '1',
            fontSize: 'xs',
            color: 'blue.700'
          })}>
            <li>• セクションごとに整理して読みやすく</li>
            <li>• 学習時間や達成感を具体的に</li>
            <li>• ハッシュタグで検索されやすく</li>
            <li>• **太字**や*斜体*で強調</li>
          </ul>
        </div>

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
