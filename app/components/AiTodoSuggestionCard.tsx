'use client';

import React from 'react';

import { CreateTodoItem } from '../types/todo-item';
import { sectionStyles } from '../styles/components';
import { css } from '../../styled-system/css';
import AiTodoSuggestion from './AiTodoSuggestion';

interface AiTodoSuggestionCardProps {
  onAddTodos: (_todoItems: CreateTodoItem[]) => Promise<void>;
  scrapboxProjectName?: string;
}

export default function AiTodoSuggestionCard({ onAddTodos, scrapboxProjectName }: AiTodoSuggestionCardProps) {
  return (
    <div className={`${sectionStyles.primary} ${css({
      h: 'fit-content'
    })}`}>
      <AiTodoSuggestion
        onAddTodos={onAddTodos}
        scrapboxProjectName={scrapboxProjectName}
      />
    </div>
  );
} 