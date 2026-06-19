import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type AnnouncementCreateBody, type ScoreFixtureBody } from "@/lib/api";
import { config } from "@/lib/config";
import { useAuthStore } from "@/store";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState, MatchupTeams } from "@/components/ui";
import { formatDateTime } from "@/lib/time";
import { LIVE_STATUSES, type Fixture, type FixtureStatus } from "@/types";

type Tab = "live" | "fixtures" | "updates";

const ANNOUNCEMENT_TYPES = [
  "GENERAL",
  "URGENT",
  "VENUE_CHANGE",
  "POSTPONEMENT",
  "SCHEDULE_CHANGE",
  "WEATHER",
  "RESULT_CORRECTION",
];

const EVENT_TYPES = ["GOAL", "POINT", "YELLOW_CARD", "RED_CARD", "NOTE"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const roles = useAuthStore((s) => s.roles);
  const email = useAuthStore((s) => s.email);
  const clear = useAuthStore((s) => s.clear);
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("live");
  const [message, setMessage] = useState("");

  const fixtures = useQuery({
    queryKey: ["admin-fixtures"],
    queryFn: () => api.adminFixtures({ include_drafts: true }),
    enabled: !!token,
  });
  const announcements = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: api.adminAnnouncements,
    enabled: !!token && canManageContent(roles),
  });

  const refreshFixtures = () => qc.invalidateQueries({ queryKey: ["admin-fixtures"] });
  const refreshAnnouncements = () => {
    qc.invalidateQueries({ queryKey: ["admin-announcements"] });
    qc.invalidateQueries({ queryKey: ["announcements"] });
  };
  const onSuccess = (text: string, refresh: () => void = refreshFixtures) => {
    setMessage(text);
    refresh();
  };

  const logout = async () => {
    await api.logout();
    clear();
    navigate("/admin/login");
  };

  const start = useMutation({
    mutationFn: (id: string) => api.startFixture(id),
    onSuccess: () => onSuccess("Fixture moved live."),
  });
  const score = useMutation({
    mutationFn: (v: { id: string; body: ScoreFixtureBody }) => api.scoreFixture(v.id, v.body),
    onSuccess: () => onSuccess("Score updated."),
  });
  const period = useMutation({
    mutationFn: (v: { id: string; expected_version: number; period: string }) =>
      api.setFixturePeriod(v.id, { expected_version: v.expected_version, period: v.period }),
    onSuccess: () => onSuccess("Period updated."),
  });
  const event = useMutation({
    mutationFn: (v: { id: string; type: string; team_id?: string | null; minute?: number | null; detail?: string | null }) =>
      api.addFixtureEvent(v.id, v),
    onSuccess: () => onSuccess("Match event added."),
  });
  const complete = useMutation({
    mutationFn: (v: { id: string; version: number }) => api.completeFixture(v.id, v.version),
    onSuccess: () => onSuccess("Fixture completed. Public results and tables will update."),
  });
  const pause = useMutation({
    mutationFn: api.pauseFixture,
    onSuccess: () => onSuccess("Fixture paused."),
  });
  const resume = useMutation({
    mutationFn: api.resumeFixture,
    onSuccess: () => onSuccess("Fixture resumed."),
  });
  const publish = useMutation({
    mutationFn: (v: { id: string; published: boolean }) => api.updateFixture(v.id, { published: v.published }),
    onSuccess: () => onSuccess("Fixture visibility updated."),
  });
  const reschedule = useMutation({
    mutationFn: (v: { id: string; scheduled_start: string | null; reason: string }) =>
      api.rescheduleFixture(v.id, { scheduled_start: v.scheduled_start, reason: v.reason }),
    onSuccess: () => onSuccess("Fixture rescheduled. The public schedule will update."),
  });
  const status = useMutation({
    mutationFn: (v: { id: string; action: "postpone" | "cancel" | "reopen"; reason: string }) => {
      if (v.action === "postpone") return api.postponeFixture(v.id, v.reason);
      if (v.action === "cancel") return api.cancelFixture(v.id, v.reason);
      return api.reopenFixture(v.id, v.reason);
    },
    onSuccess: () => onSuccess("Fixture status updated."),
  });
  const correct = useMutation({
    mutationFn: (v: { id: string; home_score: number; away_score: number; reason: string }) =>
      api.correctFixture(v.id, {
        home_score: v.home_score,
        away_score: v.away_score,
        reason: v.reason,
      }),
    onSuccess: () => onSuccess("Final result corrected. Tables will recompute."),
  });
  const createAnnouncement = useMutation({
    mutationFn: (body: AnnouncementCreateBody) => api.createAnnouncement(body),
    onSuccess: () => onSuccess("Update published to the public site.", refreshAnnouncements),
  });

  const list = fixtures.data ?? [];
  const live = list.filter((f) => LIVE_STATUSES.includes(f.status));
  const scheduled = list.filter((f) => f.status === "SCHEDULED" || f.status === "WARMUP");
  const drafts = list.filter((f) => !f.published || f.status === "DRAFT");
  const terminal = list.filter((f) => ["COMPLETED", "CANCELLED", "WALKOVER", "POSTPONED"].includes(f.status));
  const docsUrl = `${config.apiBaseUrl.replace(/\/api\/v1\/?$/, "")}/docs`;

  const busy =
    start.isPending ||
    score.isPending ||
    period.isPending ||
    event.isPending ||
    complete.isPending ||
    pause.isPending ||
    resume.isPending ||
    publish.isPending ||
    reschedule.isPending ||
    status.isPending ||
    correct.isPending ||
    createAnnouncement.isPending;

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

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.07] px-5 py-7 shadow-2xl shadow-black/20 sm:px-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-lime" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-lime">Admin Control Centre</p>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Run the festival live</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/64">
              Signed in as {email}. Changes here power the public schedule, live scores, results, tables and updates.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {roles.map((role) => (
                <span key={role} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/72">
                  {role.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={docsUrl} target="_blank" rel="noreferrer" className="btn-ghost">
              API docs
            </a>
            <button className="btn-ghost" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Live" value={live.length} tone="lime" />
        <Metric label="Scheduled" value={scheduled.length} />
        <Metric label="Drafts" value={drafts.length} />
        <Metric label="Done / paused" value={terminal.length} />
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.06] p-1">
        {([
          ["live", "Live Desk"],
          ["fixtures", "Fixtures"],
          ["updates", "News / Updates"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              tab === key ? "bg-brand-lime text-brand-secondary" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <div className="rounded-2xl border border-brand-lime/30 bg-brand-lime/10 px-4 py-3 text-sm font-semibold text-brand-lime">
          {message}
        </div>
      )}
      {busy && <p className="text-sm text-white/54">Saving change...</p>}

      {fixtures.isLoading ? (
        <CardSkeleton count={4} />
      ) : tab === "live" ? (
        <LiveDesk
          live={live}
          scheduled={scheduled}
          onStart={(id) => start.mutate(id)}
          onScore={(id, body) => score.mutate({ id, body })}
          onPeriod={(id, expected_version, nextPeriod) => period.mutate({ id, expected_version, period: nextPeriod })}
          onEvent={(id, type, team_id, minute, detail) => event.mutate({ id, type, team_id, minute, detail })}
          onPause={(id) => pause.mutate(id)}
          onResume={(id) => resume.mutate(id)}
          onComplete={(id, version) => complete.mutate({ id, version })}
        />
      ) : tab === "fixtures" ? (
        <FixtureOps
          fixtures={list}
          canManage={canManageTournament(roles)}
          onPublish={(id, published) => publish.mutate({ id, published })}
          onReschedule={(id, scheduled_start, reason) => reschedule.mutate({ id, scheduled_start, reason })}
          onStatus={(id, action, reason) => status.mutate({ id, action, reason })}
          onCorrect={(id, home_score, away_score, reason) => correct.mutate({ id, home_score, away_score, reason })}
        />
      ) : (
        <UpdatesDesk
          canManage={canManageContent(roles)}
          announcements={announcements.data ?? []}
          isLoading={announcements.isLoading}
          onCreate={(body) => createAnnouncement.mutate(body)}
        />
      )}
    </div>
  );
}

function canManageTournament(roles: string[]) {
  return roles.includes("SUPER_ADMIN") || roles.includes("TOURNAMENT_ADMIN");
}

function canManageContent(roles: string[]) {
  return canManageTournament(roles) || roles.includes("CONTENT_MANAGER");
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "lime" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className={`mt-2 font-display text-4xl font-bold ${tone === "lime" ? "text-brand-lime" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function LiveDesk({
  live,
  scheduled,
  onStart,
  onScore,
  onPeriod,
  onEvent,
  onPause,
  onResume,
  onComplete,
}: {
  live: Fixture[];
  scheduled: Fixture[];
  onStart: (id: string) => void;
  onScore: (id: string, body: ScoreFixtureBody) => void;
  onPeriod: (id: string, expectedVersion: number, nextPeriod: string) => void;
  onEvent: (id: string, type: string, teamId: string | null, minute: number | null, detail: string | null) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onComplete: (id: string, version: number) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <section>
        <SectionTitle title={`Live matches (${live.length})`} />
        {live.length === 0 ? (
          <EmptyState title="No live matches." hint="Start a scheduled fixture when play begins." />
        ) : (
          <div className="space-y-4">
            {live.map((fx) => (
              <LiveControlCard
                key={fx.id}
                fx={fx}
                onScore={(body) => onScore(fx.id, body)}
                onPeriod={(nextPeriod) => onPeriod(fx.id, fx.version, nextPeriod)}
                onEvent={(type, teamId, minute, detail) => onEvent(fx.id, type, teamId, minute, detail)}
                onPause={() => onPause(fx.id)}
                onResume={() => onResume(fx.id)}
                onComplete={() => onComplete(fx.id, fx.version)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle title="Start next" />
        <div className="space-y-3">
          {scheduled.slice(0, 8).map((fx) => (
            <FixtureSummary key={fx.id} fx={fx} action={<button className="btn-primary" onClick={() => onStart(fx.id)}>Start</button>} />
          ))}
          {scheduled.length === 0 && <EmptyState title="No scheduled fixtures ready." />}
        </div>
      </section>
    </div>
  );
}

function LiveControlCard({
  fx,
  onScore,
  onPeriod,
  onEvent,
  onPause,
  onResume,
  onComplete,
}: {
  fx: Fixture;
  onScore: (body: ScoreFixtureBody) => void;
  onPeriod: (nextPeriod: string) => void;
  onEvent: (type: string, teamId: string | null, minute: number | null, detail: string | null) => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
}) {
  const [period, setPeriod] = useState(fx.live?.period ?? "");
  const [eventType, setEventType] = useState("GOAL");
  const [eventTeam, setEventTeam] = useState<string | null>(fx.home?.id ?? null);
  const [minute, setMinute] = useState("");
  const [detail, setDetail] = useState("");
  const homeScore = fx.live?.home_score ?? 0;
  const awayScore = fx.live?.away_score ?? 0;

  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.07] p-4 shadow-xl shadow-black/15">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-lime">{fx.sport_name}</p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            {fx.home?.department_abbr ?? "TBD"} {homeScore} - {awayScore} {fx.away?.department_abbr ?? "TBD"}
          </h2>
          <p className="mt-1 text-sm text-white/54">
            {fx.round_name ?? fx.group_name ?? "Fixture"} / {fx.status.replaceAll("_", " ")} / v{fx.version}
          </p>
        </div>
        <span className="rounded-full bg-danger/15 px-3 py-1 text-xs font-bold uppercase text-danger">
          Live
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ScorePanel label={fx.home?.department_abbr ?? "Home"} onAdd={() => onScore({ expected_version: fx.version, home_delta: 1 })} onSub={() => onScore({ expected_version: fx.version, home_delta: -1 })} />
        <ScorePanel label={fx.away?.department_abbr ?? "Away"} onAdd={() => onScore({ expected_version: fx.version, away_delta: 1 })} onSub={() => onScore({ expected_version: fx.version, away_delta: -1 })} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.4fr]">
        <form
          className="rounded-xl bg-white/8 p-3 ring-1 ring-white/10"
          onSubmit={(e) => {
            e.preventDefault();
            onPeriod(period);
          }}
        >
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Period</label>
          <div className="mt-2 flex gap-2">
            <input className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="1st Half" />
            <button className="btn-ghost" type="submit">Set</button>
          </div>
        </form>

        <form
          className="rounded-xl bg-white/8 p-3 ring-1 ring-white/10"
          onSubmit={(e) => {
            e.preventDefault();
            onEvent(eventType, eventTeam, minute ? Number(minute) : null, detail || null);
            setDetail("");
            setMinute("");
          }}
        >
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Match event</label>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_5rem_1fr_auto]">
            <select className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm" value={eventType} onChange={(e) => setEventType(e.target.value)}>
              {EVENT_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
            <select className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm" value={eventTeam ?? ""} onChange={(e) => setEventTeam(e.target.value || null)}>
              <option value="">No team</option>
              {fx.home && <option value={fx.home.id}>{fx.home.department_abbr}</option>}
              {fx.away && <option value={fx.away.id}>{fx.away.department_abbr}</option>}
            </select>
            <input className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm" value={minute} onChange={(e) => setMinute(e.target.value)} placeholder="Min" inputMode="numeric" />
            <input className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Player, assist or note" />
            <button className="btn-primary" type="submit">Add</button>
          </div>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {fx.status === "PAUSED" ? (
          <button className="btn-primary" onClick={onResume}>Resume</button>
        ) : (
          <button className="btn-ghost" onClick={onPause}>Pause</button>
        )}
        <button className="btn-accent" onClick={onComplete}>Full time</button>
      </div>
    </article>
  );
}

function ScorePanel({ label, onAdd, onSub }: { label: string; onAdd: () => void; onSub: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/8 px-3 py-3 ring-1 ring-white/10">
      <span className="font-display text-xl font-bold">{label}</span>
      <span className="flex gap-2">
        <button className="btn-ghost !px-3" onClick={onSub}>-1</button>
        <button className="btn-primary !px-3" onClick={onAdd}>+1</button>
      </span>
    </div>
  );
}

function FixtureOps({
  fixtures,
  canManage,
  onPublish,
  onReschedule,
  onStatus,
  onCorrect,
}: {
  fixtures: Fixture[];
  canManage: boolean;
  onPublish: (id: string, published: boolean) => void;
  onReschedule: (id: string, scheduledStart: string | null, reason: string) => void;
  onStatus: (id: string, action: "postpone" | "cancel" | "reopen", reason: string) => void;
  onCorrect: (id: string, homeScore: number, awayScore: number, reason: string) => void;
}) {
  const grouped = useMemo(() => {
    const byStatus = new Map<FixtureStatus, Fixture[]>();
    fixtures.forEach((fx) => {
      byStatus.set(fx.status, [...(byStatus.get(fx.status) ?? []), fx]);
    });
    return byStatus;
  }, [fixtures]);

  if (!canManage) {
    return <EmptyState title="Tournament admin access required." hint="Score officials can use the live desk for assigned matches." />;
  }

  return (
    <div className="space-y-6">
      {(["DRAFT", "SCHEDULED", "LIVE", "POSTPONED", "COMPLETED", "CANCELLED"] as FixtureStatus[]).map((statusKey) => {
        const rows = grouped.get(statusKey) ?? [];
        if (rows.length === 0) return null;
        return (
          <section key={statusKey}>
            <SectionTitle title={`${statusKey.replaceAll("_", " ")} (${rows.length})`} />
            <div className="space-y-3">
              {rows.map((fx) => (
                <FixtureManageCard
                  key={fx.id}
                  fx={fx}
                  onPublish={(published) => onPublish(fx.id, published)}
                  onReschedule={(scheduledStart, reason) => onReschedule(fx.id, scheduledStart, reason)}
                  onStatus={(action, reason) => onStatus(fx.id, action, reason)}
                  onCorrect={(homeScore, awayScore, reason) => onCorrect(fx.id, homeScore, awayScore, reason)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FixtureManageCard({
  fx,
  onPublish,
  onReschedule,
  onStatus,
  onCorrect,
}: {
  fx: Fixture;
  onPublish: (published: boolean) => void;
  onReschedule: (scheduledStart: string | null, reason: string) => void;
  onStatus: (action: "postpone" | "cancel" | "reopen", reason: string) => void;
  onCorrect: (homeScore: number, awayScore: number, reason: string) => void;
}) {
  const [date, setDate] = useState(toDatetimeLocal(fx.scheduled_start));
  const [reason, setReason] = useState("");
  const [homeScore, setHomeScore] = useState(String(fx.live?.home_score ?? 0));
  const [awayScore, setAwayScore] = useState(String(fx.live?.away_score ?? 0));

  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.07] p-4 shadow-xl shadow-black/15">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
            {fx.sport_name} / {fx.status.replaceAll("_", " ")}
          </p>
          <div className="mt-3 max-w-xl">
            <MatchupTeams
              home={fx.home?.department_abbr ?? "TBD"}
              away={fx.away?.department_abbr ?? "TBD"}
              homeColor={fx.home?.primary_color}
              awayColor={fx.away?.primary_color}
            />
          </div>
          <p className="mt-3 text-sm text-white/56">
            {formatDateTime(fx.scheduled_start)} / {fx.venue_name ?? "Venue TBD"} / {fx.published ? "Published" : "Draft"}
          </p>
        </div>
        <button className={fx.published ? "btn-ghost" : "btn-primary"} onClick={() => onPublish(!fx.published)}>
          {fx.published ? "Unpublish" : "Publish"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_1fr_1fr]">
        <form
          className="rounded-xl bg-white/8 p-3 ring-1 ring-white/10"
          onSubmit={(e) => {
            e.preventDefault();
            onReschedule(date ? new Date(date).toISOString() : null, reason || "Admin reschedule");
          }}
        >
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Reschedule</label>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            <input className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" />
            <button className="btn-ghost" type="submit">Save</button>
          </div>
        </form>

        <div className="rounded-xl bg-white/8 p-3 ring-1 ring-white/10">
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Status</label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => onStatus("postpone", reason || "Postponed by admin")}>Postpone</button>
            <button className="btn-ghost" onClick={() => onStatus("cancel", reason || "Cancelled by admin")}>Cancel</button>
            <button className="btn-ghost" onClick={() => onStatus("reopen", reason || "Reopened by admin")}>Reopen</button>
          </div>
        </div>

        <form
          className="rounded-xl bg-white/8 p-3 ring-1 ring-white/10"
          onSubmit={(e) => {
            e.preventDefault();
            onCorrect(Number(homeScore), Number(awayScore), reason || "Result correction");
          }}
        >
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Correct result</label>
          <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
            <input className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} inputMode="numeric" />
            <input className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} inputMode="numeric" />
            <button className="btn-accent" type="submit">Apply</button>
          </div>
        </form>
      </div>
    </article>
  );
}

function UpdatesDesk({
  canManage,
  announcements,
  isLoading,
  onCreate,
}: {
  canManage: boolean;
  announcements: { id: string; title: string; body: string; type: string; is_urgent: boolean; published_at: string | null }[];
  isLoading: boolean;
  onCreate: (body: AnnouncementCreateBody) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("GENERAL");
  const [isUrgent, setIsUrgent] = useState(false);

  if (!canManage) {
    return <EmptyState title="Content manager access required." />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form
        className="rounded-2xl border border-white/12 bg-white/[0.07] p-5 shadow-xl shadow-black/15"
        onSubmit={(e) => {
          e.preventDefault();
          onCreate({ title, body, type, is_urgent: isUrgent, publish: true });
          setTitle("");
          setBody("");
          setIsUrgent(false);
          setType("GENERAL");
        }}
      >
        <SectionTitle title="Publish update" />
        <div className="space-y-3">
          <input className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Update title" required />
          <textarea className="min-h-32 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-sm" value={body} onChange={(e) => setBody(e.target.value)} placeholder="What should everyone know?" required />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <select className="rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              {ANNOUNCEMENT_TYPES.map((option) => <option key={option}>{option}</option>)}
            </select>
            <label className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-3 text-sm font-semibold">
              <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} />
              Urgent
            </label>
          </div>
          <button className="btn-primary w-full" type="submit">Publish to site</button>
        </div>
      </form>

      <section>
        <SectionTitle title="Recent updates" />
        {isLoading ? (
          <CardSkeleton count={3} />
        ) : announcements.length === 0 ? (
          <EmptyState title="No admin updates yet." />
        ) : (
          <div className="space-y-3">
            {announcements.slice(0, 8).map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/12 bg-white/[0.07] p-4 shadow-xl shadow-black/15">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-accent/20 px-2.5 py-1 text-xs font-bold text-brand-accent">
                    {item.type.replaceAll("_", " ")}
                  </span>
                  {item.is_urgent && <span className="rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white">Urgent</span>}
                  <span className="ml-auto text-xs text-white/45">{formatDateTime(item.published_at)}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-white/62">{item.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FixtureSummary({ fx, action }: { fx: Fixture; action?: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.07] p-4 shadow-xl shadow-black/15">
      <MatchupTeams
        home={fx.home?.department_abbr ?? "TBD"}
        away={fx.away?.department_abbr ?? "TBD"}
        homeColor={fx.home?.primary_color}
        awayColor={fx.away?.primary_color}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-white/54">
          {fx.sport_name} / {formatDateTime(fx.scheduled_start)}
        </p>
        {action}
      </div>
    </article>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-3 font-display text-2xl font-bold">{title}</h2>;
}

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
