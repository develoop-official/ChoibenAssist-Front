'use server';

export async function generateTodo(projectName: string, timeAvailable: number, dailyGoal?: string, accessToken?: string) {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('BACKEND_API_URLが設定されていません');
    }

    if (!accessToken) {
      throw new Error('認証トークンが必要です。ログインしてください。');
    }

    const response = await fetch(`${process.env.BACKEND_API_URL}/api/ai/scrapbox-todo/${projectName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        time_available: timeAvailable,
        daily_goal: dailyGoal,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API呼び出しエラー: ${response.status} ${response.statusText}`, errorText);
      if (response.status === 403) {
        throw new Error('認証に失敗しました。再度ログインしてください。');
      } else if (response.status === 404) {
        throw new Error('APIエンドポイントが見つかりません。バックエンドの設定を確認してください。');
      } else {
        throw new Error(`バックエンドAPIエラー: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    return {
      success: true,
      content: data.content,
      response_type: 'scrapbox'
    };
  } catch (error) {
    console.error('TODO生成エラー:', error);
    if (error instanceof Error) {
      throw new Error(`TODOの生成に失敗しました: ${error.message}`);
    }
    throw new Error('TODOの生成に失敗しました');
  }
}

export async function generateGeneralTodo(timeAvailable: number, recentProgress?: string, weakAreas?: string[], dailyGoal?: string, accessToken?: string) {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('BACKEND_API_URLが設定されていません');
    }

    if (!accessToken) {
      throw new Error('認証トークンが必要です。ログインしてください。');
    }

    const response = await fetch(`${process.env.BACKEND_API_URL}/api/ai/todo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        time_available: timeAvailable,
        recent_progress: recentProgress,
        weak_areas: weakAreas,
        daily_goal: dailyGoal,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API呼び出しエラー: ${response.status} ${response.statusText}`, errorText);
      if (response.status === 403) {
        throw new Error('認証に失敗しました。再度ログインしてください。');
      } else if (response.status === 404) {
        throw new Error('APIエンドポイントが見つかりません。バックエンドの設定を確認してください。');
      } else {
        throw new Error(`バックエンドAPIエラー: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    return {
      success: true,
      content: data.content,
      response_type: 'general'
    };
  } catch (error) {
    console.error('TODO生成エラー:', error);
    if (error instanceof Error) {
      throw new Error(`TODOの生成に失敗しました: ${error.message}`);
    }
    throw new Error('TODOの生成に失敗しました');
  }
}
