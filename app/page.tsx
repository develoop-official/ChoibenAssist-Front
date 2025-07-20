'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { supabase } from '../lib/supabase';
import { css } from '../styled-system/css';

import LoadingSpinner from './components/ui/LoadingSpinner';
import StatCard from './components/StatCard';
import AiTodoSuggestionCard from './components/AiTodoSuggestionCard';
import TodoCard from './components/TodoCard';
import StudyProgressChart from './components/StudyProgressChart';
import { useAuth } from './hooks/useAuth';
import { useTodos } from './hooks/useTodos';
import { sectionStyles } from './styles/components';
import { CreateTodoItem } from './types/todo-item';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { todos, loading: todosLoading, addTodos } = useTodos();
  const [profile, setProfile] = useState<any>(null);

  const [completingTodoId, setCompletingTodoId] = useState<string | null>(null);
  const [completedTodoId, setCompletedTodoId] = useState<string | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);

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

  const handleDeleteTodo = async (todoId: string) => {
    try {
      setDeletingTodoId(todoId);
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      const { error } = await supabase
        .from('todo_items')
        .delete()
        .eq('id', todoId);

      if (error) {
        throw error;
      }

      // 成功時は何もしない（useTodosフックが自動的に更新する）
    } catch (error) {
      console.error('TODO削除エラー:', error);
      alert('TODOの削除に失敗しました');
    } finally {
      setDeletingTodoId(null);
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

        {/* スマホ版: 目標達成率のみ */}
        <div className={css({
          display: { base: 'block', lg: 'none' },
          mb: '8'
        })}>
          <div className={css({
            bg: 'white',
            rounded: 'xl',
            shadow: 'lg',
            p: '6',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: 'gray.100',
            maxW: 'sm',
            mx: 'auto'
          })}>
            <h3 className={css({
              fontSize: 'lg',
              fontWeight: 'bold',
              color: 'gray.900',
              mb: '4',
              textAlign: 'center'
            })}>
              今日の目標達成率
            </h3>
            <StudyProgressChart
              targetMinutes={profile?.target_study_time || 120}
              actualMinutes={todayTotalMinutes}
              size={140}
              label="今日の学習時間"
            />
          </div>
        </div>

        {/* PC版: 今月の学習時間・完了済みTODOを円グラフで表示 */}
        <div className={css({
          display: { base: 'none', lg: 'grid' },
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8',
          mb: '8',
          maxW: '4xl',
          mx: 'auto'
        })}>
          {/* 今月の学習時間チャート */}
          <div className={css({
            bg: 'white',
            rounded: 'xl',
            shadow: 'lg',
            p: '6',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: 'gray.100'
          })}>
            <h3 className={css({
              fontSize: 'lg',
              fontWeight: 'bold',
              color: 'gray.900',
              mb: '4',
              textAlign: 'center'
            })}>
              今月の学習時間
            </h3>
            <StudyProgressChart
              targetMinutes={(profile?.target_study_time || 120) * 30}
              actualMinutes={monthTotalMinutes}
              size={140}
              label="今月の学習時間"
            />
            <div className={css({
              textAlign: 'center',
              mt: '3'
            })}>
              <div className={css({
                fontSize: 'lg',
                fontWeight: 'bold',
                color: 'gray.900'
              })}>
                {Math.floor(monthTotalMinutes / 60)}時間{Math.floor(monthTotalMinutes % 60)}分
              </div>
              <div className={css({
                fontSize: 'sm',
                color: 'gray.600',
                mt: '1'
              })}>
                目標: {Math.floor(((profile?.target_study_time || 120) * 30) / 60)}時間{Math.floor(((profile?.target_study_time || 120) * 30) % 60)}分
              </div>
            </div>
          </div>

          {/* 今日の目標達成率チャート */}
          <div className={css({
            bg: 'white',
            rounded: 'xl',
            shadow: 'lg',
            p: '6',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: 'gray.100'
          })}>
            <h3 className={css({
              fontSize: 'lg',
              fontWeight: 'bold',
              color: 'gray.900',
              mb: '4',
              textAlign: 'center'
            })}>
              今日の目標達成率
            </h3>
            <StudyProgressChart
              targetMinutes={profile?.target_study_time || 120}
              actualMinutes={todayTotalMinutes}
              size={140}
              label="今日の学習時間"
            />
            <div className={css({
              textAlign: 'center',
              mt: '3'
            })}>
              <div className={css({
                fontSize: 'lg',
                fontWeight: 'bold',
                color: 'gray.900'
              })}>
                {Math.floor(todayTotalMinutes / 60)}時間{Math.floor(todayTotalMinutes % 60)}分
              </div>
              <div className={css({
                fontSize: 'sm',
                color: 'gray.600',
                mt: '1'
              })}>
                目標: {Math.floor((profile?.target_study_time || 120) / 60)}時間{Math.floor((profile?.target_study_time || 120) % 60)}分
              </div>
            </div>
          </div>
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
                    onDelete={handleDeleteTodo}
                    completing={completingTodoId === todo.id}
                    completed={completedTodoId === todo.id}
                    showDetails={true}
                    deletingTodoId={deletingTodoId}
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
