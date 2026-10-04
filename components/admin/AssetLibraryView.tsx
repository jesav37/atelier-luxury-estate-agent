"use client";

import React from "react";
import { PlayIcon, DownloadIcon, ImageIcon, FilmIcon } from "../Icons";

export default function AssetLibraryView() {
  const assets = [
    { id: 1, type: "video", title: "Atelier Cinematic Trailer", duration: "0:30", thumb: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" },
    { id: 2, type: "video", title: "The Agent Experience", duration: "0:45", thumb: "https://images.unsplash.com/photo-1600607687940-c52af096999c?auto=format&fit=crop&q=80&w=800" },
    { id: 3, type: "video", title: "Brand Engine Demo", duration: "1:00", thumb: "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&q=80&w=800" },
    { id: 4, type: "image", title: "Editorial Frame (Kitchen)", thumb: "https://images.unsplash.com/photo-1600585154526-990dcea4db0d?auto=format&fit=crop&q=80&w=800" },
    { id: 5, type: "image", title: "Atelier Logo Animation Still", thumb: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800" },
    { id: 6, type: "image", title: "Client Delivery Portal Mockup", thumb: "https://images.unsplash.com/photo-1600566753086-00f18fb6f3ea?auto=format&fit=crop&q=80&w=800" },
    { id: 7, type: "image", title: "Master Suite Detail", thumb: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=800" },
    { id: 8, type: "image", title: "Exterior Twilight Cinematic", thumb: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" },
    { id: 9, type: "image", title: "Agent Brand Palette Sample", thumb: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=800" },
    { id: 10, type: "image", title: "Modern Terrace Wide", thumb: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=800" },
  ];

  return (
    <div className="p-6 md:p-12 lg:p-16 lg:pt-12 space-y-12">
      <div className="space-y-2">
        <div className="eyebrow">Creative Assets</div>
        <h1 className="view-title">Premium Library.</h1>
        <p className="text-[var(--muted)] max-w-2xl">
          High-fidelity visual collateral to showcase Atelier’s production quality on social media and web.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="group relative rounded-2xl border border-[var(--line)] bg-[var(--ink2)] overflow-hidden transition-all hover:border-[var(--brass)]">
            <div className="aspect-[4/3] w-full relative">
              <img 
                src={asset.thumb} 
                alt={asset.title}
                className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] to-transparent opacity-60" />
              
              {asset.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-[var(--brass)]/90 flex items-center justify-center text-[var(--ink)] shadow-xl scale-90 group-hover:scale-100 transition-transform">
                    <PlayIcon size={20} />
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium line-clamp-1">{asset.title}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {asset.type === "video" ? <FilmIcon size={10} className="text-[var(--brass)]" /> : <ImageIcon size={10} className="text-[var(--brass)]" />}
                    <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
                      {asset.type === "video" ? `Video · ${asset.duration}` : "High-Res Image"}
                    </span>
                  </div>
                </div>
                <button className="h-8 w-8 rounded-full bg-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:bg-[var(--brass)] hover:text-[var(--ink)] transition-colors">
                  <DownloadIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
