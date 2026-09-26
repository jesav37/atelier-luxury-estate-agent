"use client";

import React, { useState, useRef } from "react";

export default function App() {
  const [view, setView] = useState("composer");
  const [brief, setBrief] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isReadingListing, setIsReadingListing] = useState(false);
  const [scenes, setScenes] = useState<
    { n: number; name: string; time: string; script: string; shots: string[]; cost: number }[]
  >([]);
  const [property, setProperty] = useState("");
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  const [renderingScenes, setRenderingScenes] = useState<Record<number, string>>({});
  const [scheduled, setScheduled] = useState(false);
  const [brandRead, setBrandRead] = useState(false);
  const [brandReading, setBrandReading] = useState(false);
  const [brandUrl, setBrandUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: "composer", label: "Compose", icon: "✦" },
    { id: "board", label: "Greenlight Board", icon: "▤" },
    { id: "flow", label: "Flow", icon: "◈" },
    { id: "assets", label: "Assets", icon: "▣" },
    { id: "brand", label: "Brand Kit", icon: "◉" },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedPhotos(Array.from(e.target.files));
    }
  };

  const handleReadListing = async () => {
    if (!listingUrl.trim()) return;
    setIsReadingListing(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        body: JSON.stringify({ url: listingUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setProperty(data.details.title);
        setPropertyDetails(data.details);
        setBrief(
          `A cinematic tour of ${data.details.title}. Focus on the ${data.details.features
            .slice(0, 3)
            .join(", ")}.`
        );
      }
    } catch (err) {
      console.error("Scrape error:", err);
    } finally {
      setIsReadingListing(false);
    }
  };

  const handleGreenlight = async (scene: any) => {
    setRenderingScenes((prev) => ({ ...prev, [scene.n]: "rendering" }));
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        body: JSON.stringify({ scene }),
      });
      const data = await res.json();
      setRenderingScenes((prev) => ({ ...prev, [scene.n]: "done" }));
    } catch (err) {
      console.error(err);
      setRenderingScenes((prev) => ({ ...prev, [scene.n]: "error" }));
    }
  };

  const handlePlan = async () => {
    if (!listingUrl.trim() && uploadedPhotos.length === 0 && !brief.trim()) return;
    setIsPlanning(true);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        body: JSON.stringify({
          brief,
          listingUrl,
          propertyDetails,
          photoCount: uploadedPhotos.length,
        }),
      });
      const data = await res.json();
      setScenes(data.storyboard.scenes);
      setProperty(data.storyboard.property);
      setView("board");
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleBrandRead = () => {
    if (!brandUrl.trim()) return;
    setBrandReading(true);
    setTimeout(() => {
      setBrandReading(false);
      setBrandRead(true);
    }, 1800);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-[#f5f2ec] font-light">
      {/* Sidebar */}
      <aside className="w-[236px] flex-shrink-0 border-r border-[rgba(245,242,236,0.08)] p-7 flex flex-col bg-[#141414]">
        <div className="mb-9">
          <div className="w-[38px] height-[38px] border border-[#b89b72] flex items-center justify-center font-serif text-[22px] text-[#b89b72] rounded-full mb-2.5">
            A
          </div>
          <div className="font-serif text-[20px] tracking-[0.35em]">ATELIER</div>
          <div className="text-[9px] tracking-[0.3em] text-[#8a857c] mt-0.5">
            LUXURY VIDEO AGENT
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] tracking-[0.06em] transition-colors text-left ${
                view === item.id
                  ? "text-[#f5f2ec] bg-[rgba(184,155,114,0.1)]"
                  : "text-[#8a857c] hover:text-[#f5f2ec]"
              }`}
            >
              <span className="text-[#b89b72] w-4 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-2 text-[12px] text-[#8a857c] px-3 py-2.5 border border-[rgba(245,242,236,0.08)] rounded-[20px] mb-4">
            <div className="w-[7px] h-[7px] rounded-full bg-[#b89b72]" />
            1,240 credits
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[rgba(245,242,236,0.03)]">
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#b89b72] to-[#6b5a3f] flex items-center justify-center text-[12px] text-[#0a0a0a] font-semibold">
              MK
            </div>
            <div>
              <div className="text-[13px]">Maya Kessler</div>
              <div className="text-[11px] text-[#8a857c]">Listing Agent</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 px-14 overflow-y-auto max-h-screen">
        {view === "composer" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="eyebrow">NEW PRODUCTION</div>
            <h1 className="view-title">Create your cinematic tour</h1>
            <p className="view-sub">
              Provide your property assets and the agent will plan the production.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Photo Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#141414] border-2 border-dashed border-[rgba(245,242,236,0.08)] rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#b89b72] transition-all group"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
                <div className="text-[#b89b72] text-4xl mb-4 group-hover:scale-110 transition-transform">
                  ＋
                </div>
                <div className="font-serif text-xl mb-2">Upload property photography</div>
                <div className="text-[#8a857c] text-sm">Drop files here or click to browse</div>
                {uploadedPhotos.length > 0 && (
                  <div className="mt-4 text-[#b89b72] text-sm font-semibold">
                    {uploadedPhotos.length} photos selected
                  </div>
                )}
              </div>

              {/* Listing Link */}
              <div className="bg-[#141414] border border-[rgba(245,242,236,0.08)] rounded-2xl p-8 flex flex-col">
                <div className="font-serif text-xl mb-4">Add listing link</div>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={listingUrl}
                    onChange={(e) => setListingUrl(e.target.value)}
                    placeholder="Paste MLS or property URL..."
                    className="flex-1 bg-transparent border-b border-[rgba(245,242,236,0.2)] text-[#f5f2ec] py-2 outline-none focus:border-[#b89b72] transition-colors"
                  />
                  <button
                    onClick={handleReadListing}
                    disabled={isReadingListing || !listingUrl}
                    className="bg-[rgba(184,155,114,0.1)] text-[#b89b72] px-4 py-2 rounded-lg text-sm hover:bg-[rgba(184,155,114,0.2)] transition-colors disabled:opacity-50"
                  >
                    {isReadingListing ? "Reading..." : "Read"}
                  </button>
                </div>
                <div className="text-[#8a857c] text-xs leading-relaxed">
                  The agent will extract property details, features, and high-res imagery directly
                  from the link.
                </div>
                {property && (
                  <div className="mt-auto pt-4 border-t border-[rgba(245,242,236,0.08)]">
                    <div className="text-[#b89b72] text-xs tracking-widest uppercase mb-1">
                      Detected Property
                    </div>
                    <div className="font-serif text-lg">{property}</div>
                    {propertyDetails && (
                      <div className="text-[#8a857c] text-xs mt-1">
                        {propertyDetails.price} · {propertyDetails.specs}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Creative Direction */}
            <div className="bg-[#141414] border border-[rgba(245,242,236,0.08)] rounded-2xl p-6 transition-colors focus-within:border-[#b89b72]">
              <div className="text-[#8a857c] text-xs tracking-widest uppercase mb-3">
                Creative Direction (Optional)
              </div>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="e.g. “Focus on the ocean views and the chef's kitchen. Use a calm, sophisticated tone.”"
                className="w-full bg-transparent border-none text-[#f5f2ec] font-serif text-xl leading-relaxed resize-none min-h-[80px] outline-none placeholder:text-[#8a857c]"
              />
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handlePlan}
                disabled={isPlanning || (!listingUrl && uploadedPhotos.length === 0 && !brief)}
                className="bg-[#b89b72] text-[#0a0a0a] font-semibold text-sm px-8 py-4 rounded-full hover:bg-[#d8c3a0] transition-all disabled:opacity-50 shadow-lg shadow-[rgba(184,155,114,0.2)]"
              >
                {isPlanning ? "Planning Production..." : "Plan Production →"}
              </button>
            </div>

            {isPlanning && (
              <div className="mt-12 p-6 border border-[rgba(245,242,236,0.08)] rounded-xl bg-[#141414] animate-in fade-in duration-300">
                <div className="text-[10px] tracking-[0.3em] text-[#b89b72] mb-4">THE CREW</div>
                <div className="flex gap-3 flex-wrap">
                  {[
                    "Scriptwriter",
                    "Character Lead",
                    "Voice",
                    "Editor",
                    "Image Gen",
                    "Video Gen",
                  ].map((member, i) => (
                    <span
                      key={member}
                      className={`text-[12px] px-4 py-2 rounded-full border border-[rgba(245,242,236,0.08)] ${
                        i < 3
                          ? "text-[#f5f2ec] border-[#b89b72] bg-[rgba(184,155,114,0.08)]"
                          : "text-[#8a857c]"
                      }`}
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === "board" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="eyebrow">STORYBOARD · {property || "PALM BEACH ESTATE"}</div>
            <h1 className="view-title">Greenlight Board</h1>
            <p className="view-sub">
              Every scene, its script and its timing. Nothing renders until you say so. The cost is
              on the button.
            </p>

            <div className="flex gap-3 mt-5 mb-7">
              <button className="ghost-btn">Auto-run all</button>
              <button
                onClick={() => scenes.forEach((s) => handleGreenlight(s))}
                className="primary-btn"
              >
                Greenlight all · {scenes.reduce((acc, s) => acc + s.cost, 0)} cr
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {scenes.map((s) => (
                <div
                  key={s.n}
                  className="bg-[#141414] border border-[rgba(245,242,236,0.08)] rounded-2xl p-6 hover:border-[rgba(184,155,114,0.4)] transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="font-serif text-3xl text-[#b89b72]">
                      {String(s.n).padStart(2, "0")}
                    </div>
                    <div className="font-serif text-2xl">{s.name}</div>
                    <div className="text-sm text-[#8a857c] ml-auto">{s.time}</div>
                  </div>
                  <div className="font-serif italic text-lg text-[#ede8df] mb-6 leading-relaxed">
                    “{s.script}”
                  </div>
                  <div className="flex gap-3 mb-6">
                    {s.shots.map((sh, i) => (
                      <div
                        key={sh}
                        className={`flex-1 h-[80px] rounded-xl bg-gradient-to-br from-[#1c1c1c] to-[#2a2a2a] border border-[rgba(245,242,236,0.08)] flex items-end p-3 text-[10px] text-[#8a857c] tracking-wider ${
                          i === 0 ? "border-[rgba(184,155,114,0.5)]" : ""
                        }`}
                      >
                        {sh}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-[#8a857c]">
                      Cost <b className="text-[#b89b72] font-semibold">{s.cost} cr</b>
                    </div>
                    <button
                      onClick={() => handleGreenlight(s)}
                      disabled={
                        renderingScenes[s.n] === "rendering" || renderingScenes[s.n] === "done"
                      }
                      className={`ml-auto font-semibold text-xs px-6 py-3 rounded-full transition-colors ${
                        renderingScenes[s.n] === "done"
                          ? "bg-[rgba(184,155,114,0.15)] text-[#b89b72] border border-[#b89b72]"
                          : renderingScenes[s.n] === "rendering"
                          ? "bg-[#141414] text-[#8a857c] border border-[rgba(245,242,236,0.08)] cursor-wait"
                          : "bg-[#b89b72] text-[#0a0a0a] hover:bg-[#d8c3a0]"
                      }`}
                    >
                      {renderingScenes[s.n] === "done"
                        ? "✓ Approved"
                        : renderingScenes[s.n] === "rendering"
                        ? "Rendering..."
                        : `Greenlight · ${s.cost} cr`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "flow" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="eyebrow">PRODUCTION MAP</div>
            <h1 className="view-title">Flow</h1>
            <p className="view-sub">
              The whole production as a map. Zoom out to see the shape of the video; zoom in to fix one beat.
            </p>
            <div className="flex flex-col gap-0 relative">
              {[
                { name: property || "Palm Beach Estate", meta: "Listing · $12.4M · 6 bed / 8 bath", state: "done" },
                { name: "Script & Storyboard", meta: "6 scenes · 60s · 9:16", state: "done" },
                { name: "Voiceover — Maya (twin)", meta: "English · warm, calm", state: "done" },
                { name: "Scene 1 · Aerial Establishing", meta: "8 cr · video", state: "rendering" },
                { name: "Scene 2 · The Great Room", meta: "9 cr · video", state: "planned" },
                { name: "Scene 3 · Chef's Kitchen", meta: "9 cr · video", state: "planned" },
                { name: "Scene 4 · Primary Suite", meta: "9 cr · video", state: "planned" },
                { name: "Scene 5 · Outdoor Living", meta: "9 cr · video", state: "planned" },
                { name: "Scene 6 · Closing Card", meta: "4 cr · brand", state: "planned" },
                { name: "Assemble · Final Cut", meta: "9:16 · captions · music", state: "planned" },
              ].map((n, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5.5 py-4.5 border border-[rgba(245,242,236,0.08)] rounded-xl bg-[#141414] mb-3.5 relative"
                >
                  {i > 0 && (
                    <div className="absolute left-[26px] -top-[14px] w-px h-[14px] bg-[rgba(245,242,236,0.08)]" />
                  )}
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      n.state === "done"
                        ? "bg-[#b89b72]"
                        : n.state === "rendering"
                        ? "bg-[#d8c3a0] animate-pulse"
                        : "bg-[#8a857c]"
                    }`}
                  />
                  <div>
                    <div className="font-serif text-lg">{n.name}</div>
                    <div className="text-xs text-[#8a857c]">{n.meta}</div>
                  </div>
                  <div
                    className={`ml-auto text-[11px] tracking-[0.1em] uppercase ${
                      n.state === "done" ? "text-[#b89b72]" : "text-[#8a857c]"
                    }`}
                  >
                    {n.state}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "assets" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="eyebrow">PROJECT ASSETS</div>
            <h1 className="view-title">Assets</h1>
            <p className="view-sub">
              Everything the project made, one tab away. Reusable in your next brief.
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {[
                { name: "Palm Beach Estate — Final Cut", meta: "0:60 · 9:16 · 4K", icon: "▶" },
                { name: "Storyboard Sheet 1", meta: "4 shots · aerial", icon: "▤" },
                { name: "Storyboard Sheet 2", meta: "4 shots · interior", icon: "▤" },
                { name: "Twilight Exterior Render", meta: "still · 4K", icon: "◈" },
                { name: "Maya (twin) — Intro", meta: "voice · 0:12", icon: "♪" },
                { name: "Music — 'Ember'", meta: "score · 0:60", icon: "♫" },
              ].map((a, i) => (
                <div
                  key={i}
                  className="bg-[#141414] border border-[rgba(245,242,236,0.08)] rounded-xl overflow-hidden hover:border-[rgba(184,155,114,0.4)] transition-colors"
                >
                  <div className="h-[130px] bg-gradient-to-br from-[#1c1c1c] to-[#2e2a24] flex items-center justify-center font-serif text-[30px] text-[#b89b72]">
                    {a.icon}
                  </div>
                  <div className="p-3.5">
                    <div className="text-[13px]">{a.name}</div>
                    <div className="text-[11px] text-[#8a857c] mt-0.5">{a.meta}</div>
                    <div className="inline-block mt-2.5 text-[11px] text-[#b89b72] cursor-pointer tracking-wider">
                      Download ↓
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "brand" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="eyebrow">BRAND KIT</div>
            <h1 className="view-title">Your brand, everywhere</h1>
            <p className="view-sub">
              Read your website once. Every video after it is on brand — logo, colours, fonts, voice.
            </p>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={brandUrl}
                onChange={(e) => setBrandUrl(e.target.value)}
                placeholder="Paste your brokerage website…"
                className="flex-1 bg-[#141414] border border-[rgba(245,242,236,0.08)] rounded-[24px] px-5 py-3.5 text-[#f5f2ec] text-sm outline-none focus:border-[#b89b72] transition-colors"
              />
              <button
                onClick={handleBrandRead}
                disabled={brandReading || !brandUrl}
                className="bg-[#b89b72] text-[#0a0a0a] font-semibold text-sm px-6 py-3 rounded-[24px] hover:bg-[#d8c3a0] transition-colors disabled:opacity-50"
              >
                {brandReading ? "Reading..." : "Read my site"}
              </button>
            </div>

            {brandRead && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5 mb-7 animate-in fade-in duration-300">
                {["LOGO", "COLOURS", "FONTS", "VOICE", "TAGLINE", "PRODUCTS"].map((f) => (
                  <div
                    key={f}
                    className="text-xs tracking-[0.12em] border border-[rgba(245,242,236,0.08)] px-4 py-3 rounded-xl bg-[#141414]"
                  >
                    <span className="text-[#b89b72] mr-2">✓</span>
                    {f}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex-1 bg-[#f5f2ec] text-[#0a0a0a] rounded-2xl p-7 min-h-[180px]">
                <div className="font-serif text-[22px] tracking-[0.2em] mb-5">LUMEN SLEEP</div>
                <div className="font-serif text-[34px] mb-2">
                  Aa <span className="font-sans text-xs text-[#8a857c]">Fraunces</span>
                </div>
                <div className="text-[11px] tracking-[0.15em] text-[#8a857c] mb-4">TONE: CALM</div>
                <div className="flex gap-2">
                  <span className="w-[26px] h-[26px] rounded-full border border-black/10" style={{ background: "#0A0A0A" }} />
                  <span className="w-[26px] h-[26px] rounded-full border border-black/10" style={{ background: "#B89B72" }} />
                  <span className="w-[26px] h-[26px] rounded-full border border-black/10" style={{ background: "#F5F2EC" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
