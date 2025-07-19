import { NextRequest, NextResponse } from 'next/server';

interface TodoRequest {
  time_available: number;
  recent_progress?: string;
  weak_areas?: string[];
  daily_goal?: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ project_name: string }> }
) {
  try {
    const params = await context.params;
    const projectName = decodeURIComponent(params.project_name);
    const body: TodoRequest = await request.json();
    const { time_available, recent_progress, weak_areas, daily_goal } = body;

    // console.log('API Route called with:', { projectName, body });

    // バリデーション: time_availableのみ必須
    if (!time_available || time_available < 1 || time_available > 480) {
      return NextResponse.json(
        { success: false, content: '勉強時間は1分〜480分の間で指定してください', response_type: 'error' },
        { status: 400 }
      );
    }

    // バックエンドAPIにリクエストを送信
    const backendUrl = process.env.BACKEND_API_URL;
    console.error('Backend URL:', backendUrl);
    console.error('Project name:', projectName);

    const requestBody = JSON.stringify({ time_available, recent_progress, weak_areas, daily_goal });
    console.error('Request body:', requestBody);

    const apiKey = process.env.BACKEND_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-From-Next': 'true',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const backendRes = await fetch(`${backendUrl}/api/ai/scrapbox-todo/${encodeURIComponent(projectName)}`, {
      method: 'POST',
      headers,
      body: requestBody,
    });

    console.error('Backend response status:', backendRes.status);
    console.error('Backend response headers:', Object.fromEntries(backendRes.headers.entries()));

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend API Error: ${backendRes.status} ${backendRes.statusText} - ${errorText}`);
    }

    const backendJson = await backendRes.json();
    return NextResponse.json(backendJson, { status: backendRes.status });
  } catch (error) {
    console.error('Scrapbox TODO API エラー:', error);
    return NextResponse.json(
      { success: false, content: 'サーバーエラーが発生しました', response_type: 'error' },
      { status: 500 }
    );
  }
}
