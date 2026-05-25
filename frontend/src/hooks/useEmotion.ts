"use client";
import { useState, useEffect } from "react";
import { getWeekEmotions, getTodayEmotions, getEmotionReport } from "@/lib/api";

export function useEmotion(userId: string) {
  const [weekData, setWeekData] = useState<any>(null);
  const [todayData, setTodayData] = useState<any>(null);
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchToday = async () => {
    try {
      const data = await getTodayEmotions(userId);
      setTodayData(data);
    } catch {
      // 后端未启动时静默
    }
  };

  const fetchWeek = async () => {
    try {
      const data = await getWeekEmotions(userId);
      setWeekData(data);
    } catch {
      // 后端未启动时静默
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await getEmotionReport(userId);
      setReport(data.report);
    } catch {
      // 后端未启动时静默
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchToday();
      fetchWeek();
    }
  }, [userId]);

  return { weekData, todayData, report, loading, fetchReport, fetchToday, fetchWeek };
}
