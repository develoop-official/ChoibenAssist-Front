'use client';

import { useState, useEffect } from 'react';
import { StudyRecord, CreateStudyRecord } from '../types/study-record';

export function useStudyRecords() {
  const [records, setRecords] = useState<StudyRecord[]>([]);

  // ローカルストレージから学習記録を読み込み
  useEffect(() => {
    const savedRecords = localStorage.getItem('studyRecords');
    if (savedRecords) {
      try {
        const parsedRecords = JSON.parse(savedRecords).map((record: any) => ({
          ...record,
          createdAt: new Date(record.createdAt)
        }));
        setRecords(parsedRecords);
      } catch (error) {
        console.error('学習記録の読み込みに失敗しました:', error);
      }
    }
  }, []);

  // 学習記録をローカルストレージに保存
  const saveRecords = (newRecords: StudyRecord[]) => {
    localStorage.setItem('studyRecords', JSON.stringify(newRecords));
  };

  // 新しい学習記録を追加
  const addRecord = (newRecord: CreateStudyRecord) => {
    const record: StudyRecord = {
      id: Date.now().toString(),
      ...newRecord,
      createdAt: new Date()
    };

    const updatedRecords = [record, ...records];
    setRecords(updatedRecords);
    saveRecords(updatedRecords);
  };

  // 学習記録を削除
  const deleteRecord = (id: string) => {
    const updatedRecords = records.filter(record => record.id !== id);
    setRecords(updatedRecords);
    saveRecords(updatedRecords);
  };

  return {
    records,
    addRecord,
    deleteRecord
  };
} 