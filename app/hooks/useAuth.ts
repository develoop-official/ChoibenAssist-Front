import { User} from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabaseクライアントが存在しない場合
    if (!supabase) {
      setError('Supabaseが設定されていません');
      setLoading(false);
      return;
    }

    // 現在のセッションを取得
    const getSession = async () => {
      try {
        const response = await supabase?.auth.getSession();
        const session = response?.data?.session;
        const error = response?.error;

        // リフレッシュトークンエラーの場合、ローカルストレージをクリア
        if (error?.message?.includes('Invalid Refresh Token') || error?.message?.includes('Refresh Token Not Found')) {
          console.warn('リフレッシュトークンエラーを検出しました。ローカルストレージをクリアします。');
          localStorage.removeItem('supabase.auth.token');
          setUser(null);
          setError(null);
          setLoading(false);
          return;
        }

        if (error) {
          console.error('セッション取得エラー:', error);
          setError('認証サービスの接続に失敗しました');
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('認証エラー:', err);
        setError('認証サービスの接続に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // リフレッシュトークンエラーをチェック
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('トークンリフレッシュに失敗しました。ログアウト状態にします。');
          setUser(null);
          setError(null);
        } else {
          setUser(session?.user ?? null);
          setError(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabaseが設定されていません') };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabaseが設定されていません') };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'twitter') => {
    if (!supabase) {
      return { data: null, error: new Error('Supabaseが設定されていません') };
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/redirect`,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error('Supabaseが設定されていません') };
    }

    try {
      // ローカルストレージもクリア
      localStorage.removeItem('supabase.auth.token');
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      console.error('ログアウトエラー:', err);
      return { error: err as Error };
    }
  };

  return {
    user,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    signOut,
  };
};
