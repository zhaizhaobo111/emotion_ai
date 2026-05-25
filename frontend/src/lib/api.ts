const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch (err: any) {
    // 网络错误（后端未启动）静默处理，不打印到 console
    if (err?.message === "Failed to fetch") {
      throw new Error("服务未启动");
    }
    throw err;
  }
}

// User
export const createUser = (username: string) =>
  request<{ id: string; username: string; persona: string; created_at: string }>("/api/users/", {
    method: "POST",
    body: JSON.stringify({ username }),
  });

// Chat history
export const getChatHistory = (userId: string, limit = 50) =>
  request<any[]>(`/api/chat/history/${userId}?limit=${limit}`);

// Emotions
export const getEmotions = (userId: string, limit = 50) =>
  request<any[]>(`/api/emotions/${userId}?limit=${limit}`);

export const getTodayEmotions = (userId: string) =>
  request<any>(`/api/emotions/${userId}/today`);

export const getWeekEmotions = (userId: string) =>
  request<any>(`/api/emotions/${userId}/week`);

export const getEmotionReport = (userId: string) =>
  request<{ report: string }>(`/api/emotions/${userId}/report`);

// Memories
export const getMemories = (userId: string) =>
  request<any[]>(`/api/memories/${userId}`);

export const addMemory = (userId: string, content: string, category = "general", importance = 0.5) =>
  request<any>(`/api/memories/${userId}`, {
    method: "POST",
    body: JSON.stringify({ content, category, importance }),
  });

export const deleteMemory = (memoryId: string) =>
  request<any>(`/api/memories/${memoryId}`, { method: "DELETE" });

// Profile
export const getProfile = (userId: string) =>
  request<any>(`/api/profile/${userId}`);

export const getProfileSummary = (userId: string) =>
  request<{ summary: string }>(`/api/profile/${userId}/summary`);

// Personas
export const getPersonas = () =>
  request<any[]>("/api/personas/");

export const updatePersona = (userId: string, persona: string) =>
  request<any>(`/api/personas/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ persona }),
  });
