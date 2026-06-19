import type { WsStatus } from "@/lib/ws";

const MAP: Record<WsStatus, { label: string; cls: string; dot: string }> = {
  open: { label: "Live", cls: "bg-success/15 text-success", dot: "bg-success" },
  connecting: {
    label: "Connecting",
    cls: "bg-warning/15 text-warning",
    dot: "bg-warning animate-pulse-live",
  },
  closed: { label: "Offline", cls: "bg-danger/15 text-danger", dot: "bg-danger" },
};

export function ConnectionStatus({ status }: { status: WsStatus }) {
  const s = MAP[status];
  return (
    <span className={`chip ${s.cls}`} role="status" aria-live="polite" title="Realtime connection">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}
