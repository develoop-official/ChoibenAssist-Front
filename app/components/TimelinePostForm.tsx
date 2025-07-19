'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import { useAuth } from '../hooks/useAuth';

interface TimelinePostFormProps {
  completedTodoId?: string;
  onClose?: () => void;
}

export default function TimelinePostForm({ completedTodoId, onClose }: TimelinePostFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 完了したTODOの情報を取得
  useEffect(() => {
    const fetchCompletedTodo = async () => {
      if (!completedTodoId) return;

      try {
        const { data, error } = await supabase!
          .from('todo_items')
          .select('*')
          .eq('id', completedTodoId)
          .single();

        if (error) {
          console.error('完了TODO取得エラー:', error);
          return;
        }

        // 完了したTODOの情報を自動的にフォームに設定
        const todoInfo = `## 完了したTODO\n\n**タスク**: ${data.task}\n**学習時間**: ${data.study_time}時間\n${data.due_date ? `**期限**: ${data.due_date}\n` : ''}\n## 学習内容\n\n`;
        setContent(todoInfo);
      } catch (err) {
        console.error('完了TODO取得エラー:', err);
      }
    };

    fetchCompletedTodo();
  }, [completedTodoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase!
        .from('timeline_posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          todo_id: completedTodoId || null,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('投稿エラー:', error);
        alert('投稿に失敗しました。');
        return;
      }

      // 投稿成功後、タイムラインページにリダイレクト
      router.push('/timeline');
    } catch (err) {
      console.error('投稿エラー:', err);
      alert('投稿に失敗しました。');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className={css({
      maxW: '2xl',
      mx: 'auto',
      p: '6',
      bg: 'white',
      rounded: 'lg',
      shadow: 'lg'
    })}>
      <div className={css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: '6'
      })}>
        <h2 className={css({
          fontSize: '2xl',
          fontWeight: 'bold',
          color: 'gray.900'
        })}>
          学習成果を投稿
        </h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={css({
            px: '3',
            py: '2',
            bg: showPreview ? 'blue.600' : 'gray.200',
            color: showPreview ? 'white' : 'gray.700',
            rounded: 'md',
            fontSize: 'sm',
            fontWeight: 'medium',
            transition: 'all 0.2s',
            _hover: {
              bg: showPreview ? 'blue.700' : 'gray.300'
            }
          })}
        >
          {showPreview ? '編集' : 'プレビュー'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {showPreview ? (
          <div className={css({
            mb: '6',
            p: '4',
            bg: 'gray.50',
            rounded: 'md',
            border: '1px solid',
            borderColor: 'gray.200',
            minH: '64'
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
                }
              })}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>
        ) : (
          <div className={css({ mb: '6' })}>
            <label className={css({
              display: 'block',
              mb: '2',
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.700'
            })}>
              投稿内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="学習内容や感想をMarkdown形式で書いてください..."
              className={css({
                w: 'full',
                h: '64',
                p: '4',
                border: '1px solid',
                borderColor: 'gray.300',
                rounded: 'md',
                fontSize: 'sm',
                resize: 'vertical',
                fontFamily: 'mono',
                _focus: {
                  outline: 'none',
                  borderColor: 'blue.500',
                  ring: '1px',
                  ringColor: 'blue.500'
                }
              })}
              required
            />
            <div className={css({
              mt: '2',
              fontSize: 'xs',
              color: 'gray.500'
            })}>
              Markdown形式が使用できます（## 見出し、**太字**、*斜体*、`コード`など）
            </div>
          </div>
        )}

        <div className={css({
          display: 'flex',
          gap: '4',
          justifyContent: 'flex-end'
        })}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={css({
                px: '4',
                py: '2',
                bg: 'gray.200',
                color: 'gray.700',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                transition: 'all 0.2s',
                _hover: { bg: 'gray.300' }
              })}
            >
              キャンセル
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={css({
              px: '6',
              py: '2',
              bg: 'blue.600',
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
                bg: 'blue.700'
              }
            })}
          >
            {isSubmitting ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
}
