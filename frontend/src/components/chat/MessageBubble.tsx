"use client";
import { motion } from "framer-motion";
import EmotionBadge from "./EmotionBadge";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  emotion?: string;
  emotionScore?: number;
  isStreaming?: boolean;
}

export default function MessageBubble({ role, content, emotion, emotionScore, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`max-w-[80%] ${isUser ? "order-1" : "order-1"}`}>
        {/* Emotion badge for AI messages */}
        {!isUser && emotion && (
          <div className="mb-1">
            <EmotionBadge emotion={emotion} score={emotionScore || 0} />
          </div>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-gradient-to-r from-accent-blue to-accent-purple text-white rounded-br-md"
              : "bg-bg-card border border-white/5 text-gray-200 rounded-bl-md"
          }`}
        >
          {content}
          {isStreaming && !isUser && <span className="typing-cursor" />}
        </div>
      </div>
    </motion.div>
  );
}
