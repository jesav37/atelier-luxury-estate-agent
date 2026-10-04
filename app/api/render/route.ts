import { NextRequest, NextResponse } from "next/server";

import type { JobResponse, RenderRequest, RenderResponse } from "@/lib/api";
import { advance, createJob, getJob } from "@/lib/jobs";
import type { AspectRatio } from "@/lib/types";

export const dynamic = "force-dynamic";

const ASPECT_RATIOS: readonly AspectRatio[] = ["9:16", "16:9", "1:1"];

/** Create a render job for one storyboard scene. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Partial<RenderRequest> | null;
  const scene = body?.scene;

  if (!scene || typeof scene.n !== "number" || !scene.name) {
    const payload: RenderResponse = { success: false, error: "A storyboard scene is required." };
    return NextResponse.json(payload, { status: 400 });
  }

  const aspectRatio: AspectRatio = ASPECT_RATIOS.includes(body?.aspectRatio as AspectRatio)
    ? (body.aspectRatio as AspectRatio)
    : "9:16";
  const property =
    typeof body?.property === "string" && body.property.trim()
      ? body.property.trim()
      : "Untitled property";

  try {
    const job = createJob({ scene, property, aspectRatio });
    const payload: RenderResponse = { success: true, job };
    return NextResponse.json(payload);
  } catch (err) {
    const payload: RenderResponse = {
      success: false,
      error: `Could not start the render: ${err instanceof Error ? err.message : "unknown error"}`,
    };
    return NextResponse.json(payload, { status: 500 });
  }
}

/** Advance a running job to the current time and return it. */
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId")?.trim();
  if (!jobId) {
    const payload: JobResponse = { success: false, error: "A jobId query parameter is required." };
    return NextResponse.json(payload, { status: 400 });
  }

  const job = getJob(jobId);
  if (!job) {
    const payload: JobResponse = {
      success: false,
      error: "That render job has expired or never existed.",
    };
    return NextResponse.json(payload, { status: 404 });
  }

  advance(job);
  const payload: JobResponse = { success: true, job };
  return NextResponse.json(payload);
}
