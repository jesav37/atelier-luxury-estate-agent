// Live listing and brand readers.
//
// Parsing is deliberately plain JS/regex: fetch the HTML, pull the fields out
// with patterns, and on ANY failure fall back to a deterministic fixture so the
// prototype never dead-ends. A fallback always sets source: "fixture" and a
// warning explaining why the live read failed.

import type { BrandKit, PropertyDetails } from "./types";

const FETCH_TIMEOUT_MS = 6000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 AtelierBot/0.1";

const LUXURY_FEATURES = [
  "Chef's Kitchen",
  "Wine Cellar",
  "Home Theater",
  "Infinity Pool",
  "Private Beach",
  "Ocean View",
  "Waterfront",
  "Spa",
  "Gym",
  "Elevator",
  "Smart Home",
  "Fireplace",
  "Terraces",
  "Guest House",
  "Tennis Court",
  "Library",
  "Wet Bar",
  "Walk-in Closet",
  "Rooftop",
  "Heated Floors",
];

/** Read a property listing, falling back to a sample on any failure. */
export async function readListing(url: string): Promise<PropertyDetails> {
  try {
    const html = await fetchHtml(url);
    const details = parseListing(html, url);
    const hasSignal = Boolean(
      details.price || details.images.length || details.beds || details.baths || details.sqft,
    );
    if (!hasSignal) throw new Error("no listing details found on the page");
    return details;
  } catch (err) {
    return {
      ...listingFixture(url),
      source: "fixture",
      url,
      warning: `Live listing read failed (${errorMessage(
        err,
      )}). Showing a representative sample listing.`,
    };
  }
}

/** Read a brand site, falling back to a sample kit on any failure. */
export async function readBrand(url: string): Promise<BrandKit> {
  try {
    const html = await fetchHtml(url);
    const brand = parseBrand(html, url);
    // A page with no fonts, colours or tagline is not a usable Brand Kit.
    if (!brand.name || (!brand.fonts.length && !brand.colors.length && !brand.tagline)) {
      throw new Error("no brand information found on the page");
    }
    return brand;
  } catch (err) {
    return {
      ...brandFixture(url),
      source: "fixture",
      warning: `Live brand read failed (${errorMessage(
        err,
      )}). Showing a representative sample brand kit.`,
    };
  }
}

// --- listing parsing -------------------------------------------------------

export function parseListing(html: string, url: string): PropertyDetails {
  const text = stripTags(html);

  const title =
    cleanTitle(meta(html, "og:title") || firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)) ||
    hostLabel(url);
  const price = firstMatch(text, /(?:US\$|\$)\s?\d{1,3}(?:,\d{3}){1,}(?:\.\d+)?/);
  const beds = numberFrom(text, /(\d+(?:\.\d+)?)\s*(?:bd|bds|beds?|bedrooms?)\b/i);
  const baths = numberFrom(text, /(\d+(?:\.\d+)?)\s*(?:ba|bas|baths?|bathrooms?)\b/i);
  const sqft = numberFrom(text, /([\d,]{3,})\s*(?:sq\.?\s*ft|sqft|square\s+feet|sf)\b/i);

  const description = firstText(
    meta(html, "og:description"),
    meta(html, "description"),
    firstMatch(html, /<p[^>]*>([\s\S]*?)<\/p>/i),
  );

  return {
    title,
    price,
    specs: buildSpecs(beds, baths, sqft),
    beds,
    baths,
    sqft,
    features: detectFeatures(text),
    description: description ? clamp(cleanText(description), 320) : undefined,
    images: collectImages(html, url),
    source: "live",
    url,
  };
}

export function parseBrand(html: string, url: string): BrandKit {
  const name =
    meta(html, "og:site_name") ||
    cleanTitle(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)) ||
    hostLabel(url);
  const tagline = firstText(meta(html, "og:description"), meta(html, "description"));

  return {
    url,
    name,
    tagline: tagline ? clamp(cleanText(tagline), 200) : undefined,
    fonts: collectFonts(html),
    colors: collectColors(html),
    tone: inferTone(stripTags(html)),
    source: "live",
    readAt: Date.now(),
  };
}

// --- fetch -----------------------------------------------------------------

async function fetchHtml(url: string): Promise<string> {
  const target = new URL(url); // throws on a malformed URL
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    throw new Error("unsupported protocol");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(target.toString(), {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (html.length < 200) throw new Error("response too short to parse");
    return html;
  } finally {
    clearTimeout(timer);
  }
}

// --- field helpers ---------------------------------------------------------

function meta(html: string, key: string): string | undefined {
  const wanted = key.toLowerCase();
  const re = /<meta\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const tag = match[0];
    const name = attr(tag, "property") || attr(tag, "name") || attr(tag, "itemprop");
    if (name && name.toLowerCase() === wanted) {
      const content = attr(tag, "content");
      if (content) return decodeEntities(content);
    }
  }
  return undefined;
}

function attr(tag: string, name: string): string | undefined {
  const match = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i").exec(tag);
  return match ? match[1].trim() : undefined;
}

function firstMatch(source: string, re: RegExp): string | undefined {
  const match = re.exec(source);
  return match && match[1] != null ? decodeEntities(match[1].trim()) : undefined;
}

function firstText(...values: (string | undefined)[]): string | undefined {
  for (const value of values) {
    if (value && value.trim()) return value.trim();
  }
  return undefined;
}

function numberFrom(text: string, re: RegExp): number | undefined {
  const match = re.exec(text);
  if (!match) return undefined;
  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) ? value : undefined;
}

function buildSpecs(beds?: number, baths?: number, sqft?: number): string | undefined {
  const parts: string[] = [];
  if (beds) parts.push(`${beds} Bed`);
  if (baths) parts.push(`${baths} Bath`);
  if (sqft) parts.push(`${sqft.toLocaleString("en-US")} Sq Ft`);
  return parts.length ? parts.join(" · ") : undefined;
}

function detectFeatures(text: string): string[] {
  return LUXURY_FEATURES.filter((feature) => new RegExp(escapeRegExp(feature), "i").test(text));
}

function collectImages(html: string, base: string): string[] {
  const found: string[] = [];
  const ogImage = meta(html, "og:image");
  if (ogImage) found.push(resolveUrl(ogImage, base));

  const re = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) && found.length < 12) {
    found.push(resolveUrl(match[1], base));
  }

  return unique(found.filter((src) => Boolean(src) && !src.startsWith("data:")));
}

function collectFonts(html: string): string[] {
  const found: string[] = [];

  const linkRe = /fonts\.googleapis\.com\/css2?\?([^"'\s>]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(html))) {
    const familyRe = /family=([^&:]+)/g;
    let family: RegExpExecArray | null;
    while ((family = familyRe.exec(match[1]))) {
      found.push(decodeURIComponent(family[1].replace(/\+/g, " ")).trim());
    }
  }

  const declRe = /font-family\s*:\s*([^;"'}]+)/gi;
  while ((match = declRe.exec(html))) {
    for (const part of match[1].split(",")) {
      const name = part.replace(/['"]/g, "").trim();
      if (name && !isGenericFont(name)) found.push(name);
    }
  }

  return unique(found).slice(0, 6);
}

function isGenericFont(name: string): boolean {
  return /^(inherit|initial|unset|sans-serif|serif|monospace|system-ui|ui-\w+|helvetica|arial|-apple-system)$/i.test(
    name,
  );
}

function collectColors(html: string): string[] {
  const counts: Record<string, number> = {};
  const re = /#([0-9a-f]{6})\b/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const hex = `#${match[1].toUpperCase()}`;
    counts[hex] = (counts[hex] ?? 0) + 1;
  }

  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a] || (a < b ? -1 : 1))
    .slice(0, 6);
}

function inferTone(text: string): string {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  if (/luxur|estate|prestige|bespoke|private/.test(lower)) hits.push("refined and aspirational");
  if (/minimal|clean|modern|architectur/.test(lower)) hits.push("architectural and restrained");
  if (/warm|heritage|timeless|craft/.test(lower)) hits.push("warm and timeless");
  if (/bold|dynamic|energy|loud/.test(lower)) hits.push("bold and confident");
  return hits.length ? capitalize(hits.slice(0, 2).join(", ")) : "Editorial and understated";
}

// --- text helpers ----------------------------------------------------------

function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(value?: string): string {
  if (!value) return "";
  return value
    .replace(/\s*[|·]\s*.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

function resolveUrl(src: string, base: string): string {
  const value = src.trim();
  if (!value) return "";
  if (/^https?:/i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  try {
    return new URL(value, base).toString();
  } catch {
    return "";
  }
}

function hostLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const label = host.split(".")[0];
    return label ? capitalizeWords(label.replace(/[-_]+/g, " ")) : "New Luxury Listing";
  } catch {
    return "New Luxury Listing";
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function capitalizeWords(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

function unique(values: string[]): string[] {
  const seen: Record<string, true> = {};
  const out: string[] = [];
  for (const value of values) {
    if (!seen[value]) {
      seen[value] = true;
      out.push(value);
    }
  }
  return out;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => safeChar(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => safeChar(parseInt(dec, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function safeChar(code: number): string {
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "unknown error";
}

// --- deterministic fixtures ------------------------------------------------

const LISTING_FIXTURES: Omit<PropertyDetails, "url" | "warning">[] = [
  {
    title: "Palm Beach Oceanfront Estate",
    price: "$12,400,000",
    specs: "6 Bed · 8 Bath · 8,500 Sq Ft",
    beds: 6,
    baths: 8,
    sqft: 8500,
    features: ["Chef's Kitchen", "Infinity Pool", "Private Beach", "Ocean View", "Smart Home", "Wine Cellar"],
    description:
      "A modern oceanfront estate on the most coveted stretch of Palm Beach — floor-to-ceiling glass, a private beach path, and water views from every principal room.",
    images: [
      "https://fixtures.atelier.local/palm-beach/01-aerial.jpg",
      "https://fixtures.atelier.local/palm-beach/02-great-room.jpg",
      "https://fixtures.atelier.local/palm-beach/03-kitchen.jpg",
    ],
    source: "fixture",
  },
  {
    title: "Aspen Mountain Retreat",
    price: "$18,900,000",
    specs: "7 Bed · 9 Bath · 11,200 Sq Ft",
    beds: 7,
    baths: 9,
    sqft: 11200,
    features: ["Spa", "Home Theater", "Wine Cellar", "Fireplace", "Guest House", "Heated Floors"],
    description:
      "A timber-and-stone retreat at the foot of Aspen Mountain, with a ski room, a spa level, and a great room framed by the peaks.",
    images: [
      "https://fixtures.atelier.local/aspen/01-exterior.jpg",
      "https://fixtures.atelier.local/aspen/02-great-room.jpg",
      "https://fixtures.atelier.local/aspen/03-spa.jpg",
    ],
    source: "fixture",
  },
  {
    title: "Malibu Cliffside Modern",
    price: "$9,750,000",
    specs: "5 Bed · 6 Bath · 6,400 Sq Ft",
    beds: 5,
    baths: 6,
    sqft: 6400,
    features: ["Infinity Pool", "Ocean View", "Waterfront", "Terraces", "Gym", "Wet Bar"],
    description:
      "A cliffside modern on Malibu's Point Dume — cantilevered terraces, an infinity edge that meets the Pacific, and walls of glass that fold away.",
    images: [
      "https://fixtures.atelier.local/malibu/01-cliff.jpg",
      "https://fixtures.atelier.local/malibu/02-terrace.jpg",
      "https://fixtures.atelier.local/malibu/03-pool.jpg",
    ],
    source: "fixture",
  },
];

const BRAND_FIXTURES: Omit<BrandKit, "url" | "readAt">[] = [
  {
    name: "Marlowe & Co.",
    tagline: "Private real estate, quietly represented.",
    fonts: ["Cormorant Garamond", "Inter"],
    colors: ["#0B0B0C", "#B89B72", "#EDE7DC", "#3A3630", "#6E6A63"],
    tone: "Refined and aspirational, editorial and understated",
    source: "fixture",
  },
  {
    name: "Vantage Estates",
    tagline: "Coastal properties, from the cliff to the shore.",
    fonts: ["Playfair Display", "Helvetica Neue"],
    colors: ["#101C24", "#C7A87A", "#F2EDE4", "#2C4250"],
    tone: "Warm and timeless, architectural and restrained",
    source: "fixture",
  },
  {
    name: "Halcyon Residences",
    tagline: "Design-led homes in the world's quiet corners.",
    fonts: ["Libre Baskerville", "Work Sans"],
    colors: ["#141414", "#A98F63", "#F5F1E8", "#4A4A48"],
    tone: "Architectural and restrained, bold and confident",
    source: "fixture",
  },
];

function listingFixture(url: string): Omit<PropertyDetails, "url" | "warning"> {
  return LISTING_FIXTURES[hash(url) % LISTING_FIXTURES.length];
}

function brandFixture(url: string): BrandKit {
  return {
    ...BRAND_FIXTURES[hash(url) % BRAND_FIXTURES.length],
    url,
    readAt: Date.now(),
  };
}

/** Stable FNV-1a hash so the same URL always yields the same fixture. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
