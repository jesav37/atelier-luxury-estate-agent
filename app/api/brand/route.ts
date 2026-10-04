import { NextRequest, NextResponse } from "next/server";

import type { BrandResponse } from "@/lib/api";
import { readBrand } from "@/lib/scrape";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { url?: unknown } | null;
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!url) {
    const payload: BrandResponse = { success: false, error: "A brand URL is required." };
    return NextResponse.json(payload, { status: 400 });
  }
  if (!isHttpUrl(url)) {
    const payload: BrandResponse = { success: false, error: "Enter a valid http(s) brand URL." };
    return NextResponse.json(payload, { status: 400 });
  }

  try {
    const brand = await readBrand(url);
    const payload: BrandResponse = { success: true, brand };
    return NextResponse.json(payload);
  } catch (err) {
    const payload: BrandResponse = {
      success: false,
      error: `Could not read that brand site: ${err instanceof Error ? err.message : "unknown error"}`,
    };
    return NextResponse.json(payload, { status: 500 });
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
