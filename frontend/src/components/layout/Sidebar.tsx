"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "聊天", icon: "🌸" },
  { href: "/emotions", label: "情绪", icon: "🦋" },
  { href: "/profile", label: "画像", icon: "🧸" },
  { href: "/settings", label: "设置", icon: "🎀" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-full w-16 md:w-56 bg-bg-secondary/80 backdrop-blur-xl border-r border-accent-pink/10 z-50 flex flex-col py-6">
      {/* Logo */}
      <div className="px-4 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-pink to-accent-hot flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-accent-pink/20">
          ✿
        </div>
        <span className="hidden md:block text-lg font-semibold bg-gradient-to-r from-accent-pink to-accent-rose bg-clip-text text-transparent">
          EmotionAI
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  active
                    ? "text-white"
                    : "text-pink-200/50 hover:text-pink-200 hover:bg-accent-pink/5"
                }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-gradient-to-r from-accent-pink/20 to-accent-hot/20 rounded-xl border border-accent-pink/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative text-lg">{item.icon}</span>
                <span className="relative hidden md:block text-sm font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Status */}
      <div className="px-4">
        <div className="flex items-center gap-2 text-xs text-pink-200/40">
          <div className="w-2 h-2 rounded-full bg-accent-rose animate-pulse" />
          <span className="hidden md:block">AI 在线 💕</span>
        </div>
      </div>
    </nav>
  );
}
