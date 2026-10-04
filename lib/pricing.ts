// The credit model. Shared by the planner route, the render route and the UI
// so an estimate shown on the Greenlight Board is exactly what gets charged.
// FROZEN.

import type { SceneTask } from "./types";

export const STARTING_CREDITS = 1240;

export interface ModelSpec {
  id: string;
  label: string;
  creditsPerSecond: number;
  note: string;
}

export const MODELS: Record<"photoToVideo" | "textToVideo" | "brandCard", ModelSpec> = {
  photoToVideo: {
    id: "minimax/h3-max/image-to-video",
    label: "MiniMax H3 Max",
    creditsPerSecond: 4,
    note: "Animates the agent's real listing photography — accurate and cost-efficient.",
  },
  textToVideo: {
    id: "bytedance/seedance-2.5",
    label: "Seedance 2.5",
    creditsPerSecond: 76,
    note: "Generates a cinematic shot with no source photo — reserved for aerials and twilights.",
  },
  brandCard: {
    id: "atelier/brand-card",
    label: "Atelier Brand Card",
    creditsPerSecond: 0,
    note: "Composed from the Brand Kit — no generative model required.",
  },
};

/** Flat cost of a closing card, regardless of duration. */
export const BRAND_CARD_CREDITS = 4;

export function modelForTask(task: SceneTask): ModelSpec {
  if (task === "text_to_video") return MODELS.textToVideo;
  if (task === "brand_card") return MODELS.brandCard;
  return MODELS.photoToVideo;
}

/**
 * Route a scene to a model. Real photography is the workhorse; text-to-video is
 * reserved for shots that cannot exist as a photo (and only when the agent has
 * uploaded nothing to stand in for them).
 */
export function pickTask(sceneName: string, hasPhotos: boolean): SceneTask {
  const n = sceneName.toLowerCase();
  if (/closing|brand|card|title/.test(n)) return "brand_card";
  if (/aerial|dusk|twilight|drone|establish|skyline/.test(n) && !hasPhotos) return "text_to_video";
  return "image_to_video";
}

export function creditsForTask(task: SceneTask, seconds: number): number {
  if (task === "brand_card") return BRAND_CARD_CREDITS;
  const model = modelForTask(task);
  return Math.max(1, Math.round(model.creditsPerSecond * Math.max(1, seconds)));
}

export function totalCredits(scenes: { credits: number }[]): number {
  return scenes.reduce((sum, s) => sum + s.credits, 0);
}
