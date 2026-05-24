"use client";

const emotionConfig: Record<string, { label: string; color: string; bg: string }> = {
  happy: { label: "开心", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  anxious: { label: "焦虑", color: "text-orange-400", bg: "bg-orange-400/10" },
  stressed: { label: "压力", color: "text-red-400", bg: "bg-red-400/10" },
  sad: { label: "低落", color: "text-indigo-400", bg: "bg-indigo-400/10" },
  lonely: { label: "孤独", color: "text-purple-400", bg: "bg-purple-400/10" },
  angry: { label: "生气", color: "text-red-500", bg: "bg-red-500/10" },
  calm: { label: "平静", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  excited: { label: "兴奋", color: "text-amber-400", bg: "bg-amber-400/10" },
};

interface EmotionBadgeProps {
  emotion: string;
  score: number;
}

export default function EmotionBadge({ emotion, score }: EmotionBadgeProps) {
  const config = emotionConfig[emotion] || { label: emotion, color: "text-gray-400", bg: "bg-gray-400/10" };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.color}`}>
      <span>{config.label}</span>
      <span className="opacity-60">{Math.round(score * 100)}%</span>
    </span>
  );
}
