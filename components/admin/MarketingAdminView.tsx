"use client";

import React, { useState } from "react";
import {
  TrendingUpIcon,
  UsersIcon,
  MousePointerClickIcon,
  MessageSquareIcon,
  BarChart3Icon,
  ZapIcon,
  ShieldIcon,
  EyeIcon,
  CopyIcon,
  CheckIcon,
} from "../Icons";

export default function MarketingAdminView() {
  const [copied, setCopied] = useState<string | null>(null);

  const stats = [
    { label: "Total Views", value: "12,482", trend: "+12.4%", Icon: EyeIcon },
    { label: "Demo Signups", value: "184", trend: "+8.2%", Icon: UsersIcon },
    { label: "Conversion", value: "3.2%", trend: "+0.4%", Icon: TrendingUpIcon },
    { label: "Avg. Engagement", value: "2m 14s", trend: "-2.1%", Icon: MousePointerClickIcon },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const pitchDecks = [
    {
      title: "The Editorial Standard",
      desc: "Focused on architectural distinction and brand-aware rendering.",
      tag: "High Conversion",
    },
    {
      title: "Concierge Automation",
      desc: "Emphasizes time savings and high-touch client satisfaction.",
      tag: "Best for Teams",
    },
  ];

  return (
    <div className="p-6 md:p-12 lg:p-16 lg:pt-12 space-y-12">
      <div className="space-y-2">
        <div className="eyebrow">Admin Console</div>
        <h1 className="view-title">Marketing & Growth.</h1>
        <p className="text-[var(--muted)] max-w-2xl">
          Track the performance of the self-selling funnel and manage the 
          editorial pitch assets used across the platform.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--ink2)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-[rgba(184,155,114,0.1)] text-[var(--brass)]">
                <stat.Icon size={18} />
              </div>
              <span className={`text-[11px] font-medium ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <div className="text-[28px] serif">{stat.value}</div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pitch Decks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BarChart3Icon size={20} className="text-[var(--brass)]" />
            <h2 className="text-xl serif">Editorial Pitch Assets</h2>
          </div>
          <div className="space-y-4">
            {pitchDecks.map((deck) => (
              <div key={deck.title} className="group p-5 rounded-xl border border-[var(--line)] hover:border-[var(--brass)] transition-colors bg-[rgba(245,242,236,0.02)] flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium">{deck.title}</span>
                    <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-[var(--line)] rounded text-[var(--muted)]">
                      {deck.tag}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--muted)]">{deck.desc}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(`https://atelier.app/pitch/${deck.title.toLowerCase().replace(/ /g, '-')}`, deck.title)}
                  className="p-2 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--brass)] hover:border-[var(--brass)] transition-all"
                >
                  {copied === deck.title ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-3xl border border-[var(--line)] bg-[rgba(184,155,114,0.03)] space-y-6">
          <div className="flex items-center gap-3">
            <ZapIcon size={20} className="text-[var(--brass)]" />
            <h2 className="text-xl serif">Sales Funnel Logic</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-[var(--brass)] flex items-center justify-center text-[10px] text-[var(--ink)] font-bold">1</div>
                <div className="w-[1px] flex-1 bg-[var(--line)] my-1" />
              </div>
              <div className="pb-4">
                <div className="text-[13px] font-medium">Attention (Media Engine)</div>
                <div className="text-[11px] text-[var(--muted)]">Cinematic trailers generated for high-tier listings on social.</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-[var(--brass)] flex items-center justify-center text-[10px] text-[var(--ink)] font-bold">2</div>
                <div className="w-[1px] flex-1 bg-[var(--line)] my-1" />
              </div>
              <div className="pb-4">
                <div className="text-[13px] font-medium">Interest (Interactive Pitch)</div>
                <div className="text-[11px] text-[var(--muted)]">Prospects land on custom editorial pages showing their own brand palette.</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-[var(--brass)] flex items-center justify-center text-[10px] text-[var(--ink)] font-bold">3</div>
              </div>
              <div>
                <div className="text-[13px] font-medium">Desire (Agentic Outreach)</div>
                <div className="text-[11px] text-[var(--muted)]">The Prospecting Agent engages via personalized, zero-friction emails.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
