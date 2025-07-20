'use client';

import React, { useState } from 'react';

import { CreateTodoItem } from '../types/todo-item';
import { aiTodoSuggestionStyles } from '../styles/components';
import { parseMarkdownTodos, flattenTodoSections, convertToCreateTodoItem, ParsedTodo } from '../utils/todo-parser';

interface AiTodoSuggestionResultProps {
  content: string;
  onAddTodos: (_todoItems: CreateTodoItem[]) => Promise<void>;
  onCancel: () => void; // キャンセル時のコールバックを追加
}

export default function AiTodoSuggestionResult({ content, onAddTodos, onCancel }: AiTodoSuggestionResultProps) {
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [addingTodos, setAddingTodos] = useState(false);

  // マークダウンを解析
  const sections = parseMarkdownTodos(content);
  const allTodos = flattenTodoSections(sections);

  // 初期化時にすべてのTODOを選択
  React.useEffect(() => {
    if (allTodos.length > 0 && selectedTodos.length === 0) {
      const allTodoIds: string[] = [];
      sections.forEach((section, sectionIndex) => {
        section.todos.forEach((todo, todoIndex) => {
          allTodoIds.push(`${sectionIndex}-${todoIndex}`);
        });
      });
      setSelectedTodos(allTodoIds);
    }
  }, [allTodos.length, selectedTodos.length, sections]);

  // 個別TODO選択の切り替え
  const toggleTodo = (todoId: string) => {
    setSelectedTodos(prev => {
      if (prev.includes(todoId)) {
        return prev.filter(id => id !== todoId);
      } else {
        return [...prev, todoId];
      }
    });
  };

  // 選択されたTODOを追加
  const handleAddSelectedTodos = async () => {
    if (selectedTodos.length === 0) {
      alert('追加するTODOを選択してください');
      return;
    }

    try {
      setAddingTodos(true);

      // 選択されたTODOを抽出（IDから元のTODOを復元）
      const selectedTodoItems: ParsedTodo[] = [];
      selectedTodos.forEach(selectedId => {
        const parts = selectedId.split('-');
        if (parts.length >= 2) {
          const sectionIndex = parseInt(parts[0]);
          const todoIndex = parseInt(parts[1]);

          if (sections[sectionIndex] && sections[sectionIndex].todos[todoIndex]) {
            const todo = sections[sectionIndex].todos[todoIndex];
            selectedTodoItems.push({
              ...todo,
              section: sections[sectionIndex].title
            });
          }
        }
      });

      const createTodoItems = selectedTodoItems.map(convertToCreateTodoItem);
      await onAddTodos(createTodoItems);
      alert(`${selectedTodoItems.length}個のTODOを追加しました！`);
      setSelectedTodos([]);
      // 追加後にフォームに戻る
      onCancel();
    } catch (error) {
      console.error('TODO追加エラー:', error);
      alert('TODOの追加に失敗しました');
    } finally {
      setAddingTodos(false);
    }
  };

  return (
    <div className={aiTodoSuggestionStyles.resultContainer}>
      {/* TODOリスト表示 */}
      <div className={aiTodoSuggestionStyles.sectionsContainer}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={aiTodoSuggestionStyles.section}>
            {/* セクション内容 */}
            <div className={aiTodoSuggestionStyles.sectionContent}>
              {section.todos.map((todo, todoIndex) => {
                const todoId = `${sectionIndex}-${todoIndex}`;
                const isSelected = selectedTodos.includes(todoId);

                return (
                  <div 
                    key={todoIndex} 
                    className={`${aiTodoSuggestionStyles.todoItem} ${
                      isSelected ? aiTodoSuggestionStyles.todoItemSelected : ''
                    } ${aiTodoSuggestionStyles.todoItemHover}`}
                    onClick={() => toggleTodo(todoId)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleTodo(todoId);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={aiTodoSuggestionStyles.todoCheckbox}
                    />
                    <div className={aiTodoSuggestionStyles.todoContent}>
                      <div className={aiTodoSuggestionStyles.todoTask}>
                        {todo.task}
                      </div>
                      <div className={aiTodoSuggestionStyles.todoMeta}>
                        <span>⏱️ {todo.study_time}分</span>
                        {todo.goal && <span>🎯 {todo.goal}</span>}
                        {todo.priority && (
                          <span className={
                            todo.priority === 1 ? aiTodoSuggestionStyles.todoPriority :
                            todo.priority === 2 ? aiTodoSuggestionStyles.todoPriorityMedium :
                            aiTodoSuggestionStyles.todoPriorityLow
                          }>
                            ⭐ 優先度{todo.priority === 1 ? '高' : todo.priority === 2 ? '中' : '低'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* アクションボタン */}
      <div className={aiTodoSuggestionStyles.bottomActions}>
        <button
          onClick={onCancel}
          disabled={addingTodos}
          className={aiTodoSuggestionStyles.cancelButton}
        >
          キャンセル
        </button>
        <button
          onClick={handleAddSelectedTodos}
          disabled={addingTodos || selectedTodos.length === 0}
          className={aiTodoSuggestionStyles.addButton}
        >
          {addingTodos ? '追加中...' : '追加'}
        </button>
      </div>
    </div>
  );
} 