export interface ParsedTodo {
  task: string;
  study_time: number;
  section?: string;
  goal?: string;
  priority?: number;
}

export interface TodoSection {
  title: string;
  todos: ParsedTodo[];
  totalTime: number;
}

/**
 * AIが生成したマークダウン形式のTODOリストを解析
 */
export function parseMarkdownTodos(content: string): TodoSection[] {
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  const sections: TodoSection[] = [];
  let currentSection: TodoSection | null = null;

  for (const line of lines) {
    // セクション見出しを検出（## または ### で始まる行）
    if (line.startsWith('##') || line.startsWith('###')) {
      const title = line.replace(/^#+\s*/, '').trim();
      currentSection = {
        title,
        todos: [],
        totalTime: 0
      };
      sections.push(currentSection);
      continue;
    }

    // TODOアイテムを検出（- または • または * で始まる行）
    if (line.match(/^[-•*]\s/)) {
      const todo = parseTodoLine(line);
      if (todo && currentSection) {
        currentSection.todos.push(todo);
        currentSection.totalTime += todo.study_time;
      }
      continue;
    }

    // 番号付きリストを検出（1. 2. などで始まる行）
    if (line.match(/^\d+\.\s/)) {
      const todo = parseTodoLine(line);
      if (todo && currentSection) {
        currentSection.todos.push(todo);
        currentSection.totalTime += todo.study_time;
      }
      continue;
    }

    // セクションがない場合はデフォルトセクションを作成
    if (!currentSection) {
      currentSection = {
        title: 'AI提案TODO',
        todos: [],
        totalTime: 0
      };
      sections.push(currentSection);
    }

    // 通常のテキスト行もTODOとして解析を試行
    const todo = parseTodoLine(line);
    if (todo) {
      currentSection.todos.push(todo);
      currentSection.totalTime += todo.study_time;
    }
  }

  return sections;
}

/**
 * 個別のTODO行を解析
 */
function parseTodoLine(line: string): ParsedTodo | null {
  // 行頭の記号や番号を除去
  const cleanLine = line.replace(/^[-•*\d\.\s]+/, '').trim();
  if (!cleanLine) return null;

  // 時間情報を抽出（例: "30分"、"1時間"、"1.5時間"）
  const timeMatch = cleanLine.match(/(\d+(?:\.\d+)?)\s*(分|時間|h|hour)/);
  let studyTime = 1; // デフォルト1時間
  let taskText = cleanLine;

  if (timeMatch) {
    const timeValue = parseFloat(timeMatch[1]);
    const timeUnit = timeMatch[2];

    if (timeUnit === '分') {
      studyTime = timeValue / 60; // 分を時間に変換
    } else if (timeUnit === '時間' || timeUnit === 'h' || timeUnit === 'hour') {
      studyTime = timeValue;
    }

    // 時間情報を除去してタスクテキストを取得
    taskText = cleanLine.replace(timeMatch[0], '').trim();
  }

  // 優先度を抽出（例: "優先度: 高"、"Priority: 1"）
  const priorityMatch = taskText.match(/優先度[：:]\s*(高|中|低|1|2|3)/);
  let priority: number | undefined;
  if (priorityMatch) {
    const priorityText = priorityMatch[1];
    if (priorityText === '高' || priorityText === '1') {
      priority = 1;
    } else if (priorityText === '中' || priorityText === '2') {
      priority = 2;
    } else if (priorityText === '低' || priorityText === '3') {
      priority = 3;
    }
    taskText = taskText.replace(priorityMatch[0], '').trim();
  }

  // 目標情報を抽出（例: "目標: リスニング力向上"）
  const goalMatch = taskText.match(/目標[：:]\s*([^、。]+)/);
  let goal: string | undefined;
  if (goalMatch) {
    goal = goalMatch[1].trim();
    taskText = taskText.replace(goalMatch[0], '').trim();
  }

  return {
    task: taskText,
    study_time: studyTime,
    goal,
    priority
  };
}

/**
 * 解析されたTODOセクションをフラットなTODOリストに変換
 */
export function flattenTodoSections(sections: TodoSection[]): ParsedTodo[] {
  const todos: ParsedTodo[] = [];

  for (const section of sections) {
    for (const todo of section.todos) {
      todos.push({
        ...todo,
        section: section.title
      });
    }
  }

  return todos;
}

/**
 * 解析されたTODOをCreateTodoItem形式に変換
 */
export function convertToCreateTodoItem(parsedTodo: ParsedTodo) {
  let task = parsedTodo.task;

  // セクション情報を追加
  if (parsedTodo.section) {
    task = `[${parsedTodo.section}] ${task}`;
  }

  // 目標情報を追加
  if (parsedTodo.goal) {
    task = `${task} (目標: ${parsedTodo.goal})`;
  }

  return {
    task,
    study_time: parsedTodo.study_time,
    status: 'pending' as const
  };
}
