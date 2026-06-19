import { config } from "./config";
import type { LiveEvent } from "@/types";

type Listener = (event: LiveEvent) => void;
type StatusListener = (status: WsStatus) => void;
export type WsStatus = "connecting" | "open" | "closed";

/**
 * Resilient WebSocket client for the public live feed.
 * - exponential backoff with jitter
 * - ping/pong heartbeat
 * - re-subscribes (REST refetch is triggered by the connection.ready event)
 */
export class LiveSocket {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private statusListeners = new Set<StatusListener>();
  private retries = 0;
  private heartbeat?: ReturnType<typeof setInterval>;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private closedByUser = false;

  constructor(private readonly path = "/live") {}

  connect() {
    this.closedByUser = false;
    this.open();
  }

  private open() {
    this.setStatus("connecting");
    try {
      this.ws = new WebSocket(`${config.wsBaseUrl}${this.path}`);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retries = 0;
      this.setStatus("open");
      this.heartbeat = setInterval(() => this.ws?.send("ping"), 25000);
    };

    this.ws.onmessage = (msg) => {
      if (msg.data === "pong") return;
      try {
        const event = JSON.parse(msg.data) as LiveEvent;
        this.listeners.forEach((l) => l(event));
      } catch {
        /* ignore malformed frames */
      }
    };

    this.ws.onclose = () => {
      this.cleanup();
      this.setStatus("closed");
      if (!this.closedByUser) this.scheduleReconnect();
    };

    this.ws.onerror = () => this.ws?.close();
  }

  private scheduleReconnect() {
    this.retries += 1;
    const base = Math.min(1000 * 2 ** this.retries, 30000);
    const delay = base / 2 + Math.random() * (base / 2); // jitter
    this.reconnectTimer = setTimeout(() => this.open(), delay);
  }

  private cleanup() {
    if (this.heartbeat) clearInterval(this.heartbeat);
  }

  private setStatus(status: WsStatus) {
    this.statusListeners.forEach((l) => l(status));
  }

  onEvent(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  onStatus(l: StatusListener): () => void {
    this.statusListeners.add(l);
    return () => this.statusListeners.delete(l);
  }

  close() {
    this.closedByUser = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.cleanup();
    this.ws?.close();
  }
}
