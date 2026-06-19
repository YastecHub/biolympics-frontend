import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LiveSocket, type WsStatus } from "@/lib/ws";
import type { Fixture, LiveEvent } from "@/types";

/**
 * Subscribes to the live WebSocket feed and patches the TanStack Query caches in
 * place so live cards update without a refetch. On (re)connect it also
 * invalidates queries so a browser that was offline catches up via REST.
 */
export function useLive() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<WsStatus>("connecting");
  const socketRef = useRef<LiveSocket | null>(null);

  useEffect(() => {
    const socket = new LiveSocket("/live");
    socketRef.current = socket;

    const offEvent = socket.onEvent((event: LiveEvent) => {
      applyEventToCaches(qc, event);
      if (event.type === "connection.ready") return;
      // Standings / schedule / announcements changes: refetch affected lists.
      if (
        ["standings.updated", "schedule.changed", "announcement.published"].includes(
          event.type,
        )
      ) {
        qc.invalidateQueries({ queryKey: ["standings"] });
        qc.invalidateQueries({ queryKey: ["announcements"] });
        qc.invalidateQueries({ queryKey: ["fixtures"] });
      }
      if (event.type === "fixture.completed" || event.type === "fixture.started") {
        qc.invalidateQueries({ queryKey: ["fixtures"] });
        qc.invalidateQueries({ queryKey: ["results"] });
      }
    });

    const offStatus = socket.onStatus((s) => {
      setStatus(s);
      if (s === "open") {
        // Reconnected — pull fresh state via REST.
        qc.invalidateQueries({ queryKey: ["live"] });
      }
    });

    socket.connect();
    return () => {
      offEvent();
      offStatus();
      socket.close();
    };
  }, [qc]);

  return { status };
}

function patchFixtureScore(fx: Fixture, event: LiveEvent): Fixture {
  if (fx.id !== event.fixture_id) return fx;
  // Ignore stale events (lower version than what we already have).
  if (event.version != null && fx.live && event.version < fx.live.version) return fx;
  const p = event.payload as Record<string, number | string | null>;
  return {
    ...fx,
    status: (p.status as Fixture["status"]) ?? fx.status,
    version: event.version ?? fx.version,
    live: {
      ...(fx.live ?? {
        home_score: 0,
        away_score: 0,
        period: null,
        current_period_number: 0,
        clock_text: null,
        home_sets: 0,
        away_sets: 0,
        status_text: null,
        extra: {},
        version: 0,
        last_updated_at: null,
      }),
      home_score: (p.home_score as number) ?? fx.live?.home_score ?? 0,
      away_score: (p.away_score as number) ?? fx.live?.away_score ?? 0,
      period: (p.period as string) ?? fx.live?.period ?? null,
      clock_text: (p.clock as string) ?? fx.live?.clock_text ?? null,
      version: event.version ?? fx.live?.version ?? 0,
      last_updated_at: event.timestamp,
    },
  };
}

function applyEventToCaches(
  qc: ReturnType<typeof useQueryClient>,
  event: LiveEvent,
) {
  if (!event.fixture_id) return;
  const patch = (list?: Fixture[]) =>
    list?.map((fx) => patchFixtureScore(fx, event));

  qc.setQueryData<Fixture[]>(["live"], (old) => patch(old) ?? old);
  qc.setQueryData<Fixture[]>(["fixtures"], (old) => patch(old) ?? old);
  qc.setQueryData<Fixture>(["fixture", event.fixture_id], (old) =>
    old ? patchFixtureScore(old, event) : old,
  );
}
