'use server';

export async function generateTodo(projectName: string, timeAvailable: number, dailyGoal?: string) {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('BACKEND_API_URLが設定されていません');
    }

    if (!process.env.API_SECRET_KEY) {
      throw new Error('API_SECRET_KEYが設定されていません');
    }

    // 複数のエンドポイントパターンを試行
    const endpoints = [
      `/api/ai/scrapbox-todo/${projectName}`,
      `/api/scrapbox-todo/${projectName}`,
      `/ai/scrapbox-todo/${projectName}`,
      `/scrapbox-todo/${projectName}`
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      const apiUrl = `${process.env.BACKEND_API_URL}${endpoint}`;
      console.warn('🔍 Scrapbox TODO API呼び出し試行:', {
        url: apiUrl,
        method: 'POST',
        hasApiKey: !!process.env.API_SECRET_KEY,
        projectName,
        timeAvailable,
        dailyGoal
      });

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_SECRET_KEY}`,
          },
          body: JSON.stringify({
            time_available: timeAvailable,
            daily_goal: dailyGoal,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.warn('✅ Scrapbox TODO API成功:', endpoint);
          return {
            success: true,
            content: data.content,
            response_type: 'scrapbox'
          };
        } else {
          const errorText = await response.text();
          console.error(`API呼び出しエラー (${endpoint}): ${response.status} ${response.statusText}`, errorText);
          lastError = { status: response.status, text: errorText, endpoint };
        }
      } catch (error) {
        console.error(`API呼び出し例外 (${endpoint}):`, error);
        lastError = { error: error instanceof Error ? error.message : 'Unknown error', endpoint };
      }
    }

    // すべてのエンドポイントが失敗した場合
    if (lastError) {
      if (lastError.status === 403) {
        throw new Error('認証に失敗しました。APIキーを確認してください。');
      } else if (lastError.status === 404) {
        throw new Error(`APIエンドポイントが見つかりません。試行したエンドポイント: ${endpoints.join(', ')}`);
      } else {
        throw new Error(`バックエンドAPIエラー: ${lastError.status || 'Unknown'} - ${lastError.text || lastError.error}`);
      }
    }

    throw new Error('すべてのAPIエンドポイントでエラーが発生しました');
  } catch (error) {
    console.error('TODO生成エラー:', error);
    if (error instanceof Error) {
      throw new Error(`TODOの生成に失敗しました: ${error.message}`);
    }
    throw new Error('TODOの生成に失敗しました');
  }
}

export async function generateGeneralTodo(timeAvailable: number, recentProgress?: string, weakAreas?: string[], dailyGoal?: string) {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('BACKEND_API_URLが設定されていません');
    }

    if (!process.env.API_SECRET_KEY) {
      throw new Error('API_SECRET_KEYが設定されていません');
    }

    // 複数のエンドポイントパターンを試行
    const endpoints = [
      `/api/ai/todo`,
      `/api/todo`,
      `/ai/todo`,
      `/todo`
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      const apiUrl = `${process.env.BACKEND_API_URL}${endpoint}`;
      console.warn('🔍 一般TODO API呼び出し試行:', {
        url: apiUrl,
        method: 'POST',
        hasApiKey: !!process.env.API_SECRET_KEY,
        timeAvailable,
        recentProgress,
        weakAreas,
        dailyGoal
      });

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_SECRET_KEY}`,
          },
          body: JSON.stringify({
            time_available: timeAvailable,
            recent_progress: recentProgress,
            weak_areas: weakAreas,
            daily_goal: dailyGoal,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.warn('✅ 一般TODO API成功:', endpoint);
          return {
            success: true,
            content: data.content,
            response_type: 'general'
          };
        } else {
          const errorText = await response.text();
          console.error(`API呼び出しエラー (${endpoint}): ${response.status} ${response.statusText}`, errorText);
          lastError = { status: response.status, text: errorText, endpoint };
        }
      } catch (error) {
        console.error(`API呼び出し例外 (${endpoint}):`, error);
        lastError = { error: error instanceof Error ? error.message : 'Unknown error', endpoint };
      }
    }

    // すべてのエンドポイントが失敗した場合
    if (lastError) {
      if (lastError.status === 403) {
        throw new Error('認証に失敗しました。APIキーを確認してください。');
      } else if (lastError.status === 404) {
        throw new Error(`APIエンドポイントが見つかりません。試行したエンドポイント: ${endpoints.join(', ')}`);
      } else {
        throw new Error(`バックエンドAPIエラー: ${lastError.status || 'Unknown'} - ${lastError.text || lastError.error}`);
      }
    }

    throw new Error('すべてのAPIエンドポイントでエラーが発生しました');
  } catch (error) {
    console.error('TODO生成エラー:', error);
    if (error instanceof Error) {
      throw new Error(`TODOの生成に失敗しました: ${error.message}`);
    }
    throw new Error('TODOの生成に失敗しました');
  }
}
