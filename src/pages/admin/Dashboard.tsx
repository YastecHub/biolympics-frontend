import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, PageHeader } from "@/components/ui";
import { LIVE_STATUSES, type Fixture } from "@/types";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const roles = useAuthStore((s) => s.roles);
  const email = useAuthStore((s) => s.email);
  const clear = useAuthStore((s) => s.clear);
  const qc = useQueryClient();

  const fixtures = useQuery({
    queryKey: ["admin-fixtures"],
    queryFn: () => api.schedule(),
    enabled: !!token,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-fixtures"] });

  const start = useMutation({
    mutationFn: (id: string) => api.startFixture(id),
    onSuccess: refresh,
  });
  const score = useMutation({
    mutationFn: (v: { id: string; version: number; home: boolean }) =>
      api.scoreFixture(v.id, {
        expected_version: v.version,
        home_delta: v.home ? 1 : undefined,
        away_delta: v.home ? undefined : 1,
      }),
    onSuccess: refresh,
  });
  const complete = useMutation({
    mutationFn: (v: { id: string; version: number }) => api.completeFixture(v.id, v.version),
    onSuccess: refresh,
  });

  if (!token) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <p className="text-lg font-semibold">Please sign in to access the control centre.</p>
        <button className="btn-primary mt-4" onClick={() => navigate("/admin/login")}>
          Go to sign in
        </button>
      </div>
    );
  }

  const list = fixtures.data ?? [];
  const live = list.filter((f) => LIVE_STATUSES.includes(f.status));
  const scheduled = list.filter((f) => f.status === "SCHEDULED" && f.home && f.away);

  return (
    <div>
      <PageHeader
        title="Live Control Centre"
        subtitle={`${email} · ${roles.join(", ") || "no roles"}`}
        action={
          <button
            className="btn-ghost"
            onClick={async () => {
              await api.logout();
              clear();
              navigate("/admin/login");
            }}
          >
            Sign out
          </button>
        }
      />

      {fixtures.isLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="space-y-6">
          <Section title={`Live (${live.length})`}>
            {live.length === 0 ? (
              <EmptyState title="No live matches." />
            ) : (
              live.map((f) => (
                <ControlCard
                  key={f.id}
                  fx={f}
                  onHome={() => score.mutate({ id: f.id, version: f.version, home: true })}
                  onAway={() => score.mutate({ id: f.id, version: f.version, home: false })}
                  onComplete={() => complete.mutate({ id: f.id, version: f.version })}
                />
              ))
            )}
          </Section>

          <Section title={`Scheduled (${scheduled.length})`}>
            {scheduled.length === 0 ? (
              <EmptyState title="No scheduled matches with teams assigned." />
            ) : (
              scheduled.slice(0, 12).map((f) => (
                <div key={f.id} className="card flex items-center justify-between p-4">
                  <span className="font-semibold">
                    {f.home?.department_abbr} vs {f.away?.department_abbr}
                    <span className="ml-2 text-xs text-muted">{f.sport_name}</span>
                  </span>
                  <button className="btn-primary" onClick={() => start.mutate(f.id)}>
                    Start
                  </button>
                </div>
              ))
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-display text-xl font-bold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ControlCard({
  fx,
  onHome,
  onAway,
  onComplete,
}: {
  fx: Fixture;
  onHome: () => void;
  onAway: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-lg font-bold">
          {fx.home?.department_abbr} {fx.live?.home_score ?? 0}–{fx.live?.away_score ?? 0}{" "}
          {fx.away?.department_abbr}
        </span>
        <span className="text-xs text-muted">v{fx.version}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button className="btn-primary !py-3 text-base" onClick={onHome}>
          + {fx.home?.department_abbr}
        </button>
        <button className="btn-primary !py-3 text-base" onClick={onAway}>
          + {fx.away?.department_abbr}
        </button>
        <button className="btn-ghost !py-3" onClick={onComplete}>
          Full time
        </button>
      </div>
    </div>
  );
}
