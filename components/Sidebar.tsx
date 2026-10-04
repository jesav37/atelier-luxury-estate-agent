"use client";

import React from "react";
import { useProduction } from "@/lib/store";
import { STARTING_CREDITS } from "@/lib/pricing";
import {
  AssetsIcon,
  BoardIcon,
  BrandIcon,
  ComposeIcon,
  FlowIcon,
  Logo,
  PresentIcon,
} from "./Icons";

export type ViewKey = "compose" | "board" | "flow" | "assets" | "brand" | "present";

export const VIEWS: {
  key: ViewKey;
  label: string;
  hint: string;
  Icon: React.FC<{ className?: string; size?: number }>;
}[] = [
  { key: "compose", label: "Compose", hint: "Author the brief", Icon: ComposeIcon },
  { key: "board", label: "Greenlight", hint: "Approve each scene", Icon: BoardIcon },
  { key: "flow", label: "Flow", hint: "Pipeline status", Icon: FlowIcon },
  { key: "assets", label: "Assets", hint: "Rendered artefacts", Icon: AssetsIcon },
  { key: "brand", label: "Brand Kit", hint: "Brokerage identity", Icon: BrandIcon },
  { key: "present", label: "Present", hint: "Client delivery", Icon: PresentIcon },
];

interface SidebarProps {
  view: ViewKey;
  onChangeView(view: ViewKey): void;
}

export default function Sidebar({ view, onChangeView }: SidebarProps) {
  const { state, actions } = useProduction();
  const remaining = actions.remainingCredits();
  const storyboarded = !!state.production.storyboard;
  const assetCount = state.production.assets.length;

  const badgeFor: Record<ViewKey, string | null> = {
    compose: null,
    board: storyboarded ? String(state.production.storyboard!.scenes.length) : null,
    flow: storyboarded ? "live" : null,
    assets: assetCount > 0 ? String(assetCount) : null,
    brand: state.production.brand ? "saved" : null,
    present: state.production.assets.some(a => a.kind === "cut") ? "ready" : null,
  };

  const desktopNav = (
    <nav className="flex flex-col gap-1">
      {VIEWS.map(({ key, label, hint, Icon }) => {
        const active = view === key;
        const badge = badgeFor[key];
        return (
          <button
            key={key}
            onClick={() => onChangeView(key)}
            className={[
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
              active
                ? "bg-[rgba(184,155,114,0.10)] text-[var(--bone)]"
                : "text-[var(--muted)] hover:text-[var(--bone)] hover:bg-[rgba(245,242,236,0.04)]",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            <span
              className={[
                "flex h-8 w-8 items-center justify-center rounded-lg border",
                active
                  ? "border-[var(--brass)] text-[var(--brass)]"
                  : "border-[var(--line)] text-[var(--muted)] group-hover:text-[var(--bone)]",
              ].join(" ")}
            >
              <Icon size={15} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className={[
                  "text-[13px] tracking-wide",
                  active ? "text-[var(--bone)]" : "",
                ].join(" ")}
              >
                {label}
              </span>
              <span className="text-[10.5px] uppercase tracking-[0.18em] text-[var(--muted)]">
                {hint}
              </span>
            </span>
            {badge && (
              <span className="rounded-full border border-[var(--line)] px-2 py-[1px] text-[10px] tracking-wider text-[var(--brass)]">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex sticky top-0 h-screen w-[248px] flex-shrink-0 flex-col border-r border-[var(--line)] bg-[var(--ink)] px-5 py-6">
        <div className="mb-8 flex items-center gap-3">
          <Logo size={34} />
          <div className="flex flex-col leading-none">
            <span className="serif text-[22px] tracking-[0.04em]">Atelier</span>
            <span className="mt-1 text-[9.5px] uppercase tracking-[0.32em] text-[var(--muted)]">
              Estate Video Agent
            </span>
          </div>
        </div>

        {desktopNav}

        <div className="mt-auto pt-6">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--ink2)] p-4">
            <div className="text-[9.5px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Credits
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="serif text-[28px] leading-none">
                {remaining.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                / {STARTING_CREDITS.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="h-full rounded-full bg-[var(--brass)] transition-all"
                style={{ width: `${(remaining / STARTING_CREDITS) * 100}%` }}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10.5px] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brass)]" />
              {state.production.propertyDetails ? "Listing recovered" : "Awaiting listing"}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-full border border-[var(--line)] py-2 pl-2 pr-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brass)] text-[11px] font-semibold text-[var(--ink)]">
              JK
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[12px]">Jordan Kade</span>
              <span className="text-[9.5px] uppercase tracking-[0.25em] text-[var(--muted)]">
                Listing Agent
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--ink)]/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Logo size={28} />
          <div className="flex flex-1 flex-col leading-none">
            <span className="serif text-[18px] tracking-[0.04em]">Atelier</span>
            <span className="mt-0.5 text-[8.5px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Estate Video Agent
            </span>
          </div>
          <div className="flex flex-col items-end leading-tight">
            <span className="serif text-[16px]">{remaining.toLocaleString()}</span>
            <span className="text-[8.5px] uppercase tracking-[0.22em] text-[var(--muted)]">
              credits
            </span>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {VIEWS.map(({ key, label, Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                onClick={() => onChangeView(key)}
                className={[
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-all",
                  active
                    ? "border-[var(--brass)] bg-[rgba(184,155,114,0.10)] text-[var(--bone)]"
                    : "border-[var(--line)] text-[var(--muted)]",
                ].join(" ")}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
}
