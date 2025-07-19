'use client';

import React from 'react';
import Link from 'next/link';
import { css } from '../../styled-system/css';
import { todoCardStyles } from '../styles/components';

interface TodoItem {
  id: string;
  task: string;
  status: string;
  created_at: string;
}

interface TodoCardProps {
  todo: TodoItem;
  onComplete?: (todoId: string) => void;
  completing?: boolean;
  completed?: boolean;
  showDetails?: boolean;
  linkPrefix?: string;
}

export default function TodoCard({
  todo,
  onComplete,
  completing = false,
  completed = false,
  showDetails = true,
  linkPrefix = '/todoList'
}: TodoCardProps) {
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
        justifyContent: 'space-between',
        alignItems: showDetails ? 'center' : 'flex-start',
        mb: showDetails ? '2' : '0',
        gap: '2'
      })}>
        <Link href={`${linkPrefix}/${todo.id}`} className={todoCardStyles.link}>
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            flex: '1'
          })}>
            {!showDetails && (
              <div className={css({
                w: '4',
                h: '4',
                rounded: 'full',
                bg: todo.status === 'completed' ? 'success.500' : 'primary.300'
              })} />
            )}
            <h3 className={css({
              fontSize: showDetails ? 'lg' : 'sm',
              fontWeight: 'bold',
              color: !showDetails && todo.status === 'completed' ? 'success.700' : 'primary.800',
              cursor: 'pointer',
              textDecoration: !showDetails && todo.status === 'completed' ? 'line-through' : 'none'
            })}>
              {todo.task}
            </h3>
          </div>
        </Link>
        
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
        </div>
      </div>
      
      {showDetails && (
        <div className={todoCardStyles.date}>
          {new Date(todo.created_at).toLocaleDateString('ja-JP')}
        </div>
      )}
    </div>
  );
}
