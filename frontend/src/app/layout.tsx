import type { Metadata } from "next";
import "@/styles/globals.css";
import Sidebar from "@/components/layout/Sidebar";
import DynamicBackground from "@/components/layout/DynamicBackground";

export const metadata: Metadata = {
  title: "EmotionAI - AI 情绪陪伴",
  description: "你的 AI 情绪陪伴伙伴",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="h-screen overflow-hidden bg-bg-primary text-gray-200">
        <DynamicBackground />
        <div className="relative z-10 flex h-full">
          <Sidebar />
          <main className="flex-1 ml-16 md:ml-56 h-full overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
