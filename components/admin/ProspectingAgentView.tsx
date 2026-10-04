"use client";

import React, { useState } from "react";
import {
  UsersIcon,
  SearchIcon,
  MailIcon,
  CalendarIcon,
  PlayIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  MoreVerticalIcon,
  Loader2Icon,
} from "../Icons";

type Lead = {
  id: string;
  name: string;
  brokerage: string;
  status: "identifying" | "qualified" | "outreach" | "scheduled" | "rejected";
  matchScore: number;
  lastAction: string;
};

import { useProduction } from "@/lib/store";

export default function ProspectingAgentView() {
  const { actions } = useProduction();
  const [isRunning, setIsRunning] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "1",
      name: "Julian Sterling",
      brokerage: "Sterling Sotheby's",
      status: "qualified",
      matchScore: 98,
      lastAction: "Identified high-tier listing at 1200 Bel Air Rd.",
    },
    {
      id: "2",
      name: "Elena Rossi",
      brokerage: "The Agency",
      status: "outreach",
      matchScore: 94,
      lastAction: "Sent personalized cinematic teaser email.",
    },
    {
      id: "3",
      name: "Marcus Thorne",
      brokerage: "Douglas Elliman",
      status: "scheduled",
      matchScore: 89,
      lastAction: "Demo confirmed for Oct 12, 10:00 AM.",
    },
  ]);

  const toggleAgent = () => {
    const next = !isRunning;
    setIsRunning(next);
    actions.logEvent(next ? "outreach_sent" : "onboarded", {
      source: "simulated-agent",
      detail: next
        ? "Simulated agent activated on the sample pipeline"
        : "Simulated agent stopped",
    });
  };

  const statusColors = {
    identifying: "text-blue-400 bg-blue-400/10",
    qualified: "text-[var(--brass)] bg-[var(--brass)]/10",
    outreach: "text-purple-400 bg-purple-400/10",
    scheduled: "text-emerald-400 bg-emerald-400/10",
    rejected: "text-rose-400 bg-rose-400/10",
  };

  return (
    <div className="p-6 md:p-12 lg:p-16 lg:pt-12 space-y-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="eyebrow">Autonomous Agent</div>
          <h1 className="view-title">Prospecting Engine.</h1>
          <p className="text-[var(--muted)] max-w-2xl">
            The intended shape of the engine: identify listing agents with the right
            brand alignment, qualify them, then open outreach from the pitch pack.
          </p>
          <p className="text-[11px] text-[var(--brass)] max-w-2xl">
            Sample pipeline — the leads, scores and activity below are illustrative
            placeholders, not live data. No prospecting source is connected yet.
          </p>
        </div>
        <button
          onClick={toggleAgent}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all font-medium text-[13px] ${
            isRunning 
              ? "bg-[rgba(245,242,236,0.05)] text-[var(--bone)] border border-[var(--line)]" 
              : "bg-[var(--brass)] text-[var(--ink)]"
          }`}
        >
          {isRunning ? (
            <>
              <Loader2Icon size={16} className="animate-spin" />
              Agent Running...
            </>
          ) : (
            <>
              <PlayIcon size={16} />
              Activate Agent
            </>
          )}
        </button>
      </div>

      {/* Leads Table */}
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--ink2)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[rgba(245,242,236,0.02)]">
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-[var(--muted)] font-medium">Lead</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-[var(--muted)] font-medium">Status</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-[var(--muted)] font-medium text-center">Score</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-[var(--muted)] font-medium">Latest Activity</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {leads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-[rgba(245,242,236,0.01)] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[var(--bone)]">{lead.name}</span>
                      <span className="text-[11px] text-[var(--muted)]">{lead.brokerage}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="serif text-[18px] text-[var(--brass)]">{lead.matchScore}%</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[12px] text-[var(--muted)] max-w-xs">{lead.lastAction}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-[var(--muted)] hover:text-[var(--bone)] transition-colors">
                      <MoreVerticalIcon size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[var(--line)] bg-[rgba(245,242,236,0.01)]">
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>Showing 3 active autonomous engagements</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2Icon size={12} className="text-emerald-500" /> 18 Qualified
              </span>
              <span className="flex items-center gap-1.5">
                <AlertCircleIcon size={12} className="text-[var(--brass)]" /> 2 Overrides Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Logic Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-[var(--line)] bg-[rgba(184,155,114,0.02)] space-y-4">
          <SearchIcon size={20} className="text-[var(--brass)]" />
          <h3 className="text-[15px] font-medium">Discovery Scope</h3>
          <p className="text-[12px] text-[var(--muted)]">
            Monitoring Zillow Luxury, Mansion Global, and Sotheby’s listings over $10M in NY, LA, and Miami.
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-[var(--line)] bg-[rgba(184,155,114,0.02)] space-y-4">
          <MailIcon size={20} className="text-[var(--brass)]" />
          <h3 className="text-[15px] font-medium">Outreach Persona</h3>
          <p className="text-[12px] text-[var(--muted)]">
            &quot;Editorial Concierge&quot; — Tone is professional, observant, and respectful of high-value time.
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-[var(--line)] bg-[rgba(184,155,114,0.02)] space-y-4">
          <CalendarIcon size={20} className="text-[var(--brass)]" />
          <h3 className="text-[15px] font-medium">Engagement Goal</h3>
          <p className="text-[12px] text-[var(--muted)]">
            Schedule 15-minute &quot;Atelier Overview&quot; with listing coordinator or agent direct.
          </p>
        </div>
      </div>
    </div>
  );
}
