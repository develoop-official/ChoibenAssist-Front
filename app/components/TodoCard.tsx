'use client';

import Link from 'next/link';
import React from 'react';

import { todoCardStyles } from '../styles/components';
import { css } from '../../styled-system/css';
import MarkdownRenderer from './ui/MarkdownRenderer';

interface TodoItem {
  id: string;
  task: string; // タイトルと内容が結合されている
  status: string;
  created_at: string;
  study_time?: number;
  goal?: string;
}

interface TodoCardProps {
  todo: TodoItem;
  onComplete?: (todoId: string) => void;
  onDelete?: (todoId: string) => void;
  completing?: boolean;
  completed?: boolean;
  showDetails?: boolean;
  linkPrefix?: string;
  deletingTodoId?: string | null; // 追加
}

export default function TodoCard({
  todo,
  onComplete,
  onDelete,
  completing = false,
  completed = false,
  showDetails = true,
  linkPrefix = '/todoList',
  deletingTodoId
}: TodoCardProps) {
  // taskフィールドからタイトルと内容を分離
  const parseTask = (task: string) => {
    const parts = task.split(' - ');
    return {
      title: parts[0],
      content: parts.slice(1).join(' - ')
    };
  };

  const { title, content } = parseTask(todo.task);

  const getCardStyle = () => {
    if (completed) return todoCardStyles.completing;
    if (todo.status === 'completed') return todoCardStyles.completed;
    return todoCardStyles.base;
  };

  const getStatusStyle = () => {
    if (todo.status === 'completed') {
      return css({
        fontSize: 'sm',
        fontWeight: 'bold',
        color: 'success.600'
      });
    }
    return css({
      fontSize: 'sm',
      fontWeight: 'bold',
      color: 'amber.600'
    });
  };

  return (
    <div className={getCardStyle()}>
      {completed && (
        <div className={todoCardStyles.completedOverlay}>
          ✅ 完了済み！
        </div>
      )}
      
      <div className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '3'
      })}>
        {/* タイトルとアクションボタン */}
        <div className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '2'
        })}>
          <div className={css({
            flex: '1',
            minW: '0'
          })}>
            <Link href={`${linkPrefix}/${todo.id}`} className={todoCardStyles.link}>
              <h3 className={css({
                fontSize: showDetails ? 'lg' : 'sm',
                fontWeight: 'bold',
                color: !showDetails && todo.status === 'completed' ? 'success.700' : 'primary.800',
                cursor: 'pointer',
                textDecoration: !showDetails && todo.status === 'completed' ? 'line-through' : 'none',
                lineHeight: '1.4',
                mb: '1'
              })}>
                <MarkdownRenderer 
                  content={title}
                  className={css({
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    color: 'inherit',
                    textDecoration: 'inherit',
                    lineHeight: 'inherit',
                    mb: '0'
                  })}
                />
              </h3>
            </Link>
            
            {/* 内容の表示 */}
            {showDetails && content && (
              <div className={css({
                fontSize: 'sm',
                color: 'gray.600',
                lineHeight: '1.4',
                mb: '2'
              })}>
                <MarkdownRenderer 
                  content={content}
                  className={css({
                    fontSize: 'inherit',
                    color: 'inherit',
                    lineHeight: 'inherit',
                    mb: '0'
                  })}
                />
              </div>
            )}
          </div>
          
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2'
          })}>
            {showDetails && (
              <span className={getStatusStyle()}>
                {todo.status === 'completed' ? '完了' : '未完了'}
              </span>
            )}
            
            {todo.status !== 'completed' && onComplete && (
              <button
                onClick={() => onComplete(todo.id)}
                disabled={completing}
                className={todoCardStyles.completeButton}
              >
                {completing ? '完了中...' : '完了'}
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(todo.id)}
                disabled={completing || deletingTodoId === todo.id}
                className={css({
                  px: '2',
                  py: '1',
                  bg: 'red.500',
                  color: 'white',
                  rounded: 'sm',
                  fontSize: 'xs',
                  fontWeight: 'medium',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  _hover: { bg: 'red.600' },
                  _disabled: { opacity: 0.6, cursor: 'not-allowed' }
                })}
              >
                {deletingTodoId === todo.id ? '削除中...' : '削除'}
              </button>
            )}
          </div>
        </div>

        {/* 詳細情報 */}
        {showDetails && (
          <div className={css({
            spaceY: '2'
          })}>
            {todo.goal && (
              <div className={css({
                fontSize: 'sm',
                color: 'gray.600',
                lineHeight: '1.4'
              })}>
                🎯 {todo.goal}
              </div>
            )}
            
            <div className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 'sm',
              color: 'gray.500'
            })}>
              <span>⏱️ {todo.study_time || 0}分</span>
              <span>{new Date(todo.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
