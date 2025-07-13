'use client';

import { useState } from 'react';
import { css } from '../../styled-system/css';
import { CreateStudyRecord } from '../types/study-record';
import { cardStyles, buttonStyles, formStyles } from '../styles/components';

interface StudyRecordFormProps {
  onSubmit: (record: CreateStudyRecord) => Promise<void>;
}

export default function StudyRecordForm({ onSubmit }: StudyRecordFormProps) {
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !duration.trim()) {
      alert('科目と学習時間を入力してください');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      alert('学習時間は正の数で入力してください');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        subject: subject.trim(),
        duration: durationNum,
        notes: notes.trim(),
      });

      // フォームをリセット
      setSubject('');
      setDuration('');
      setNotes('');
    } catch (error) {
      console.error('記録の保存に失敗しました:', error);
      alert('記録の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css({
      bg: 'white',
      rounded: '2xl',
      shadow: 'lg',
      p: '6',
      position: 'relative',
      overflow: 'hidden',
      _before: {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '4px',
        bg: 'gradient-to-r',
        bgGradient: 'from-primary.600 to-primary.800',
        roundedTop: '2xl'
      }
    })}>
      <div className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '3',
        mb: '6'
      })}>
        <div className={css({
          w: '8',
          h: '8',
          bg: 'blue.100',
          rounded: 'lg',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        })}>
          <span className={css({
            fontSize: 'lg',
            color: 'blue.600'
          })}>
            ✏️
          </span>
        </div>
        <h2 className={css({
          fontSize: 'lg',
          fontWeight: 'bold',
          color: 'gray.900'
        })}>
          新しい記録
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className={css({
        spaceY: '5'
      })}>
        <div>
          <label htmlFor="subject" className={formStyles.label}>
            科目
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="例: 数学、英語、プログラミング..."
            className={formStyles.input}
          />
        </div>

        <div>
          <label htmlFor="duration" className={formStyles.label}>
            学習時間（分）
          </label>
          <input
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="例: 30"
            className={formStyles.input}
          />
        </div>

        <div>
          <label htmlFor="notes" className={formStyles.label}>
            メモ（任意）
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="学習した内容のメモや感想を書いてください..."
            rows={4}
            className={formStyles.textarea}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={css({
            w: 'full',
            bg: 'gradient-to-r',
            bgGradient: 'from-primary.600 to-primary.800',
            color: 'white',
            py: '3',
            px: '6',
            rounded: 'xl',
            fontWeight: '600',
            fontSize: 'sm',
            transition: 'all 0.2s',
            _hover: {
              transform: 'translateY(-1px)',
              shadow: 'lg'
            },
            _active: {
              transform: 'translateY(0)'
            },
            _disabled: {
              opacity: '0.6',
              cursor: 'not-allowed',
              transform: 'none'
            }
          })}
        >
          {loading ? '保存中...' : '記録を保存'}
        </button>
      </form>
    </div>
  );
} 