'use client';

import React from 'react';
import { css } from '../../styled-system/css';
import { statCardStyles } from '../styles/components';

interface StatCardProps {
  value: string | number;
  label: string;
}

export default function StatCard({ value, label }: StatCardProps) {
  return (
    <div className={statCardStyles.base}>
      <div className={statCardStyles.value}>
        {value}
      </div>
      <div className={statCardStyles.label}>
        {label}
      </div>
    </div>
  );
}
