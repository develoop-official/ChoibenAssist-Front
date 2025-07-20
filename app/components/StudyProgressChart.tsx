'use client';

import React from 'react';
import { css } from '../../styled-system/css';

interface StudyProgressChartProps {
  targetMinutes: number;
  actualMinutes: number;
  size?: number;
  label?: string;
}

export default function StudyProgressChart({ 
  targetMinutes, 
  actualMinutes, 
  size = 120,
  label = '学習時間'
}: StudyProgressChartProps) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  
  // 目標時間が0の場合は100%表示（単純な数値表示用）
  const progress = targetMinutes === 0 ? 1 : Math.min(actualMinutes / targetMinutes, 1);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  const getProgressColor = (progress: number, targetMinutes: number) => {
    // 目標時間が0の場合は青色（単純な数値表示用）
    if (targetMinutes === 0) return '#3b82f6';
    
    if (progress >= 1) return '#10b981'; // 緑色（目標達成）
    if (progress >= 0.7) return '#3b82f6'; // 青色（良好）
    if (progress >= 0.4) return '#f59e0b'; // オレンジ色（注意）
    return '#ef4444'; // 赤色（要改善）
  };

  const progressColor = getProgressColor(progress, targetMinutes);
  const progressPercentage = targetMinutes === 0 ? 100 : Math.round(progress * 100);

  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3'
    })}>
      <div className={css({
        position: 'relative',
        w: size,
        h: size
      })}>
        {/* 背景円 */}
        <svg
          width={size}
          height={size}
          className={css({
            transform: 'rotate(-90deg)'
          })}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* 進捗円 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={css({
              transition: 'stroke-dashoffset 0.5s ease-in-out'
            })}
          />
        </svg>

        {/* 中央のテキスト */}
        <div className={css({
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        })}>
          <div className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: progressColor
          })}>
            {progressPercentage}%
          </div>
          <div className={css({
            fontSize: 'xs',
            color: 'gray.600',
            mt: '1'
          })}>
            達成率
          </div>
        </div>
      </div>

      {/* ラベル */}
      <div className={css({
        textAlign: 'center'
      })}>
        <div className={css({
          fontSize: 'sm',
          color: 'gray.600'
        })}>
          {label}
        </div>
      </div>
    </div>
  );
} 