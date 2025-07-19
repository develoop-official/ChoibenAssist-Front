import { useState, useEffect, useCallback } from 'react';

import { supabase } from '../../lib/supabase';
import { TodoItem, CreateTodoItem } from '../types/todo-item';

import { useAuth } from './useAuth';

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // 一覧取得
  const fetchTodos = useCallback(async () => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }
    if (!supabase) {
      setError('Supabaseが設定されていません');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('todo_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        setTodos([]);
        setError(error.message);
        return;
      }
      setTodos(data || []);
    } catch {
      setError('TODOの取得に失敗しました');
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 追加
  const addTodo = async (newTodo: CreateTodoItem) => {
    if (!user) throw new Error('ユーザーが認証されていません');
    if (!supabase) throw new Error('Supabaseが設定されていません');
    try {
      setError(null);
      const { data, error } = await supabase
        .from('todo_items')
        .insert([{ user_id: user.id, ...newTodo }])
        .select()
        .single();
      if (error) throw error;
      setTodos(prev => [data, ...prev]);
    } catch (err) {
      setError('TODOの追加に失敗しました');
      throw err;
    }
  };

  // 削除
  const deleteTodo = async (id: string) => {
    if (!supabase) throw new Error('Supabaseが設定されていません');
    try {
      setError(null);
      const { error } = await supabase
        .from('todo_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      setError('TODOの削除に失敗しました');
      throw err;
    }
  };

  // ステータス変更
  const updateStatus = async (id: string, status: 'pending' | 'completed') => {
    if (!supabase) throw new Error('Supabaseが設定されていません');
    try {
      setError(null);
      const { data, error } = await supabase
        .from('todo_items')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setTodos(prev => prev.map(todo => todo.id === id ? data : todo));
    } catch (err) {
      setError('TODOの更新に失敗しました');
      throw err;
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [user, fetchTodos]);

  return {
    todos,
    loading,
    error,
    addTodo,
    deleteTodo,
    updateStatus,
    refetch: fetchTodos
  };
}
