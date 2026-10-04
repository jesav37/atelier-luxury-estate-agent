// Pure derivations for the Marketing & Pitch dashboard.
//
// Every number the dashboard renders comes from one of two real sources:
//   1. the recorded event ledger (Production.marketing.events) — actions this
//      workspace actually took, stored in this browser's localStorage;
//   2. the current production state (brief, storyboard, assets, brand, agent).
//
// Nothing here invents traffic, conversion or revenue. Stages with no data
// report `null` conversion and the UI renders an em dash. Events tagged
// "simulated-agent" are counted separately and never mixed into real numbers.

import type {
  MarketingEvent,
  MarketingEventType,
  MarketingSource,
  Production,
} from "./types";

/** Hard cap so the ledger cannot grow without bound in localStorage. */
export const MAX_MARKETING_EVENTS = 240;

export const EVENT_META: Record<
  MarketingEventType,
  { label: string; detail: string }
> = {
  view_opened: {
    label: "Surface opened",
    detail: "Someone opened a surface in this workspace.",
  },
  pitch_copied: {
    label: "Pitch handoff",
    detail: "An editorial pitch was copied for a named prospect.",
  },
  delivery_shared: {
    label: "Delivery shared",
    detail: "A client-facing delivery was generated and handed over.",
  },
  outreach_sent: {
    label: "Outreach sent",
    detail: "A prospecting message was sent to a qualified agent.",
  },
  demo_requested: {
    label: "Demo requested",
    detail: "A prospect asked for an Atelier walkthrough.",
  },
  onboarded: {
    label: "Onboarded",
    detail: "A prospect became an active Atelier workspace.",
  },
};

export const SOURCE_LABEL: Record<MarketingSource, string> = {
  operator: "Operator",
  prospect: "Prospect",
  "simulated-agent": "Simulated agent",
};

export interface MarketingEventInput {
  type: MarketingEventType;
  source?: MarketingSource;
  detail?: string;
}

export function makeEvent(
  input: MarketingEventInput,
  now: number = Date.now()
): MarketingEvent {
  return {
    id: `evt_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    type: input.type,
    at: now,
    source: input.source ?? "operator",
    detail: input.detail,
  };
}

/** Newest first, capped. */
export function appendEvent(
  events: MarketingEvent[],
  event: MarketingEvent
): MarketingEvent[] {
  return [event, ...events].slice(0, MAX_MARKETING_EVENTS);
}

export function countOf(
  events: MarketingEvent[],
  types: MarketingEventType | MarketingEventType[]
): number {
  const set = new Set(Array.isArray(types) ? types : [types]);
  return events.filter((e) => set.has(e.type)).length;
}

/** Real events only: everything the operator or a prospect actually did. */
export function recordedEvents(events: MarketingEvent[]): MarketingEvent[] {
  return events.filter((e) => e.source !== "simulated-agent");
}

export function simulatedEvents(events: MarketingEvent[]): MarketingEvent[] {
  return events.filter((e) => e.source === "simulated-agent");
}

export interface FunnelStage {
  key: string;
  label: string;
  /** What exactly is being counted — shown in the UI so the number is auditable. */
  definition: string;
  count: number;
  /** Conversion from the previous stage; null when the prior stage is empty. */
  conversion: number | null;
}

/**
 * Touch -> Interest -> Intent -> Conversion, counted from recorded events.
 * "Interest" counts the client-facing Present surface being opened, because
 * that is the moment a prospect is looking at delivered work rather than text.
 */
export function deriveFunnel(events: MarketingEvent[]): FunnelStage[] {
  const real = recordedEvents(events);
  const counts = [
    countOf(real, ["pitch_copied", "outreach_sent"]),
    real.filter((e) => e.type === "view_opened" && e.detail === "present").length,
    countOf(real, "demo_requested"),
    countOf(real, "onboarded"),
  ];
  const definitions = [
    "Pitch handed over or outreach sent",
    "Client-facing Present surface opened",
    "Walkthrough requested by a prospect",
    "Prospect became an active workspace",
  ];
  const labels = ["Touch", "Interest", "Intent", "Conversion"];

  return labels.map((label, i) => ({
    key: label.toLowerCase(),
    label,
    definition: definitions[i],
    count: counts[i],
    conversion: i === 0 ? null : counts[i - 1] > 0 ? counts[i] / counts[i - 1] : null,
  }));
}

export interface Kpi {
  key: string;
  label: string;
  value: string;
  detail: string;
}

export function deriveKpis(
  production: Production,
  events: MarketingEvent[]
): Kpi[] {
  const assets = production.assets;
  const frames = assets.filter((a) => a.kind === "frame").length;
  const cuts = assets.filter((a) => a.kind === "cut").length;
  const captions = assets.filter((a) => a.kind === "caption").length;
  const sheets = assets.filter((a) => a.kind === "sheet").length;

  return [
    {
      key: "deliverables",
      label: "Deliverables ready",
      value: String(assets.length),
      detail: `${frames} frames · ${cuts} cut · ${captions} caption · ${sheets} sheet`,
    },
    {
      key: "handoffs",
      label: "Pitch handoffs",
      value: String(countOf(recordedEvents(events), "pitch_copied")),
      detail: "Editorial pitches copied for a named prospect",
    },
    {
      key: "demos",
      label: "Demos requested",
      value: String(countOf(recordedEvents(events), "demo_requested")),
      detail: "Recorded walkthrough requests",
    },
    {
      key: "credits",
      label: "Credits invested",
      value: production.creditsSpent.toLocaleString("en-US"),
      detail: "Spent on rendering in this workspace",
    },
  ];
}

export interface ReadinessItem {
  key: string;
  label: string;
  done: boolean;
  detail: string;
  /** Sidebar view that completes this item. */
  view: string;
}

export function deriveReadiness(production: Production): ReadinessItem[] {
  const scenes = production.storyboard?.scenes ?? [];
  const greenlit = scenes.filter((s) => s.status === "done").length;

  return [
    {
      key: "brief",
      label: "Brief authored",
      done: production.brief.trim().length > 0,
      detail:
        production.brief.trim().length > 0
          ? `${production.brief.trim().length} characters`
          : "No brief yet",
      view: "compose",
    },
    {
      key: "listing",
      label: "Listing read",
      done: !!production.propertyDetails,
      detail: production.propertyDetails?.title ?? "No listing scanned",
      view: "compose",
    },
    {
      key: "brand",
      label: "Brand kit applied",
      done: !!production.brand,
      detail: production.brand
        ? `${production.brand.colors.length} colours · ${production.brand.tone}`
        : "No palette recovered",
      view: "brand",
    },
    {
      key: "agent",
      label: "Agent profile stamped",
      done: !!production.agent?.name,
      detail: production.agent?.name
        ? `${production.agent.name} · ${production.agent.brokerage ?? ""}`.trim()
        : "No consultant on file",
      view: "brand",
    },
    {
      key: "storyboard",
      label: "Storyboard planned",
      done: scenes.length > 0,
      detail: scenes.length > 0 ? `${scenes.length} scenes` : "Not planned",
      view: "board",
    },
    {
      key: "greenlit",
      label: "Scenes greenlit",
      done: scenes.length > 0 && greenlit === scenes.length,
      detail: `${greenlit} of ${scenes.length || 0} rendered`,
      view: "board",
    },
    {
      key: "cut",
      label: "Client cut assembled",
      done: production.assets.some((a) => a.kind === "cut"),
      detail: production.assets.some((a) => a.kind === "cut")
        ? "Final cut available"
        : "Awaiting all scenes",
      view: "present",
    },
  ];
}

/** Which surfaces this workspace actually opened, most-used first. */
export function deriveSurfaceUsage(events: MarketingEvent[]): {
  detail: string;
  count: number;
}[] {
  const map = new Map<string, number>();
  for (const e of recordedEvents(events)) {
    if (e.type !== "view_opened") continue;
    const key = e.detail ?? "unknown";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map, ([detail, count]) => ({ detail, count })).sort(
    (a, b) => b.count - a.count
  );
}

/** Handoffs per pitch asset, most-handed-over first. */
export function derivePitchPerformance(events: MarketingEvent[]): {
  detail: string;
  count: number;
  lastAt: number;
}[] {
  const map = new Map<string, { count: number; lastAt: number }>();
  for (const e of recordedEvents(events)) {
    if (e.type !== "pitch_copied") continue;
    const key = e.detail ?? "Unlabelled pitch";
    const prev = map.get(key);
    map.set(key, {
      count: (prev?.count ?? 0) + 1,
      lastAt: Math.max(prev?.lastAt ?? 0, e.at),
    });
  }
  return Array.from(map, ([detail, v]) => ({ detail, ...v })).sort(
    (a, b) => b.count - a.count
  );
}

export function lastEventAt(events: MarketingEvent[]): number | null {
  if (events.length === 0) return null;
  return events.reduce((max, e) => Math.max(max, e.at), 0);
}

export function formatRelative(at: number, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export function formatConversion(conversion: number | null): string {
  return conversion === null ? "—" : `${Math.round(conversion * 100)}%`;
}

/** CSV of the raw ledger, so the numbers can be audited outside the app. */
export function ledgerToCsv(events: MarketingEvent[]): string {
  const header = "recorded_at,iso_time,event,source,detail";
  const rows = events.map((e) =>
    [
      String(e.at),
      new Date(e.at).toISOString(),
      e.type,
      e.source,
      `"${(e.detail ?? "").replace(/"/g, '""')}"`,
    ].join(",")
  );
  return [header, ...rows].join("\n");
}
