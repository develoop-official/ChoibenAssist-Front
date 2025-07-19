import { useState, useEffect, useCallback } from 'react';

import { supabase } from '../../lib/supabase';
import { TodoItemWithUser } from '../types/todo-item';

export function useAllTodos() {
  const [todos, setTodos] = useState<TodoItemWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 全ユーザーのTODO一覧取得
  const fetchAllTodos = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchAllTodos();
  }, [fetchAllTodos]);

  return {
    todos,
    loading,
    error,
    refetch: fetchAllTodos
  };
}
