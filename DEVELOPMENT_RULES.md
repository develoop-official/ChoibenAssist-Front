# 開発ルール

## 🚫 禁止事項

### 1. mainブランチへの直接push
- **禁止**: `git push origin main`
- **許可**: developブランチへのpushのみ
- **理由**: コードレビューと品質保証のため

### 2. スタイル変更時の機能変更
- スタイル修正指示時は、機能ロジックを変更しない
- CSS/スタイル関連の変更のみを行う
- 必要に応じて別のブランチで機能変更を行う

### 3. 未使用コードの残存
- 使用されていない変数、関数、インポートは削除
- コメントアウトされたコードは削除
- デバッグ用のconsole.logは本番コードに残さない

## ✅ 推奨事項

### 1. ブランチ戦略
```bash
# 新機能開発
git checkout develop
git checkout -b feature/新機能名

# バグ修正
git checkout develop
git checkout -b fix/バグ修正内容

# ホットフィックス
git checkout main
git checkout -b hotfix/緊急修正内容
```

### 2. コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
style: スタイル変更（機能変更なし）
refactor: リファクタリング
docs: ドキュメント更新
test: テスト追加・修正
chore: その他の変更
```

### 3. コード品質
- ESLintエラーは必ず修正
- TypeScriptの型定義を適切に行う
- コンポーネントは再利用可能に設計
- 関数は単一責任の原則に従う

## 🔧 開発環境

### 必須コマンド
```bash
# 開発サーバー起動
npm run dev

# コード品質チェック
npm run lint

# 自動修正
npm run lint:fix

# ビルド
npm run build
```

### ファイル命名規則
- コンポーネント: `PascalCase` (例: `UserProfile.tsx`)
- ファイル: `kebab-case` (例: `user-profile.tsx`)
- フォルダ: `kebab-case` (例: `user-components/`)

### インポート順序
1. ビルトインモジュール (Node.js)
2. 外部ライブラリ
3. 内部モジュール
4. 相対インポート

## 🚨 エラー対処

### ESLintエラー
```bash
# エラー確認
npm run lint

# 自動修正
npm run lint:fix

# 手動修正が必要な場合
# エラーメッセージに従って修正
```

### TypeScriptエラー
- 型定義を適切に行う
- `any`型の使用は最小限に
- インターフェースを活用

### Gitフックエラー
- mainブランチへのpushは自動でブロック
- developブランチを使用
- プルリクエスト経由でマージ

## 📝 レビューチェックリスト

### コードレビュー時
- [ ] ESLintエラーがない
- [ ] TypeScriptエラーがない
- [ ] テストが通る
- [ ] 機能要件を満たしている
- [ ] パフォーマンスに問題がない
- [ ] セキュリティ上の問題がない
- [ ] ドキュメントが更新されている

### マージ前
- [ ] developブランチからのプルリクエスト
- [ ] レビューが完了している
- [ ] CI/CDが通っている
- [ ] コンフリクトが解決されている 