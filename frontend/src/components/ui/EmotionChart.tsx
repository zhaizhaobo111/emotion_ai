"use client";
import { useMemo } from "react";

const EMOTION_COLORS: Record<string, string> = {
  happy: "#fbbf24",
  anxious: "#f97316",
  stressed: "#ef4444",
  sad: "#6366f1",
  lonely: "#8b5cf6",
  angry: "#dc2626",
  calm: "#10b981",
  excited: "#f59e0b",
};

const EMOTION_LABELS: Record<string, string> = {
  happy: "开心",
  anxious: "焦虑",
  stressed: "压力",
  sad: "低落",
  lonely: "孤独",
  angry: "生气",
  calm: "平静",
  excited: "兴奋",
};

interface EmotionChartProps {
  distribution?: Record<string, number>;
  dailyTrend?: Array<{ date: string; dominant: string; count: number }>;
}

export default function EmotionChart({ distribution, dailyTrend }: EmotionChartProps) {
  if (!distribution && !dailyTrend) {
    return <div className="text-pink-200/30 text-sm text-center py-8">暂无数据 🌸</div>;
  }

  return (
    <div className="space-y-6">
      {/* Distribution bar */}
      {distribution && Object.keys(distribution).length > 0 && (
        <div>
          <h3 className="text-xs text-pink-200/40 mb-3 uppercase tracking-wider">情绪分布</h3>
          <div className="space-y-2">
            {Object.entries(distribution)
              .sort((a, b) => b[1] - a[1])
              .map(([emotion, ratio]) => (
                <div key={emotion} className="flex items-center gap-3">
                  <span className="text-xs w-12 text-right" style={{ color: EMOTION_COLORS[emotion] }}>
                    {EMOTION_LABELS[emotion] || emotion}
                  </span>
                  <div className="flex-1 h-2 bg-accent-pink/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${ratio * 100}%`,
                        background: EMOTION_COLORS[emotion] || "#6b7280",
                      }}
                    />
                  </div>
                  <span className="text-xs text-pink-200/40 w-10">{Math.round(ratio * 100)}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Daily trend */}
      {dailyTrend && dailyTrend.length > 0 && (
        <div>
          <h3 className="text-xs text-pink-200/40 mb-3 uppercase tracking-wider">每日趋势</h3>
          <div className="flex gap-1 items-end h-20">
            {dailyTrend.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t transition-all duration-300"
                  style={{
                    height: `${Math.max(10, day.count * 15)}%`,
                    background: EMOTION_COLORS[day.dominant] || "#6b7280",
                    opacity: 0.7,
                  }}
                />
                <span className="text-[10px] text-pink-200/30">{day.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
