import { NextRequest, NextResponse } from 'next/server';

interface TodoRequest {
  time_available: number;
  daily_goal: string;
}

interface TodoResponse {
  success: boolean;
  content: string;
  response_type: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { project_name: string } }
) {
  try {
    // プロジェクト名を取得
    const projectName = decodeURIComponent(params.project_name);
    
    // リクエストボディを取得
    const body: TodoRequest = await request.json();
    const { time_available, daily_goal } = body;

    // バリデーション
    if (!projectName) {
      return NextResponse.json(
        { success: false, content: 'プロジェクト名が指定されていません', response_type: 'error' },
        { status: 400 }
      );
    }

    if (!time_available || time_available < 15 || time_available > 480) {
      return NextResponse.json(
        { success: false, content: '勉強時間は15分〜480分の間で指定してください', response_type: 'error' },
        { status: 400 }
      );
    }

    if (!daily_goal || daily_goal.trim().length === 0) {
      return NextResponse.json(
        { success: false, content: '今日の目標を入力してください', response_type: 'error' },
        { status: 400 }
      );
    }

    // TODO: 実際のAI APIとの連携
    // 現在はモックレスポンスを返す
    const mockResponse: TodoResponse = {
      success: true,
      content: `📚 ${projectName} プロジェクトの今日のTODOリスト

⏰ 利用可能時間: ${time_available}分
🎯 今日の目標: ${daily_goal}

## 推奨TODOリスト

### 1. 準備・計画 (15分)
- 今日の学習計画を立てる
- 必要な教材・ツールを準備する
- 学習環境を整える

### 2. メイン学習 (${Math.floor(time_available * 0.7)}分)
- ${daily_goal}に集中して取り組む
- 理解度を確認しながら進める
- 分からない点があればメモを取る

### 3. 復習・整理 (${Math.floor(time_available * 0.15)}分)
- 今日学んだ内容を振り返る
- 重要ポイントをまとめる
- 次回への課題を整理する

### 4. 振り返り (${Math.floor(time_available * 0.15)}分)
- 学習記録を更新する
- 達成感を味わう
- 明日の計画を考える

💡 ヒント: 集中力が切れたら5分休憩を挟んでください。`,
      response_type: 'todo_list'
    };

    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('Scrapbox TODO API エラー:', error);
    return NextResponse.json(
      { success: false, content: 'サーバーエラーが発生しました', response_type: 'error' },
      { status: 500 }
    );
  }
} 