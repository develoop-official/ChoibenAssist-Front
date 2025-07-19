"use client";
import Link from "next/link";
import { useState, useMemo } from "react";

import { css } from "../../styled-system/css";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAllTodos } from "../hooks/useAllTodos";
import { useTodos } from "../hooks/useTodos";
import { TodoItemWithUser } from "../types/todo-item";

export default function TodoListPage() {
  const { todos: myTodos, loading: myLoading, error: myError, updateStatus } = useTodos();
  const { todos: allTodos, loading: allLoading, error: allError } = useAllTodos();
  const [removingId, setRemovingId] = useState<string | null>(null);

  // 最近のTODOリスト（最新の2つ）とそれ以外を分離
  const { recentTodos, pastTodos } = useMemo(() => {
    if (allTodos.length === 0) {
      return { recentTodos: [], pastTodos: [] };
    }

    const sortedTodos = [...allTodos].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const recentTodos = sortedTodos.slice(0, 2);
    const pastTodos = sortedTodos.slice(2);

    return { recentTodos, pastTodos };
  }, [allTodos]);

  const loading = myLoading || allLoading;
  const error = myError || allError;

  return (
    <main className={css({ maxW: "2xl", mx: "auto", px: "4", py: "8" })}>
      <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "8" })}>
        <h2 className={css({ fontSize: "2xl", fontWeight: "bold", color: "primary.700" })}>TODOリスト</h2>
        <Link
          href="/todoList/create"
          className={css({
            px: "4",
            py: "2",
            bg: "primary.600",
            color: "white",
            rounded: "md",
            fontWeight: "bold",
            fontSize: "sm",
            _hover: { bg: "primary.700" },
            transition: "all 0.2s",
            textDecoration: "none",
            display: "inline-block"
          })}
        >
          TODO作成
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="TODOを読み込み中..." />
      ) : error ? (
        <div className={css({ color: "red.500", mb: "4" })}>{error}</div>
      ) : (
        <div className={css({ spaceY: "8" })}>
          {/* 最近のTODOリスト */}
          <div>
            <h3 className={css({ fontSize: "xl", fontWeight: "bold", color: "gray.800", mb: "4" })}>
              最近のTODOリスト
            </h3>
            {recentTodos.length === 0 ? (
              <div className={css({ color: "gray.500", textAlign: "center", py: "8" })}>最近のTODOはありません</div>
            ) : (
              <ul className={css({ spaceY: "4" })}>
                {recentTodos.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    isMyTodo={myTodos.some(_todoItem => _todoItem.id === todo.id)}
                    onStatusUpdate={updateStatus}
                    removingId={removingId}
                    setRemovingId={setRemovingId}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* これまでのTODOリスト */}
          {pastTodos.length > 0 && (
            <div>
              <h3 className={css({ fontSize: "xl", fontWeight: "bold", color: "gray.800", mb: "4" })}>
                これまでのTODOリスト
              </h3>
              <div className={css({
                maxH: "96",
                overflowY: "auto",
                border: "1px solid",
                borderColor: "gray.200",
                rounded: "lg",
                p: "4"
              })}>
                <ul className={css({ spaceY: "3" })}>
                  {pastTodos.map(todo => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      isMyTodo={myTodos.some(_todoItem => _todoItem.id === todo.id)}
                      onStatusUpdate={updateStatus}
                      removingId={removingId}
                      setRemovingId={setRemovingId}
                      compact={true}
                    />
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

interface TodoItemProps {
  todo: TodoItemWithUser;
  isMyTodo: boolean;
  onStatusUpdate: (id: string, status: 'pending' | 'completed') => Promise<void>;
  removingId: string | null;
  setRemovingId: (id: string | null) => void;
  compact?: boolean;
}

function TodoItem({ todo, isMyTodo, onStatusUpdate, removingId, setRemovingId, compact = false }: TodoItemProps) {
  return (
    <li
      className={css({
        p: compact ? "3" : "4",
        bg: todo.status === "completed" ? "green.50" : "white",
        border: "1px solid",
        borderColor: todo.status === "completed" ? "green.200" : "gray.200",
        rounded: "lg",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "4",
        transition: "background 0.2s, transform 0.5s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.5s",
        willChange: "transform, opacity",
        cursor: "pointer",
        ...(removingId === todo.id
          ? {
              transform: "scale(1.2) translateY(-40px)",
              opacity: 0,
              filter: "blur(2px)",
            }
          : {})
      })}
    >
      <Link href={`/todoList/${todo.id}`} className={css({ flex: 1, textDecoration: "none", color: "inherit", display: "block" })}>
        <div>
          <div className={css({
            fontWeight: "bold",
            color: todo.status === "completed" ? "green.700" : "gray.900",
            fontSize: compact ? "sm" : "lg"
          })}>
            {todo.task}
          </div>
          <div className={css({ fontSize: "xs", color: "purple.600", mt: "1", fontWeight: "medium" })}>
            ユーザーID: {todo.user_id.slice(0, 8)}...
          </div>
          {todo.due_date && (
            <div className={css({ fontSize: compact ? "xs" : "sm", color: "gray.500", mt: "1" })}>
              期限: {todo.due_date}
            </div>
          )}
          <div className={css({ fontSize: compact ? "xs" : "sm", color: "blue.600", mt: "1", fontWeight: "medium" })}>
            学習時間: {todo.study_time}時間
          </div>
          <div className={css({ fontSize: "xs", color: "gray.400", mt: "1" })}>
            作成日: {todo.created_at.slice(0, 10)}
          </div>
        </div>
      </Link>
      {isMyTodo && (
        <div className={css({ display: "flex", flexDirection: "column", gap: "2", alignItems: "flex-end" })}>
          <button
            className={css({
              px: compact ? "2" : "3",
              py: compact ? "1" : "1",
              bg: todo.status === "completed" ? "gray.300" : "primary.500",
              color: todo.status === "completed" ? "gray.600" : "white",
              rounded: "md",
              fontSize: "xs",
              fontWeight: "bold",
              mb: "1",
              _hover: { bg: todo.status === "completed" ? "gray.400" : "primary.600" },
              transition: "all 0.2s"
            })}
            onClick={async () => {
              if (todo.status === "completed") return;
              setRemovingId(todo.id);
              setTimeout(async () => {
                await onStatusUpdate(todo.id, "completed");
                setRemovingId(null);
              }, 500);
            }}
          >
            {todo.status === "completed" ? "完了済み" : "完了にする"}
          </button>
        </div>
      )}
    </li>
  );
}
