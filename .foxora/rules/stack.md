# Stack — atelier-luxury-estate-agent

Chosen stack (already in place, do not migrate): **Next.js 14 App Router + TypeScript + Tailwind CSS**, no component library. Fonts loaded from Google Fonts in `app/layout.tsx` (Cormorant Garamond + Inter).

## Commands
- Install: `npm install`
- Dev: `npm run dev` → http://localhost:3000
- Build: `npm run build`
- Lint: `npm run lint`

## Conventions
- Import alias: `@/*` maps to the project root (`@/lib/types`).
- Shared contract lives in `lib/types.ts`, `lib/pricing.ts`, `lib/api.ts` — **frozen**; change all three together if a shape must move.
- API routes live in `app/api/<name>/route.ts` and always return JSON with a discriminated `success` field.
- Visual language: near-black `--ink` canvas, bone text, brass accent `#B89B72`, Cormorant Garamond for display, Inter for UI. Keep it restrained and editorial — no emoji, no bright fills.
- Rendering is **simulated** in this prototype; label it honestly in the UI, never imply a live model gateway.
