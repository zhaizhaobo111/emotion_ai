"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { EmotionWebSocket, WSEvent } from "@/lib/ws";
import { createUser } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  emotion?: string;
  emotionScore?: number;
}

export function useWebSocket(username: string) {
  const wsRef = useRef<EmotionWebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<{ emotion: string; score: number } | null>(null);
  const streamBuffer = useRef("");

  useEffect(() => {
    if (!username) return;

    createUser(username)
      .then((user) => {
        const ws = new EmotionWebSocket(user.id);
        wsRef.current = ws;

        // 情绪数据：{ type: "emotion", data: { emotion, score } }
        ws.on("emotion", (msg: WSEvent) => {
          const d = msg.data;
          if (d?.emotion != null) {
            setCurrentEmotion({ emotion: d.emotion, score: d.score ?? 0 });
          }
        });

        // 流式片段：{ type: "stream", content: "xxx" }
        ws.on("stream", (msg: WSEvent) => {
          const chunk = msg.content ?? "";
          if (!isStreaming) {
            setIsStreaming(true);
            streamBuffer.current = "";
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
          }
          streamBuffer.current += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: streamBuffer.current };
            }
            return updated;
          });
        });

        // 完成：{ type: "done" }
        ws.on("done", (_msg: WSEvent) => {
          setIsStreaming(false);
          streamBuffer.current = "";
        });

        // 错误：{ type: "error", message: "xxx" }
        ws.on("error", (msg: WSEvent) => {
          console.error("聊天错误:", msg.message ?? "未知错误");
          setIsStreaming(false);
        });

        ws.connect();
      })
      .catch((err) => {
        console.error("创建用户失败:", err);
      });

    return () => {
      wsRef.current?.disconnect();
    };
  }, [username]);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || !content.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content }]);
    wsRef.current.send(content);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, sendMessage, clearMessages, isStreaming, currentEmotion };
}
