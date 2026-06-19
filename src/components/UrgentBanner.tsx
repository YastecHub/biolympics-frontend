import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Announcement } from "@/types";

export function UrgentBanner() {
  const { data } = useQuery({
    queryKey: ["announcements"],
    queryFn: api.announcements,
  });
  const [dismissed, setDismissed] = useState<string[]>([]);

  const urgent = (data ?? []).filter(
    (a: Announcement) => a.is_urgent && !dismissed.includes(a.id),
  );
  if (urgent.length === 0) return null;

  return (
    <div role="alert" className="bg-danger text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-sm">
        <span className="chip bg-white/20">URGENT</span>
        <p className="flex-1">
          <strong>{urgent[0].title}</strong> — {urgent[0].body}
        </p>
        <button
          onClick={() => setDismissed((d) => [...d, urgent[0].id])}
          aria-label="Dismiss announcement"
          className="rounded px-2 py-0.5 hover:bg-white/20"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
