import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 開発環境でのデバッグ情報を表示
if (process.env.NODE_ENV === 'development') {
  // console.log('🔍 Supabase環境変数チェック:', {
  //   hasUrl: !!supabaseUrl,
  //   hasKey: !!supabaseAnonKey,
  //   urlLength: supabaseUrl?.length || 0,
  //   keyLength: supabaseAnonKey?.length || 0,
  //   urlPrefix: supabaseUrl?.substring(0, 20) + '...',
  //   keyPrefix: supabaseAnonKey?.substring(0, 20) + '...'
  // });
}

// 環境変数の設定状況をチェック
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `⚠️ Supabase環境変数が設定されていません。
  
現在の設定状況:
- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '設定済み' : '未設定'}
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '設定済み' : '未設定'}

環境: ${process.env.NODE_ENV}
実行場所: ${typeof window !== 'undefined' ? 'ブラウザ' : 'サーバー'}

設定方法:
1. 開発環境: プロジェクトルートに.env.localファイルを作成
2. 本番環境: GitLab CI/CDの環境変数を設定
3. サーバーを再起動

.env.localの例:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`;

  if (process.env.NODE_ENV === 'development') {
    console.warn(errorMessage);
  } else {
    console.error(errorMessage);
  }
}

// 環境変数が設定されている場合のみSupabaseクライアントを作成
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// クライアントコンポーネント用のSupabaseクライアント
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase環境変数が設定されていません');
    return null;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// クライアントの状態をログ出力
if (process.env.NODE_ENV === 'development') {
  // console.log('🔧 Supabaseクライアント状態:', {
  //   isInitialized: !!supabase,
  //   clientType: supabase ? 'initialized' : 'null'
  // });
}
