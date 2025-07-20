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
  console.log('🔍 TODO解析開始 - 生コンテンツ:', content);
  console.log('📄 TODO解析開始 - 行分割後:', content.split('\n'));
  
  const lines = content.split('\n');
  const sections: TodoSection[] = [];
  let currentSection: TodoSection | null = null;
  let currentTodo: ParsedTodo | null = null;
  let currentTodoLines: string[] = [];

  // デフォルトセクションを作成
  currentSection = {
    title: 'AI提案TODO',
    todos: [],
    totalTime: 0
  };
  sections.push(currentSection);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    console.log(`🔍 解析中 - 行${i + 1}: "${line}"`);
    
    // 空行をスキップ
    if (!line) {
      // 空行でTODOの終了を判定
      if (currentTodo && currentSection) {
        console.log('💾 TODO保存:', currentTodo);
        currentSection.todos.push(currentTodo);
        currentSection.totalTime += currentTodo.study_time;
        currentTodo = null;
        currentTodoLines = [];
      }
      continue;
    }

    // セクション見出しを検出（## または ### で始まる行）
    if (line.startsWith('##') || line.startsWith('###')) {
      // 前のTODOがあれば保存
      if (currentTodo && currentSection) {
        console.log('💾 TODO保存:', currentTodo);
        currentSection.todos.push(currentTodo);
        currentSection.totalTime += currentTodo.study_time;
        currentTodo = null;
        currentTodoLines = [];
      }
      
      const title = line.replace(/^#+\s*/, '').trim();
      currentSection = {
        title,
        todos: [],
        totalTime: 0
      };
      sections.push(currentSection);
      console.log('📂 新しいセクション作成:', title);
      continue;
    }

    // 番号付きリストを検出（1. 2. などで始まる行）
    if (line.match(/^\d+\.\s/)) {
      // 前のTODOがあれば保存
      if (currentTodo && currentSection) {
        console.log('💾 TODO保存:', currentTodo);
        currentSection.todos.push(currentTodo);
        currentSection.totalTime += currentTodo.study_time;
      }
      
      // 新しいTODOの開始
      const taskName = line.replace(/^\d+\.\s*/, '').trim();
      currentTodo = {
        task: taskName,
        study_time: 1, // デフォルト値、後で更新
        goal: '',
        priority: undefined
      };
      currentTodoLines = [taskName];
      console.log('🆕 新しいTODO開始:', taskName);
      continue;
    }

    // 現在のTODOの詳細情報を収集
    if (currentTodo && line.startsWith('-')) {
      currentTodoLines.push(line);
      console.log('📝 TODO詳細追加:', line);
      
      // 推定時間を抽出
      const timeMatch = line.match(/推定時間:\s*(\d+)\s*min/);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1]);
        currentTodo.study_time = minutes; // 分のまま保持
        console.log('⏰ 時間設定:', minutes, '分');
      }
      
      // 内容を抽出
      const contentMatch = line.match(/内容:\s*(.+)/);
      if (contentMatch) {
        currentTodo.goal = contentMatch[1].trim();
        console.log('📋 内容設定:', currentTodo.goal);
      }
      
      continue;
    }

    // 補足情報を抽出
    if (currentTodo && line.startsWith('補足:')) {
      const note = line.replace(/^補足:\s*/, '').trim();
      if (note) {
        currentTodo.goal = currentTodo.goal ? `${currentTodo.goal} (補足: ${note})` : `補足: ${note}`;
        console.log('📌 補足追加:', note);
      }
      continue;
    }

    // その他の行は無視（デバッグ用にログ出力）
    if (currentTodo) {
      console.log('⚠️ 未処理の行（TODO中）:', line);
    } else {
      console.log('⚠️ 未処理の行（TODO外）:', line);
    }
  }

  // 最後のTODOを保存
  if (currentTodo && currentSection) {
    console.log('💾 最後のTODO保存:', currentTodo);
    currentSection.todos.push(currentTodo);
    currentSection.totalTime += currentTodo.study_time;
  }

  console.log('✅ TODO解析完了 - 結果:', JSON.stringify(sections, null, 2));
  return sections;
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
