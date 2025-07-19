import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// アバター画像をアップロードする関数
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase環境変数が設定されていません');
  }
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  // ファイル拡張子を取得
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `${userId}/${fileName}`; // ユーザーごとにフォルダ分け

  // ファイルをアップロード
  const { data, error } = await supabase
    .storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // 同名ファイルを上書き
    });

  if (error) {
    console.error('アバターアップロードエラー:', error);
    throw new Error('アバター画像のアップロードに失敗しました');
  }

  // 公開URLを取得
  const { data: urlData } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// アバター画像を削除する関数
export async function deleteAvatar(userId: string): Promise<void> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase環境変数が設定されていません');
  }
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  try {
    // ユーザーのアバターファイルを検索
    const { data: files, error: listError } = await supabase
      .storage
      .from('avatars')
      .list(userId);

    if (listError) {
      console.error('ファイル一覧取得エラー:', listError);
      return;
    }

    // ユーザーのファイルを削除
    if (files && files.length > 0) {
      const filePaths = files.map(file => `${userId}/${file.name}`);
      const { error: deleteError } = await supabase
        .storage
        .from('avatars')
        .remove(filePaths);

      if (deleteError) {
        console.error('ファイル削除エラー:', deleteError);
      }
    }
  } catch (error) {
    console.error('アバター削除エラー:', error);
  }
}

// ファイルのバリデーション
export function validateAvatarFile(file: File): { isValid: boolean; error?: string } {
  // ファイルサイズチェック（5MB以下）
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'ファイルサイズは5MB以下にしてください' };
  }

  // ファイル形式チェック
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'JPEG、PNG、GIF、WebP形式の画像のみアップロード可能です' };
  }

  return { isValid: true };
}
