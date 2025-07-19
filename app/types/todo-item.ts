export interface TodoItem {
  id: string;
  user_id: string;
  task: string;
  due_date?: string; // ISO形式の日付文字列
  status: 'pending' | 'completed';
  study_time: number; // 学習時間（時間数、小数点可）
  priority?: number; // 優先度（1: 高, 2: 中, 3: 低）
  goal?: string; // 目標
  notes?: string; // メモ
  created_at: string; // ISO形式
  updated_at: string; // ISO形式
}

export interface TodoItemWithUser extends TodoItem {
  profiles?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface CreateTodoItem {
  task: string;
  due_date?: string;
  status?: 'pending' | 'completed';
  study_time?: number; // 学習時間（時間数、小数点可）
  priority?: number; // 優先度（1: 高, 2: 中, 3: 低）
  goal?: string; // 目標
  notes?: string; // メモ
}
