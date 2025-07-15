export interface TodoItem {
  id: string;
  user_id: string;
  task: string;
  due_date?: string; // ISO形式の日付文字列
  status: 'pending' | 'completed';
  created_at: string; // ISO形式
  updated_at: string; // ISO形式
}

export interface CreateTodoItem {
  task: string;
  due_date?: string;
  status?: 'pending' | 'completed';
} 