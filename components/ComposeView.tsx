"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useProduction } from "@/lib/store";
import type { AspectRatio, PropertyDetails } from "@/lib/types";
import { CheckIcon, SpinnerIcon, UploadIcon, XIcon } from "./Icons";

const ASPECTS: { value: AspectRatio; label: string; sub: string }[] = [
  { value: "9:16", label: "9:16", sub: "Vertical / Reels" },
  { value: "16:9", label: "16:9", sub: "Widescreen / YouTube" },
  { value: "1:1", label: "1:1", sub: "Square / Social" },
];

const MIN_DURATION = 15;
const MAX_DURATION = 90;
const DURATION_STEP = 5;

export default function ComposeView({
  onPlanned,
}: {
  onPlanned: () => void;
}) {
  const { state, actions } = useProduction();
  const { production, readingListing, planning, lastError } = state;

  // Local UI state — files can't be persisted.
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [targetSeconds, setTargetSeconds] = useState<number>(
    production.storyboard?.targetDuration ?? 30
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync file names into the store so the rest of the app sees them.
  useEffect(() => {
    actions.setPhotoNames(files.map((f) => f.name));
    // We intentionally don't include `actions` in deps — it's stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  // Manage object URLs alongside the File[].
  useEffect(() => {
    const next = files.map((f) => URL.createObjectURL(f));
    setUrls(next);
    return () => {
      next.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    setFiles((prev) => [...prev, ...arr]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleReadListing = useCallback(async () => {
    const url = production.listingUrl.trim();
    if (!url) return;
    await actions.scrapeListing(url);
  }, [production.listingUrl, actions]);

  const handlePlan = useCallback(async () => {
    const ok = await actions.plan({
      brief: production.brief,
      listingUrl: production.listingUrl,
      photoCount: files.length,
      aspectRatio: production.aspectRatio,
      targetSeconds,
      propertyDetails: production.propertyDetails,
    });
    if (ok) onPlanned();
  }, [
    actions,
    production.brief,
    production.listingUrl,
    production.aspectRatio,
    production.propertyDetails,
    files.length,
    targetSeconds,
    onPlanned,
  ]);

  const canPlan =
    !planning &&
    !readingListing &&
    (!!production.listingUrl.trim() ||
      files.length > 0 ||
      !!production.brief.trim());

  const urlValid =
    !production.listingUrl.trim() ||
    /^https?:\/\/.+\..+/i.test(production.listingUrl.trim());

  return (
    <div className="p-6 md:p-12 lg:p-16 lg:pt-12">
      <div className="eyebrow">New Production</div>
      <h1 className="view-title">Compose the brief.</h1>
      <p className="view-sub">
        One sentence. A few listing photos. A link to the property. Atelier
        assembles a cinematic, on-brand storyboard — ready for your greenlight.
      </p>

      {lastError && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-[#a8543a]/40 bg-[rgba(168,84,58,0.08)] px-4 py-3 text-[12.5px] text-[#e7c0b3]">
          <XIcon size={14} className="mt-0.5 shrink-0" />
          <span>{lastError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Listing URL */}
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--ink2)] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--brass)]">
                01 · Listing
              </div>
              <h2 className="serif mt-1 text-[20px]">Drop the listing URL.</h2>
            </div>
            {production.propertyDetails && (
              <span className="flex items-center gap-1.5 rounded-full border border-[var(--brass)]/40 bg-[rgba(184,155,114,0.10)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--brass)]">
                <CheckIcon size={11} /> Recovered
              </span>
            )}
          </div>

          <p className="mt-2 text-[12.5px] text-[var(--muted)]">
            Atelier reads the headline, specs and hero copy. Saving the URL
            alone is fine; you can fill in the rest below.
          </p>

          <div className="mt-4 flex gap-2">
            <input
              type="url"
              value={production.listingUrl}
              onChange={(e) => actions.setListingUrl(e.target.value)}
              placeholder="https://compass.com/listing/…"
              className="flex-1 rounded-full border border-[var(--line)] bg-[var(--ink)] px-4 py-3 text-[13px] text-[var(--bone)] placeholder:text-[var(--muted)] focus:border-[var(--brass)] focus:outline-none"
            />
            <button
              onClick={handleReadListing}
              disabled={!production.listingUrl.trim() || !urlValid || readingListing}
              className="primary-btn shrink-0 disabled:opacity-40"
            >
              {readingListing ? (
                <span className="flex items-center gap-2">
                  <SpinnerIcon size={14} /> Reading
                </span>
              ) : (
                "Read"
              )}
            </button>
          </div>
          {!urlValid && (
            <div className="mt-2 text-[11px] text-[#d8a89a]">
              That doesn&apos;t look like an http(s) URL yet.
            </div>
          )}

          {production.propertyDetails && (
            <PropertySummary details={production.propertyDetails} />
          )}
        </section>

        {/* Photo dropzone */}
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
          }}
          className={[
            "rounded-2xl border-2 border-dashed bg-[var(--ink2)] p-5 sm:p-6 transition-colors",
            dragOver
              ? "border-[var(--brass)] bg-[rgba(184,155,114,0.06)]"
              : "border-[var(--line)]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--brass)]">
                02 · Photography
              </div>
              <h2 className="serif mt-1 text-[20px]">Upload the photos.</h2>
            </div>
            {files.length > 0 && (
              <span className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--brass)]">
                {files.length} {files.length === 1 ? "photo" : "photos"}
              </span>
            )}
          </div>

          <p className="mt-2 text-[12.5px] text-[var(--muted)]">
            Drag &amp; drop or browse — JPG, PNG, HEIC. Atelier picks the most
            cinematic shot to anchor each scene.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {files.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-[var(--line)] py-10 text-[var(--muted)] transition-colors hover:border-[var(--brass)] hover:text-[var(--bone)]"
            >
              <UploadIcon size={22} />
              <span className="text-[12px]">
                Drop photos here, or click to browse
              </span>
            </button>
          ) : (
            <div className="mt-5">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {files.map((f, i) => (
                  <Thumb
                    key={`${f.name}-${i}`}
                    src={urls[i]}
                    alt={f.name}
                    onRemove={() => removeFile(i)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--brass)] hover:text-[var(--bone)]"
                  aria-label="Add more photos"
                >
                  <UploadIcon size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="mt-3 text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] hover:text-[var(--bone)]"
              >
                Clear all
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Controls row */}
      <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--ink2)] p-5 sm:p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--brass)]">
          03 · Format
        </div>
        <h2 className="serif mt-1 text-[20px]">Pick the canvas.</h2>

        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-10">
          <div className="flex-1">
            <div className="mb-2 text-[10.5px] uppercase tracking-[0.25em] text-[var(--muted)]">
              Aspect ratio
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ASPECTS.map((a) => {
                const active = production.aspectRatio === a.value;
                return (
                  <button
                    key={a.value}
                    onClick={() => actions.setAspectRatio(a.value)}
                    className={[
                      "rounded-xl border px-3 py-3 text-left transition-all",
                      active
                        ? "border-[var(--brass)] bg-[rgba(184,155,114,0.10)]"
                        : "border-[var(--line)] hover:border-[var(--muted)]",
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    <div className="serif text-[18px]">{a.label}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                      {a.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-[10.5px] uppercase tracking-[0.25em] text-[var(--muted)]">
                Duration
              </span>
              <span className="serif text-[18px]">
                {targetSeconds}
                <span className="ml-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  sec
                </span>
              </span>
            </div>
            <input
              type="range"
              min={MIN_DURATION}
              max={MAX_DURATION}
              step={DURATION_STEP}
              value={targetSeconds}
              onChange={(e) => setTargetSeconds(Number(e.target.value))}
              className="w-full accent-[var(--brass)]"
              aria-label="Target duration in seconds"
            />
            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              <span>{MIN_DURATION}s</span>
              <span>{MAX_DURATION}s</span>
            </div>
          </div>
        </div>
      </section>

      {/* Brief */}
      <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--ink2)] p-5 sm:p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--brass)]">
          04 · The brief
        </div>
        <h2 className="serif mt-1 text-[20px]">One sentence is enough.</h2>
        <p className="mt-2 text-[12.5px] text-[var(--muted)]">
          A line of direction in the agent&apos;s voice. Atelier turns it into
          a storyboard — tone, cadence, shot intent.
        </p>
        <textarea
          value={production.brief}
          onChange={(e) => actions.setBrief(e.target.value)}
          rows={4}
          placeholder="A twilight reel that opens on the foyer, lingers on the chef's kitchen, then lifts to the terrace at golden hour."
          className="mt-4 w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--ink)] p-4 text-[13.5px] leading-relaxed text-[var(--bone)] placeholder:text-[var(--muted)] focus:border-[var(--brass)] focus:outline-none"
        />
      </section>

      {/* Plan CTA */}
      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[11.5px] uppercase tracking-[0.25em] text-[var(--muted)]">
          {planning
            ? "Planning production…"
            : files.length > 0
            ? `${files.length} photo${files.length === 1 ? "" : "s"} ready · ${production.aspectRatio} · ${targetSeconds}s`
            : "Atelier will auto-source visuals from the listing."}
        </div>
        <button
          onClick={handlePlan}
          disabled={!canPlan}
          className="primary-btn shadow-[0_12px_40px_-12px_rgba(184,155,114,0.55)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {planning ? (
            <span className="flex items-center gap-2">
              <SpinnerIcon size={14} /> Planning Production…
            </span>
          ) : (
            "Plan Production →"
          )}
        </button>
      </div>
    </div>
  );
}

function Thumb({
  src,
  alt,
  onRemove,
}: {
  src: string;
  alt: string;
  onRemove: () => void;
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--ink)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ink)]/80 text-[var(--bone)] opacity-0 transition-opacity group-hover:opacity-100"
        aria-label={`Remove ${alt}`}
      >
        <XIcon size={11} />
      </button>
    </div>
  );
}

function PropertySummary({ details }: { details: PropertyDetails }) {
  return (
    <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--ink)] p-4">
      <div className="serif text-[16px]">{details.title}</div>
      <div className="mt-1 text-[11.5px] uppercase tracking-[0.22em] text-[var(--brass)]">
        {details.specs}
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
        {details.description}
      </p>
      {details.features.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {details.features.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[12px] text-[var(--bone)]"
            >
              <span className="mt-1.5 h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--brass)]" />
              {f}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
