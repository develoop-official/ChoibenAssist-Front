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

    console.log('API Route called with:', { projectName, body });

    // バリデーション: time_availableのみ必須
    if (!time_available || time_available < 1 || time_available > 480) {
      return NextResponse.json(
        { success: false, content: '勉強時間は1分〜480分の間で指定してください', response_type: 'error' },
        { status: 400 }
      );
    }

    // テスト用: バックエンドAPIへのリクエストを一時的にコメントアウト
    // const backendRes = await fetch(`http://localhost:8000/api/ai/scrapbox-todo/${encodeURIComponent(projectName)}`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-From-Next': 'true',
    //   },
    //   body: JSON.stringify({ time_available, recent_progress, weak_areas, daily_goal }),
    // });

    // const backendJson = await backendRes.json();
    // return NextResponse.json(backendJson, { status: backendRes.status });

    // テスト用レスポンス
    const testResponse = {
      success: true,
      content: `📚 今日の学習TODOリスト（${time_available}分）

• 英単語の暗記（20分）
• 数学の問題演習（30分）
• リスニング練習（15分）
• 復習・まとめ（15分）

💡 今日の目標: ${daily_goal || '効率的に学習を進める'}

✅ 完了したらTODOリストに追加して管理しましょう！`,
      response_type: 'success'
    };

    return NextResponse.json(testResponse, { status: 200 });
  } catch (error) {
    console.error('Scrapbox TODO API エラー:', error);
    return NextResponse.json(
      { success: false, content: 'サーバーエラーが発生しました', response_type: 'error' },
      { status: 500 }
    );
  }
} 