'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import { supabase } from '../lib/supabase';
import { css } from '../styled-system/css';
import { useAuth } from './hooks/useAuth';
import { TodoItem } from './types/todo-item';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newStudyTime, setNewStudyTime] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTodos = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase!
        .from('todo_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('TODO取得エラー:', error);
        return;
      }

      setTodos(data || []);
    } catch (err) {
      console.error('TODO取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user, fetchTodos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTodo.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const studyTime = parseFloat(newStudyTime) || 0;

      const { error } = await supabase!
        .from('todo_items')
        .insert({
          user_id: user.id,
          task: newTodo.trim(),
          study_time: studyTime,
          due_date: newDueDate || null,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('TODO作成エラー:', error);
        alert('TODOの作成に失敗しました。');
        return;
      }

      setNewTodo('');
      setNewStudyTime('');
      setNewDueDate('');
      fetchTodos();
    } catch (err) {
      console.error('TODO作成エラー:', err);
      alert('TODOの作成に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTodo = async (todoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase!
        .from('todo_items')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', todoId)
        .eq('user_id', user.id);

      if (error) {
        console.error('TODO完了エラー:', error);
        alert('TODOの完了に失敗しました。');
        return;
      }

      // 完了アニメーションを表示
      const todoElement = document.getElementById(`todo-${todoId}`);
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
        router.push(`/timeline?completed_todo=${todoId}`);
      }, 1000);

    } catch (err) {
      console.error('TODO完了エラー:', err);
      alert('TODOの完了に失敗しました。');
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!user || !confirm('このTODOを削除しますか？')) return;

    try {
      const { error } = await supabase!
        .from('todo_items')
        .delete()
        .eq('id', todoId)
        .eq('user_id', user.id);

      if (error) {
        console.error('TODO削除エラー:', error);
        alert('TODOの削除に失敗しました。');
        return;
      }

      fetchTodos();
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
          mb: '8',
          textAlign: 'center'
        })}>
          <h1 className={css({
            fontSize: '3xl',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '2'
          })}>
            ちょい勉ダッシュボード
          </h1>
          <p className={css({
            fontSize: 'lg',
            color: 'gray.600'
          })}>
            学習タスクを管理して、効率的に勉強を進めましょう
          </p>
        </div>

        {/* 新しいTODO作成フォーム */}
        <div className={css({
          bg: 'white',
          rounded: 'lg',
          shadow: 'md',
          p: '6',
          mb: '8'
        })}>
          <h2 className={css({
            fontSize: 'xl',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '4'
          })}>
            新しいTODOを作成
          </h2>
          <form onSubmit={handleSubmit} className={css({
            spaceY: '4'
          })}>
            <div>
              <label className={css({
                display: 'block',
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'gray.700',
                mb: '2'
              })}>
                タスク
              </label>
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="学習したい内容を入力してください"
                className={css({
                  w: 'full',
                  p: '3',
                  border: '1px solid',
                  borderColor: 'gray.300',
                  rounded: 'md',
                  fontSize: 'sm',
                  _focus: {
                    outline: 'none',
                    borderColor: 'blue.500',
                    ring: '1px',
                    ringColor: 'blue.500'
                  }
                })}
                required
              />
            </div>
            <div className={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                  予定学習時間（時間）
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={newStudyTime}
                  onChange={(e) => setNewStudyTime(e.target.value)}
                  placeholder="2.5"
                  className={css({
                    w: 'full',
                    p: '3',
                    border: '1px solid',
                    borderColor: 'gray.300',
                    rounded: 'md',
                    fontSize: 'sm',
                    _focus: {
                      outline: 'none',
                      borderColor: 'blue.500',
                      ring: '1px',
                      ringColor: 'blue.500'
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
                  期限
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className={css({
                    w: 'full',
                    p: '3',
                    border: '1px solid',
                    borderColor: 'gray.300',
                    rounded: 'md',
                    fontSize: 'sm',
                    _focus: {
                      outline: 'none',
                      borderColor: 'blue.500',
                      ring: '1px',
                      ringColor: 'blue.500'
                    }
                  })}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !newTodo.trim()}
              className={css({
                w: 'full',
                py: '3',
                bg: 'blue.600',
                color: 'white',
                rounded: 'md',
                fontSize: 'md',
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
              {isSubmitting ? '作成中...' : 'TODOを作成'}
            </button>
          </form>
        </div>

        {/* TODO一覧 */}
        <div className={css({
          bg: 'white',
          rounded: 'lg',
          shadow: 'md',
          p: '6'
        })}>
          <h2 className={css({
            fontSize: 'xl',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '4'
          })}>
            TODO一覧
          </h2>
          {isLoading ? (
            <div className={css({
              textAlign: 'center',
              py: '8'
            })}>
              <div className={css({
                w: '8',
                h: '8',
                border: '4px solid',
                borderColor: 'gray.200',
                borderTopColor: 'blue.600',
                rounded: 'full',
                animation: 'spin 1s linear infinite',
                mx: 'auto'
              })} />
              <p className={css({
                mt: '4',
                color: 'gray.600'
              })}>
                読み込み中...
              </p>
            </div>
          ) : todos.length === 0 ? (
            <div className={css({
              textAlign: 'center',
              py: '8'
            })}>
              <p className={css({
                color: 'gray.600',
                mb: '4'
              })}>
                まだTODOがありません
              </p>
              <p className={css({
                fontSize: 'sm',
                color: 'gray.500'
              })}>
                上記のフォームで新しいTODOを作成してください
              </p>
            </div>
          ) : (
            <div className={css({
              spaceY: '4'
            })}>
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  id={`todo-${todo.id}`}
                  className={css({
                    p: '4',
                    border: '1px solid',
                    borderColor: 'gray.200',
                    rounded: 'lg',
                    bg: todo.status === 'completed' ? 'green.50' : 'white',
                    transition: 'all 0.2s',
                    _hover: {
                      shadow: 'md'
                    }
                  })}
                >
                  <div className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '4'
                  })}>
                    <div className={css({
                      flex: '1'
                    })}>
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
                        <Link
                          href={`/todoList/${todo.id}`}
                          className={css({
                            fontSize: 'lg',
                            fontWeight: 'medium',
                            color: todo.status === 'completed' ? 'green.800' : 'gray.900',
                            textDecoration: 'none',
                            _hover: {
                              textDecoration: 'underline'
                            }
                          })}
                        >
                          {todo.task}
                        </Link>
                      </div>
                      <div className={css({
                        display: 'flex',
                        gap: '4',
                        fontSize: 'sm',
                        color: 'gray.600'
                      })}>
                        <span>学習時間: {todo.study_time}時間</span>
                        {todo.due_date && (
                          <span>期限: {new Date(todo.due_date).toLocaleDateString('ja-JP')}</span>
                        )}
                        <span>作成日: {new Date(todo.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                    <div className={css({
                      display: 'flex',
                      gap: '2'
                    })}>
                      {todo.status === 'pending' && (
                        <button
                          onClick={() => handleCompleteTodo(todo.id)}
                          className={css({
                            px: '3',
                            py: '1',
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
                          px: '3',
                          py: '1',
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
                        onClick={() => handleDeleteTodo(todo.id)}
                        className={css({
                          px: '3',
                          py: '1',
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
