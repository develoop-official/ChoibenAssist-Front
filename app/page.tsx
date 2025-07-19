'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { css } from '../styled-system/css';

import { generateGeneralTodo } from './actions/todo-actions';
import AiTodoSuggestion from './components/AiTodoSuggestion';
import LoadingSpinner from './components/ui/LoadingSpinner';
import StatCard from './components/StatCard';
import TodoCard from './components/TodoCard';
import { useAuth } from './hooks/useAuth';
import { useTodos } from './hooks/useTodos';
import { buttonStyles, sectionStyles, formStyles, statusStyles } from './styles/components';
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
      py: { base: '16', md: '6', lg: '8' },
      px: { base: '4', md: '6', lg: '8' }
    })}>
      <div className={css({
        maxW: '4xl',
        mx: 'auto'
      })}>


        {/* 統計カード */}
        <div className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: { base: '4', md: '6' },
          mb: '8',
          maxW: '4xl',
          mx: 'auto'
        })}>
          <StatCard
            value={`${Math.floor(todayTotalMinutes / 60)}h ${todayTotalMinutes % 60}m`}
            label="今日の学習時間"
          />
          <StatCard
            value={`${Math.floor(weekTotalMinutes / 60)}h ${weekTotalMinutes % 60}m`}
            label="今週の学習時間"
          />
          <StatCard
            value={`${Math.floor(monthTotalMinutes / 60)}h ${monthTotalMinutes % 60}m`}
            label="今月の学習時間"
          />
          <StatCard
            value={completedTodos.length}
            label="完了したTODO"
          />
        </div>

        <div className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '2fr 1fr' },
          gap: { base: '6', lg: '8' },
          maxW: '6xl',
          mx: 'auto'
        })}>
          {/* 進行中のTODOリスト */}
          <div className={sectionStyles.primary}>
            <h2 className={sectionStyles.title}>
              進行中のTODOリスト
            </h2>

            {todosLoading ? (
              <LoadingSpinner text="TODOリストを読み込み中..." />
            ) : todos.filter(todo => todo.status !== 'completed').length === 0 ? (
              <div className={sectionStyles.emptyState}>
                進行中のTODOがありません
              </div>
            ) : (
              <div className={css({
                spaceY: '4'
              })}>
                {todos.filter(todo => todo.status !== 'completed').slice(0, 5).map(todo => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onComplete={handleCompleteTodo}
                    completing={completingTodoId === todo.id}
                    completed={completedTodoId === todo.id}
                    showDetails={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* AI TODO提案 */}
          <div className={sectionStyles.primary + ' ' + css({
            h: 'fit-content'
          })}>
            <h2 className={sectionStyles.title}>
              AI TODO提案
            </h2>

            <form onSubmit={handleTodoSuggestion} className={css({
              spaceY: '4'
            })}>
              <div>
                <label className={formStyles.label}>
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
                  className={formStyles.input}
                />
              </div>

              <div>
                <label className={formStyles.label}>
                  最近の進捗
                </label>
                <textarea
                  value={todoSuggestionForm.recent_progress}
                  onChange={(e) => setTodoSuggestionForm(prev => ({
                    ...prev,
                    recent_progress: e.target.value
                  }))}
                  placeholder="最近何を勉強しましたか？"
                  className={formStyles.textarea}
                />
              </div>

              <div>
                <label className={formStyles.label}>
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
                  className={formStyles.input}
                />
              </div>

              <div>
                <label className={formStyles.label}>
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
                  className={formStyles.input}
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
              <div className={statusStyles.error}>
                {todoSuggestionError}
              </div>
            )}

            {todoSuggestionResult && (
              <div className={statusStyles.success}>
                <h3 className={css({
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'success.800',
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

        {/* 完了済みTODO */}
        <div className={sectionStyles.white + ' ' + css({
          mt: '8'
        })}>
          <h2 className={sectionStyles.title}>
            完了済みTODO
          </h2>

          {todosLoading ? (
            <LoadingSpinner text="TODOを読み込み中..." />
          ) : completedTodos.length === 0 ? (
            <div className={sectionStyles.emptyState}>
              まだ完了したTODOがありません
            </div>
          ) : (
            <div className={css({
              spaceY: '3'
            })}>
              {completedTodos.slice(0, 5).map(todo => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  showDetails={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
