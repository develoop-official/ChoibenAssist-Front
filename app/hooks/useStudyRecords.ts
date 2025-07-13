'use client';

import { useState, useEffect } from 'react';
import { StudyRecord, CreateStudyRecord } from '../types/study-record';
import { supabase } from '../../lib/supabase';
import { useAuth } from './useAuth';

export function useStudyRecords() {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Supabaseから学習記録を取得
  const fetchRecords = async () => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    if (!supabase) {
      console.warn('Supabaseクライアントが初期化されていません');
      console.log('環境変数チェック:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });
      setError('Supabaseが設定されていません');
      setLoading(false);
      return;
    }

    // デバッグ用: Supabaseクライアントの状態を確認
    console.log('📊 データ取得前の状態確認:', {
      hasClient: !!supabase,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userMetadata: user?.user_metadata
    });

    try {
      setLoading(true);
      setError(null);

      // まずテーブルの存在を確認
      const { data: tableCheck, error: tableError } = await supabase
        .from('study_records')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn('テーブルアクセスエラー:', tableError);
        console.log('テーブルエラー詳細:', {
          code: tableError.code,
          message: tableError.message,
          details: tableError.details,
          hint: tableError.hint
        });
        
        if (tableError.code === '42P01' || tableError.message?.includes('relation "study_records" does not exist')) {
          console.warn('study_recordsテーブルが存在しません。テーブルを作成してください。');
          setError('データベーステーブルが存在しません。管理者に連絡してください。');
          setRecords([]);
          setLoading(false);
          return;
        }
        
        // 400エラーの場合は認証や権限の問題の可能性
        if (tableError.code === '400' || tableError.message?.includes('400')) {
          console.error('400エラー - 認証または権限の問題の可能性:', tableError);
          setError('認証に問題があります。ログインし直してください。');
          setRecords([]);
          setLoading(false);
          return;
        }
      }

      // 実際のデータ取得
      const { data, error } = await supabase
        .from('study_records')
        .select(`
          id,
          subject,
          duration,
          notes,
          created_at,
          updated_at,
          user_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // データが存在しない場合はエラーとして扱わない
        if (error.code === 'PGRST116' || error.message?.includes('No rows returned')) {
          setRecords([]);
          return;
        }
        
        // テーブルが存在しない場合や権限エラーの場合
        if (error.code === '42P01' || error.message?.includes('relation "study_records" does not exist')) {
          console.warn('study_recordsテーブルが存在しません。テーブルを作成してください。');
          setRecords([]);
          return;
        }
        
        // ネットワークエラーやその他のエラー
        console.error('Supabaseエラー詳細:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          stack: error.stack,
          fullError: error
        });
        
        // エラーが空のオブジェクトの場合は特別処理
        if (!error.message && !error.code) {
          console.warn('空のエラーオブジェクトが返されました。Supabaseクライアントの状態を確認してください。');
          console.log('現在のSupabaseクライアント:', supabase);
          setError('Supabaseの接続に問題があります。環境変数を確認してください。');
          setRecords([]);
          return;
        }
        
        throw error;
      }

      // Supabaseのデータ形式をアプリケーションの型に変換
      const formattedRecords: StudyRecord[] = (data || []).map(record => ({
        id: record.id,
        subject: record.subject,
        duration: record.duration,
        notes: record.notes,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
        user_id: record.user_id,
        user_email: user.email,
        user_name: user.user_metadata?.full_name
      }));

      setRecords(formattedRecords);
    } catch (err) {
      console.error('学習記録の取得に失敗しました:', err);
      
      // エラーの詳細をログに出力（デバッグ用）
      if (err instanceof Error) {
        console.error('エラー詳細:', {
          message: err.message,
          name: err.name,
          stack: err.stack
        });
      } else {
        console.error('エラーオブジェクト:', err);
      }
      
      // エラーの種類に応じて適切な処理
      if (err instanceof Error) {
        if (err.message.includes('fetch') || err.message.includes('network')) {
          setError('ネットワークエラーが発生しました。インターネット接続を確認してください。');
        } else if (err.message.includes('Supabaseが設定されていません')) {
          setError('Supabaseが設定されていません');
        } else {
          setError('学習記録の取得に失敗しました');
        }
      } else {
        setError('予期しないエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントマウント時とユーザー変更時にデータを取得
  useEffect(() => {
    fetchRecords();
  }, [user]);

  // 新しい学習記録を追加
  const addRecord = async (newRecord: CreateStudyRecord) => {
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    if (!supabase) {
      throw new Error('Supabaseが設定されていません');
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('study_records')
        .insert([
          {
            user_id: user.id,
            subject: newRecord.subject,
            duration: newRecord.duration,
            notes: newRecord.notes
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 新しいレコードをアプリケーションの型に変換
      const formattedRecord: StudyRecord = {
        id: data.id,
        subject: data.subject,
        duration: data.duration,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        user_id: data.user_id,
        user_email: user.email,
        user_name: user.user_metadata?.full_name
      };

      // ローカル状態を更新
      setRecords(prev => [formattedRecord, ...prev]);
    } catch (err) {
      console.error('学習記録の追加に失敗しました:', err);
      setError('学習記録の追加に失敗しました');
      throw err;
    }
  };

  // 学習記録を削除
  const deleteRecord = async (id: string) => {
    if (!supabase) {
      throw new Error('Supabaseが設定されていません');
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('study_records')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // ローカル状態を更新
      setRecords(prev => prev.filter(record => record.id !== id));
    } catch (err) {
      console.error('学習記録の削除に失敗しました:', err);
      setError('学習記録の削除に失敗しました');
      throw err;
    }
  };

  return {
    records,
    loading,
    error,
    addRecord,
    deleteRecord,
    refetch: fetchRecords
  };
} 