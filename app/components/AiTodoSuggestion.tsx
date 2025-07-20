'use client';

import React, { useState } from 'react';

import { CreateTodoItem } from '../types/todo-item';
import AiTodoSuggestionForm from './AiTodoSuggestionForm';
import AiTodoSuggestionResult from './AiTodoSuggestionResult';
import { statusStyles } from '../styles/components';

interface AiTodoSuggestionProps {
  onAddTodos: (_todoItems: CreateTodoItem[]) => Promise<void>;
  scrapboxProjectName?: string;
}

interface TodoSuggestionResponse {
  success: boolean;
  content: string;
  response_type: string;
}

export default function AiTodoSuggestion({ onAddTodos, scrapboxProjectName }: AiTodoSuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TodoSuggestionResponse | null>(null);

  const handleResult = (todoResult: TodoSuggestionResponse) => {
    setResult(todoResult);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  // キャンセル時の処理
  const handleCancel = () => {
    setResult(null);
    setError('');
  };

  // 結果が表示されている場合はフォームを非表示
  if (result) {
    return (
      <div>
        {/* エラーメッセージ */}
        {error && (
          <div className={statusStyles.error}>
            {error}
          </div>
        )}

        {/* 結果表示 */}
        <AiTodoSuggestionResult
          content={result.content}
          onAddTodos={onAddTodos}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div>
      <AiTodoSuggestionForm
        onResult={handleResult}
        onError={handleError}
        onLoading={handleLoading}
        scrapboxProjectName={scrapboxProjectName}
        loading={loading}
      />

      {/* エラーメッセージ */}
      {error && (
        <div className={statusStyles.error}>
          {error}
        </div>
      )}
    </div>
  );
}
