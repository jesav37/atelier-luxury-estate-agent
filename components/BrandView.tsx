"use client";

import React, { useState } from "react";
import { useProduction } from "@/lib/store";
import { BrandIcon, CheckIcon, SpinnerIcon, XIcon } from "./Icons";

function isLikelyUrl(s: string): boolean {
  return /^https?:\/\/.+\..+/i.test(s.trim());
}

export default function BrandView() {
  const { state, actions } = useProduction();
  const { production, readingBrand, lastError } = state;
  const brand = production.brand;

  const [url, setUrl] = useState(brand?.url ?? "");
  const [touched, setTouched] = useState(false);
  const urlValid = !url.trim() || isLikelyUrl(url);

  const handleRead = async () => {
    if (!urlValid || !url.trim()) {
      setTouched(true);
      return;
    }
    await actions.readBrand(url.trim());
  };

  return (
    <div className="p-6 md:p-12 lg:p-16 lg:pt-12">
      <div className="eyebrow">Brand Kit</div>
      <h1 className="view-title">The brokerage identity.</h1>
      <p className="view-sub">
        Atelier reads a brokerage site, recovers its palette, typography and
        tone, then applies them across every frame.
      </p>

      {lastError && !readingBrand && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-[#a8543a]/40 bg-[rgba(168,84,58,0.08)] px-4 py-3 text-[12.5px] text-[#e7c0b3]">
          <XIcon size={14} className="mt-0.5 shrink-0" />
          <span>{lastError}</span>
        </div>
      )}

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--ink2)] p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--brass)]">
              Read my site
            </div>
            <h2 className="serif mt-1 text-[20px]">Recover the brand.</h2>
          </div>
          {brand && (
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--brass)]/40 bg-[rgba(184,155,114,0.10)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--brass)]">
              <CheckIcon size={11} /> Saved
            </span>
          )}
        </div>
        <p className="mt-2 text-[12.5px] text-[var(--muted)]">
          Drop in the brokerage homepage. Atelier pulls fonts, colours, and a
          sentence on the voice.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="https://compass.com"
            className="flex-1 rounded-full border border-[var(--line)] bg-[var(--ink)] px-4 py-3 text-[13px] text-[var(--bone)] placeholder:text-[var(--muted)] focus:border-[var(--brass)] focus:outline-none"
          />
          <button
            onClick={handleRead}
            disabled={!url.trim() || !urlValid || readingBrand}
            className="primary-btn shrink-0 disabled:opacity-40"
          >
            {readingBrand ? (
              <span className="flex items-center gap-2">
                <SpinnerIcon size={14} /> Reading
              </span>
            ) : (
              "Read"
            )}
          </button>
        </div>
        {touched && !urlValid && (
          <div className="mt-2 text-[11px] text-[#d8a89a]">
            That doesn&apos;t look like an http(s) URL yet.
          </div>
        )}
      </section>

      {brand ? (
        <BrandDisplay brand={brand} />
      ) : (
        <section className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-[var(--line)] px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] text-[var(--brass)]">
            <BrandIcon size={20} />
          </div>
          <h3 className="serif mt-4 text-[18px]">No brand yet.</h3>
          <p className="mt-1 max-w-md text-[12.5px] text-[var(--muted)]">
            Atelier will use a neutral editorial palette by default. Read a
            brokerage site to set the colours, type and tone.
          </p>
        </section>
      )}
    </div>
  );
}

function BrandDisplay({ brand }: { brand: NonNullable<ReturnType<typeof useProduction>["state"]["production"]["brand"]> }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
      {/* Preview card */}
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--ink2)] p-6 lg:col-span-3">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--brass)]">
          Preview
        </div>
        <h3 className="serif mt-1 text-[24px] leading-tight">{brand.name}</h3>
        {brand.tagline && (
          <p className="serif mt-1 text-[15px] italic text-[var(--muted)]">
            {brand.tagline}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-end gap-4">
          {brand.colors.slice(0, 5).map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="h-14 w-14 rounded-full border border-[var(--line)]"
                style={{ background: c }}
                aria-label={`Color ${c}`}
              />
              <span className="mt-1.5 font-mono text-[10px] text-[var(--muted)]">
                {c}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-7 rounded-xl border border-[var(--line)] bg-[var(--ink)] p-5">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
            Voice
          </div>
          <p className="serif mt-1 text-[16px] leading-relaxed">
            {brand.tone}
          </p>
        </div>
      </section>

      {/* Details */}
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--ink2)] p-6 lg:col-span-2">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--brass)]">
          Details
        </div>
        <h3 className="serif mt-1 text-[18px]">Recovered from</h3>
        <a
          href={brand.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-all text-[12.5px] text-[var(--brass)] underline-offset-2 hover:underline"
        >
          {brand.url}
        </a>

        <div className="mt-5 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Type
            </div>
            <ul className="mt-1.5 space-y-1">
              {brand.fonts.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-[12.5px]"
                >
                  <span className="serif text-[16px]">{f}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    {i === 0 ? "display" : i === 1 ? "body" : "accent"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Palette
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {brand.colors.map((c, i) => (
                <span
                  key={i}
                  className="rounded-full border border-[var(--line)] px-2.5 py-1 font-mono text-[10px] text-[var(--muted)]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Source
            </div>
            <div className="mt-1 text-[12.5px] text-[var(--bone)]">
              {brand.source === "live" ? "Recovered from live page" : "Recovered (fixture fallback)"}
            </div>
            {brand.warning && (
              <div className="mt-1 text-[11px] text-[#d8a89a]">
                {brand.warning}
              </div>
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Read at
            </div>
            <div className="mt-1 text-[12px] text-[var(--bone)]">
              {new Date(brand.readAt).toLocaleString()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
