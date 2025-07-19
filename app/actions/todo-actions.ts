'use server';

export async function generateTodo(projectName: string, timeAvailable: number, dailyGoal?: string) {
  try {
    const response = await fetch(`https://choiben-back.youkan.uk/api/ai/scrapbox-todo/${projectName}`, {
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

    if (!response.ok) {
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
    const response = await fetch(`https://choiben-back.youkan.uk/api/ai/todo`, {
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

    if (!response.ok) {
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
