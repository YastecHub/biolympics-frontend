import { useState } from "react";
import { pushSupported, subscribeToPush } from "@/lib/push";

export function NotifyCTA() {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onClick() {
    setState("working");
    const res = await subscribeToPush();
    if (res.ok) {
      setState("done");
    } else {
      setState("error");
      setMsg(res.reason ?? "Couldn't enable notifications.");
    }
  }

  return (
    <section className="card flex flex-col items-start gap-3 bg-brand-primary/5 p-6 sm:flex-row sm:items-center">
      <div className="flex-1">
        <h2 className="font-display text-xl font-bold">Never miss a goal</h2>
        <p className="text-sm text-muted">
          Get browser notifications for kick-offs, goals and results — no account needed.
        </p>
      </div>
      {state === "done" ? (
        <span className="chip bg-success/15 text-success">✓ Notifications on</span>
      ) : (
        <button className="btn-primary" onClick={onClick} disabled={state === "working" || !pushSupported()}>
          {state === "working" ? "Enabling…" : "Enable notifications"}
        </button>
      )}
      {state === "error" && <p className="text-sm text-danger">{msg}</p>}
      {!pushSupported() && state === "idle" && (
        <p className="text-xs text-muted">Not supported on this browser.</p>
      )}
    </section>
  );
}
