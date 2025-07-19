'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import { supabase } from '../../../lib/supabase';
import { css } from '../../../styled-system/css';
import { useAuth } from '../../hooks/useAuth';
import { TodoItem } from '../../types/todo-item';

export default function TodoDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const todoId = params.id as string;

  const [todo, setTodo] = useState<TodoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodo = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase!
        .from('todo_items')
        .select('*')
        .eq('id', todoId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('TODO取得エラー:', error);
        setError('TODOの取得に失敗しました。');
        return;
      }

      setTodo(data);
    } catch (err) {
      console.error('TODO取得エラー:', err);
      setError('TODOの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [user, todoId]);

  useEffect(() => {
    if (todoId) {
      fetchTodo();
    }
  }, [todoId, fetchTodo]);

  const handleCompleteTodo = async () => {
    if (!user || !todo) return;

    try {
      const { error } = await supabase!
        .from('todo_items')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', todo.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('TODO完了エラー:', error);
        alert('TODOの完了に失敗しました。');
        return;
      }

      // 完了アニメーションを表示
      const todoElement = document.getElementById('todo-detail');
      if (todoElement) {
        todoElement.style.transition = 'all 0.5s ease';
        todoElement.style.backgroundColor = '#10b981';
        todoElement.style.color = 'white';
        todoElement.style.transform = 'scale(1.02)';

        setTimeout(() => {
          todoElement.style.transform = 'scale(1)';
        }, 500);
      }

      // タイムラインに遷移
      setTimeout(() => {
        router.push(`/timeline?completed_todo=${todo.id}`);
      }, 1000);

    } catch (err) {
      console.error('TODO完了エラー:', err);
      alert('TODOの完了に失敗しました。');
    }
  };

  const handleDeleteTodo = async () => {
    if (!user || !todo || !confirm('このTODOを削除しますか？')) return;

    try {
      const { error } = await supabase!
        .from('todo_items')
        .delete()
        .eq('id', todo.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('TODO削除エラー:', error);
        alert('TODOの削除に失敗しました。');
        return;
      }

      router.push('/');
    } catch (err) {
      console.error('TODO削除エラー:', err);
      alert('TODOの削除に失敗しました。');
    }
  };

  if (!user) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.50'
      })}>
        <div className={css({
          textAlign: 'center',
          p: '8'
        })}>
          <h1 className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '4'
          })}>
            ログインが必要です
          </h1>
          <Link
            href="/login"
            className={css({
              display: 'inline-block',
              px: '6',
              py: '3',
              bg: 'blue.600',
              color: 'white',
              rounded: 'lg',
              fontSize: 'md',
              fontWeight: 'medium',
              textDecoration: 'none',
              transition: 'all 0.2s',
              _hover: { bg: 'blue.700' }
            })}
          >
            ログインする
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.50'
      })}>
        <div className={css({
          textAlign: 'center'
        })}>
          <div className={css({
            w: '8',
            h: '8',
            border: '4px solid',
            borderColor: 'gray.200',
            borderTopColor: 'blue.600',
            rounded: 'full',
            animation: 'spin 1s linear infinite',
            mx: 'auto',
            mb: '4'
          })} />
          <p className={css({
            color: 'gray.600'
          })}>
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.50'
      })}>
        <div className={css({
          textAlign: 'center',
          p: '8'
        })}>
          <h1 className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '4'
          })}>
            TODOが見つかりません
          </h1>
          <p className={css({
            color: 'gray.600',
            mb: '6'
          })}>
            {error || '指定されたTODOは存在しないか、削除された可能性があります。'}
          </p>
          <Link
            href="/"
            className={css({
              display: 'inline-block',
              px: '6',
              py: '3',
              bg: 'blue.600',
              color: 'white',
              rounded: 'lg',
              fontSize: 'md',
              fontWeight: 'medium',
              textDecoration: 'none',
              transition: 'all 0.2s',
              _hover: { bg: 'blue.700' }
            })}
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={css({
      minH: '100vh',
      bg: 'gray.50',
      py: '8'
    })}>
      <div className={css({
        maxW: '4xl',
        mx: 'auto',
        px: '6'
      })}>
        {/* ヘッダー */}
        <div className={css({
          mb: '6',
          display: 'flex',
          alignItems: 'center',
          gap: '4'
        })}>
          <Link
            href="/"
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              px: '4',
              py: '2',
              bg: 'white',
              color: 'gray.700',
              rounded: 'lg',
              fontSize: 'sm',
              fontWeight: 'medium',
              textDecoration: 'none',
              transition: 'all 0.2s',
              shadow: 'sm',
              _hover: {
                bg: 'gray.50',
                shadow: 'md'
              }
            })}
          >
            <span>←</span>
            ダッシュボードに戻る
          </Link>
        </div>

        {/* TODO詳細 */}
        <div
          id="todo-detail"
          className={css({
            bg: 'white',
            rounded: 'lg',
            shadow: 'lg',
            overflow: 'hidden'
          })}
        >
          {/* TODOヘッダー */}
          <div className={css({
            p: '6',
            borderBottom: '1px solid',
            borderColor: 'gray.200'
          })}>
            <div className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: '4'
            })}>
              <div>
                <h1 className={css({
                  fontSize: '2xl',
                  fontWeight: 'bold',
                  color: 'gray.900',
                  mb: '2'
                })}>
                  {todo.task}
                </h1>
                <div className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  mb: '2'
                })}>
                  <span className={css({
                    fontSize: 'lg',
                    color: todo.status === 'completed' ? 'green.600' : 'gray.400'
                  })}>
                    {todo.status === 'completed' ? '✅' : '⭕'}
                  </span>
                  <span className={css({
                    fontSize: 'sm',
                    color: todo.status === 'completed' ? 'green.700' : 'gray.600',
                    fontWeight: 'medium'
                  })}>
                    {todo.status === 'completed' ? '完了' : '未完了'}
                  </span>
                </div>
              </div>
              <div className={css({
                display: 'flex',
                gap: '2'
              })}>
                {todo.status === 'pending' && (
                  <button
                    onClick={handleCompleteTodo}
                    className={css({
                      px: '4',
                      py: '2',
                      bg: 'green.600',
                      color: 'white',
                      rounded: 'md',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      transition: 'all 0.2s',
                      _hover: { bg: 'green.700' }
                    })}
                  >
                    完了
                  </button>
                )}
                <Link
                  href={`/todoList/${todo.id}/edit`}
                  className={css({
                    px: '4',
                    py: '2',
                    bg: 'blue.600',
                    color: 'white',
                    rounded: 'md',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    _hover: { bg: 'blue.700' }
                  })}
                >
                  編集
                </Link>
                <button
                  onClick={handleDeleteTodo}
                  className={css({
                    px: '4',
                    py: '2',
                    bg: 'red.600',
                    color: 'white',
                    rounded: 'md',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    transition: 'all 0.2s',
                    _hover: { bg: 'red.700' }
                  })}
                >
                  削除
                </button>
              </div>
            </div>
          </div>

          {/* TODO詳細情報 */}
          <div className={css({
            p: '6'
          })}>
            <div className={css({
              spaceY: '4'
            })}>
              <div>
                <h3 className={css({
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'gray.900',
                  mb: '2'
                })}>
                  学習時間
                </h3>
                <p className={css({
                  fontSize: 'md',
                  color: 'gray.700'
                })}>
                  {todo.study_time}時間
                </p>
              </div>

              {todo.due_date && (
                <div>
                  <h3 className={css({
                    fontSize: 'lg',
                    fontWeight: 'bold',
                    color: 'gray.900',
                    mb: '2'
                  })}>
                    期限
                  </h3>
                  <p className={css({
                    fontSize: 'md',
                    color: 'gray.700'
                  })}>
                    {new Date(todo.due_date).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              )}

              <div>
                <h3 className={css({
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'gray.900',
                  mb: '2'
                })}>
                  作成日
                </h3>
                <p className={css({
                  fontSize: 'md',
                  color: 'gray.700'
                })}>
                  {new Date(todo.created_at).toLocaleString('ja-JP')}
                </p>
              </div>

              {todo.updated_at && (
                <div>
                  <h3 className={css({
                    fontSize: 'lg',
                    fontWeight: 'bold',
                    color: 'gray.900',
                    mb: '2'
                  })}>
                    更新日
                  </h3>
                  <p className={css({
                    fontSize: 'md',
                    color: 'gray.700'
                  })}>
                    {new Date(todo.updated_at).toLocaleString('ja-JP')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
