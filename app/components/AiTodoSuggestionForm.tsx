'use client';

import React, { useState } from 'react';

import { generateTodo, generateGeneralTodo } from '../actions/todo-actions';
import { supabase } from '../../lib/supabase';
import { formStyles, buttonStyles, statusStyles, aiTodoSuggestionStyles } from '../styles/components';
import { css } from '../../styled-system/css';

interface AiTodoSuggestionFormProps {
  onResult: (_result: TodoSuggestionResponse) => void;
  onError: (_error: string) => void;
  onLoading: (_loading: boolean) => void;
  scrapboxProjectName?: string;
  loading: boolean;
}

interface TodoSuggestionResponse {
  success: boolean;
  content: string;
  response_type: string;
}

export default function AiTodoSuggestionForm({ 
  onResult, 
  onError, 
  onLoading, 
  scrapboxProjectName,
  loading
}: AiTodoSuggestionFormProps) {
  const [useScrapbox, setUseScrapbox] = useState(!!scrapboxProjectName);

  // Scrapbox連携時のシンプルなフォーム
  const [scrapboxForm, setScrapboxForm] = useState({
    time_available: 60,
    daily_goal: ''
  });

  // 一般提案時の詳細フォーム
  const [generalForm, setGeneralForm] = useState({
    time_available: 60,
    recent_progress: '',
    weak_areas: '',
    daily_goal: ''
  });

  // TODO提案を生成
  const handleGenerateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const timeAvailable = useScrapbox ? scrapboxForm.time_available : generalForm.time_available;
    if (!timeAvailable || timeAvailable < 1 || timeAvailable > 480) {
      onError('勉強時間は1分〜480分の間で指定してください。');
      return;
    }

    try {
      onLoading(true);
      onError('');

      // セッショントークンを取得
      if (!supabase) {
        onError('Supabaseが設定されていません。');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        onError('認証トークンが見つかりません。再度ログインしてください。');
        return;
      }

      let todoResult: TodoSuggestionResponse;

      if (useScrapbox && scrapboxProjectName) {
        // Scrapbox連携API
        todoResult = await generateTodo(
          scrapboxProjectName,
          timeAvailable,
          scrapboxForm.daily_goal
        );
      } else {
        // 一般AI提案API
        const weakAreasArray = generalForm.weak_areas
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        todoResult = await generateGeneralTodo(
          timeAvailable,
          generalForm.recent_progress,
          weakAreasArray,
          generalForm.daily_goal
        );
      }

      onResult(todoResult);
    } catch (err) {
      console.error('TODO提案エラー:', err);
      onError('TODO提案の取得に失敗しました。');
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className={aiTodoSuggestionStyles.container}>
      {/* モード切り替えボタン */}
      {scrapboxProjectName && (
        <div className={aiTodoSuggestionStyles.modeToggle}>
          <button
            onClick={() => setUseScrapbox(!useScrapbox)}
            disabled={loading}
            className={`${aiTodoSuggestionStyles.modeButton} ${
              useScrapbox ? aiTodoSuggestionStyles.modeButtonActive : aiTodoSuggestionStyles.modeButtonInactive
            }`}
          >
            {useScrapbox ? '📚 Scrapbox連携' : '🤖 一般AI提案'}
          </button>
        </div>
      )}

      {/* フォーム */}
      <form onSubmit={handleGenerateTodo} className={css({
        spaceY: '4'
      })}>

        <div>
          <label className={formStyles.label}>
            勉強時間（分）
          </label>
          <input
            type="number"
            min="1"
            max="480"
            disabled={loading}
            value={useScrapbox ? scrapboxForm.time_available : generalForm.time_available}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              if (useScrapbox) {
                setScrapboxForm(prev => ({ ...prev, time_available: value }));
              } else {
                setGeneralForm(prev => ({ ...prev, time_available: value }));
              }
            }}
            className={formStyles.input}
          />
        </div>

        {useScrapbox ? (
          // Scrapbox連携時のシンプルなフォーム
          <div>
            <label className={formStyles.label}>
              今日の目標
            </label>
            <input
              type="text"
              disabled={loading}
              value={scrapboxForm.daily_goal}
              onChange={(e) => setScrapboxForm(prev => ({
                ...prev,
                daily_goal: e.target.value
              }))}
              placeholder="今日達成したい目標"
              className={formStyles.input}
            />
          </div>
        ) : (
          // 一般提案時の詳細フォーム
          <>
            <div>
              <label className={formStyles.label}>
                最近の進捗
              </label>
              <textarea
                disabled={loading}
                value={generalForm.recent_progress}
                onChange={(e) => setGeneralForm(prev => ({
                  ...prev,
                  recent_progress: e.target.value
                }))}
                placeholder="最近何を勉強しましたか？"
                className={formStyles.textarea}
              />
            </div>

            <div>
              <label className={formStyles.label}>
                苦手分野（カンマ区切り）
              </label>
              <input
                type="text"
                disabled={loading}
                value={generalForm.weak_areas}
                onChange={(e) => setGeneralForm(prev => ({
                  ...prev,
                  weak_areas: e.target.value
                }))}
                placeholder="例：数学, 英語"
                className={formStyles.input}
              />
            </div>

            <div>
              <label className={formStyles.label}>
                今日の目標
              </label>
              <input
                type="text"
                disabled={loading}
                value={generalForm.daily_goal}
                onChange={(e) => setGeneralForm(prev => ({
                  ...prev,
                  daily_goal: e.target.value
                }))}
                placeholder="今日達成したい目標"
                className={formStyles.input}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`${buttonStyles.primary} ${loading ? css({
            opacity: 0.6,
            cursor: 'not-allowed'
          }) : ''}`}
        >
          {loading ? (
            <div className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2'
            })}>
              <div className={css({
                width: '4',
                height: '4',
                border: '2px solid',
                borderColor: 'transparent',
                borderTopColor: 'currentColor',
                borderRadius: 'full',
                animation: 'spin 1s linear infinite'
              })} />
              <span>生成中...</span>
            </div>
          ) : (
            'TODOを生成'
          )}
        </button>
      </form>
    </div>
  );
} 