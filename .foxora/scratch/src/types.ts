// Shared contract for the Atelier production pipeline.
// FROZEN: server routes and the client store both import from here.
// Do not change a field name or shape without updating lib/api.ts in the same edit.

export type SceneTask = "image_to_video" | "text_to_video" | "brand_card";

export type SceneStatus = "planned" | "queued" | "rendering" | "done" | "error";

export type JobStatus = "queued" | "rendering" | "done" | "error";

export type AspectRatio = "9:16" | "16:9" | "1:1";

export interface Scene {
  /** 1-based scene number. Stable across re-plans within a production. */
  n: number;
  name: string;
  /** Human-readable timeline label, e.g. "0:08–0:20". */
  time: string;
  /** Start offset in seconds. */
  start: number;
  /** Duration in seconds. */
  duration: number;
  /** The narration / direction line rendered on the greenlight card. */
  script: string;
  /** Short camera-move labels, e.g. ["AERIAL · DUSK", "OCEAN · GLINT"]. */
  shots: string[];
  task: SceneTask;
  /** Model id used for the estimate. */
  model: string;
  /** Human-readable model name. */
  modelLabel: string;
  /** Credit estimate for this scene, from lib/pricing. */
  credits: number;
  /** Why this model was chosen, shown to the agent. */
  rationale: string;
  status: SceneStatus;
  jobId?: string;
  /** Set when status is "done": the produced storyboard frame. */
  output?: RenderOutput;
  error?: string;
}

export interface PropertyDetails {
  title: string;
  price?: string;
  specs?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  features: string[];
  description?: string;
  images: string[];
  /** "live" when parsed from the real page, "fixture" when the fetch failed and we fell back. */
  source: "live" | "fixture";
  url?: string;
  /** Present when source is "fixture": why the live read failed. */
  warning?: string;
}

export interface Storyboard {
  property: string;
  aspectRatio: AspectRatio;
  /** Sum of scene durations, in seconds. */
  targetDuration: number;
  /** Sum of scene credits. */
  totalCredits: number;
  scenes: Scene[];
  createdAt: number;
}

export interface RenderOutput {
  kind: "frame";
  /** A self-contained SVG storyboard frame for this scene. */
  svg: string;
  /** The shot list + prompt sidecar written alongside the frame. */
  manifest: {
    scene: number;
    name: string;
    time: string;
    script: string;
    shots: string[];
    model: string;
    task: SceneTask;
    prompt: string;
    credits: number;
    aspectRatio: AspectRatio;
    generatedAt: string;
  };
}

export interface RenderJob {
  jobId: string;
  scene: number;
  sceneName: string;
  task: SceneTask;
  model: string;
  modelLabel: string;
  status: JobStatus;
  /** 0–100. */
  progress: number;
  credits: number;
  prompt: string;
  /** The prototype runs a simulated renderer, not a live model gateway. */
  simulated: true;
  /** Total render time for this job, in ms. */
  etaMs: number;
  output?: RenderOutput;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AssetItem {
  id: string;
  name: string;
  kind: "frame" | "shotlist" | "cut";
  meta: string;
  scene?: number;
  createdAt: number;
  /** Inline payload the client turns into a download. */
  payload: { filename: string; mime: string; content: string };
}

export interface BrandKit {
  url: string;
  name: string;
  tagline?: string;
  fonts: string[];
  colors: string[];
  tone: string;
  source: "live" | "fixture";
  warning?: string;
  readAt: number;
}

export interface Production {
  id: string;
  createdAt: number;
  brief: string;
  listingUrl: string;
  aspectRatio: AspectRatio;
  /** File names only — photos never leave the browser in this prototype. */
  photoNames: string[];
  propertyDetails?: PropertyDetails;
  storyboard?: Storyboard;
  assets: AssetItem[];
  creditsSpent: number;
  brand?: BrandKit;
}
