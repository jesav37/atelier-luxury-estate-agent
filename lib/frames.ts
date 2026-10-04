// Storyboard frame renderer.
//
// Produces one self-contained SVG per scene — no external assets, no network,
// no image files: just the Atelier ink / bone / brass palette drawn from the
// scene's own text. The client turns RenderOutput.svg into a preview or a
// download, and ships RenderOutput.manifest as the shotlist sidecar.

import type { AspectRatio, BrandKit, RenderOutput, Scene } from "./types";

/** Pixel dimensions per aspect ratio. The SVG is drawn in a 1000-unit-wide space. */
const FRAME_PX: Record<AspectRatio, { w: number; h: number }> = {
  "9:16": { w: 1080, h: 1920 },
  "16:9": { w: 1920, h: 1080 },
  "1:1": { w: 1080, h: 1080 },
};

/** Deterministic, editorial prompt sidecar for a scene. */
export function buildPrompt(scene: Scene, property: string): string {
  const camera = scene.shots[0] ? scene.shots[0].toLowerCase() : "slow cinematic push";
  return [
    `Luxury real-estate frame for ${property}.`,
    `Scene ${scene.n} — ${scene.name} (${scene.time}).`,
    scene.script,
    `Camera: ${camera}.`,
    `Shot list: ${scene.shots.join(" · ") || "wide establishing"}.`,
    "Warm golden-hour light, shallow depth of field, restrained editorial grade; no people, no on-screen text.",
  ].join(" ");
}

/** Build the storyboard frame plus the manifest written alongside it. */
export function makeFrame(
  scene: Scene,
  property: string,
  aspectRatio: AspectRatio,
  brand?: BrandKit,
): RenderOutput {
  return {
    kind: "frame",
    svg: renderSvg(scene, property, aspectRatio, brand),
    manifest: {
      scene: scene.n,
      name: scene.name,
      time: scene.time,
      script: scene.script,
      shots: scene.shots,
      model: scene.model,
      task: scene.task,
      prompt: buildPrompt(scene, property),
      credits: scene.credits,
      aspectRatio,
      generatedAt: new Date().toISOString(),
    },
  };
}

function renderSvg(
  scene: Scene,
  property: string,
  aspectRatio: AspectRatio,
  brand?: BrandKit,
): string {
  const { w, h } = FRAME_PX[aspectRatio];

  const INK = brand?.colors[0] || "#0B0B0C";
  const BONE = brand?.colors[1] || "#EDE7DC";
  const BRASS = brand?.colors[2] || "#B89B72";
  const DIM = "#8C857A";
  const HAIR = "#2A2723";

  const SERIF = "Cormorant Garamond, 'Times New Roman', Georgia, serif";
  const SANS = "Inter, 'Helvetica Neue', Arial, sans-serif";

  const vbW = 1000;
  const vbH = Math.round((vbW * h) / w);
  const pad = vbW * 0.075;
  const innerW = vbW - pad * 2;

  const fEyebrow = vbW * 0.0135;
  const fNumber = vbW * 0.1;
  const fName = vbW * 0.042;
  const fTime = vbW * 0.017;
  const fScript = vbW * 0.028;
  const fShot = vbW * 0.016;
  const fProp = vbW * 0.019;

  // Short frames (16:9) need the stack to flow below the eyebrow rather than
  // sit on fixed fractions, or the scene number collides with the eyebrow line.
  const eyebrowY = vbH * 0.072;
  const numberY = Math.max(vbH * 0.215, eyebrowY + fNumber * 0.95);
  const nameY = Math.max(vbH * 0.29, numberY + fName * 0.95);
  const timeY = nameY + Math.max(fName * 0.78, vbW * 0.028);
  const hairY = timeY + Math.max(fScript * 1.25, vbW * 0.03);
  const scriptY = hairY + Math.max(fScript * 2.1, vbW * 0.05);
  const lineH = fScript * 1.5;

  const scriptLines = wrap(scene.script, Math.max(24, Math.floor(innerW / (fScript * 0.5))), 8);
  const shotLines = wrap(
    scene.shots.join(" | "),
    Math.max(20, Math.floor(innerW / (fShot * 0.62))),
    2,
  );

  const propY = vbH - pad * 1.1;
  const shotBaseY = propY - Math.max(fProp * 1.7, vbW * 0.032);
  const shotTopY = shotBaseY - (shotLines.length - 1) * fShot * 1.6;

  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${w}" height="${h}" role="img" aria-label="${esc(`${scene.name} — storyboard frame`)}">`,
    `<rect width="${vbW}" height="${vbH}" fill="${INK}"/>`,
    `<rect x="${r(pad * 0.5)}" y="${r(pad * 0.5)}" width="${r(vbW - pad)}" height="${r(vbH - pad)}" fill="none" stroke="${BRASS}" stroke-opacity="0.26"/>`,
    `<text x="${r(pad)}" y="${r(eyebrowY)}" font-family="${SANS}" font-size="${r(fEyebrow)}" letter-spacing="${r(fEyebrow * 0.3)}" fill="${DIM}">${esc(
      "ATELIER · STORYBOARD FRAME",
    )}</text>`,
    `<text x="${r(pad)}" y="${r(numberY)}" font-family="${SERIF}" font-size="${r(fNumber)}" fill="${BRASS}" fill-opacity="0.85">${esc(
      String(scene.n).padStart(2, "0"),
    )}</text>`,
    `<text x="${r(pad)}" y="${r(nameY)}" font-family="${SERIF}" font-size="${r(fName)}" fill="${BONE}">${esc(
      scene.name,
    )}</text>`,
    `<text x="${r(pad)}" y="${r(timeY)}" font-family="${SANS}" font-size="${r(fTime)}" letter-spacing="${r(
      fTime * 0.14,
    )}" fill="${BRASS}">${esc(scene.time.toUpperCase())}</text>`,
    `<line x1="${r(pad)}" y1="${r(hairY)}" x2="${r(vbW - pad)}" y2="${r(hairY)}" stroke="${HAIR}"/>`,
  ];

  scriptLines.forEach((line, i) => {
    out.push(
      `<text x="${r(pad)}" y="${r(scriptY + i * lineH)}" font-family="${SERIF}" font-size="${r(
        fScript,
      )}" fill="${DIM}">${esc(line)}</text>`,
    );
  });

  shotLines.forEach((line, i) => {
    out.push(
      `<text x="${r(pad)}" y="${r(shotTopY + i * fShot * 1.6)}" font-family="${SANS}" font-size="${r(
        fShot,
      )}" letter-spacing="${r(fShot * 0.18)}" fill="${BRASS}">${esc(line.toUpperCase())}</text>`,
    );
  });

  out.push(
    `<text x="${r(pad)}" y="${r(propY)}" font-family="${SERIF}" font-size="${r(fProp)}" fill="${BONE}">${esc(
      property,
    )}</text>`,
    `<text x="${r(vbW - pad)}" y="${r(propY)}" text-anchor="end" font-family="${SANS}" font-size="${r(
      fEyebrow,
    )}" letter-spacing="${r(fEyebrow * 0.2)}" fill="${DIM}">${esc(`${aspectRatio} · SIMULATED`)}</text>`,
    `</svg>`,
  );

  return out.join("");
}

/** Round to two decimals to keep the generated SVG tidy. */
function r(n: number): number {
  return Math.round(n * 100) / 100;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Assemble the finished scenes into a single "final cut" contact-sheet SVG —
 * the assembled preview of the whole video. Closes the loop that the board and
 * asset gallery advertise as a "cut" deliverable once every scene is done.
 * Returns a self-contained SVG plus a JSON sequence manifest.
 */
export function composeFinalCut(
  scenes: Scene[],
  property: string,
  aspectRatio: AspectRatio,
  brand?: BrandKit,
): { svg: string; manifest: unknown } {
  const done = scenes.filter((s) => s.status === "done" && s.output?.svg);
  const { w, h } = FRAME_PX[aspectRatio];

  const INK = brand?.colors[0] || "#0B0B0C";
  const BONE = brand?.colors[1] || "#EDE7DC";
  const BRASS = brand?.colors[2] || "#B89B72";
  const DIM = "#8C857A";
  const HAIR = "#2A2723";

  const SERIF = "Cormorant Garamond, 'Times New Roman', Georgia, serif";
  const SANS = "Inter, 'Helvetica Neue', Arial, sans-serif";

  const vbW = 1000;
  const vbH = Math.round((vbW * h) / w);
  const pad = 44;
  const header = 160;
  const gap = 30;
  const W = vbW + pad * 2;
  const H = pad + header + done.length * (vbH + gap) + pad;

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Atelier final cut preview">`,
    `<rect width="${W}" height="${H}" fill="${INK}"/>`,
    `<rect x="${r(pad * 0.5)}" y="${r(pad * 0.5)}" width="${r(W - pad)}" height="${r(H - pad)}" fill="none" stroke="${BRASS}" stroke-opacity="0.22"/>`,
    `<text x="${r(pad)}" y="${r(pad + 30)}" font-family="${SANS}" font-size="14" letter-spacing="4" fill="${BRASS}">ATELIER · FINAL CUT PREVIEW</text>`,
    `<text x="${r(pad)}" y="${r(pad + 78)}" font-family="${SERIF}" font-size="44" fill="${BONE}">${esc(
      property || "Untitled property",
    )}</text>`,
    `<text x="${r(pad)}" y="${r(pad + 112)}" font-family="${SANS}" font-size="15" letter-spacing="2" fill="${DIM}">${esc(
      `${done.length} ${done.length === 1 ? "scene" : "scenes"} · ${aspectRatio} · ${Math.round(
        done.reduce((sum, s) => sum + (s.duration || 0), 0),
      )}s assembled`,
    )}</text>`,
    `<line x1="${r(pad)}" y1="${r(pad + 138)}" x2="${r(W - pad)}" y2="${r(pad + 138)}" stroke="${HAIR}"/>`,
  ];

  done.forEach((scene, i) => {
    const y0 = pad + header + i * (vbH + gap);
    const inner = frameInner(scene.output!.svg);
    parts.push(
      `<g transform="translate(${r(pad)}, ${r(y0)})">`,
      `<rect x="0" y="0" width="${vbW}" height="${vbH}" fill="none" stroke="${BRASS}" stroke-opacity="0.3"/>`,
      inner,
      `</g>`,
    );
  });
  parts.push(`</svg>`);

  const manifest = {
    kind: "cut",
    property,
    aspectRatio,
    sceneCount: done.length,
    generatedAt: new Date().toISOString(),
    sequences: done.map((s) => ({
      scene: s.n,
      name: s.name,
      time: s.time,
      duration: s.duration,
      model: s.modelLabel,
      credits: s.credits,
      source: `atelier-scene-${String(s.n).padStart(2, "0")}.svg`,
    })),
  };

  return { svg: parts.join(""), manifest };
}

/** Strip a frame's outer <svg …> wrapper so it can be embedded inside the cut. */
function frameInner(svg: string): string {
  const open = svg.indexOf(">");
  const close = svg.lastIndexOf("</svg>");
  return open >= 0 && close > open ? svg.slice(open + 1, close) : svg;
}

function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if (!line) {
      line = word;
      continue;
    }
    if ((line + " " + word).length <= maxChars) {
      line += " " + word;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (!lines.length) lines.push("");

  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, "")}…`;
    return kept;
  }
  return lines;
}
