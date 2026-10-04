"use client";

import React, { useMemo } from "react";
import { useProduction } from "@/lib/store";
import { CheckIcon, FilmIcon, FlowIcon, SpinnerIcon } from "./Icons";

type NodeStatus = "done" | "active" | "pending" | "error";

interface FlowNode {
  key: string;
  label: string;
  hint: string;
  status: NodeStatus;
  meta?: string;
  Icon: React.FC<{ className?: string; size?: number }>;
}

function statusColor(status: NodeStatus): string {
  switch (status) {
    case "done":
      return "border-[var(--brass)] text-[var(--brass)]";
    case "active":
      return "border-[var(--brass)] text-[var(--brass)]";
    case "error":
      return "border-[#a8543a] text-[#e7c0b3]";
    default:
      return "border-[var(--line)] text-[var(--muted)]";
  }
}

function StatusGlyph({ status }: { status: NodeStatus }) {
  if (status === "done") return <CheckIcon size={14} />;
  if (status === "active") return <SpinnerIcon size={14} />;
  if (status === "error") return <span>!</span>;
  return <span className="text-[10px]">·</span>;
}

export default function FlowView() {
  const { state, actions } = useProduction();
  const { production, sceneProgress } = state;

  const nodes: FlowNode[] = useMemo(() => {
    const list: FlowNode[] = [
      {
        key: "listing",
        label: "Listing Recovered",
        hint: "Scraped from URL",
        status: production.propertyDetails ? "done" : "pending",
        meta: production.propertyDetails?.title,
        Icon: FlowIcon,
      },
      {
        key: "storyboard",
        label: "Storyboard Drafted",
        hint: "Atelier planner",
        status: production.storyboard ? "done" : "pending",
        meta: production.storyboard
          ? `${production.storyboard.scenes.length} scenes · ${production.storyboard.targetDuration}s`
          : undefined,
        Icon: FilmIcon,
      },
    ];

    if (production.storyboard) {
      production.storyboard.scenes.forEach((s) => {
        const status: NodeStatus =
          s.status === "done"
            ? "done"
            : s.status === "error"
            ? "error"
            : s.status === "rendering" || s.status === "queued"
            ? "active"
            : "pending";
        list.push({
          key: `scene-${s.n}`,
          label: s.name,
          hint: `${s.modelLabel} · ${s.credits} cr`,
          status,
          meta:
            status === "active"
              ? `${sceneProgress[s.n] ?? 0}%`
              : s.status === "done"
              ? "rendered"
              : s.status === "error"
              ? "failed"
              : s.time,
          Icon: FilmIcon,
        });
      });

      const allDone = production.storyboard.scenes.every(
        (s) => s.status === "done"
      );
      list.push({
        key: "cut",
        label: "Final Cut Assembled",
        hint: "All frames in order",
        status: allDone ? "done" : "pending",
        meta: allDone
          ? "ready to publish"
          : `${production.storyboard.scenes.filter((s) => s.status === "done").length}/${production.storyboard.scenes.length} done`,
        Icon: FilmIcon,
      });
    }

    return list;
  }, [production, sceneProgress]);

  const completed = nodes.filter((n) => n.status === "done").length;
  const total = nodes.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (!production.storyboard) {
    return (
      <div className="flex flex-col items-center px-5 py-20 text-center sm:py-28">
        <div className="eyebrow">Flow</div>
        <h1 className="view-title">No production flowing yet.</h1>
        <p className="view-sub">
          The pipeline will visualise every stage of the production as soon as a
          storyboard is drafted in Compose.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-7 sm:px-8 sm:py-10 md:px-12 md:py-12 lg:px-16">
      <div className="eyebrow">Flow · Live pipeline</div>
      <h1 className="view-title">The pipeline.</h1>
      <p className="view-sub">
        A real-time map of where the production is — every stage derives
        directly from the persisted production state.
      </p>

      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--ink2)] p-5 sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Overall
            </div>
            <div className="serif mt-1 text-[26px]">
              {pct}%
              <span className="ml-2 text-[12px] uppercase tracking-[0.25em] text-[var(--muted)]">
                complete
              </span>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Stages
            </div>
            <div className="serif mt-1 text-[20px]">
              {completed}
              <span className="text-[var(--muted)]"> / {total}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--brass)] to-[var(--brass2)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {completed < total && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={() => actions.greenlightAll()}
              className="ghost-btn px-6"
            >
              Greenlight All →
            </button>
          </div>
        )}
      </div>

      <ol className="mt-8 space-y-3">
        {nodes.map((n, i) => (
          <li
            key={n.key}
            className="relative flex items-stretch gap-3 sm:gap-5"
          >
            <div className="flex w-10 flex-col items-center">
              <div
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-[var(--ink)]",
                  statusColor(n.status),
                ].join(" ")}
                aria-current={n.status === "active" ? "step" : undefined}
              >
                {n.status === "done" || n.status === "active" || n.status === "error" ? (
                  <StatusGlyph status={n.status} />
                ) : (
                  <n.Icon size={14} />
                )}
              </div>
              {i < nodes.length - 1 && (
                <div
                  className={[
                    "mt-1 w-px flex-1",
                    n.status === "done"
                      ? "bg-[var(--brass)]/60"
                      : "bg-[var(--line)]",
                  ].join(" ")}
                />
              )}
            </div>
            <div
              className={[
                "mb-3 flex-1 rounded-2xl border bg-[var(--ink2)] p-4 sm:p-5",
                n.status === "active"
                  ? "border-[var(--brass)]/50 shadow-[0_0_0_1px_rgba(184,155,114,0.18)]"
                  : "border-[var(--line)]",
              ].join(" ")}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--brass)]">
                    {String(i + 1).padStart(2, "0")} · {n.hint}
                  </div>
                  <h3 className="serif mt-0.5 text-[18px] leading-tight">
                    {n.label}
                  </h3>
                </div>
                <div className="shrink-0 text-right text-[10.5px] uppercase tracking-[0.25em] text-[var(--muted)]">
                  {n.status === "done"
                    ? "Complete"
                    : n.status === "active"
                    ? "In progress"
                    : n.status === "error"
                    ? "Failed"
                    : "Queued"}
                  {n.meta && <div className="mt-0.5 normal-case text-[var(--bone)]">{n.meta}</div>}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
