"use client";

import React, { useMemo } from "react";
import { useProduction } from "@/lib/store";
import {
  DownloadIcon,
  FilmIcon,
  FileTextIcon,
  ShareIcon,
  CheckCircleIcon,
} from "@/components/Icons";
import { AssetItem } from "@/lib/types";

export default function PresentView() {
  const { state, actions } = useProduction();
  const { production } = state;
  const { assets, storyboard, propertyDetails, agent, brand } = production;

  const cutAsset = useMemo(() => assets.find((a) => a.kind === "cut" && a.payload.mime === "image/svg+xml"), [assets]);
  const captionAsset = useMemo(() => assets.find((a) => a.kind === "caption"), [assets]);
  const frameAssets = useMemo(() => assets.filter((a) => a.kind === "frame"), [assets]);

  const isReady = !!cutAsset;

  if (!storyboard) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--muted)]">
        <p>No production storyboard found.</p>
        <p className="text-xs">Complete a production to view the presentation.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header / Brand */}
      <div className="text-center space-y-4">
        <div className="inline-block px-3 py-1 border border-[var(--brass)] text-[10px] tracking-[0.2em] uppercase text-[var(--brass)] mb-4">
          Client Presentation
        </div>
        <h1 className="text-5xl font-serif text-[var(--bone)]">
          {propertyDetails?.title || storyboard.property}
        </h1>
        <p className="text-[var(--muted)] tracking-widest uppercase text-xs">
          Prepared by {agent?.name || "Atelier Agent"} · {agent?.brokerage || "Atelier Estates"}
        </p>
      </div>

      {/* Hero / Cut */}
      <div className="aspect-video bg-[var(--ink)] border border-[var(--brass)]/20 relative group overflow-hidden">
        {cutAsset ? (
          <div 
            className="w-full h-full p-8 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: cutAsset.payload.content }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-[var(--muted)]">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-[var(--brass)]" />
              <div className="w-2 h-2 rounded-full bg-[var(--brass)]" />
              <div className="w-2 h-2 rounded-full bg-[var(--brass)]" />
            </div>
            <p className="text-[10px] uppercase tracking-widest">Rendering Final Cut...</p>
          </div>
        )}
        
        {cutAsset && (
          <button 
            onClick={() => actions.downloadAsset(cutAsset)}
            className="absolute bottom-6 right-6 p-4 bg-[var(--ink)] border border-[var(--brass)]/40 text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[var(--ink)] transition-all shadow-2xl"
          >
            <DownloadIcon size={20} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left: Agent & Brand */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Consultant</h3>
            <div className="space-y-1">
              <p className="text-[var(--bone)] font-medium">{agent?.name}</p>
              <p className="text-[var(--muted)] text-xs">{agent?.title}</p>
              <p className="text-[var(--muted)] text-xs">{agent?.brokerage}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Brand Direction</h3>
            <div className="flex gap-2">
              {brand?.colors.map((c, i) => (
                <div 
                  key={i} 
                  className="w-6 h-6 rounded-full border border-white/10" 
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <p className="text-[var(--muted)] text-xs italic">&quot;{brand?.tone}&quot;</p>
          </div>
        </div>

        {/* Center: Storyboard Highlights */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Storyboard Highlights</h3>
            <div className="grid grid-cols-2 gap-4">
              {frameAssets.slice(0, 4).map((asset) => (
                <div key={asset.id} className="aspect-video bg-[var(--ink)] border border-white/5 p-2 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                   <div 
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: asset.payload.content }}
                  />
                </div>
              ))}
            </div>
          </div>

          {captionAsset && (
            <div className="space-y-4 p-6 bg-white/5 border border-white/5">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Social / MLS Copy</h3>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(captionAsset.payload.content);
                  }}
                  className="text-[10px] uppercase tracking-widest text-[var(--brass)] hover:text-[var(--bone)]"
                >
                  Copy Text
                </button>
              </div>
              <p className="text-[var(--muted)] text-sm leading-relaxed whitespace-pre-wrap font-serif italic">
                {captionAsset.payload.content}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3 text-[var(--muted)]">
          <CheckCircleIcon size={16} className="text-emerald-500" />
          <span className="text-xs tracking-widest uppercase">Production Verified & Ready</span>
        </div>
        
        <div className="flex gap-4">
          <button 
            disabled={!isReady}
            className="px-8 py-3 bg-[var(--brass)] text-[var(--ink)] text-xs tracking-[0.2em] uppercase font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale"
          >
            Share with Client
          </button>
          <button 
            onClick={() => actions.generateExtras()}
            className="px-8 py-3 border border-[var(--brass)] text-[var(--brass)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--brass)] hover:text-[var(--ink)] transition-all"
          >
            Regenerate Assets
          </button>
        </div>
      </div>
    </div>
  );
}
