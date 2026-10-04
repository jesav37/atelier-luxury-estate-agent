"use client";

import React, { useMemo, useState } from "react";
import { useProduction } from "@/lib/store";
import { downloadAsset } from "@/lib/api";
import {
  EVENT_META,
  SOURCE_LABEL,
  countOf,
  deriveFunnel,
  deriveKpis,
  derivePitchPerformance,
  deriveReadiness,
  deriveSurfaceUsage,
  formatConversion,
  formatRelative,
  lastEventAt,
  ledgerToCsv,
  recordedEvents,
  simulatedEvents,
} from "@/lib/marketing";
import { PITCH_PACK, type PitchItemKind } from "@/lib/pitch";
import type { ViewKey } from "../Sidebar";
import {
  AlertCircleIcon,
  BarChart3Icon,
  CalendarIcon,
  CheckCircle2Icon,
  CopyIcon,
  DownloadIcon,
  MailIcon,
  MousePointerClickIcon,
  ShieldIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from "../Icons";

const PANEL =
  "rounded-2xl border border-[var(--line)] bg-[rgba(184,155,114,0.02)] p-5";

const KIND_LABEL: Record<PitchItemKind, string> = {
  positioning: "Positioning",
  script: "Script",
  play: "Workflow play",
  guardrail: "Guardrail",
};

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "true");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export default function MarketingAdminView({
  onNavigate,
}: {
  onNavigate?: (view: ViewKey) => void;
}) {
  const { state, actions } = useProduction();
  const production = state.production;
  const events = useMemo(
    () => production.marketing?.events ?? [],
    [production.marketing]
  );

  const [copied, setCopied] = useState<string | null>(null);
  const [copyFailed, setCopyFailed] = useState<string | null>(null);

  const kpis = useMemo(() => deriveKpis(production, events), [production, events]);
  const funnel = useMemo(() => deriveFunnel(events), [events]);
  const readiness = useMemo(() => deriveReadiness(production), [production]);
  const usage = useMemo(() => deriveSurfaceUsage(events), [events]);
  const pitchPerf = useMemo(() => derivePitchPerformance(events), [events]);
  const simulated = simulatedEvents(events);
  const recorded = recordedEvents(events);
  const lastAt = lastEventAt(events);
  const readyCount = readiness.filter((r) => r.done).length;

  const handleCopy = async (item: { key: string; label: string; text: string }) => {
    const ok = await copyToClipboard(item.text);
    if (ok) {
      actions.logEvent("pitch_copied", { source: "operator", detail: item.label });
      setCopied(item.key);
      setCopyFailed(null);
      window.setTimeout(() => setCopied((c) => (c === item.key ? null : c)), 2200);
    } else {
      setCopyFailed(item.key);
      setCopied(null);
    }
  };

  const exportCsv = () =>
    downloadAsset({
      filename: `atelier-funnel-${new Date().toISOString().slice(0, 10)}.csv`,
      mime: "text/csv",
      content: ledgerToCsv(events),
    });

  const funnelMax = Math.max(1, ...funnel.map((s) => s.count));

  return (
    <div className="p-6 md:p-12 lg:p-16 lg:pt-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow">Admin · Marketing</div>
          <h1 className="view-title">The self-selling desk.</h1>
          <p className="view-sub max-w-2xl">
            The pitch, its guardrails and every funnel number live here. Counts are
            derived from actions recorded in this browser and from the current
            production — nothing is modelled, projected or estimated.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="ghost-btn" onClick={exportCsv}>
            <DownloadIcon size={14} />
            Export ledger CSV
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              if (
                window.confirm(
                  "Clear the local event ledger? Recorded pitch handoffs, demos and surface usage will be deleted. This cannot be undone."
                )
              ) {
                actions.clearEvents();
              }
            }}
          >
            Clear ledger
          </button>
        </div>
      </header>

      {/* Tracking status — honest about what is and is not connected */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-[var(--line)] bg-[rgba(245,242,236,0.02)] px-5 py-3 text-[12px] text-[var(--muted)]">
        <span className="flex items-center gap-2">
          <span className="status-dot brass" />
          Local ledger active
        </span>
        <span>{events.length} events recorded</span>
        <span>Last activity: {lastAt ? formatRelative(lastAt) : "none yet"}</span>
        <span className="flex items-center gap-2">
          <AlertCircleIcon size={13} className="text-[var(--brass)]" />
          No third-party analytics connected — metrics cover this browser only.
        </span>
      </div>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.key} className={PANEL}>
            <div className="eyebrow">{kpi.label}</div>
            <div className="serif mt-2 text-[38px] leading-none text-[var(--bone)]">
              {kpi.value}
            </div>
            <div className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
              {kpi.detail}
            </div>
          </div>
        ))}
      </section>

      {/* Funnel + readiness */}
      <section className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className={PANEL}>
          <div className="flex items-center gap-2">
            <TrendingUpIcon size={16} className="text-[var(--brass)]" />
            <h2 className="text-[15px] font-medium">Pipeline</h2>
          </div>
          <p className="mt-2 text-[11px] text-[var(--muted)]">
            Recorded events only. Simulated agent activity is excluded and reported
            separately below.
          </p>

          <div className="mt-5 space-y-4">
            {funnel.map((stage) => (
              <div key={stage.key}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-[13px] text-[var(--bone)]">
                    {stage.label}
                    <span className="ml-2 text-[11px] text-[var(--muted)]">
                      {stage.definition}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="serif text-[20px] leading-none text-[var(--bone)]">
                      {stage.count}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                      {formatConversion(stage.conversion)}
                    </div>
                  </div>
                </div>
                <div className="progress-track mt-2">
                  <div
                    className="progress-fill"
                    style={{ width: `${(stage.count / funnelMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {pitchPerf.length > 0 && (
            <div className="mt-6 border-t border-[var(--line)] pt-4">
              <div className="eyebrow">Pitch handoffs by asset</div>
              <ul className="mt-3 space-y-2">
                {pitchPerf.map((row) => (
                  <li
                    key={row.detail}
                    className="flex items-center justify-between text-[12px] text-[var(--muted)]"
                  >
                    <span className="text-[var(--bone)]">{row.detail}</span>
                    <span>
                      {row.count} · {formatRelative(row.lastAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className={PANEL}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon size={16} className="text-[var(--brass)]" />
                <h2 className="text-[15px] font-medium">Production readiness</h2>
              </div>
              <span className="text-[11px] text-[var(--muted)]">
                {readyCount}/{readiness.length}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-[var(--muted)]">
              What a prospect can be shown today, read straight from the current
              workspace.
            </p>
            <ul className="mt-4 space-y-3">
              {readiness.map((item) => (
                <li key={item.key} className="flex items-start gap-3">
                  <span
                    className={`mt-[3px] h-2 w-2 shrink-0 rounded-full ${
                      item.done ? "bg-[var(--brass)]" : "bg-[rgba(245,242,236,0.18)]"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] text-[var(--bone)]">{item.label}</div>
                    <div className="truncate text-[11px] text-[var(--muted)]">
                      {item.detail}
                    </div>
                  </div>
                  {!item.done && onNavigate && (
                    <button
                      type="button"
                      className="shrink-0 text-[11px] text-[var(--brass)] underline decoration-[rgba(184,155,114,0.4)] underline-offset-4"
                      onClick={() => onNavigate(item.view as ViewKey)}
                    >
                      Open
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className={PANEL}>
            <div className="flex items-center gap-2">
              <MousePointerClickIcon size={16} className="text-[var(--brass)]" />
              <h2 className="text-[15px] font-medium">Surfaces opened</h2>
            </div>
            {usage.length === 0 ? (
              <p className="mt-3 text-[12px] text-[var(--muted)]">
                No surface activity recorded yet. Opening any tab records one event.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {usage.map((row) => (
                  <li
                    key={row.detail}
                    className="flex items-center justify-between text-[12px]"
                  >
                    <span className="capitalize text-[var(--bone)]">{row.detail}</span>
                    <span className="text-[var(--muted)]">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Pitch pack */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Pitch</div>
            <h2 className="view-title text-[30px]">Copy, ready to send.</h2>
          </div>
          <p className="max-w-md text-[11px] text-[var(--muted)]">
            Each copy is recorded as a pitch handoff, so the pipeline above reflects
            real outreach. Scripts and guardrails are the same text used in the
            prospecting desk.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {PITCH_PACK.map((item) => (
            <div key={item.key} className={PANEL}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="tag brass">{KIND_LABEL[item.kind]}</span>
                  <h3 className="mt-3 text-[14px] text-[var(--bone)]">{item.label}</h3>
                </div>
                <button
                  type="button"
                  className="ghost-btn shrink-0"
                  onClick={() => handleCopy(item)}
                >
                  {copied === item.key ? (
                    <>
                      <CheckCircle2Icon size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-line text-[12.5px] leading-relaxed text-[var(--muted)]">
                {item.text}
              </p>
              <p className="mt-3 border-t border-[var(--line)] pt-3 text-[11px] text-[var(--muted)]">
                {item.detail}
              </p>
              {copyFailed === item.key && (
                <p className="mt-2 flex items-center gap-2 text-[11px] text-[#c97b65]">
                  <AlertCircleIcon size={13} />
                  Clipboard blocked by the browser — select the text and copy manually.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Manual recording + log */}
      <section className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className={PANEL}>
          <div className="flex items-center gap-2">
            <BarChart3Icon size={16} className="text-[var(--brass)]" />
            <h2 className="text-[15px] font-medium">Event log</h2>
          </div>
          {events.length === 0 ? (
            <p className="mt-3 text-[12px] text-[var(--muted)]">
              The ledger is empty. Copy a pitch, open the Present surface, or record an
              offline action to start it.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {events.slice(0, 12).map((event) => (
                <li
                  key={event.id}
                  className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-2 text-[12px] last:border-0"
                >
                  <div className="min-w-0">
                    <span className="text-[var(--bone)]">
                      {EVENT_META[event.type].label}
                    </span>
                    {event.detail && (
                      <span className="ml-2 text-[11px] text-[var(--muted)]">
                        {event.detail}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-[10.5px] uppercase tracking-[0.12em] text-[var(--muted)]">
                    {SOURCE_LABEL[event.source]} · {formatRelative(event.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className={PANEL}>
            <div className="flex items-center gap-2">
              <MailIcon size={16} className="text-[var(--brass)]" />
              <h2 className="text-[15px] font-medium">Record an offline action</h2>
            </div>
            <p className="mt-2 text-[11px] text-[var(--muted)]">
              Outreach happens in inboxes and on calls. Log it here and the pipeline
              above stays truthful.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="ghost-btn"
                onClick={() =>
                  actions.logEvent("outreach_sent", {
                    source: "operator",
                    detail: "Recorded manually",
                  })
                }
              >
                <ZapIcon size={14} />
                Outreach sent
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() =>
                  actions.logEvent("delivery_shared", {
                    source: "operator",
                    detail: "Present link handed over",
                  })
                }
              >
                <UsersIcon size={14} />
                Delivery shared
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() =>
                  actions.logEvent("demo_requested", {
                    source: "prospect",
                    detail: "Recorded manually",
                  })
                }
              >
                <CalendarIcon size={14} />
                Demo requested
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() =>
                  actions.logEvent("onboarded", {
                    source: "prospect",
                    detail: "Recorded manually",
                  })
                }
              >
                <CheckCircle2Icon size={14} />
                Mark onboarded
              </button>
            </div>
          </div>

          <div className={PANEL}>
            <div className="flex items-center gap-2">
              <ShieldIcon size={16} className="text-[var(--brass)]" />
              <h2 className="text-[15px] font-medium">Compliance &amp; privacy</h2>
            </div>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-[var(--muted)]">
              <li className="flex gap-2">
                <span className="list-dot" />
                Ledger entries store an event type, a timestamp and a short label — no
                client names, addresses, email bodies or phone numbers.
              </li>
              <li className="flex gap-2">
                <span className="list-dot" />
                Outreach needs a working opt-out and a postal address (CAN-SPAM);
                consent-based contact for EU/UK prospects falls under GDPR/PECR, and
                automated calls or texts to US mobiles under the TCPA.
              </li>
              <li className="flex gap-2">
                <span className="list-dot" />
                {recorded.length} recorded events sit in this browser only. Export the
                CSV before clearing the ledger if the history matters.
              </li>
            </ul>
            {simulated.length > 0 && (
              <p className="mt-3 border-t border-[var(--line)] pt-3 text-[11px] text-[var(--muted)]">
                {simulated.length} simulated agent events are held in the log and
                excluded from every number above.
              </p>
            )}
          </div>
        </div>
      </section>

      <p className="text-[11px] text-[var(--muted)]">
        Rendering and outreach are simulated in this prototype. This desk measures what
        the workspace actually did in this browser — {countOf(recorded, "view_opened")}{" "}
        surface opens, {countOf(recorded, "pitch_copied")} handoffs — and makes no claim
        about revenue.
      </p>
    </div>
  );
}
