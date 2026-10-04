"use client";

import React, { useMemo } from "react";
import { useProduction } from "@/lib/store";
import type { Scene } from "@/lib/types";
import { CheckIcon, DownloadIcon, FilmIcon, SpinnerIcon } from "./Icons";

const STATUS_LABEL: Record<Scene["status"], string> = {
  planned: "Awaiting greenlight",
  queued: "Queued for render",
  rendering: "Rendering…",
  done: "Approved & rendered",
  error: "Render failed",
};

function formatTimeRange(scene: Scene): string {
  // Scene has no explicit `start` field; derive a sensible label from `time`.
  return scene.time || `Scene ${scene.n}`;
}

export default function BoardView({
  onOpenCompose,
}: {
  onOpenCompose?: () => void;
}) {
  const { state, actions } = useProduction();
  const { production, sceneProgress } = state;
  const storyboard = production.storyboard;

  const allDone = useMemo(
    () => !!storyboard && storyboard.scenes.every((s) => s.status === "done"),
    [storyboard]
  );
  const anyRenderable = useMemo(
    () =>
      !!storyboard &&
      storyboard.scenes.some(
        (s) => s.status === "planned" || s.status === "error"
      ),
    [storyboard]
  );

  if (!storyboard) {
    return <EmptyState onOpenCompose={onOpenCompose} />;
  }

  return (
    <div className="p-6 md:p-12 lg:p-16 lg:pt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow">Storyboard · {storyboard.property}</div>
          <h1 className="view-title">Greenlight Board.</h1>
          <p className="view-sub">
            {storyboard.scenes.length} scenes · {storyboard.targetDuration}s total
            · {storyboard.totalCredits.toLocaleString()} cr estimated.
            Approve each scene; Atelier renders a frame and adds it to the
            gallery.
          </p>
        </div>
        {anyRenderable && (
          <button
            onClick={() =>
              storyboard.scenes.forEach((s) => {
                if (s.status === "planned" || s.status === "error") {
                  void actions.greenlight(s.n);
                }
              })
            }
            className="primary-btn shadow-[0_12px_40px_-12px_rgba(184,155,114,0.55)]"
          >
            Greenlight all →
          </button>
        )}
      </div>

      <ol className="mt-8 space-y-5">
        {storyboard.scenes.map((scene) => (
          <SceneCard
            key={scene.n}
            scene={scene}
            progress={sceneProgress[scene.n] ?? 0}
            onGreenlight={() => actions.greenlight(scene.n)}
            onDownload={(kind) => {
              const asset = production.assets.find(
                (a) => a.scene === scene.n && a.kind === kind
              );
              if (asset) actions.downloadAsset(asset);
            }}
            disabled={!allDone && scene.status === "rendering"}
          />
        ))}
      </ol>

      {allDone && (
        <div className="mt-10 flex items-center gap-3 rounded-2xl border border-[var(--brass)]/40 bg-[rgba(184,155,114,0.06)] px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brass)] text-[var(--brass)]">
            <CheckIcon size={16} />
          </span>
          <div>
            <div className="serif text-[18px]">Production is greenlit.</div>
            <div className="text-[12px] text-[var(--muted)]">
              Every frame is in the Assets gallery — ready for the final cut.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SceneCard({
  scene,
  progress,
  onGreenlight,
  onDownload,
  disabled,
}: {
  scene: Scene;
  progress: number;
  onGreenlight: () => void;
  onDownload: (kind: "frame" | "shotlist") => void;
  disabled: boolean;
}) {
  const isRendering =
    scene.status === "rendering" || scene.status === "queued";
  const isDone = scene.status === "done";
  const isError = scene.status === "error";

  return (
    <li className="rounded-2xl border border-[var(--line)] bg-[var(--ink2)] p-5 sm:p-6">
      <div className="flex items-start gap-4 sm:gap-6">
        <div className="flex flex-col items-center">
          <div
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[12px] tracking-widest",
              isDone
                ? "border-[var(--brass)] bg-[var(--brass)] text-[var(--ink)]"
                : isError
                ? "border-[#a8543a] text-[#e7c0b3]"
                : isRendering
                ? "border-[var(--brass)] text-[var(--brass)]"
                : "border-[var(--line)] text-[var(--muted)]",
            ].join(" ")}
          >
            {isDone ? <CheckIcon size={16} /> : String(scene.n).padStart(2, "0")}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div className="min-w-0">
              <h3 className="serif text-[20px] leading-tight">
                {scene.name}
              </h3>
              <div className="mt-0.5 text-[10.5px] uppercase tracking-[0.25em] text-[var(--muted)]">
                {formatTimeRange(scene)} · {scene.modelLabel} · {scene.credits} cr
              </div>
            </div>
            <div
              className={[
                "shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]",
                isDone
                  ? "border-[var(--brass)]/40 bg-[rgba(184,155,114,0.08)] text-[var(--brass)]"
                  : isError
                  ? "border-[#a8543a]/40 bg-[rgba(168,84,58,0.08)] text-[#e7c0b3]"
                  : isRendering
                  ? "border-[var(--brass)]/40 text-[var(--brass)]"
                  : "border-[var(--line)] text-[var(--muted)]",
              ].join(" ")}
            >
              {STATUS_LABEL[scene.status]}
            </div>
          </div>

          {scene.script && (
            <p className="serif mt-2.5 text-[14.5px] italic leading-relaxed text-[var(--bone)]">
              &ldquo;{scene.script}&rdquo;
            </p>
          )}

          {scene.shots.length > 0 && (
            <div className="mt-3 flex gap-1.5">
              {scene.shots.slice(0, 4).map((shot, i) => (
                <div
                  key={i}
                  className="serif relative h-12 w-20 overflow-hidden rounded-md border border-[var(--line)] text-[10px] italic text-[var(--muted)]"
                >
                  <ShotGradient index={i} />
                  <span className="absolute inset-0 flex items-center justify-center px-1 text-center text-[10px] leading-tight text-[var(--bone)]/80">
                    {shot}
                  </span>
                </div>
              ))}
            </div>
          )}

          {scene.rationale && (
            <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--muted)]">
              <span className="text-[var(--brass)]">Model choice ·</span>{" "}
              {scene.rationale}
            </p>
          )}

          {isRendering && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.25em] text-[var(--muted)]">
                <span>Render progress</span>
                <span className="text-[var(--brass)]">{progress}%</span>
              </div>
              <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-[var(--line)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--brass)] to-[var(--brass2)] transition-all duration-300"
                  style={{ width: `${Math.max(6, progress)}%` }}
                />
              </div>
            </div>
          )}

          {isError && scene.error && (
            <div className="mt-3 rounded-lg border border-[#a8543a]/40 bg-[rgba(168,84,58,0.06)] px-3 py-2 text-[11.5px] text-[#e7c0b3]">
              {scene.error}
            </div>
          )}

          {/* Rendered SVG frame */}
          {isDone && scene.output && (
            <div className="mt-4 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--ink)]">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-1.5">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-[var(--brass)]">
                  <FilmIcon size={11} /> Storyboard Frame
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {scene.output.manifest.time}
                </span>
              </div>
              <div className="bg-[#0d0d0d] p-3">
                <div
                  className="mx-auto"
                  style={{ maxWidth: 360 }}
                  dangerouslySetInnerHTML={{ __html: scene.output.svg }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {isDone ? (
              <>
                <button
                  onClick={() => onDownload("frame")}
                  className="primary-btn"
                >
                  <span className="flex items-center gap-2">
                    <DownloadIcon size={14} /> Download Frame
                  </span>
                </button>
                <button
                  onClick={() => onDownload("shotlist")}
                  className="ghost-btn"
                >
                  <span className="flex items-center gap-2">
                    <DownloadIcon size={14} /> Shot List
                  </span>
                </button>
              </>
            ) : isRendering ? (
              <button disabled className="ghost-btn cursor-not-allowed opacity-60">
                <span className="flex items-center gap-2">
                  <SpinnerIcon size={14} /> Rendering
                </span>
              </button>
            ) : (
              <button
                onClick={onGreenlight}
                disabled={disabled}
                className="primary-btn shadow-[0_12px_40px_-12px_rgba(184,155,114,0.55)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {isError ? "Re-render →" : "Greenlight →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function ShotGradient({ index }: { index: number }) {
  // Cycle through three distinct, tasteful gradients.
  const grads = [
    "linear-gradient(135deg,#1a1814 0%,#3a2f22 60%,#b89b72 130%)",
    "linear-gradient(180deg,#0f1418 0%,#1e2a32 60%,#7d8b8e 130%)",
    "linear-gradient(135deg,#1c1612 0%,#4a2e1a 60%,#d8c3a0 130%)",
  ];
  return (
    <div
      aria-hidden
      className="absolute inset-0 opacity-90"
      style={{ background: grads[index % grads.length] }}
    />
  );
}

function EmptyState({ onOpenCompose }: { onOpenCompose?: () => void }) {
  return (
    <div className="flex flex-col items-center px-5 py-20 text-center sm:py-28">
      <div className="eyebrow">Greenlight Board</div>
      <h1 className="view-title">No storyboard yet.</h1>
      <p className="view-sub">
        Compose a brief, a listing URL or a few photos and Atelier will plan
        your storyboard here.
      </p>
      <button
        onClick={() => onOpenCompose?.()}
        className="ghost-btn mt-6"
        disabled={!onOpenCompose}
      >
        Plan in Compose →
      </button>
      <p className="mt-3 text-[10.5px] uppercase tracking-[0.3em] text-[var(--muted)]">
        Tip · open the Compose tab to start.
      </p>
    </div>
  );
}
