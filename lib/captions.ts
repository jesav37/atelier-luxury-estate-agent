import { AgentProfile, Production } from "./types";

/**
 * Generate a refined social media or MLS caption based on the production.
 */
export function generateCaption(production: Production): string {
  const prop = production.storyboard?.property || "This exclusive luxury estate";
  const agent = production.agent?.name || "Our team";
  
  return `Introducing ${prop}. Experience unparalleled elegance and sophisticated design in every detail. 

Presented by ${agent} at ${production.agent?.brokerage || "Atelier Estates"}.

#LuxuryRealEstate #AtelierEstates #DreamHome #RealEstateDesign`;
}

/**
 * Generate a printable/PDF-ready listing sheet manifest.
 * In this prototype, we produce a structured JSON object representing the layout.
 */
export function generateListingSheet(production: Production) {
  return {
    title: production.storyboard?.property || "Luxury Estate",
    agent: production.agent,
    brand: production.brand,
    scenes: production.storyboard?.scenes.map(s => ({
      n: s.n,
      name: s.name,
      time: s.time,
      description: s.script
    })) || [],
    creditsSpent: production.creditsSpent,
    generatedAt: new Date().toISOString(),
  };
}
