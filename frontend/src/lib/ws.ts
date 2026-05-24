// WebSocket 连接管理，支持指数退避重连
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

// 统一消息类型
export type WSEventType = "emotion" | "stream" | "done" | "error";

// 统一消息结构（所有字段可选，按 type 区分）
export interface WSEvent {
  type: WSEventType;
  data?: any;       // emotion 消息携带
  content?: string; // stream 消息携带
  message?: string; // error 消息携带
}

const MAX_RETRIES = 10;
const BASE_DELAY = 1000;
const MAX_DELAY = 30000;

export class EmotionWebSocket {
  private ws: WebSocket | null = null;
  private userId: string;
  private listeners: Map<WSEventType, Set<(msg: WSEvent) => void>> = new Map();
  private retryCount = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  connect() {
    this.intentionalClose = false;

    try {
      this.ws = new WebSocket(`${WS_BASE}/api/chat/ws/${this.userId}`);
    } catch (e) {
      console.error("WebSocket 创建失败:", e);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retryCount = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WSEvent = JSON.parse(event.data);
        if (!msg || !msg.type) return; // 防御：无 type 直接忽略
        const handlers = this.listeners.get(msg.type);
        if (handlers) {
          // 传整个消息对象，让 handler 自行按 type 取字段
          handlers.forEach((fn) => fn(msg));
        }
      } catch (e) {
        console.error("WS 消息解析失败:", e);
      }
    };

    this.ws.onerror = (e) => {
      console.error("WS 连接错误:", e);
    };

    this.ws.onclose = () => {
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect() {
    if (this.retryCount >= MAX_RETRIES) {
      console.error(`WS 已达最大重连次数 ${MAX_RETRIES}，停止重连`);
      return;
    }

    const exponential = Math.min(BASE_DELAY * Math.pow(2, this.retryCount), MAX_DELAY);
    const jitter = Math.random() * 0.3 * exponential;
    const delay = exponential + jitter;

    this.retryCount++;
    console.warn(`WS 将在 ${Math.round(delay)}ms 后第 ${this.retryCount} 次重连`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /** 注册事件监听，handler 接收完整消息对象 */
  on(type: WSEventType, handler: (msg: WSEvent) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);
    return () => this.listeners.get(type)?.delete(handler);
  }

  send(content: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ content }));
    }
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }
}
