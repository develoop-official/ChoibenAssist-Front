"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { css } from "../../styled-system/css";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useTodos } from "../hooks/useTodos";

export default function TodoListPage() {
  const router = useRouter();
  const { todos, loading, error, updateStatus } = useTodos();
  const [removingId, setRemovingId] = useState<string | null>(null);

  return (
    <main className={css({ maxW: "2xl", mx: "auto", px: "4", py: "8" })}>
      <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "8" })}>
        <h2 className={css({ fontSize: "2xl", fontWeight: "bold", color: "primary.700" })}>TODOリスト</h2>
        <button
          className={css({
            px: "4",
            py: "2",
            bg: "primary.600",
            color: "white",
            rounded: "md",
            fontWeight: "bold",
            fontSize: "sm",
            _hover: { bg: "primary.700" },
            transition: "all 0.2s"
          })}
          onClick={() => router.push("/todoPost")}
        >
          TODO作成
        </button>
      </div>
      {loading ? (
        <LoadingSpinner text="TODOを読み込み中..." />
      ) : error ? (
        <div className={css({ color: "red.500", mb: "4" })}>{error}</div>
      ) : todos.length === 0 ? (
        <div className={css({ color: "gray.500", textAlign: "center", py: "12" })}>TODOはありません</div>
      ) : (
        <ul className={css({ spaceY: "4" })}>
          {todos.map(todo => (
            <li
              key={todo.id}
              className={css({
                p: "4",
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
                  <div className={css({ fontWeight: "bold", color: todo.status === "completed" ? "green.700" : "gray.900", fontSize: "lg" })}>{todo.task}</div>
                  {todo.due_date && (
                    <div className={css({ fontSize: "sm", color: "gray.500", mt: "1" })}>期限: {todo.due_date}</div>
                  )}
                  <div className={css({ fontSize: "xs", color: "gray.400", mt: "1" })}>作成日: {todo.created_at.slice(0, 10)}</div>
                </div>
              </Link>
              <div className={css({ display: "flex", flexDirection: "column", gap: "2", alignItems: "flex-end" })}>
                <button
                  className={css({
                    px: "3",
                    py: "1",
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
                      await updateStatus(todo.id, "completed");
                      setRemovingId(null);
                    }, 500);
                  }}
                >
                  {todo.status === "completed" ? "完了済み" : "完了にする"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
