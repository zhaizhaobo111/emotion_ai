"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import { getPersonas, updatePersona, getProfile } from "@/lib/api";

const USER_ID = "demo-user";

const personaEmojis: Record<string, string> = {
  gentle_sister: "🌸",
  rational_friend: "🧠",
  energetic_girl: "⚡",
  healing_companion: "🌙",
};

export default function SettingsPage() {
  const [personas, setPersonas] = useState<any[]>([]);
  const [currentPersona, setCurrentPersona] = useState("gentle_sister");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [p, profile] = await Promise.all([getPersonas(), getProfile(USER_ID)]);
      setPersonas(p);
      if (profile?.persona) setCurrentPersona(profile.persona);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPersona = async (key: string) => {
    setSaving(true);
    try {
      await updatePersona(USER_ID, key);
      setCurrentPersona(key);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
          设置
        </h1>

        {/* Persona Selection */}
        <GlowCard>
          <h3 className="text-sm font-medium text-gray-300 mb-4">选择 AI 人格</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {personas.map((p) => {
              const active = currentPersona === p.key;
              return (
                <motion.button
                  key={p.key}
                  onClick={() => handleSelectPersona(p.key)}
                  disabled={saving}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    active
                      ? "border-accent-purple/40 bg-accent-purple/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{personaEmojis[p.key] || "🤖"}</span>
                    <span className={`font-medium ${active ? "text-accent-purple" : "text-gray-300"}`}>
                      {p.name}
                    </span>
                    {active && (
                      <span className="ml-auto text-xs text-accent-purple bg-accent-purple/20 px-2 py-0.5 rounded-full">
                        当前
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{p.description}</p>
                </motion.button>
              );
            })}
          </div>
        </GlowCard>

        {/* About */}
        <GlowCard>
          <h3 className="text-sm font-medium text-gray-300 mb-2">关于 EmotionAI</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            EmotionAI 是一款 AI 情绪陪伴应用，基于 LangGraph 多节点 Agent 工作流构建。
            AI 能够识别你的情绪、记住你的故事、形成你的情绪画像，并以不同人格陪伴你。
          </p>
        </GlowCard>
      </motion.div>
    </div>
  );
}
