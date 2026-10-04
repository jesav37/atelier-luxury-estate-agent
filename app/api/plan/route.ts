import { NextRequest, NextResponse } from "next/server";

import type { PlanRequest, PlanResponse } from "@/lib/api";
import type { ModelSpec } from "@/lib/pricing";
import { creditsForTask, modelForTask, pickTask, totalCredits } from "@/lib/pricing";
import type { AspectRatio, PropertyDetails, Scene, SceneTask, Storyboard } from "@/lib/types";

export const dynamic = "force-dynamic";

const ASPECT_RATIOS: readonly AspectRatio[] = ["9:16", "16:9", "1:1"];
const MIN_SCENES = 5;
const MAX_SCENES = 7;
const DEFAULT_TARGET_SECONDS = 30;

interface PlanContext {
  property: string;
  specs: string;
  feature: string;
}

interface SceneBlueprint {
  name: string;
  shots: string[];
  script: (ctx: PlanContext) => string;
}

/** Aerial opener — the establishing shot (text-to-video when the agent has no photos). */
const OPENING: SceneBlueprint = {
  name: "Aerial Establishing",
  shots: ["AERIAL · DUSK", "DRONE · REVEAL", "HORIZON · GLINT"],
  script: (c) =>
    `A slow aerial glide over ${c.property} at dusk, the last light catching the water beyond the manicured grounds.`,
};

/** Closing card — always last, always cheap. */
const CLOSING: SceneBlueprint = {
  name: "Closing Card",
  shots: ["BRAND · CARD"],
  script: (c) => `${c.property}. Your private estate awaits.`,
};

/** The interior/lifestyle pool the planner draws from (most-to-least essential). */
const INTERIORS: SceneBlueprint[] = [
  {
    name: "The Great Room",
    shots: ["WIDE · GLASS", "DOLLY · IN", "DETAIL · STONE"],
    script: (c) =>
      `The great room — ${c.specs}, floor-to-ceiling glass, the last of the evening light washing the stone.`,
  },
  {
    name: "Chef's Kitchen",
    shots: ["REVEAL · RANGE", "MARBLE · MACRO", "BRASS · DETAIL"],
    script: (c) =>
      `The chef's kitchen — honed marble, a brass tap catching the warm glow, ${c.feature.toLowerCase()} beyond.`,
  },
  {
    name: "Primary Suite",
    shots: ["BED · WIDE", "TERRACE · OUT", "WATER · VIEW"],
    script: () => "The primary suite — a private sanctuary opening onto a terrace above the water.",
  },
  {
    name: "Outdoor Living",
    shots: ["POOL · TWILIGHT", "LOGGIA · FIRE", "SEA · HORIZON"],
    script: () => "Outdoor living at its finest — the pool, the loggia, the fire, the sea.",
  },
  {
    name: "Grounds at Dusk",
    shots: ["GARDEN · CRUISE", "PATH · LIGHT", "ESTATE · WIDE"],
    script: (c) =>
      `The grounds at dusk — clipped hedges, lantern light, the whole of ${c.property} held in one frame.`,
  },
];

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Partial<PlanRequest> | null;
  if (!body) {
    const payload: PlanResponse = { success: false, error: "Invalid JSON body." };
    return NextResponse.json(payload, { status: 400 });
  }

  const brief = typeof body.brief === "string" ? body.brief.trim() : "";
  const listingUrl = typeof body.listingUrl === "string" ? body.listingUrl.trim() : "";
  if (!brief && !listingUrl) {
    const payload: PlanResponse = {
      success: false,
      error: "Add a brief or a listing URL to plan the film.",
    };
    return NextResponse.json(payload, { status: 400 });
  }

  const aspectRatio: AspectRatio = ASPECT_RATIOS.includes(body.aspectRatio as AspectRatio)
    ? (body.aspectRatio as AspectRatio)
    : "9:16";
  const photoCount =
    typeof body.photoCount === "number" && body.photoCount > 0 ? body.photoCount : 0;
  const targetSeconds =
    typeof body.targetSeconds === "number" && Number.isFinite(body.targetSeconds) && body.targetSeconds > 0
      ? body.targetSeconds
      : DEFAULT_TARGET_SECONDS;

  try {
    const storyboard = buildStoryboard({
      aspectRatio,
      details: body.propertyDetails,
      photoCount,
      targetSeconds,
    });
    const payload: PlanResponse = { success: true, storyboard };
    return NextResponse.json(payload);
  } catch (err) {
    const payload: PlanResponse = {
      success: false,
      error: `Could not plan the storyboard: ${err instanceof Error ? err.message : "unknown error"}`,
    };
    return NextResponse.json(payload, { status: 500 });
  }
}

interface BuildInput {
  aspectRatio: AspectRatio;
  details?: PropertyDetails;
  photoCount: number;
  targetSeconds: number;
}

function buildStoryboard(input: BuildInput): Storyboard {
  const property = input.details?.title?.trim() || "New Luxury Listing";
  const hasPhotos = input.photoCount > 0;

  const count = sceneCount(input.targetSeconds);
  const target = clampTarget(input.targetSeconds, count);

  const order: SceneBlueprint[] = [OPENING, ...INTERIORS.slice(0, count - 2), CLOSING];
  const weights = [1.4, ...order.slice(1, -1).map(() => 1), 0.5];
  const durations = enforceMin(distribute(target, weights), 2);

  const ctx: PlanContext = {
    property,
    specs: input.details?.specs?.trim() || "twelve-foot ceilings",
    feature: input.details?.features?.[0]?.trim() || "quietly luxurious finishes",
  };

  let cursor = 0;
  const scenes: Scene[] = order.map((blueprint, index) => {
    const duration = durations[index];
    const start = cursor;
    cursor += duration;

    const task: SceneTask = pickTask(blueprint.name, hasPhotos);
    const model = modelForTask(task);

    return {
      n: index + 1,
      name: blueprint.name,
      time: `${formatTime(start)}–${formatTime(cursor)}`,
      start,
      duration,
      script: blueprint.script(ctx),
      shots: blueprint.shots,
      task,
      model: model.id,
      modelLabel: model.label,
      credits: creditsForTask(task, duration),
      rationale: rationaleFor(task, model),
      status: "planned",
    };
  });

  return {
    property,
    aspectRatio: input.aspectRatio,
    targetDuration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
    totalCredits: totalCredits(scenes),
    scenes,
    createdAt: Date.now(),
  };
}

/** 5–7 scenes: shorter films need fewer, longer films earn more coverage. */
function sceneCount(target: number): number {
  if (target <= 24) return MIN_SCENES;
  if (target <= 45) return MIN_SCENES + 1;
  return MAX_SCENES;
}

/** Keep the target sane and large enough to give every scene a real duration. */
function clampTarget(target: number, count: number): number {
  return Math.min(600, Math.max(count * 3, Math.round(target)));
}

/** Split `total` seconds across `weights` using largest-remainder, summing exactly. */
function distribute(total: number, weights: number[]): number[] {
  const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (total * w) / weightSum);
  const out = raw.map((value) => Math.floor(value));

  let remainder = total - out.reduce((a, b) => a + b, 0);
  const byFraction = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);

  for (let k = 0; k < byFraction.length && remainder > 0; k++, remainder--) {
    out[byFraction[k].index] += 1;
  }
  return out;
}

/** Lift any scene under `min` seconds by borrowing from the longest, preserving the sum. */
function enforceMin(values: number[], min: number): number[] {
  const out = values.slice();
  for (let i = 0; i < out.length; i++) {
    while (out[i] < min) {
      let maxIndex = 0;
      for (let j = 1; j < out.length; j++) {
        if (out[j] > out[maxIndex]) maxIndex = j;
      }
      if (out[maxIndex] <= min) break;
      out[maxIndex] -= 1;
      out[i] += 1;
    }
  }
  return out;
}

function rationaleFor(task: SceneTask, model: ModelSpec): string {
  if (task === "brand_card") {
    return `${model.label} — composed from the Brand Kit, so no generative model is billed.`;
  }
  if (task === "text_to_video") {
    return `${model.label} — reserved for shots with no source photography (aerials and twilights).`;
  }
  return `${model.label} — animates the agent's real listing photography, the most cost-efficient route.`;
}

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
