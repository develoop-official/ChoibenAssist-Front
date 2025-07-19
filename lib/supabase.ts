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

// 開発環境でのみ警告を表示
if (process.env.NODE_ENV === 'development' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '⚠️ Supabase環境変数が設定されていません。\n' +
    '以下の手順で設定してください：\n' +
    '1. プロジェクトルートに.env.localファイルを作成\n' +
    '2. NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定\n' +
    '3. 開発サーバーを再起動\n' +
    '詳細はSUPABASE_SETUP.mdを参照してください。'
  );
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
