import { NextRequest, NextResponse } from "next/server";

// The cost model — verified against the live media catalog:
//   Photo-to-video (image_to_video) is the WORKHORSE for luxury real estate.
//   It animates the agent's REAL listing photos with cinematic camera moves.
//   MiniMax H3 Max: 4 cr/sec  (cheapest, ~19x cheaper than text-to-video)
//   Kling 3 Pro:     45 cr/sec (reliable, uses real photo)
//   Seedance 2.5:    76 cr/sec (premium quality)
//
//   Text-to-video is reserved for "wow" shots that don't exist as photos
//   (aerial/twilight renders) — it's expensive and can hallucinate, so it's
//   used sparingly.

export async function POST(req: NextRequest) {
  try {
    const { scene, photoUrls, aspectRatio = "9:16" } = await req.json();

    if (!scene?.n) {
      return NextResponse.json({ error: "Scene is required" }, { status: 400 });
    }

    console.log(`[render] Scene ${scene.n}: ${scene.name} (${aspectRatio})`);

    // ---- Scene routing logic ----
    // Each scene type maps to a media task:
    //   aerial/twilight  -> text_to_video (no real photo exists) OR image_to_video on a render
    //   interior/kitchen -> image_to_video on the agent's real listing photo
    //   closing card     -> image (brand overlay) + assemble
    const sceneType = scene.name.toLowerCase();
    const usesRealPhoto = /great room|kitchen|suite|outdoor|interior/.test(sceneType);
    const needsTextToVideo = /aerial|twilight|drone/.test(sceneType);

    // ---- Build the media prompt from the scene's script + shots ----
    const prompt = buildCinematicPrompt(scene);

    // ---- In production, this submits a media_generate job and returns its id ----
    // const job = await submitRenderJob({
    //   task: usesRealPhoto ? "image_to_video" : "text_to_video",
    //   model: usesRealPhoto ? "minimax/h3-max/image-to-video" : "bytedance/seedance-2.5",
    //   prompt,
    //   references: usesRealPhoto ? photoUrls : [],
    //   aspectRatio,
    //   durationSeconds: sceneDuration(scene),
    // });

    // For the prototype, return a simulated job the frontend can poll.
    const jobId = `job_${Date.now()}_${scene.n}`;
    const estimatedCredits = estimateCredits(scene, usesRealPhoto, needsTextToVideo);

    return NextResponse.json({
      status: "queued",
      jobId,
      scene: scene.n,
      estimatedCredits,
      model: usesRealPhoto
        ? needsTextToVideo
          ? "bytedance/seedance-2.5 (text-to-video)"
          : "minimax/h3-max/image-to-video (photo-to-video)"
        : "bytedance/seedance-2.5 (text-to-video)",
      note: usesRealPhoto
        ? "Animating your real listing photography — accurate and cost-efficient."
        : "Generating a cinematic shot from scratch (aerial/twilight).",
    });
  } catch (error) {
    console.error("[render] error:", error);
    return NextResponse.json({ error: "Failed to render scene" }, { status: 500 });
  }
}

// Build a cinematic, real-estate-specific motion prompt from the scene.
function buildCinematicPrompt(scene: any): string {
  const shots = scene.shots || [];
  const firstShot = shots[0] || "cinematic";
  return `Cinematic luxury real estate shot: ${scene.script} Camera: ${firstShot.toLowerCase()}. Warm golden-hour light, shallow depth of field, high-end commercial film quality, no people, no text.`;
}

// Estimate credits based on scene type and model.
function estimateCredits(scene: any, usesRealPhoto: boolean, needsTextToVideo: boolean): number {
  const duration = sceneDuration(scene);
  if (usesRealPhoto && !needsTextToVideo) {
    return duration * 4; // MiniMax photo-to-video
  }
  return duration * 76; // Seedance text-to-video
}

// Scene duration from the time string, e.g. "0:08–0:20" -> 12s
function sceneDuration(scene: any): number {
  const m = scene.time?.match(/(\d+):(\d+)/g);
  if (!m || m.length < 2) return 10;
  const start = parseTime(m[0]);
  const end = parseTime(m[1]);
  return Math.max(5, end - start);
}

function parseTime(t: string): number {
  const [m, s] = t.split(":").map(Number);
  return m * 60 + s;
}
