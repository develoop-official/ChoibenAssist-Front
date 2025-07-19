'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { css } from '../../../styled-system/css';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useTodos } from '../../hooks/useTodos';

export default function CreateTodoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addTodo } = useTodos();

  const [formData, setFormData] = useState({
    task: '',
    due_date: '',
    study_time: 1, // デフォルト1時間
    status: 'pending' as const
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 未認証の場合はログインページにリダイレクト
  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.task.trim()) {
      setError('タスクを入力してください');
      return;
    }

    if (formData.study_time <= 0) {
      setError('学習時間は0より大きい値を入力してください');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await addTodo({
        task: formData.task.trim(),
        due_date: formData.due_date || undefined,
        study_time: formData.study_time,
        status: formData.status
      });

      router.push('/todoList');
    } catch {
      setError('TODOの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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

  return (
    <main className={css({
      maxW: '2xl',
      mx: 'auto',
      px: '4',
      py: '8'
    })}>
      <div className={css({
        mb: '8'
      })}>
        <h1 className={css({
          fontSize: '2xl',
          fontWeight: 'bold',
          color: 'primary.700',
          mb: '2'
        })}>
          新しいTODOを作成
        </h1>
        <p className={css({
          color: 'gray.600'
        })}>
          学習タスクと学習時間を設定してください
        </p>
      </div>

      <form onSubmit={handleSubmit} className={css({
        bg: 'white',
        rounded: 'xl',
        shadow: 'md',
        border: '1px solid',
        borderColor: 'gray.200',
        p: '6',
        spaceY: '6'
      })}>
        <div>
          <label className={css({
            display: 'block',
            fontSize: 'sm',
            fontWeight: 'medium',
            color: 'gray.700',
            mb: '2'
          })}>
            タスク *
          </label>
          <textarea
            value={formData.task}
            onChange={(e) => setFormData(prev => ({ ...prev, task: e.target.value }))}
            placeholder="学習する内容を入力してください"
            required
            rows={3}
            className={css({
              w: 'full',
              px: '3',
              py: '2',
              border: '1px solid',
              borderColor: 'gray.300',
              rounded: 'md',
              fontSize: 'sm',
              resize: 'vertical',
              _focus: {
                outline: 'none',
                borderColor: 'primary.500',
                ring: '1px',
                ringColor: 'primary.500'
              }
            })}
          />
        </div>

        <div className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', md: '1fr 1fr' },
          gap: '4'
        })}>
          <div>
            <label className={css({
              display: 'block',
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.700',
              mb: '2'
            })}>
              期限
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className={css({
                w: 'full',
                px: '3',
                py: '2',
                border: '1px solid',
                borderColor: 'gray.300',
                rounded: 'md',
                fontSize: 'sm',
                _focus: {
                  outline: 'none',
                  borderColor: 'primary.500',
                  ring: '1px',
                  ringColor: 'primary.500'
                }
              })}
            />
          </div>

          <div>
            <label className={css({
              display: 'block',
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.700',
              mb: '2'
            })}>
              学習時間（時間） *
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={formData.study_time}
              onChange={(e) => setFormData(prev => ({ ...prev, study_time: parseFloat(e.target.value) || 0 }))}
              required
              className={css({
                w: 'full',
                px: '3',
                py: '2',
                border: '1px solid',
                borderColor: 'gray.300',
                rounded: 'md',
                fontSize: 'sm',
                _focus: {
                  outline: 'none',
                  borderColor: 'primary.500',
                  ring: '1px',
                  ringColor: 'primary.500'
                }
              })}
            />
          </div>
        </div>

        {error && (
          <div className={css({
            p: '3',
            bg: 'red.50',
            border: '1px solid',
            borderColor: 'red.200',
            rounded: 'md',
            color: 'red.700',
            fontSize: 'sm'
          })}>
            {error}
          </div>
        )}

        <div className={css({
          display: 'flex',
          gap: '4',
          pt: '4'
        })}>
          <button
            type="button"
            onClick={() => router.push('/todoList')}
            className={css({
              px: '4',
              py: '2',
              bg: 'gray.100',
              color: 'gray.700',
              rounded: 'md',
              fontSize: 'sm',
              fontWeight: 'medium',
              _hover: { bg: 'gray.200' }
            })}
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className={css({
              px: '4',
              py: '2',
              bg: 'primary.600',
              color: 'white',
              rounded: 'md',
              fontSize: 'sm',
              fontWeight: 'medium',
              _hover: { bg: 'primary.700' },
              _disabled: {
                opacity: '0.5',
                cursor: 'not-allowed'
              }
            })}
          >
            {loading ? '作成中...' : 'TODOを作成'}
          </button>
        </div>
      </form>
    </main>
  );
}
