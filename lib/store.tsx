"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  api,
  downloadAsset as downloadAssetApi,
  emptyProduction,
  POLL_INTERVAL_MS,
  PRODUCTION_STORAGE_KEY,
} from "./api";
import type {
  AgentProfile,
  AssetItem,
  AspectRatio,
  BrandKit,
  MarketingEvent,
  MarketingEventType,
  MarketingSource,
  Production,
  PropertyDetails,
  Scene,
} from "./types";
import { MAX_MARKETING_EVENTS } from "./marketing";
import { STARTING_CREDITS } from "./pricing";
import { composeFinalCut, makeFrame } from "./frames";
import { generateCaption, generateListingSheet } from "./captions";

/** Transient (in-memory) state that lives alongside the persisted production. */
export interface ProductionState {
  production: Production;
  hydrated: boolean;
  readingListing: boolean;
  planning: boolean;
  readingBrand: boolean;
  lastError: string | null;
  /** Per-scene live progress, 0-100, only meaningful while rendering/queued. */
  sceneProgress: Record<number, number>;
}

export interface PlanArgs {
  brief: string;
  listingUrl: string;
  photoCount: number;
  aspectRatio: AspectRatio;
  targetSeconds: number;
  propertyDetails?: PropertyDetails;
}

export interface ProductionActions {
  setBrief(brief: string): void;
  setListingUrl(url: string): void;
  setPhotoNames(names: string[]): void;
  setAspectRatio(ratio: AspectRatio): void;
  setAgent(patch: Partial<AgentProfile>): void;
  setBrand(patch: Partial<BrandKit>): void;
  scrapeListing(url: string): Promise<boolean>;
  readBrand(url: string): Promise<boolean>;
  plan(args: PlanArgs): Promise<boolean>;
  greenlight(sceneN: number): Promise<void>;
  greenlightAll(): Promise<void>;
  generateExtras(): void;
  downloadAsset(asset: AssetItem): void;
  /** Record a funnel event in the local marketing ledger. */
  logEvent(type: MarketingEventType, opts?: { source?: MarketingSource; detail?: string }): void;
  /** Wipe the local marketing ledger. */
  clearEvents(): void;
  reset(): void;
  remainingCredits(): number;
}

interface CtxValue {
  state: ProductionState;
  actions: ProductionActions;
}

const Ctx = createContext<CtxValue | null>(null);

/** Read the persisted production from localStorage, defensively. */
function loadFromStorage(): Production {
  if (typeof window === "undefined") return emptyProduction();
  try {
    const raw = window.localStorage.getItem(PRODUCTION_STORAGE_KEY);
    if (!raw) return emptyProduction();
    const parsed = JSON.parse(raw) as Production;
    if (!parsed || typeof parsed !== "object" || !parsed.id) {
      return emptyProduction();
    }
    // Reset any in-flight scenes — the poller is gone after a reload.
    let storyboard = parsed.storyboard;
    if (storyboard) {
      const scenes = storyboard.scenes.map((s) => {
        if (s.status === "rendering" || s.status === "queued") {
          return { ...s, status: "planned" as const, jobId: undefined };
        }
        return s;
      });
      storyboard = { ...storyboard, scenes };
    }
    return {
      ...emptyProduction(),
      ...parsed,
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      photoNames: Array.isArray(parsed.photoNames) ? parsed.photoNames : [],
      storyboard,
    };
  } catch {
    return emptyProduction();
  }
}

function saveToStorage(p: Production) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRODUCTION_STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function ProductionProvider({ children }: { children: React.ReactNode }) {
  // Start with an empty production on both server and client to avoid hydration
  // mismatches; the real persisted state loads in the effect below.
  const [production, setProduction] = useState<Production>(() => emptyProduction());
  const [hydrated, setHydrated] = useState(false);
  const [readingListing, setReadingListing] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [readingBrand, setReadingBrand] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const pollers = useRef<Map<string, number>>(new Map());

  // Hydrate from localStorage exactly once.
  useEffect(() => {
    setProduction(loadFromStorage());
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(production);
  }, [production, hydrated]);

  // Cancel any in-flight pollers on unmount.
  useEffect(() => {
    const map = pollers.current;
    return () => {
      map.forEach((handle) => window.clearTimeout(handle));
      map.clear();
    };
  }, []);

  const update = useCallback(
    (updater: (p: Production) => Production) => setProduction((prev) => updater(prev)),
    []
  );

  const setBrief = useCallback(
    (brief: string) => update((p) => ({ ...p, brief })),
    [update]
  );
  const setListingUrl = useCallback(
    (listingUrl: string) => update((p) => ({ ...p, listingUrl })),
    [update]
  );
  const setPhotoNames = useCallback(
    (names: string[]) => update((p) => ({ ...p, photoNames: names })),
    [update]
  );
  const setAspectRatio = useCallback(
    (aspectRatio: AspectRatio) => update((p) => ({ ...p, aspectRatio })),
    [update]
  );

  const setAgent = useCallback(
    (agent: Partial<AgentProfile>) =>
      update((p) => ({
        ...p,
        agent: { ...(p.agent || ({} as AgentProfile)), ...agent },
      })),
    [update]
  );

  const setBrand = useCallback(
    (brand: Partial<BrandKit>) =>
      update((p) => ({
        ...p,
        brand: { ...(p.brand || ({} as BrandKit)), ...brand },
      })),
    [update]
  );

  const logEvent = useCallback(
    (type: MarketingEventType, opts?: { source?: MarketingSource; detail?: string }) => {
      const event: MarketingEvent = {
        id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        type,
        at: Date.now(),
        source: opts?.source ?? "operator",
        detail: opts?.detail,
      };
      update((p) => ({
        ...p,
        marketing: {
          events: [event, ...(p.marketing?.events ?? [])].slice(0, MAX_MARKETING_EVENTS),
        },
      }));
    },
    [update]
  );

  const clearEvents = useCallback(
    () => update((p) => ({ ...p, marketing: { events: [] } })),
    [update]
  );

  const scrapeListing = useCallback(
    async (url: string): Promise<boolean> => {
      setLastError(null);
      setReadingListing(true);
      try {
        const res = await api.scrape({ url });
        if (res.success) {
          update((p) => ({ ...p, listingUrl: url, propertyDetails: res.details }));
          return true;
        }
        setLastError(res.error);
        return false;
      } catch (e) {
        setLastError(e instanceof Error ? e.message : "Failed to read listing");
        return false;
      } finally {
        setReadingListing(false);
      }
    },
    [update]
  );

  const readBrand = useCallback(
    async (url: string): Promise<boolean> => {
      setLastError(null);
      setReadingBrand(true);
      try {
        const res = await api.brand({ url });
        if (res.success) {
          update((p) => ({ ...p, brand: res.brand }));
          return true;
        }
        setLastError(res.error);
        return false;
      } catch (e) {
        setLastError(e instanceof Error ? e.message : "Failed to read site");
        return false;
      } finally {
        setReadingBrand(false);
      }
    },
    [update]
  );

  const plan = useCallback(
    async (args: PlanArgs): Promise<boolean> => {
      setLastError(null);
      setPlanning(true);
      try {
        const res = await api.plan(args);
        if (res.success) {
          update((p) => ({ ...p, storyboard: res.storyboard }));
          return true;
        }
        setLastError(res.error);
        return false;
      } catch (e) {
        setLastError(e instanceof Error ? e.message : "Failed to plan production");
        return false;
      } finally {
        setPlanning(false);
      }
    },
    [update]
  );

  const cancelPoller = useCallback((jobId: string) => {
    const handle = pollers.current.get(jobId);
    if (handle !== undefined) {
      window.clearTimeout(handle);
      pollers.current.delete(jobId);
    }
  }, []);

  const updateScene = useCallback(
    (sceneN: number, patch: (s: Scene) => Scene) => {
      update((p) => {
        if (!p.storyboard) return p;
        const scenes = p.storyboard.scenes.map((s) =>
          s.n === sceneN ? patch(s) : s
        );
        return { ...p, storyboard: { ...p.storyboard, scenes } };
      });
    },
    [update]
  );

  const setProgressForScene = useCallback((sceneN: number, value: number) => {
    setProgressMap((prev) => {
      if (prev[sceneN] === value) return prev;
      return { ...prev, [sceneN]: value };
    });
  }, []);

  const greenlight = useCallback(
    async (sceneN: number) => {
      const storyboard = production.storyboard;
      if (!storyboard) return;
      const scene = storyboard.scenes.find((s) => s.n === sceneN);
      if (!scene) return;
      if (scene.status === "rendering" || scene.status === "queued") return;

      // Optimistically mark the scene as rendering.
      updateScene(sceneN, (s) => ({
        ...s,
        status: "rendering",
        error: undefined,
        jobId: undefined,
      }));
      setProgressForScene(sceneN, 4);

      try {
        const res = await api.render({
          scene,
          aspectRatio: production.aspectRatio,
          property: storyboard.property,
        });
        if (!res.success) {
          updateScene(sceneN, (s) => ({ ...s, status: "error", error: res.error }));
          setProgressForScene(sceneN, 0);
          return;
        }
        const jobId = res.job.jobId;
        updateScene(sceneN, (s) => ({ ...s, status: "queued", jobId }));
        setProgressForScene(sceneN, Math.max(8, res.job.progress ?? 8));

        const tick = async () => {
          try {
            const r = await api.job(jobId);
            if (!r.success) {
              // transient — try again
              pollers.current.set(
                jobId,
                window.setTimeout(tick, POLL_INTERVAL_MS * 2)
              );
              return;
            }
            const job = r.job;
            const next: Scene["status"] =
              job.status === "done"
                ? "done"
                : job.status === "error"
                ? "error"
                : "rendering";
            setProgressForScene(sceneN, job.progress ?? 0);
            updateScene(sceneN, (s) => ({ ...s, status: next, error: job.error }));

            if (next === "done" && job.output) {
              const manifest = job.output.manifest;
              const frameAsset: AssetItem = {
                id: `asset_frame_${jobId}`,
                name: `${job.sceneName} — Frame`,
                kind: "frame",
                meta: `${manifest.model} · ${manifest.time}`,
                scene: sceneN,
                createdAt: Date.now(),
                payload: {
                  filename: `atelier-scene-${String(sceneN).padStart(2, "0")}-frame.svg`,
                  mime: "image/svg+xml",
                  content: makeFrame(
                    (production.storyboard?.scenes ?? []).find((s) => s.n === sceneN)!,
                    production.storyboard?.property ?? "Untitled",
                    production.aspectRatio,
                    production.brand,
                  ).svg,
                },
              };
              const shotlistAsset: AssetItem = {
                id: `asset_shots_${jobId}`,
                name: `${job.sceneName} — Shot List`,
                kind: "shotlist",
                meta: `manifest · ${job.credits} cr`,
                scene: sceneN,
                createdAt: Date.now(),
                payload: {
                  filename: `atelier-scene-${String(sceneN).padStart(2, "0")}-shotlist.json`,
                  mime: "application/json",
                  content: JSON.stringify(manifest, null, 2),
                },
              };
              updateScene(sceneN, (s) => ({ ...s, output: job.output }));
              update((p) => {
                // Reflect this just-finished scene locally so the all-done check
                // is correct regardless of React batching / ordering.
                const scenes = (p.storyboard?.scenes ?? []).map((s) =>
                  s.n === sceneN ? { ...s, status: "done" as const, output: job.output } : s,
                );
                const allDone = scenes.length > 0 && scenes.every((s) => s.status === "done");
                const cutAssets: AssetItem[] = [];
                if (allDone && !p.assets.some((a) => a.kind === "cut")) {
                  const fc = composeFinalCut(
                    scenes,
                    p.storyboard?.property ?? "",
                    p.aspectRatio,
                    p.brand,
                  );
                  cutAssets.push({
                    id: `asset_cut_${Date.now()}`,
                    name: "Final Cut — Assembled Preview",
                    kind: "cut",
                    meta: `${scenes.length} scenes assembled · ${p.aspectRatio} · tap to download`,
                    createdAt: Date.now(),
                    payload: {
                      filename: `atelier-final-cut.svg`,
                      mime: "image/svg+xml",
                      content: fc.svg,
                    },
                  });
                }
                return {
                  ...p,
                  assets: [...p.assets, frameAsset, shotlistAsset, ...cutAssets],
                  creditsSpent: p.creditsSpent + job.credits,
                };
              });
              cancelPoller(jobId);
              return;
            }
            if (next === "error") {
              cancelPoller(jobId);
              return;
            }
            pollers.current.set(jobId, window.setTimeout(tick, POLL_INTERVAL_MS));
          } catch {
            pollers.current.set(
              jobId,
              window.setTimeout(tick, POLL_INTERVAL_MS * 2)
            );
          }
        };
        pollers.current.set(jobId, window.setTimeout(tick, POLL_INTERVAL_MS));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to greenlight scene";
        updateScene(sceneN, (s) => ({ ...s, status: "error", error: message }));
        setProgressForScene(sceneN, 0);
      }
    },
    [
      production.storyboard,
      production.aspectRatio,
      production.brand,
      updateScene,
      update,
      setProgressForScene,
      cancelPoller,
    ]
  );

  const downloadAsset = useCallback(
    (asset: AssetItem) => downloadAssetApi(asset.payload),
    []
  );

  const reset = useCallback(() => {
    pollers.current.forEach((handle) => window.clearTimeout(handle));
    pollers.current.clear();
    setProgressMap({});
    setProduction(emptyProduction());
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(PRODUCTION_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const remainingCredits = useCallback(
    () => Math.max(0, STARTING_CREDITS - production.creditsSpent),
    [production.creditsSpent]
  );

  const state: ProductionState = {
    production,
    hydrated,
    readingListing,
    planning,
    readingBrand,
    lastError,
    sceneProgress: progressMap,
  };
  const generateExtras = useCallback(() => {
    update((p) => {
      const caption = generateCaption(p);
      const sheet = generateListingSheet(p);

      const captionAsset: AssetItem = {
        id: `asset_caption_${Date.now()}`,
        name: "Social / MLS Caption",
        kind: "caption",
        meta: "Copy-ready text for listing platforms",
        createdAt: Date.now(),
        payload: {
          filename: "listing-caption.txt",
          mime: "text/plain",
          content: caption,
        },
      };

      const sheetAsset: AssetItem = {
        id: `asset_sheet_${Date.now()}`,
        name: "Production Listing Sheet",
        kind: "sheet",
        meta: "Full production summary (JSON)",
        createdAt: Date.now(),
        payload: {
          filename: "listing-sheet.json",
          mime: "application/json",
          content: JSON.stringify(sheet, null, 2),
        },
      };

      const otherAssets = p.assets.filter(
        (a) => a.kind !== "caption" && a.kind !== "sheet"
      );
      return {
        ...p,
        assets: [...otherAssets, captionAsset, sheetAsset],
      };
    });
  }, [update]);

  const actions: ProductionActions = {
    setBrief,
    setListingUrl,
    setPhotoNames,
    setAspectRatio,
    setAgent,
    setBrand,
    scrapeListing,
    readBrand,
    plan,
    greenlight,
    greenlightAll: async () => {
      if (!production.storyboard) return;
      const scenes = production.storyboard.scenes;
      for (const s of scenes) {
        if (s.status === "planned" || s.status === "error") {
          const credits = remainingCredits();
          if (credits < s.credits) break;
          await greenlight(s.n);
        }
      }
    },
    generateExtras,
    downloadAsset,
    logEvent,
    clearEvents,
    reset,
    remainingCredits,
  };

  return <Ctx.Provider value={{ state, actions }}>{children}</Ctx.Provider>;
}

export function useProduction(): CtxValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useProduction must be used inside <ProductionProvider>");
  }
  return ctx;
}
