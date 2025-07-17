import { NextRequest, NextResponse } from 'next/server';

interface TodoRequest {
  time_available: number;
  recent_progress?: string;
  weak_areas?: string[];
  daily_goal?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { project_name: string } }
) {
  try {
    const projectName = decodeURIComponent(params.project_name);
    const body: TodoRequest = await request.json();
    const { time_available, recent_progress, weak_areas, daily_goal } = body;

    // バリデーション: time_availableのみ必須
    if (!time_available || time_available < 1 || time_available > 480) {
      return NextResponse.json(
        { success: false, content: '勉強時間は1分〜480分の間で指定してください', response_type: 'error' },
        { status: 400 }
      );
    }

    // FastAPI等のバックエンドAPIにPOST
    const backendRes = await fetch(`http://localhost:8000/api/ai/scrapbox-todo/${encodeURIComponent(projectName)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-From-Next': 'true',
      },
      body: JSON.stringify({ time_available, recent_progress, weak_areas, daily_goal }),
    });

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