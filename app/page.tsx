'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { css } from '../styled-system/css';

import { generateGeneralTodo } from './actions/todo-actions';
import AiTodoSuggestion from './components/AiTodoSuggestion';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuth } from './hooks/useAuth';
import { useTodos } from './hooks/useTodos';
import { buttonStyles } from './styles/components';
import { CreateTodoItem } from './types/todo-item';
import { supabase } from '../lib/supabase';

interface TodoSuggestionResponse {
  success: boolean;
  content: string;
  response_type: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { todos, loading: todosLoading, addTodos } = useTodos();

  const [todoSuggestionForm, setTodoSuggestionForm] = useState({
    time_available: 60,
    recent_progress: '',
    weak_areas: '',
    daily_goal: ''
  });
  const [todoSuggestionLoading, setTodoSuggestionLoading] = useState(false);
  const [todoSuggestionResult, setTodoSuggestionResult] = useState<TodoSuggestionResponse | null>(null);
  const [todoSuggestionError, setTodoSuggestionError] = useState('');
  const [completingTodoId, setCompletingTodoId] = useState<string | null>(null);
  const [completedTodoId, setCompletedTodoId] = useState<string | null>(null);

  // 未認証の場合はログインページにリダイレクト
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // TODOリストから学習時間を計算（実際のstudy_timeを使用）
  const today = new Date();
  const todayTodos = todos.filter(todo => {
    const todoDate = new Date(todo.created_at);
    return todoDate.toDateString() === today.toDateString();
  });
  const todayTotalMinutes = todayTodos.reduce((total, todo) => total + (todo.study_time * 60), 0);

  // 今週の学習時間を計算
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekTodos = todos.filter(todo => {
    const todoDate = new Date(todo.created_at);
    return todoDate >= weekStart;
  });
  const weekTotalMinutes = weekTodos.reduce((total, todo) => total + (todo.study_time * 60), 0);

  // 今月の学習時間を計算
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthTodos = todos.filter(todo => {
    const todoDate = new Date(todo.created_at);
    return todoDate >= monthStart;
  });
  const monthTotalMinutes = monthTodos.reduce((total, todo) => total + (todo.study_time * 60), 0);

  // 完了したTODOの数
  const completedTodos = todos.filter(todo => todo.status === 'completed');

  const handleTodoSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoSuggestionForm.time_available || todoSuggestionForm.time_available < 1 || todoSuggestionForm.time_available > 480) {
      setTodoSuggestionError('勉強時間は1分〜480分の間で指定してください。');
      return;
    }
    try {
      setTodoSuggestionLoading(true);
      setTodoSuggestionError('');
      setTodoSuggestionResult(null);

      // 実際のAI APIを呼び出し
      const weakAreasArray = todoSuggestionForm.weak_areas
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const result = await generateGeneralTodo(
        todoSuggestionForm.time_available,
        todoSuggestionForm.recent_progress,
        weakAreasArray,
        todoSuggestionForm.daily_goal
      );

      setTodoSuggestionResult(result);
    } catch (_err) {
      console.error('TODO提案エラー:', _err);
      setTodoSuggestionError('TODO提案の取得に失敗しました。');
    } finally {
      setTodoSuggestionLoading(false);
    }
  };

  const handleAddToTodoList = async (todos: CreateTodoItem[]) => {
    try {
      await addTodos(todos);
      alert('TODOリストに追加しました！');
    } catch (_err) {
      console.error('TODO追加エラー:', _err);
      alert('TODOリストへの追加に失敗しました');
    }
  };

  const handleCompleteTodo = async (todoId: string) => {
    try {
      setCompletingTodoId(todoId);
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      const { error } = await supabase
        .from('todo_items')
        .update({ status: 'completed' })
        .eq('id', todoId);

      if (error) {
        throw error;
      }

      // 完了アニメーションを表示
      setCompletedTodoId(todoId);
      setCompletingTodoId(null);
      
      // 2秒後にタイムラインに遷移
      setTimeout(() => {
        setCompletedTodoId(null);
        router.push(`/timeline?completed_todo=${todoId}`);
      }, 2000);
    } catch (error) {
      console.error('TODO完了エラー:', error);
      alert('TODOの完了に失敗しました');
      setCompletingTodoId(null);
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

  if (!user) {
    return null; // リダイレクト中
  }

  return (
    <div className={css({
      minH: '100vh',
      bg: 'primary.50',
      py: '8',
      px: { base: '4', md: '6', lg: '8' }
    })}>
      <div className={css({
        maxW: '4xl',
        mx: 'auto'
      })}>
        {/* ヘッダー */}
        <div className={css({
          mb: '8',
          textAlign: 'center'
        })}>
          <h1 className={css({
            fontSize: '4xl',
            fontWeight: 'bold',
            color: 'primary.700',
            mb: '4'
          })}>
            🏠 マイダッシュボード
          </h1>
          <p className={css({
            fontSize: 'lg',
            color: 'gray.600'
          })}>
            今日の学習を管理し、目標に向かって進もう！
          </p>
        </div>

        {/* 統計カード */}
        <div className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: { base: '4', md: '6' },
          mb: '8',
          maxW: '3xl',
          mx: 'auto'
        })}>
          <div className={css({
            bg: 'white',
            rounded: 'xl',
            p: '6',
            shadow: 'md',
            border: '1px solid',
            borderColor: 'primary.100'
          })}>
            <div className={css({
              textAlign: 'center'
            })}>
              <div className={css({
                fontSize: '3xl',
                fontWeight: 'bold',
                color: 'primary.600',
                mb: '2'
              })}>
                {Math.floor(todayTotalMinutes / 60)}h {todayTotalMinutes % 60}m
              </div>
              <div className={css({
                fontSize: 'sm',
                color: 'gray.600'
              })}>
                今日の学習時間
              </div>
            </div>
          </div>

          <div className={css({
            bg: 'white',
            rounded: 'xl',
            p: '6',
            shadow: 'md',
            border: '1px solid',
            borderColor: 'primary.100'
          })}>
            <div className={css({
              textAlign: 'center'
            })}>
              <div className={css({
                fontSize: '3xl',
                fontWeight: 'bold',
                color: 'primary.600',
                mb: '2'
              })}>
                {Math.floor(weekTotalMinutes / 60)}h {weekTotalMinutes % 60}m
              </div>
              <div className={css({
                fontSize: 'sm',
                color: 'gray.600'
              })}>
                今週の学習時間
              </div>
            </div>
          </div>

          <div className={css({
            bg: 'white',
            rounded: 'xl',
            p: '6',
            shadow: 'md',
            border: '1px solid',
            borderColor: 'primary.100'
          })}>
            <div className={css({
              textAlign: 'center'
            })}>
              <div className={css({
                fontSize: '3xl',
                fontWeight: 'bold',
                color: 'primary.600',
                mb: '2'
              })}>
                {Math.floor(monthTotalMinutes / 60)}h {monthTotalMinutes % 60}m
              </div>
              <div className={css({
                fontSize: 'sm',
                color: 'gray.600'
              })}>
                今月の学習時間
              </div>
            </div>
          </div>

          <div className={css({
            bg: 'white',
            rounded: 'xl',
            p: '6',
            shadow: 'md',
            border: '1px solid',
            borderColor: 'primary.100'
          })}>
            <div className={css({
              textAlign: 'center'
            })}>
              <div className={css({
                fontSize: '3xl',
                fontWeight: 'bold',
                color: 'green.600',
                mb: '2'
              })}>
                {completedTodos.length}
              </div>
              <div className={css({
                fontSize: 'sm',
                color: 'gray.600'
              })}>
                完了したTODO
              </div>
            </div>
          </div>
        </div>

        <div className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '2fr 1fr' },
          gap: { base: '6', lg: '8' },
          maxW: '5xl',
          mx: 'auto'
        })}>
          {/* 最近のTODOリスト */}
          <div className={css({
            bg: 'white',
            rounded: 'xl',
            p: '6',
            shadow: 'md',
            border: '1px solid',
            borderColor: 'primary.100'
          })}>
            <h2 className={css({
              fontSize: '2xl',
              fontWeight: 'bold',
              color: 'primary.800',
              mb: '4'
            })}>
              最近のTODOリスト
            </h2>

            {todosLoading ? (
              <LoadingSpinner text="TODOリストを読み込み中..." />
            ) : todos.length === 0 ? (
              <div className={css({
                textAlign: 'center',
                py: '12',
                color: 'gray.500'
              })}>
                まだTODOがありません
              </div>
            ) : (
              <div className={css({
                spaceY: '4'
              })}>
                {todos.slice(0, 5).map(todo => (
                  <div key={todo.id} className={css({
                    p: '4',
                    bg: completedTodoId === todo.id ? 'green.100' : 'gray.50',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: completedTodoId === todo.id ? 'green.300' : 'gray.200',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out',
                    ...(completedTodoId === todo.id && {
                      transform: 'scale(1.02)',
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                    })
                  })}>
                    {completedTodoId === todo.id && (
                      <div className={css({
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        bg: 'green.500',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'lg',
                        fontWeight: 'bold',
                        animation: 'slideIn 0.5s ease-out',
                        zIndex: '10'
                      })}>
                        ✅ 完了済み！
                      </div>
                    )}
                    <div className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: '2'
                    })}>
                      <Link href={`/todoList/${todo.id}`} className={css({
                        flex: '1',
                        textDecoration: 'none',
                        color: 'inherit',
                        _hover: { color: 'primary.600' }
                      })}>
                        <h3 className={css({
                          fontSize: 'lg',
                          fontWeight: 'bold',
                          color: 'gray.900',
                          cursor: 'pointer'
                        })}>
                          {todo.task}
                        </h3>
                      </Link>
                      <div className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2'
                      })}>
                        <span className={css({
                          fontSize: 'sm',
                          color: todo.status === 'completed' ? 'green.600' : 'orange.600',
                          fontWeight: 'bold'
                        })}>
                          {todo.status === 'completed' ? '完了' : '未完了'}
                        </span>
                        {todo.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteTodo(todo.id)}
                            disabled={completingTodoId === todo.id}
                            className={css({
                              px: '3',
                              py: '1',
                              bg: 'green.500',
                              color: 'white',
                              rounded: 'md',
                              fontSize: 'xs',
                              fontWeight: 'bold',
                              _hover: { bg: 'green.600' },
                              _disabled: { bg: 'gray.400', cursor: 'not-allowed' },
                              transition: 'all 0.2s'
                            })}
                          >
                            {completingTodoId === todo.id ? '完了中...' : '完了'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={css({
                      fontSize: 'xs',
                      color: 'gray.400',
                      mt: '2'
                    })}>
                      {new Date(todo.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI TODO提案 */}
          <div className={css({
            bg: 'white',
            rounded: 'xl',
            p: '6',
            shadow: 'md',
            border: '1px solid',
            borderColor: 'primary.100',
            h: 'fit-content'
          })}>
            <h2 className={css({
              fontSize: '2xl',
              fontWeight: 'bold',
              color: 'primary.800',
              mb: '4'
            })}>
              AI TODO提案
            </h2>

            <form onSubmit={handleTodoSuggestion} className={css({
              spaceY: '4'
            })}>
              <div>
                <label className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.700',
                  mb: '1'
                })}>
                  勉強時間（分）
                </label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={todoSuggestionForm.time_available}
                  onChange={(e) => setTodoSuggestionForm(prev => ({
                    ...prev,
                    time_available: parseInt(e.target.value) || 0
                  }))}
                  className={css({
                    w: 'full',
                    px: '3',
                    py: '2',
                    border: '1px solid',
                    borderColor: 'gray.300',
                    rounded: 'md',
                    fontSize: 'sm'
                  })}
                />
              </div>

              <div>
                <label className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.700',
                  mb: '1'
                })}>
                  最近の進捗
                </label>
                <textarea
                  value={todoSuggestionForm.recent_progress}
                  onChange={(e) => setTodoSuggestionForm(prev => ({
                    ...prev,
                    recent_progress: e.target.value
                  }))}
                  placeholder="最近何を勉強しましたか？"
                  className={css({
                    w: 'full',
                    px: '3',
                    py: '2',
                    border: '1px solid',
                    borderColor: 'gray.300',
                    rounded: 'md',
                    fontSize: 'sm',
                    resize: 'vertical',
                    minH: '20'
                  })}
                />
              </div>

              <div>
                <label className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.700',
                  mb: '1'
                })}>
                  苦手分野（カンマ区切り）
                </label>
                <input
                  type="text"
                  value={todoSuggestionForm.weak_areas}
                  onChange={(e) => setTodoSuggestionForm(prev => ({
                    ...prev,
                    weak_areas: e.target.value
                  }))}
                  placeholder="例：数学, 英語"
                  className={css({
                    w: 'full',
                    px: '3',
                    py: '2',
                    border: '1px solid',
                    borderColor: 'gray.300',
                    rounded: 'md',
                    fontSize: 'sm'
                  })}
                />
              </div>

              <div>
                <label className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.700',
                  mb: '1'
                })}>
                  今日の目標
                </label>
                <input
                  type="text"
                  value={todoSuggestionForm.daily_goal}
                  onChange={(e) => setTodoSuggestionForm(prev => ({
                    ...prev,
                    daily_goal: e.target.value
                  }))}
                  placeholder="今日達成したい目標"
                  className={css({
                    w: 'full',
                    px: '3',
                    py: '2',
                    border: '1px solid',
                    borderColor: 'gray.300',
                    rounded: 'md',
                    fontSize: 'sm'
                  })}
                />
              </div>

              <button
                type="submit"
                disabled={todoSuggestionLoading}
                className={buttonStyles.primary + ' ' + css({ w: 'full' })}
              >
                {todoSuggestionLoading ? '生成中...' : 'TODOを生成'}
              </button>
            </form>

            {todoSuggestionError && (
              <div className={css({
                mt: '4',
                p: '3',
                bg: 'red.50',
                border: '1px solid',
                borderColor: 'red.200',
                rounded: 'md',
                color: 'red.700',
                fontSize: 'sm'
              })}>
                {todoSuggestionError}
              </div>
            )}

            {todoSuggestionResult && (
              <div className={css({
                mt: '4',
                p: '4',
                bg: 'green.50',
                border: '1px solid',
                borderColor: 'green.200',
                rounded: 'md'
              })}>
                <h3 className={css({
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'green.800',
                  mb: '2'
                })}>
                  AI提案
                </h3>

                <AiTodoSuggestion
                  content={todoSuggestionResult.content}
                  onAddTodos={handleAddToTodoList}
                />
              </div>
            )}
          </div>
        </div>

        {/* 最近のTODO */}
        <div className={css({
          mt: '8',
          bg: 'white',
          rounded: 'xl',
          p: '6',
          shadow: 'md',
          border: '1px solid',
          borderColor: 'primary.100'
        })}>
          <h2 className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: 'primary.800',
            mb: '4'
          })}>
            最近のTODO
          </h2>

          {todosLoading ? (
            <LoadingSpinner text="TODOを読み込み中..." />
          ) : todos.length === 0 ? (
            <div className={css({
              textAlign: 'center',
              py: '12',
              color: 'gray.500'
            })}>
              まだTODOがありません
            </div>
          ) : (
            <div className={css({
              spaceY: '3'
            })}>
              {todos.slice(0, 5).map(todo => (
                <div key={todo.id} className={css({
                  p: '3',
                  bg: completedTodoId === todo.id ? 'green.100' : (todo.status === 'completed' ? 'green.50' : 'gray.50'),
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: completedTodoId === todo.id ? 'green.300' : (todo.status === 'completed' ? 'green.200' : 'gray.200'),
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease-in-out',
                  ...(completedTodoId === todo.id && {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                  })
                })}>
                  {completedTodoId === todo.id && (
                    <div className={css({
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      bottom: '0',
                      bg: 'green.500',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'md',
                      fontWeight: 'bold',
                      animation: 'slideIn 0.5s ease-out',
                      zIndex: '10'
                    })}>
                      ✅ 完了済み！
                    </div>
                  )}
                  <div className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '2'
                  })}>
                    <Link href={`/todoList/${todo.id}`} className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      flex: '1',
                      textDecoration: 'none',
                      color: 'inherit',
                      _hover: { color: 'primary.600' }
                    })}>
                      <div className={css({
                        w: '4',
                        h: '4',
                        rounded: 'full',
                        bg: todo.status === 'completed' ? 'green.500' : 'gray.300'
                      })} />
                      <h3 className={css({
                        fontSize: 'sm',
                        color: todo.status === 'completed' ? 'green.700' : 'gray.700',
                        textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
                        cursor: 'pointer'
                      })}>
                        {todo.task}
                      </h3>
                    </Link>
                    {todo.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteTodo(todo.id)}
                        disabled={completingTodoId === todo.id}
                        className={css({
                          px: '2',
                          py: '1',
                          bg: 'green.500',
                          color: 'white',
                          rounded: 'sm',
                          fontSize: 'xs',
                          fontWeight: 'bold',
                          _hover: { bg: 'green.600' },
                          _disabled: { bg: 'gray.400', cursor: 'not-allowed' },
                          transition: 'all 0.2s'
                        })}
                      >
                        {completingTodoId === todo.id ? '完了中...' : '完了'}
                      </button>
                    )}
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
