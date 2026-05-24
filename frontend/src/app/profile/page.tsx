"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import { getProfile, getMemories } from "@/lib/api";

const USER_ID = "demo-user";

const categoryLabels: Record<string, string> = {
  work: "工作",
  health: "健康",
  emotion: "情感",
  relationship: "人际",
  hobby: "兴趣",
  general: "其他",
};

const categoryColors: Record<string, string> = {
  work: "bg-blue-500/10 text-blue-400",
  health: "bg-emerald-500/10 text-emerald-400",
  emotion: "bg-pink-500/10 text-pink-400",
  relationship: "bg-purple-500/10 text-purple-400",
  hobby: "bg-amber-500/10 text-amber-400",
  general: "bg-gray-500/10 text-gray-400",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, m] = await Promise.all([getProfile(USER_ID), getMemories(USER_ID)]);
      setProfile(p);
      setMemories(m);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
          用户画像
        </h1>

        {/* User Info */}
        {profile && (
          <GlowCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-2xl font-bold">
                {profile.username?.[0] || "?"}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{profile.username}</h2>
                <p className="text-sm text-gray-400">当前人格: {profile.persona}</p>
              </div>
            </div>

            {/* Recent Emotions */}
            {profile.recent_emotions?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs text-gray-500 mb-2 uppercase tracking-wider">近期情绪</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.recent_emotions.slice(0, 8).map((e: any, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full text-xs bg-white/5 text-gray-400"
                    >
                      {e.emotion} {Math.round(e.score * 100)}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlowCard>
        )}

        {/* Memories */}
        <GlowCard>
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            AI 记住的事情 ({memories.length})
          </h3>
          {memories.length === 0 ? (
            <p className="text-sm text-gray-600">AI 还没有记住任何信息，开始聊天吧</p>
          ) : (
            <div className="space-y-3">
              {memories.map((m) => (
                <div key={m.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[m.category] || categoryColors.general}`}>
                    {categoryLabels[m.category] || m.category}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{m.content}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      重要性: {Math.round(m.importance * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlowCard>
      </motion.div>
    </div>
  );
}
