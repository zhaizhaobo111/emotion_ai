"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import MessageBubble from "./MessageBubble";
import { useWebSocket } from "@/hooks/useWebSocket";

const USER_ID = "demo-user";

export default function ChatWindow() {
  const { messages, sendMessage, isStreaming, currentEmotion } = useWebSocket(USER_ID);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-accent-pink/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-pink to-accent-hot flex items-center justify-center text-sm shadow-lg shadow-accent-pink/20">
            🌸
          </div>
          <div>
            <h2 className="text-sm font-medium text-pink-100">AI 陪伴</h2>
            <div className="flex items-center gap-1.5 text-xs text-pink-200/40">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-pulse" />
              在线
            </div>
          </div>
        </div>
        {currentEmotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-pink-200/50"
          >
            检测到: <span className="text-accent-pink">{currentEmotion.emotion}</span> 💗
          </motion.div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-pink-200/40 gap-4">
            <motion.div
              className="text-5xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🌸
            </motion.div>
            <p className="text-sm text-pink-200/60">和 AI 开始聊天吧</p>
            <p className="text-xs text-pink-200/30">我会记住你说的每一句话 💕</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            content={msg.content}
            emotion={msg.emotion}
            emotionScore={msg.emotionScore}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-accent-pink/10">
        <div className="flex items-end gap-3 bg-bg-card rounded-2xl border border-accent-pink/10 px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说点什么吧... 🌷"
            className="flex-1 bg-transparent text-sm text-pink-100 placeholder-pink-200/30 resize-none outline-none max-h-32"
            rows={1}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-pink to-accent-hot text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-accent-pink/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            发送 💌
          </motion.button>
        </div>
      </div>
    </div>
  );
}
