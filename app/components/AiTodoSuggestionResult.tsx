'use client';

import React, { useState } from 'react';

import { CreateTodoItem } from '../types/todo-item';
import { parseMarkdownTodos, flattenTodoSections, convertToCreateTodoItem, ParsedTodo } from '../utils/todo-parser';
import { aiTodoSuggestionStyles } from '../styles/components';

interface AiTodoSuggestionResultProps {
  content: string;
  onAddTodos: (_todoItems: CreateTodoItem[]) => Promise<void>;
}

export default function AiTodoSuggestionResult({ content, onAddTodos }: AiTodoSuggestionResultProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [addingTodos, setAddingTodos] = useState(false);

  // マークダウンを解析
  const sections = parseMarkdownTodos(content);
  const allTodos = flattenTodoSections(sections);

  // 初期化時にすべてのセクションを展開
  React.useEffect(() => {
    if (sections.length > 0 && selectedSections.length === 0) {
      setSelectedSections(sections.map(section => section.title));
    }
  }, [sections, selectedSections.length]);

  // セクション選択の切り替え
  const toggleSection = (sectionTitle: string) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionTitle)) {
        return prev.filter(title => title !== sectionTitle);
      } else {
        return [...prev, sectionTitle];
      }
    });
  };

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

  // 全選択/全解除
  const selectAll = () => {
    const allTodoIds: string[] = [];
    sections.forEach((section, sectionIndex) => {
      section.todos.forEach((todo, todoIndex) => {
        allTodoIds.push(`${sectionIndex}-${todoIndex}`);
      });
    });
    setSelectedTodos(allTodoIds);
  };

  const deselectAll = () => {
    setSelectedTodos([]);
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
    } catch (error) {
      console.error('TODO追加エラー:', error);
      alert('TODOの追加に失敗しました');
    } finally {
      setAddingTodos(false);
    }
  };

  // 全TODOを追加
  const handleAddAllTodos = async () => {
    try {
      setAddingTodos(true);
      const createTodoItems = allTodos.map(convertToCreateTodoItem);
      await onAddTodos(createTodoItems);
      alert(`${allTodos.length}個のTODOを追加しました！`);
    } catch (error) {
      console.error('TODO追加エラー:', error);
      alert('TODOの追加に失敗しました');
    } finally {
      setAddingTodos(false);
    }
  };

  const totalTime = allTodos.reduce((sum, todo) => sum + todo.study_time, 0);

  return (
    <div className={aiTodoSuggestionStyles.resultContainer}>
      <div className={aiTodoSuggestionStyles.resultHeader}>
        <h3 className={aiTodoSuggestionStyles.resultTitle}>
          🤖 AI提案のTODOリスト
        </h3>
        <div className={aiTodoSuggestionStyles.actionButtons}>
          <button
            onClick={selectAll}
            className={`${aiTodoSuggestionStyles.actionButton} ${aiTodoSuggestionStyles.selectAllButton}`}
          >
            全選択
          </button>
          <button
            onClick={deselectAll}
            className={`${aiTodoSuggestionStyles.actionButton} ${aiTodoSuggestionStyles.deselectAllButton}`}
          >
            全解除
          </button>
        </div>
      </div>

      {/* 統計情報 */}
      <div className={aiTodoSuggestionStyles.stats}>
        <div className={aiTodoSuggestionStyles.statsContent}>
          <span>セクション数: {sections.length}</span>
          <span>TODO数: {allTodos.length}</span>
          <span>総学習時間: {totalTime.toFixed(1)}時間</span>
        </div>
      </div>

      {/* セクション別表示 */}
      <div className={aiTodoSuggestionStyles.sectionsContainer}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={aiTodoSuggestionStyles.section}>
            {/* セクションヘッダー */}
            <div 
              className={aiTodoSuggestionStyles.sectionHeader}
              onClick={() => toggleSection(section.title)}
            >
              <h4 className={aiTodoSuggestionStyles.sectionTitle}>
                📋 {section.title}
              </h4>
              <div className={aiTodoSuggestionStyles.sectionInfo}>
                <span className={aiTodoSuggestionStyles.sectionCount}>
                  {section.todos.length}個 / {section.totalTime.toFixed(1)}時間
                </span>
                <span 
                  className={aiTodoSuggestionStyles.sectionArrow}
                  style={{
                    transform: selectedSections.includes(section.title) ? 'rotate(90deg)' : 'rotate(0deg)'
                  }}
                >
                  ▶
                </span>
              </div>
            </div>

            {/* セクション内容 */}
            {selectedSections.includes(section.title) && (
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
            )}
          </div>
        ))}
      </div>

      {/* アクションボタン */}
      <div className={aiTodoSuggestionStyles.bottomActions}>
        <button
          onClick={handleAddSelectedTodos}
          disabled={addingTodos || selectedTodos.length === 0}
          className={aiTodoSuggestionStyles.addButton}
        >
          {addingTodos ? '追加中...' : `選択した${selectedTodos.length}個を追加`}
        </button>
        <button
          onClick={handleAddAllTodos}
          disabled={addingTodos}
          className={aiTodoSuggestionStyles.addAllButton}
        >
          {addingTodos ? '追加中...' : `全${allTodos.length}個を追加`}
        </button>
      </div>
    </div>
  );
} 