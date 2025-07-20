import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 開発環境での環境変数チェック（空文字列は未設定として扱う）
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     (typeof window !== 'undefined' && window.location.port === '3002');
const hasValidUrl = supabaseUrl && supabaseUrl.trim() !== '';
const hasValidKey = supabaseAnonKey && supabaseAnonKey.trim() !== '';

// 開発環境でのデバッグ情報を表示
if (isDevelopment) {
  console.log('🔍 Supabase環境変数チェック:', {
    hasUrl: hasValidUrl,
    hasKey: hasValidKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
    urlPrefix: supabaseUrl?.substring(0, 20) + '...',
    keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
    nodeEnv: process.env.NODE_ENV,
    port: typeof window !== 'undefined' ? window.location.port : 'N/A',
    isEmptyUrl: supabaseUrl === '',
    isEmptyKey: supabaseAnonKey === ''
  });
}

// 環境変数の設定状況をチェック
if (!hasValidUrl || !hasValidKey) {
  const errorMessage = `⚠️ Supabase環境変数が設定されていません。
  
現在の設定状況:
- NEXT_PUBLIC_SUPABASE_URL: ${hasValidUrl ? '設定済み' : '未設定'}${supabaseUrl === '' ? ' (空文字列)' : ''}
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasValidKey ? '設定済み' : '未設定'}${supabaseAnonKey === '' ? ' (空文字列)' : ''}

環境: ${process.env.NODE_ENV}
実行場所: ${typeof window !== 'undefined' ? 'ブラウザ' : 'サーバー'}
ポート: ${typeof window !== 'undefined' ? window.location.port : 'N/A'}

設定方法:
1. 開発環境: プロジェクトルートに.env.localファイルを作成
2. 本番環境: GitLab CI/CDの環境変数を設定
3. サーバーを再起動

.env.localの例:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

注意: ポート3002で動作している場合は開発環境です。`;

  // 開発環境では警告のみ表示
  if (isDevelopment) {
    console.warn(errorMessage);
  } else {
    console.error(errorMessage);
  }
}

// 環境変数が設定されている場合のみSupabaseクライアントを作成
export const supabase = hasValidUrl && hasValidKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// クライアントコンポーネント用のSupabaseクライアント
export const createSupabaseClient = () => {
  if (!hasValidUrl || !hasValidKey) {
    console.warn('Supabase環境変数が設定されていません');
    return null;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// クライアントの状態をログ出力
if (isDevelopment) {
  console.log('🔧 Supabaseクライアント状態:', {
    isInitialized: !!supabase,
    clientType: supabase ? 'initialized' : 'null',
    nodeEnv: process.env.NODE_ENV,
    port: typeof window !== 'undefined' ? window.location.port : 'N/A'
  });
}
