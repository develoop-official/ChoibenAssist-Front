'use client';

import React, { useState } from 'react';

import { css } from '../../styled-system/css';
import { CreateTodoItem } from '../types/todo-item';
import { parseMarkdownTodos, flattenTodoSections, convertToCreateTodoItem } from '../utils/todo-parser';

interface AiTodoSuggestionProps {
  content: string;
  onAddTodos: (_todoItems: CreateTodoItem[]) => Promise<void>;
}

export default function AiTodoSuggestion({ content, onAddTodos }: AiTodoSuggestionProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [addingTodos, setAddingTodos] = useState(false);

  // マークダウンを解析
  const sections = parseMarkdownTodos(content);
  const allTodos = flattenTodoSections(sections);

  // デバッグ情報
  console.warn('🔍 AI提案デバッグ:', {
    contentLength: content.length,
    sectionsCount: sections.length,
    allTodosCount: allTodos.length,
    sections: sections.map(s => ({ title: s.title, todosCount: s.todos.length })),
    selectedSections,
    selectedTodos
  });

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
    setSelectedTodos(allTodos.map(todo => `${todo.section}-${todo.task}`));
  };

  const deselectAll = () => {
    setSelectedTodos([]);
  };

  // 選択されたTODOを追加
      const handleAddSelectedTodos = async () => {
    const selectedTodoItems = allTodos.filter(todoItem =>
      selectedTodos.includes(`${todoItem.section}-${todoItem.task}`)
    );

    if (selectedTodoItems.length === 0) {
      alert('追加するTODOを選択してください');
      return;
    }

    try {
      setAddingTodos(true);
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
    <div className={css({
      mt: '4',
      p: '4',
      bg: 'green.50',
      border: '1px solid',
      borderColor: 'green.200',
      rounded: 'md'
    })}>
      <div className={css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: '3'
      })}>
        <h3 className={css({
          fontSize: 'lg',
          fontWeight: 'bold',
          color: 'green.800'
        })}>
          🤖 AI提案のTODOリスト
        </h3>
        <div className={css({
          display: 'flex',
          gap: '2'
        })}>
          <button
            onClick={selectAll}
            className={css({
              px: '2',
              py: '1',
              bg: 'blue.100',
              color: 'blue.700',
              rounded: 'sm',
              fontSize: 'xs',
              fontWeight: 'medium',
              _hover: { bg: 'blue.200' }
            })}
          >
            全選択
          </button>
          <button
            onClick={deselectAll}
            className={css({
              px: '2',
              py: '1',
              bg: 'gray.100',
              color: 'gray.700',
              rounded: 'sm',
              fontSize: 'xs',
              fontWeight: 'medium',
              _hover: { bg: 'gray.200' }
            })}
          >
            全解除
          </button>
        </div>
      </div>

      {/* 統計情報 */}
      <div className={css({
        mb: '4',
        p: '3',
        bg: 'white',
        rounded: 'md',
        border: '1px solid',
        borderColor: 'green.200'
      })}>
        <div className={css({
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'sm',
          color: 'green.700'
        })}>
          <span>セクション数: {sections.length}</span>
          <span>TODO数: {allTodos.length}</span>
          <span>総学習時間: {totalTime.toFixed(1)}時間</span>
        </div>
      </div>

      {/* セクション別表示 */}
      <div className={css({
        spaceY: '4',
        maxH: '96',
        overflowY: 'auto'
      })}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={css({
            border: '1px solid',
            borderColor: 'green.200',
            rounded: 'md',
            overflow: 'hidden'
          })}>
            {/* セクションヘッダー */}
            <div className={css({
              p: '3',
              bg: 'green.100',
              borderBottom: '1px solid',
              borderColor: 'green.200',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            })} onClick={() => toggleSection(section.title)}>
              <h4 className={css({
                fontSize: 'md',
                fontWeight: 'bold',
                color: 'green.800'
              })}>
                📋 {section.title}
              </h4>
              <div className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2'
              })}>
                <span className={css({
                  fontSize: 'xs',
                  color: 'green.600'
                })}>
                  {section.todos.length}個 / {section.totalTime.toFixed(1)}時間
                </span>
                <span className={css({
                  fontSize: 'lg',
                  color: 'green.600',
                  transform: selectedSections.includes(section.title) ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                })}>
                  ▶
                </span>
              </div>
            </div>

            {/* セクション内容 */}
            {selectedSections.includes(section.title) && (
              <div className={css({
                p: '3',
                bg: 'white',
                spaceY: '2'
              })}>
                {section.todos.map((todo, todoIndex) => {
                  const todoId = `${todo.section}-${todo.task}`;
                  const isSelected = selectedTodos.includes(todoId);

                  return (
                    <div key={todoIndex} className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3',
                      p: '2',
                      bg: isSelected ? 'green.50' : 'transparent',
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: isSelected ? 'green.200' : 'transparent',
                      cursor: 'pointer',
                      _hover: { bg: 'green.50' }
                    })} onClick={() => toggleTodo(todoId)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleTodo(todoId);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={css({
                          w: '4',
                          h: '4',
                          accentColor: 'green.600',
                          cursor: 'pointer'
                        })}
                      />
                      <div className={css({
                        flex: '1',
                        minW: '0'
                      })}>
                        <div className={css({
                          fontSize: 'sm',
                          color: 'gray.800',
                          fontWeight: 'medium'
                        })}>
                          {todo.task}
                        </div>
                        <div className={css({
                          display: 'flex',
                          gap: '3',
                          fontSize: 'xs',
                          color: 'gray.500',
                          mt: '1'
                        })}>
                          <span>⏱️ {todo.study_time}時間</span>
                          {todo.goal && <span>🎯 {todo.goal}</span>}
                          {todo.priority && (
                            <span className={css({
                              color: todo.priority === 1 ? 'red.600' : todo.priority === 2 ? 'orange.600' : 'blue.600'
                            })}>
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
      <div className={css({
        display: 'flex',
        gap: '3',
        mt: '4',
        pt: '3',
        borderTop: '1px solid',
        borderColor: 'green.200'
      })}>
        <button
          onClick={handleAddSelectedTodos}
          disabled={addingTodos || selectedTodos.length === 0}
          className={css({
            px: '4',
            py: '2',
            bg: 'green.600',
            color: 'white',
            rounded: 'md',
            fontSize: 'sm',
            fontWeight: 'medium',
            _hover: { bg: 'green.700' },
            _disabled: { opacity: '0.5', cursor: 'not-allowed' }
          })}
        >
          {addingTodos ? '追加中...' : `選択した${selectedTodos.length}個を追加`}
        </button>
        <button
          onClick={handleAddAllTodos}
          disabled={addingTodos}
          className={css({
            px: '4',
            py: '2',
            bg: 'blue.600',
            color: 'white',
            rounded: 'md',
            fontSize: 'sm',
            fontWeight: 'medium',
            _hover: { bg: 'blue.700' },
            _disabled: { opacity: '0.5', cursor: 'not-allowed' }
          })}
        >
          {addingTodos ? '追加中...' : `全${allTodos.length}個を追加`}
        </button>
      </div>
    </div>
  );
}
