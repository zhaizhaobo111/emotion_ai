"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import EmotionChart from "@/components/ui/EmotionChart";
import { useEmotion } from "@/hooks/useEmotion";

const USER_ID = "demo-user";

export default function EmotionsPage() {
  const { weekData, todayData, report, loading, fetchReport } = useEmotion(USER_ID);
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");

  const data = activeTab === "today" ? todayData : weekData;

  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            情绪趋势
          </h1>
          <div className="flex bg-bg-card rounded-xl p-1 border border-white/5">
            {(["today", "week"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                  activeTab === tab
                    ? "bg-accent-purple/20 text-accent-purple"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab === "today" ? "今日" : "本周"}
              </button>
            ))}
          </div>
        </div>

        {/* Dominant Emotion */}
        {data?.dominant_emotion && (
          <GlowCard>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 flex items-center justify-center text-2xl">
                {data.dominant_emotion === "happy" && "😊"}
                {data.dominant_emotion === "anxious" && "😰"}
                {data.dominant_emotion === "stressed" && "😤"}
                {data.dominant_emotion === "sad" && "😢"}
                {data.dominant_emotion === "lonely" && "🥺"}
                {data.dominant_emotion === "angry" && "😠"}
                {data.dominant_emotion === "calm" && "😌"}
                {data.dominant_emotion === "excited" && "🤩"}
              </div>
              <div>
                <p className="text-sm text-gray-400">主要情绪</p>
                <p className="text-lg font-semibold">{data.dominant_emotion}</p>
              </div>
            </div>
          </GlowCard>
        )}

        {/* Chart */}
        <GlowCard>
          <EmotionChart
            distribution={data?.distribution}
            dailyTrend={data?.daily_trend}
          />
        </GlowCard>

        {/* AI Report */}
        <GlowCard>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">AI 情绪报告</h3>
              <button
                onClick={fetchReport}
                disabled={loading}
                className="px-3 py-1 rounded-lg bg-accent-purple/20 text-accent-purple text-xs hover:bg-accent-purple/30 transition disabled:opacity-50"
              >
                {loading ? "生成中..." : "生成报告"}
              </button>
            </div>
            {report ? (
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{report}</p>
            ) : (
              <p className="text-sm text-gray-600">点击按钮生成本周情绪报告</p>
            )}
          </div>
        </GlowCard>
      </motion.div>
    </div>
  );
}
