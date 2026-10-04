// The sales content the Marketing & Pitch dashboard hands to an operator.
//
// Kept as data, not JSX, so the wording can be reviewed, versioned and copied
// without touching layout code. Every claim here is limited to what this
// prototype can demonstrate: it composes a brand-aligned cinematic package and
// a client-facing delivery surface. Nothing promises a live model gateway,
// guaranteed leads or measured revenue.

export type PitchItemKind = "positioning" | "script" | "play" | "guardrail";

export interface PitchItem {
  key: string;
  kind: PitchItemKind;
  label: string;
  /** The copyable text. Guardrails and plays read as instructions. */
  text: string;
  detail: string;
}

export const PITCH_PACK: PitchItem[] = [
  {
    key: "positioning",
    kind: "positioning",
    label: "Positioning line",
    text: "Atelier is the cinematic production desk for luxury listing agents: a brand-aligned film, a listing sheet and a client-facing delivery surface, assembled from one brief.",
    detail: "Use as the opening line of any pitch, email signature or profile bio.",
  },
  {
    key: "value-proposition",
    kind: "positioning",
    label: "Value proposition (one paragraph)",
    text: "Atelier exists because the marketing for a $6M property is judged in the same minute as the property itself. Describe a listing once and the desk returns a scene-by-scene film plan, rendered frames in the brokerage's own palette, a listing sheet and a private delivery surface the client opens like a magazine and not a portal. The work that normally takes a week of coordination with a videographer, a copywriter and a designer happens between the listing appointment and the evening follow-up.",
    detail: "Full paragraph for proposals, listing presentations and the site's own pitch page.",
  },
  {
    key: "elevator",
    kind: "script",
    label: "30-second elevator script",
    text: "At the high end, clients are not buying square footage — they are buying judgment, and they decide whether you have it in the first few minutes. Atelier turns one listing brief into a cinematic, brand-aligned film, a listing sheet and a private delivery link that looks like it came from a production house. The work that used to cost a week of chasing a videographer now happens the same afternoon, in your brokerage's own palette. You keep the listing appointment and the follow-up; we handle the production. May I build one film from one of your current listings, so you can judge the quality on your own property?",
    detail: "Ends with a low-friction next step: a single listing, not a subscription.",
  },
  {
    key: "objection-price",
    kind: "script",
    label: "Objection: \"I already pay a videographer.\"",
    text: "Keep them for the hero film on your $12M listings. Use Atelier for the other nine listings a year that never get a film because the budget or the timeline will not carry one — the ones where you currently send stills and a PDF. Same listing appointment, same afternoon, no crew scheduling.",
    detail: "Never argue against their existing vendor; expand the inventory that gets covered.",
  },
  {
    key: "objection-brand",
    kind: "script",
    label: "Objection: \"It will not look like us.\"",
    text: "Point the desk at your own brokerage site first. It recovers the palette, typography and tone from that page and applies them to every frame, caption and sheet — before you approve a single scene. If the recovered palette is wrong, you overwrite it and the whole package re-renders.",
    detail: "Demonstrate live with their URL; the brand step runs before any rendering.",
  },
  {
    key: "objection-time",
    kind: "script",
    label: "Objection: \"I do not have time to learn another tool.\"",
    text: "You give it one sentence and one property URL. Everything after that is a review, not an input: greenlight the scenes you like, skip the ones you do not, and the final cut and listing sheet assemble themselves. The first run is fifteen minutes; every listing after that is the brief plus your approvals.",
    detail: "Frame the product as a review loop rather than a design tool.",
  },
  {
    key: "play-listing-appointment",
    kind: "play",
    label: "Play 1 — build it during the listing appointment",
    text: "Open Compose before the seller signs. Enter the property URL, read the listing, greenlight the scenes in front of them, then open Present. A seller watching their own house become a film before they have signed the agreement is the strongest exclusivity signal available to you — and it costs you one appointment hour.",
    detail: "Highest-intent moment in the funnel. Logs as a pitch handoff in this dashboard.",
  },
  {
    key: "play-coming-soon",
    kind: "play",
    label: "Play 2 — the coming-soon 48 hours",
    text: "The moment a listing is marked coming soon, run Compose and hand the seller a 9:16 teaser within 24 hours. It is proof of work before the first showing and it gives the seller something to forward to their own network, which is where your next listing appointment comes from.",
    detail: "Seller-side retention play; feeds the referral loop rather than paid reach.",
  },
  {
    key: "play-referral",
    kind: "play",
    label: "Play 3 — the delivery-as-referral",
    text: "Every Present link you send is stamped with the consultancy's name, not Atelier's. The client forwards the film; the recipient sees the agent's brand and a delivery quality their own agent is not producing. Follow up with the Prospecting desk only after a delivery has been opened, never before.",
    detail: "Keeps outbound warm and defensible; pairs with the Outreach log.",
  },
  {
    key: "guardrail-consent",
    kind: "guardrail",
    label: "Guardrail — consent and opt-out",
    text: "Every outreach template must carry a working opt-out and a physical postal address. US commercial email is governed by CAN-SPAM; consent-based marketing to EU or UK contacts is governed by GDPR/PECR, and cold automated calls or texts to US mobiles by the TCPA. Record the lawful basis next to the consent, and honour an opt-out within one business day.",
    detail: "The outreach log exists so this is auditable, not to increase volume.",
  },
  {
    key: "guardrail-pii",
    kind: "guardrail",
    label: "Guardrail — what never leaves the workspace",
    text: "The ledger stores event types, timestamps and a short label only: no client names, no addresses, no email bodies and no phone numbers. Client-facing Present links must be unlisted and revocable, and seller financial details must never be pasted into a marketing surface.",
    detail: "Enforced by the event shape in lib/types.ts; keep it that way when adding fields.",
  },
  {
    key: "guardrail-claims",
    kind: "guardrail",
    label: "Guardrail — claim discipline",
    text: "Do not quote time savings, lead volume or revenue that this workspace has not measured. Speak in the language of the pipeline: deliverables produced, pitches handed over, demos requested. Rendering and outreach are simulated in this prototype and every surface must say so.",
    detail: "Matches the honesty rule in .foxora/rules/stack.md.",
  },
];
