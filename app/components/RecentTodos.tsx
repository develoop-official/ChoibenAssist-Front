'use client';

import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';

import LoadingSpinner from './ui/LoadingSpinner';

interface CompletedTodo {
  id: string;
  title: string;
  description?: string;
  priority: string;
  completed_at: string;
  created_at: string;
}

interface RecentTodosProps {
  userId: string;
  limit?: number;
}

export default function RecentTodos({ userId, limit = 10 }: RecentTodosProps) {
  const [completedTodos, setCompletedTodos] = useState<CompletedTodo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompletedTodos = useCallback(async () => {
    if (!supabase || !userId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('todo_items')
        .select('id, title, description, priority, completed_at, created_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setCompletedTodos(data || []);
    } catch (error) {
      console.error('完了済みTODO取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchCompletedTodos();
  }, [fetchCompletedTodos]);

  const getPriorityColor = (priority: string) => {
    const colors = {
      '高': 'red.500',
      '中': 'amber.500',
      '低': 'green.500'
    };
    return colors[priority as keyof typeof colors] || 'gray.500';
  };

  const getPriorityBg = (priority: string) => {
    const colors = {
      '高': 'red.50',
      '中': 'amber.50',
      '低': 'green.50'
    };
    return colors[priority as keyof typeof colors] || 'gray.50';
  };

  if (loading) {
    return (
      <div className={css({
        bg: 'white',
        rounded: '2xl',
        shadow: 'md',
        p: '6',
        border: '1px solid',
        borderColor: 'gray.100'
      })}>
        <h3 className={css({
          fontSize: 'xl',
          fontWeight: 'bold',
          color: 'gray.900',
          mb: '4'
        })}>
          最近完了したTODO
        </h3>
        <div className={css({
          display: 'flex',
          justifyContent: 'center',
          py: '8'
        })}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className={css({
      bg: 'white',
      rounded: '2xl',
      shadow: 'md',
      p: '6',
      border: '1px solid',
      borderColor: 'gray.100'
    })}>
      <div className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: '4'
      })}>
        <h3 className={css({
          fontSize: 'xl',
          fontWeight: 'bold',
          color: 'gray.900'
        })}>
          最近完了したTODO
        </h3>
        <span className={css({
          bg: 'primary.50',
          color: 'primary.700',
          px: '3',
          py: '1',
          rounded: 'full',
          fontSize: 'sm',
          fontWeight: 'medium'
        })}>
          {completedTodos.length}件
        </span>
      </div>

      {completedTodos.length === 0 ? (
        <div className={css({
          textAlign: 'center',
          py: '8',
          color: 'gray.500'
        })}>
          <div className={css({
            fontSize: '3xl',
            mb: '2'
          })}>
            📝
          </div>
          <p>完了したTODOがありません</p>
          <p className={css({
            fontSize: 'sm',
            mt: '1'
          })}>
            TODOを完了すると、ここに表示されます
          </p>
        </div>
      ) : (
        <div className={css({
          spaceY: '3',
          maxH: '96',
          overflowY: 'auto'
        })}>
          {completedTodos.map((todo) => (
            <div
              key={todo.id}
              className={css({
                p: '4',
                border: '1px solid',
                borderColor: 'gray.200',
                rounded: 'lg',
                _hover: { borderColor: 'primary.300', shadow: 'sm' },
                transition: 'all 0.2s'
              })}
            >
              <div className={css({
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'space-between',
                gap: '3'
              })}>
                <div className={css({ flex: '1' })}>
                  <div className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    mb: '2'
                  })}>
                    <h4 className={css({
                      fontWeight: 'semibold',
                      color: 'gray.900',
                      textDecoration: 'line-through',
                      textDecorationColor: 'gray.400'
                    })}>
                      {todo.title}
                    </h4>
                    <span
                      className={css({
                        px: '2',
                        py: '0.5',
                        rounded: 'md',
                        fontSize: 'xs',
                        fontWeight: 'medium',
                        color: getPriorityColor(todo.priority),
                        bg: getPriorityBg(todo.priority)
                      })}
                    >
                      {todo.priority}
                    </span>
                  </div>

                  {todo.description && (
                    <p className={css({
                      color: 'gray.600',
                      fontSize: 'sm',
                      mb: '2',
                      lineHeight: 'relaxed'
                    })}>
                      {todo.description}
                    </p>
                  )}

                  <div className={css({
                    display: 'flex',
                    gap: '4',
                    fontSize: 'xs',
                    color: 'gray.500'
                  })}>
                    <span>
                      完了: {dayjs(todo.completed_at).format('MM/DD HH:mm')}
                    </span>
                    <span>
                      作成: {dayjs(todo.created_at).format('MM/DD')}
                    </span>
                  </div>
                </div>

                <div className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  w: '8',
                  h: '8',
                  bg: 'green.50',
                  color: 'green.600',
                  rounded: 'full',
                  fontSize: 'lg',
                  flexShrink: '0'
                })}>
                  ✓
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {completedTodos.length >= limit && (
        <div className={css({
          textAlign: 'center',
          mt: '4',
          pt: '4',
          borderTop: '1px solid',
          borderTopColor: 'gray.200'
        })}>
          <button
            onClick={() => fetchCompletedTodos()}
            className={css({
              px: '4',
              py: '2',
              bg: 'primary.50',
              color: 'primary.700',
              rounded: 'md',
              fontSize: 'sm',
              fontWeight: 'medium',
              _hover: { bg: 'primary.100' },
              border: 'none',
              cursor: 'pointer'
            })}
          >
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
}
