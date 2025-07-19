import React from 'react';

import { css } from '../../../styled-system/css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon = '📚',
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={css({
      textAlign: 'center',
      py: '16',
      px: '6'
    }) + (className ? ` ${className}` : '')}>
      <div className={css({
        maxW: 'md',
        mx: 'auto'
      })}>
        <div className={css({
          w: '20',
          h: '20',
          bg: 'gray.50',
          rounded: 'full',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: '6'
        })}>
          <span className={css({
            fontSize: '3xl'
          })}>
            {icon}
          </span>
        </div>

        <h3 className={css({
          fontSize: 'xl',
          fontWeight: 'bold',
          color: 'gray.900',
          mb: '3'
        })}>
          {title}
        </h3>

        <p className={css({
          color: 'gray.600',
          mb: '6',
          lineHeight: 'relaxed'
        })}>
          {description}
        </p>

        {action && (
          <div className={css({
            mb: '6'
          })}>
            {action}
          </div>
        )}

        <div className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2',
          fontSize: 'sm',
          color: 'gray.500'
        })}>
          <span>✨</span>
          <span>新しいことを始めよう</span>
          <span>✨</span>
        </div>
      </div>
    </div>
  );
}
