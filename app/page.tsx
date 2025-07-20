'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { css } from '../styled-system/css';

import AiTodoSuggestionCard from './components/AiTodoSuggestionCard';
import LoadingSpinner from './components/ui/LoadingSpinner';
import StatCard from './components/StatCard';
import TodoCard from './components/TodoCard';
import { useAuth } from './hooks/useAuth';
import { useTodos } from './hooks/useTodos';
import { sectionStyles } from './styles/components';
import { CreateTodoItem } from './types/todo-item';
import { supabase } from '../lib/supabase';



export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { todos, loading: todosLoading, addTodos } = useTodos();
  const [profile, setProfile] = useState<any>(null);

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
  const todayTotalMinutes = todayTodos.reduce((total, todo) => total + todo.study_time, 0);

  // 今週の学習時間を計算
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekTodos = todos.filter(todo => {
    const todoDate = new Date(todo.created_at);
    return todoDate >= weekStart;
  });
  const weekTotalMinutes = weekTodos.reduce((total, todo) => total + todo.study_time, 0);

  // 今月の学習時間を計算
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthTodos = todos.filter(todo => {
    const todoDate = new Date(todo.created_at);
    return todoDate >= monthStart;
  });
  const monthTotalMinutes = monthTodos.reduce((total, todo) => total + todo.study_time, 0);

  // 完了したTODOの数
  const completedTodos = todos.filter(todo => todo.status === 'completed');

  // プロフィール取得
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase || !user) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('プロフィール取得エラー:', err);
      }
    };

    if (user && supabase) {
      fetchProfile();
    }
  }, [user]);

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
          <AiTodoSuggestionCard
            onAddTodos={handleAddToTodoList}
            scrapboxProjectName={profile?.scrapbox_project_name}
          />
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
