import { supabase } from '../../lib/supabase';

/**
 * データベース接続を確認する
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    if (!supabase) {
      console.error('Supabaseクライアントが初期化されていません');
      return false;
    }

    // 簡単なクエリで接続をテスト
    const { error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('データベース接続エラー:', error);
      return false;
    }

    console.warn('データベース接続成功');
    return true;
  } catch (err) {
    console.error('データベース接続確認エラー:', err);
    return false;
  }
}

/**
 * 指定されたテーブルが存在するか確認する
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    if (!supabase) {
      console.error('Supabaseクライアントが初期化されていません');
      return false;
    }

    // テーブルの存在を確認するためのクエリ
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        // テーブルが存在しない
        console.warn(`テーブル ${tableName} が存在しません`);
        return false;
      }
      console.error(`テーブル ${tableName} 確認エラー:`, error);
      return false;
    }

    console.warn(`テーブル ${tableName} が存在します`);
    return true;
  } catch (err) {
    console.error(`テーブル ${tableName} 確認エラー:`, err);
    return false;
  }
}

/**
 * フォローテーブルの機能をテストする
 */
export async function testFollowRecord(userId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!supabase) {
      return {
        success: false,
        message: 'Supabaseクライアントが初期化されていません'
      };
    }

    // テスト用のフォロー先ユーザーID（実際には存在しないID）
    const testFollowingId = '00000000-0000-0000-0000-000000000000';

    // 1. テスト用のフォロー記録を作成
    const { error: insertError } = await supabase
      .from('user_follows')
      .insert({
        follower_id: userId,
        following_id: testFollowingId,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      return {
        success: false,
        message: `フォロー記録作成エラー: ${insertError.message}`
      };
    }

    // 2. 作成したフォロー記録を確認
    const { data: checkData, error: checkError } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', userId)
      .eq('following_id', testFollowingId)
      .single();

    if (checkError || !checkData) {
      return {
        success: false,
        message: `フォロー記録確認エラー: ${checkError?.message || 'データが見つかりません'}`
      };
    }

    // 3. テスト用のフォロー記録を削除
    const { error: deleteError } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', testFollowingId);

    if (deleteError) {
      return {
        success: false,
        message: `フォロー記録削除エラー: ${deleteError.message}`
      };
    }

    return {
      success: true,
      message: 'フォローテーブルのテストが成功しました（作成・確認・削除）'
    };
  } catch (err) {
    return {
      success: false,
      message: `フォローテーブルテストエラー: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
}
