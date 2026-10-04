// The frozen HTTP contract between the browser and the Atelier API routes.
// The routes implement these shapes; the client store consumes them.
// FROZEN.

import type {
  AspectRatio,
  BrandKit,
  Production,
  PropertyDetails,
  RenderJob,
  Storyboard,
} from "./types";

export interface ScrapeRequest {
  url: string;
}

export type ScrapeResponse =
  | { success: true; details: PropertyDetails }
  | { success: false; error: string };

export interface PlanRequest {
  brief: string;
  listingUrl: string;
  propertyDetails?: PropertyDetails;
  photoCount: number;
  aspectRatio: AspectRatio;
  targetSeconds: number;
}

export type PlanResponse = { success: true; storyboard: Storyboard } | { success: false; error: string };

export interface RenderRequest {
  scene: Storyboard["scenes"][number];
  aspectRatio: AspectRatio;
  property: string;
}

export type RenderResponse = { success: true; job: RenderJob } | { success: false; error: string };

export interface JobRequest {
  jobId: string;
}

export type JobResponse = { success: true; job: RenderJob } | { success: false; error: string };

export interface BrandRequest {
  url: string;
}

export type BrandResponse = { success: true; brand: BrandKit } | { success: false; error: string };

/** How often the board polls a running job, in ms. */
export const POLL_INTERVAL_MS = 400;

/** localStorage key holding the persisted production. */
export const PRODUCTION_STORAGE_KEY = "atelier.production.v1";

export function emptyProduction(): Production {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    brief: "",
    listingUrl: "",
    aspectRatio: "9:16",
    photoNames: [],
    assets: [],
    creditsSpent: 0,
  };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as T;
}

export const api = {
  scrape: (body: ScrapeRequest) => post<ScrapeResponse>("/api/scrape", body),
  plan: (body: PlanRequest) => post<PlanResponse>("/api/plan", body),
  render: (body: RenderRequest) => post<RenderResponse>("/api/render", body),
  brand: (body: BrandRequest) => post<BrandResponse>("/api/brand", body),
  job: async (jobId: string): Promise<JobResponse> => {
    const res = await fetch(`/api/render?jobId=${encodeURIComponent(jobId)}`, { cache: "no-store" });
    return (await res.json()) as JobResponse;
  },
};

/** Trigger a browser download of an inline asset payload. */
export function downloadAsset(payload: { filename: string; mime: string; content: string }) {
  const blob = new Blob([payload.content], { type: payload.mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = payload.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
