'use server';

export async function generateTodo(projectName: string, timeAvailable: number, dailyGoal?: string) {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('BACKEND_API_URLが設定されていません');
    }

    const response = await fetch(`${process.env.BACKEND_API_URL}/api/ai/scrapbox-todo/${projectName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        time_available: timeAvailable,
        daily_goal: dailyGoal,
      }),
    });

    if (!response.ok) {
      console.error(`API呼び出しエラー: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.content,
      response_type: 'scrapbox'
    };
  } catch (error) {
    console.error('TODO生成エラー:', error);
    throw new Error('TODOの生成に失敗しました');
  }
}

export async function generateGeneralTodo(timeAvailable: number, recentProgress?: string, weakAreas?: string[], dailyGoal?: string) {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('BACKEND_API_URLが設定されていません');
    }

    const response = await fetch(`${process.env.BACKEND_API_URL}/api/ai/todo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        time_available: timeAvailable,
        recent_progress: recentProgress,
        weak_areas: weakAreas,
        daily_goal: dailyGoal,
      }),
    });

    if (!response.ok) {
      console.error(`API呼び出しエラー: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.content,
      response_type: 'general'
    };
  } catch (error) {
    console.error('TODO生成エラー:', error);
    throw new Error('TODOの生成に失敗しました');
  }
}
