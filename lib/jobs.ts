// In-memory render job store for the Atelier prototype.
//
// Rendering is simulated: a job carries an etaMs and advance() derives progress
// from wall-clock elapsed time, attaching the finished storyboard frame at 100%.
// Jobs live in a module-level Map — process memory only, which is exactly the
// lifetime this prototype needs. They do not survive a restart or cross replicas.

import type { AspectRatio, RenderJob, Scene } from "./types";
import { modelForTask } from "./pricing";
import { buildPrompt, makeFrame } from "./frames";

interface JobRecord {
  job: RenderJob;
  scene: Scene;
  property: string;
  aspectRatio: AspectRatio;
}

// Pinned to globalThis so the store survives Next.js dev module re-evaluation
// (a recompile otherwise hands each route a fresh module scope and loses jobs).
const registry = globalThis as typeof globalThis & {
  __atelierRenderJobs?: Map<string, JobRecord>;
};
const STORE: Map<string, JobRecord> =
  registry.__atelierRenderJobs ?? (registry.__atelierRenderJobs = new Map<string, JobRecord>());

const BASE_ETA_MS = 1500;
const PER_SECOND_ETA_MS = 170;
const MAX_BILLED_SECONDS = 12;

/** Deterministic simulated render time: longer scenes take proportionally longer. */
function etaFor(scene: Scene): number {
  const seconds = Math.min(Math.max(scene.duration, 1), MAX_BILLED_SECONDS);
  return BASE_ETA_MS + Math.round(seconds * PER_SECOND_ETA_MS);
}

export function createJob(input: {
  scene: Scene;
  property: string;
  aspectRatio: AspectRatio;
}): RenderJob {
  const { scene, property, aspectRatio } = input;
  const model = modelForTask(scene.task);
  const now = Date.now();

  const job: RenderJob = {
    jobId: newJobId(),
    scene: scene.n,
    sceneName: scene.name,
    task: scene.task,
    model: model.id,
    modelLabel: model.label,
    status: "queued",
    progress: 0,
    credits: scene.credits,
    prompt: buildPrompt(scene, property),
    simulated: true,
    etaMs: etaFor(scene),
    createdAt: now,
    updatedAt: now,
  };

  STORE.set(job.jobId, { job, scene, property, aspectRatio });
  return job;
}

export function getJob(jobId: string): RenderJob | undefined {
  return STORE.get(jobId)?.job;
}

/** Move a job forward to the current wall-clock time. Mutates and returns it. */
export function advance(job: RenderJob): RenderJob {
  const record = STORE.get(job.jobId);
  const target = record?.job ?? job;
  const eta = target.etaMs > 0 ? target.etaMs : 1;
  const elapsed = Date.now() - target.createdAt;

  if (elapsed >= eta) {
    target.status = "done";
    target.progress = 100;
    if (!target.output && record) {
      target.output = makeFrame(record.scene, record.property, record.aspectRatio);
    }
  } else if (elapsed > 0) {
    target.status = "rendering";
    target.progress = Math.max(1, Math.min(99, Math.round((elapsed / eta) * 100)));
  } else {
    target.status = "queued";
    target.progress = 0;
  }

  target.updatedAt = Date.now();
  return target;
}

function newJobId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `job_${uuid.replace(/-/g, "").slice(0, 12)}`;
  return `job_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
