"use client";

import React, { useMemo, useState } from "react";
import { useProduction } from "@/lib/store";
import type { AssetItem } from "@/lib/types";
import { AssetsIcon, DownloadIcon, FilmIcon } from "./Icons";

const KIND_LABEL: Record<AssetItem["kind"], string> = {
  frame: "Storyboard Frame",
  shotlist: "Shot List",
  cut: "Final Cut",
  caption: "Social Caption",
  sheet: "Listing Sheet",
};

function kindGradient(kind: AssetItem["kind"]): string {
  switch (kind) {
    case "frame":
      return "linear-gradient(135deg,#1a1814 0%,#3a2f22 60%,#b89b72 130%)";
    case "shotlist":
      return "linear-gradient(160deg,#11161a 0%,#1f2a32 60%,#7d8b8e 130%)";
    case "cut":
      return "linear-gradient(150deg,#1c1612 0%,#4a2e1a 60%,#d8c3a0 130%)";
    case "caption":
      return "linear-gradient(135deg,#111827 0%,#1e3a8a 60%,#3b82f6 130%)";
    case "sheet":
      return "linear-gradient(135deg,#064e3b 0%,#059669 60%,#10b981 130%)";
    default:
      return "linear-gradient(135deg,#1a1814 0%,#3a2f22 60%,#b89b72 130%)";
  }
}

export default function AssetsView() {
  const { state, actions } = useProduction();
  const { production } = state;
  const [filter, setFilter] = useState<"all" | AssetItem["kind"]>("all");

  const sorted = useMemo(
    () =>
      [...production.assets].sort((a, b) => {
        if (a.scene !== undefined && b.scene !== undefined) {
          return a.scene - b.scene;
        }
        return a.createdAt - b.createdAt;
      }),
    [production.assets]
  );

  const filtered = useMemo(
    () => (filter === "all" ? sorted : sorted.filter((a) => a.kind === filter)),
    [sorted, filter]
  );

  if (production.assets.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 py-20 text-center sm:py-28">
        <div className="eyebrow">Assets</div>
        <h1 className="view-title">The gallery is empty.</h1>
        <p className="view-sub">
          Rendered storyboard frames and shot lists appear here as soon as a
          scene is greenlit.
        </p>
        <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)] text-[var(--brass)]">
          <AssetsIcon size={20} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 lg:p-16 lg:pt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow">Assets · {production.assets.length} items</div>
          <h1 className="view-title">The gallery.</h1>
          <p className="view-sub">
            Every artefact the production has produced. Frames and the Final Cut
            render as inline SVG, shot lists download as JSON for the team.
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {(["all", "frame", "shotlist", "cut", "caption", "sheet"] as const).map((k) => {
            const active = filter === k;
            const label = k === "all" ? "All" : KIND_LABEL[k];
            return (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={[
                  "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-all",
                  active
                    ? "border-[var(--brass)] bg-[rgba(184,155,114,0.10)] text-[var(--bone)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--bone)]",
                ].join(" ")}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <li
            key={a.id}
            className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--ink2)]"
          >
            <div
              className="relative h-40"
              style={{ background: kindGradient(a.kind) }}
            >
              {(a.kind === "frame" || a.kind === "cut") &&
                a.payload.mime === "image/svg+xml" && (
                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: a.payload.content }}
                  />
                )}
              {a.kind !== "frame" && a.kind !== "cut" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--bone)]">
                  <FilmIcon size={22} />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--brass)]">
                    {KIND_LABEL[a.kind]}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="serif text-[15px] leading-snug">{a.name}</h3>
                {a.scene !== undefined && (
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.25em] text-[var(--brass)]">
                    Scene {String(a.scene).padStart(2, "0")}
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-[var(--muted)]">{a.meta}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">
                  {a.payload.mime}
                </span>
                <button
                  onClick={() => actions.downloadAsset(a)}
                  className="ghost-btn"
                >
                  <span className="flex items-center gap-1.5">
                    <DownloadIcon size={13} /> Download
                  </span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
