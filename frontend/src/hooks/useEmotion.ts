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
    } catch (e) {
      console.error("Failed to fetch today emotions:", e);
    }
  };

  const fetchWeek = async () => {
    try {
      const data = await getWeekEmotions(userId);
      setWeekData(data);
    } catch (e) {
      console.error("Failed to fetch week emotions:", e);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await getEmotionReport(userId);
      setReport(data.report);
    } catch (e) {
      console.error("Failed to fetch report:", e);
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
