# ちょい勉アプリ テーブル設計仕様書

## 📋 概要

このドキュメントは、ちょい勉アプリのSupabase PostgreSQLデータベースのテーブル設計について説明します。

## 🗄️ テーブル一覧

### 1. `user_profiles` - ユーザープロフィール
### 2. `todo_items` - 学習タスク
### 3. `user_follows` - フォロー関係
### 4. `timeline_posts` - タイムライン投稿
### 5. `timeline_comments` - 投稿コメント
### 6. `timeline_likes` - 投稿いいね

## 📊 詳細仕様

### 1. `user_profiles` テーブル

**用途**: ユーザーのプロフィール情報を管理

```sql
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    icon_url TEXT,
    bio TEXT,
    scrapbox_project_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**カラム詳細**:
- `user_id`: ユーザーID（auth.usersと1:1）
- `username`: ユニークなユーザー名
- `full_name`: 表示名
- `icon_url`: プロフィール画像URL
- `bio`: 自己紹介文
- `scrapbox_project_name`: Scrapboxプロジェクト名
- `created_at`: 作成日時
- `updated_at`: 更新日時

**インデックス**:
- `user_id` (PRIMARY KEY)
- `username` (UNIQUE)

**RLSポリシー**:
- SELECT: 誰でも閲覧可能
- INSERT: 自分のプロフィールのみ作成可能
- UPDATE: 自分のプロフィールのみ更新可能

### 2. `todo_items` テーブル

**用途**: 学習タスクの管理

```sql
CREATE TABLE todo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    due_date TEXT, -- ISO形式の日付文字列
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    study_time NUMERIC(5,2) NOT NULL DEFAULT 0, -- 学習時間（時間数、小数点2桁まで）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**カラム詳細**:
- `id`: タスクID（UUID）
- `user_id`: 作成者ID
- `task`: タスク内容
- `due_date`: 期限（ISO形式）
- `status`: ステータス（'pending' | 'completed'）
- `study_time`: 学習時間（時間）
- `created_at`: 作成日時
- `updated_at`: 更新日時

**インデックス**:
- `user_id`
- `status`
- `created_at` (DESC)

**RLSポリシー**:
- SELECT: 自分のTODOのみ閲覧可能
- INSERT: 自分のTODOのみ作成可能
- UPDATE: 自分のTODOのみ更新可能
- DELETE: 自分のTODOのみ削除可能

### 3. `user_follows` テーブル

**用途**: ユーザー間のフォロー関係

```sql
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);
```

**カラム詳細**:
- `id`: フォロー関係ID
- `follower_id`: フォローするユーザーID
- `following_id`: フォローされるユーザーID
- `created_at`: フォロー日時

**制約**:
- `UNIQUE(follower_id, following_id)`: 重複フォロー防止

**インデックス**:
- `follower_id`
- `following_id`
- `created_at` (DESC)

**RLSポリシー**:
- SELECT: 誰でも閲覧可能
- INSERT: 自分のフォロー関係のみ作成可能
- DELETE: 自分のフォロー関係のみ削除可能

### 4. `timeline_posts` テーブル

**用途**: タイムライン投稿

```sql
CREATE TABLE timeline_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    hashtags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    todo_id UUID REFERENCES todo_items(id) ON DELETE SET NULL, -- Todoとの紐付け
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**カラム詳細**:
- `id`: 投稿ID
- `user_id`: 投稿者ID
- `content`: 投稿内容
- `hashtags`: ハッシュタグ配列
- `is_public`: 公開設定
- `todo_id`: 関連Todo ID（オプション）
- `created_at`: 投稿日時
- `updated_at`: 更新日時

**インデックス**:
- `user_id`
- `created_at` (DESC)
- `hashtags` (GIN)
- `todo_id`
- `is_public` (WHERE is_public = true)

**RLSポリシー**:
- SELECT: 公開投稿は誰でも閲覧、非公開は投稿者のみ
- INSERT: 認証ユーザーのみ作成可能
- UPDATE: 自分の投稿のみ更新可能
- DELETE: 自分の投稿のみ削除可能

### 5. `timeline_comments` テーブル

**用途**: 投稿へのコメント

```sql
CREATE TABLE timeline_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**カラム詳細**:
- `id`: コメントID
- `post_id`: 投稿ID
- `user_id`: コメント投稿者ID
- `content`: コメント内容
- `created_at`: コメント日時
- `updated_at`: 更新日時

**インデックス**:
- `post_id`
- `user_id`
- `created_at`

**RLSポリシー**:
- SELECT: 誰でも閲覧可能
- INSERT: 認証ユーザーのみ作成可能
- UPDATE: 自分のコメントのみ更新可能
- DELETE: 自分のコメントのみ削除可能

### 6. `timeline_likes` テーブル

**用途**: 投稿へのいいね

```sql
CREATE TABLE timeline_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);
```

**カラム詳細**:
- `id`: いいねID
- `post_id`: 投稿ID
- `user_id`: いいねしたユーザーID
- `created_at`: いいね日時

**制約**:
- `UNIQUE(post_id, user_id)`: 重複いいね防止

**インデックス**:
- `post_id`
- `user_id`

**RLSポリシー**:
- SELECT: 誰でも閲覧可能
- INSERT: 認証ユーザーのみ作成可能
- DELETE: 自分のいいねのみ削除可能

## 📈 ビュー

### 1. `timeline_posts_with_stats`

**用途**: 投稿一覧表示用の統計情報

```sql
CREATE OR REPLACE VIEW timeline_posts_with_stats AS
SELECT 
    p.*,
    up.username,
    up.full_name,
    up.icon_url,
    COALESCE(likes.likes_count, 0) as likes_count,
    COALESCE(comments.comments_count, 0) as comments_count,
    CASE WHEN user_likes.post_id IS NOT NULL THEN true ELSE false END as is_liked,
    t.task as todo_task,
    t.study_time as todo_study_time,
    t.due_date as todo_due_date
FROM timeline_posts p
LEFT JOIN user_profiles up ON p.user_id = up.user_id
LEFT JOIN todo_items t ON p.todo_id = t.id
LEFT JOIN (
    SELECT post_id, COUNT(*) as likes_count
    FROM timeline_likes
    GROUP BY post_id
) likes ON p.id = likes.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as comments_count
    FROM timeline_comments
    GROUP BY post_id
) comments ON p.id = comments.post_id
LEFT JOIN timeline_likes user_likes ON p.id = user_likes.post_id AND user_likes.user_id = auth.uid()
WHERE p.is_public = true OR p.user_id = auth.uid();
```

### 2. `user_follows_with_profiles`

**用途**: フォロー関係とプロフィール情報の結合

```sql
CREATE OR REPLACE VIEW user_follows_with_profiles AS
SELECT 
    uf.*,
    follower.username as follower_username,
    follower.full_name as follower_full_name,
    follower.icon_url as follower_icon_url,
    following.username as following_username,
    following.full_name as following_full_name,
    following.icon_url as following_icon_url
FROM user_follows uf
LEFT JOIN user_profiles follower ON uf.follower_id = follower.user_id
LEFT JOIN user_profiles following ON uf.following_id = following.user_id;
```

## 🔒 セキュリティ

### RLS（Row Level Security）

すべてのテーブルでRLSを有効化し、適切なポリシーを設定しています。

### データアクセス制御

- **公開データ**: プロフィール、フォロー関係、公開投稿、コメント、いいね
- **プライベートデータ**: 非公開投稿、個人のTODO
- **認証必須**: 投稿、コメント、いいね、フォロー操作

## ⚡ パフォーマンス

### インデックス戦略

1. **主キー**: すべてのテーブルでUUID主キー
2. **外部キー**: 関連テーブルへの高速アクセス
3. **検索最適化**: ハッシュタグのGINインデックス
4. **時系列**: 作成日時の降順インデックス
5. **条件付き**: 公開投稿の部分インデックス

### トリガー

- `updated_at`の自動更新
- データ整合性の維持

## 🔄 データフロー

### Todo完了時の投稿フロー

1. `todo_items.status` → `'completed'`
2. `timeline_posts`に投稿作成（`todo_id`で紐付け）
3. ハッシュタグ自動生成
4. 統計ビューで即座に反映

### フォロー機能フロー

1. `user_follows`にフォロー関係作成
2. フォローしたユーザーの投稿を表示
3. フォロー解除で関係削除

## 📝 注意事項

1. **UUID使用**: セキュリティ向上のためUUIDを主キーとして使用
2. **CASCADE削除**: 関連データの整合性を保つため適切に設定
3. **タイムゾーン**: すべての日時はタイムゾーン付きで管理
4. **配列型**: ハッシュタグはPostgreSQLの配列型を活用
5. **制約**: データ整合性のための適切な制約を設定

## 🚀 拡張性

この設計は以下の拡張に対応しています：

- 学習記録の詳細化
- グループ機能
- 通知システム
- 検索機能の強化
- 分析・レポート機能 