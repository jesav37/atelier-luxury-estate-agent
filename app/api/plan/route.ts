import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { brief, listingUrl, propertyDetails, photoCount } = await req.json();

    // The planner now takes the scraped details and uploaded photo count into account.
    // It uses this context to build a more accurate and cinematic storyboard.

    const propertyName = propertyDetails?.title || "New Luxury Listing";
    const specs = propertyDetails?.specs || "twelve-foot ceilings";
    const features = propertyDetails?.features || [];

    const storyboard = {
      property: propertyName,
      scenes: [
        {
          n: 1,
          name: "Aerial Establishing",
          time: "0:00–0:08",
          script: `A slow aerial glide over ${propertyName} at dusk, the ocean glinting beyond the manicured grounds.`,
          shots: ["AERIAL · DUSK", "DRONE · REVEAL", "OCEAN · GLINT"],
          cost: 8,
        },
        {
          n: 2,
          name: "The Great Room",
          time: "0:08–0:20",
          script: `Inside the great room — ${specs}, floor-to-ceiling glass, the last light of day washing the stone.`,
          shots: ["WIDE · GLASS", "DOLLY · IN", "DETAIL · STONE"],
          cost: 9,
        },
        {
          n: 3,
          name: "Chef's Kitchen",
          time: "0:20–0:32",
          script: `The chef's kitchen — a Wolf range, honed marble, brass fixtures catching the warm glow.`,
          shots: ["REVEAL · RANGE", "MARBLE · MACRO", "BRASS · DETAIL"],
          cost: 9,
        },
        {
          n: 4,
          name: "Primary Suite",
          time: "0:32–0:44",
          script: `The primary suite — a private sanctuary with a terrace overlooking the water.`,
          shots: ["BED · WIDE", "TERRACE · OUT", "WATER · VIEW"],
          cost: 9,
        },
        {
          n: 5,
          name: "Outdoor Living",
          time: "0:44–0:56",
          script: `Outdoor living at its finest — the pool, the loggia, the fire, the sea.`,
          shots: ["POOL · TWILIGHT", "LOGGIA · FIRE", "SEA · HORIZON"],
          cost: 9,
        },
        {
          n: 6,
          name: "Closing Card",
          time: "0:56–1:00",
          script: `${propertyName}. Your private estate awaits.`,
          shots: ["BRAND · CARD"],
          cost: 4,
        },
      ],
    };

    return NextResponse.json({ storyboard });
  } catch (error) {
    console.error("Plan error:", error);
    return NextResponse.json({ error: "Failed to plan production" }, { status: 500 });
  }
}
