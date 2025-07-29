import { User} from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // リフレッシュトークンエラーを処理する関数
  const handleRefreshTokenError = async () => {
    console.warn('リフレッシュトークンエラーを検出しました。ローカルストレージをクリアしてログアウト状態にします。');
    
    try {
      // ローカルストレージをクリア
      localStorage.clear();
      sessionStorage.clear();
      
      // Supabaseのセッションもクリア
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      setUser(null);
      setError(null);
      
      // ログインページにリダイレクト
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('ログアウト処理エラー:', err);
    }
  };

  useEffect(() => {
    // Supabaseクライアントが存在しない場合
    if (!supabase) {
      setError('Supabaseが設定されていません。lib/supabase.tsファイルを確認し、環境変数SUPABASE_URLとSUPABASE_ANON_KEYが正しく設定されているか確認してください。');
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
        if (error?.message?.includes('Invalid Refresh Token') || 
            error?.message?.includes('Refresh Token Not Found') ||
            error?.message?.includes('JWT expired')) {
          await handleRefreshTokenError();
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
        // エラーメッセージにリフレッシュトークン関連の文字列が含まれている場合
        if (err instanceof Error && (
          err.message.includes('Invalid Refresh Token') ||
          err.message.includes('Refresh Token Not Found') ||
          err.message.includes('JWT expired')
        )) {
          await handleRefreshTokenError();
          return;
        }
        setError('認証サービスの接続に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('認証状態変更:', event, session?.user?.id);
        
        // リフレッシュトークンエラーをチェック
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('トークンリフレッシュに失敗しました。ログアウト状態にします。');
          await handleRefreshTokenError();
          return;
        }
        
        // その他の認証エラー
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        } else if (session) {
          setUser(session.user);
          setError(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabaseが設定されていません。lib/supabase.tsファイルを確認し、環境変数SUPABASE_URLとSUPABASE_ANON_KEYが正しく設定されているか確認してください。') };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabaseが設定されていません。lib/supabase.tsファイルを確認し、環境変数SUPABASE_URLとSUPABASE_ANON_KEYが正しく設定されているか確認してください。') };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'twitter') => {
    if (!supabase) {
      return { data: null, error: new Error('Supabaseが設定されていません。lib/supabase.tsファイルを確認し、環境変数SUPABASE_URLとSUPABASE_ANON_KEYが正しく設定されているか確認してください。') };
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
      return { error: new Error('Supabaseが設定されていません。lib/supabase.tsファイルを確認し、環境変数SUPABASE_URLとSUPABASE_ANON_KEYが正しく設定されているか確認してください。') };
    }
    try {
      // ローカルストレージとセッションストレージをクリア
      localStorage.clear();
      sessionStorage.clear();
      
      // Supabaseのセッションをクリア
      const { error } = await supabase.auth.signOut();
      
      // ユーザー状態をリセット
      setUser(null);
      setError(null);
      
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
