"use client";

import React, { useEffect, useState } from "react";
import { useProduction } from "@/lib/store";
import Sidebar, { type ViewKey } from "@/components/Sidebar";
import ComposeView from "@/components/ComposeView";
import BoardView from "@/components/BoardView";
import FlowView from "@/components/FlowView";
import AssetsView from "@/components/AssetsView";
import BrandView from "@/components/BrandView";
import PresentView from "@/components/PresentView";
import MarketingAdminView from "@/components/admin/MarketingAdminView";
import ProspectingAgentView from "@/components/admin/ProspectingAgentView";
import AssetLibraryView from "@/components/admin/AssetLibraryView";

function ViewHost({
  view,
  onPlanned,
  onOpenCompose,
}: {
  view: ViewKey;
  onPlanned: () => void;
  onOpenCompose: () => void;
}) {
  switch (view) {
    case "compose":
      return <ComposeView onPlanned={onPlanned} />;
    case "board":
      return <BoardView onOpenCompose={onOpenCompose} />;
    case "flow":
      return <FlowView />;
    case "assets":
      return <AssetsView />;
    case "brand":
      return <BrandView />;
    case "present":
      return <PresentView />;
    case "marketing":
      return <MarketingAdminView />;
    case "prospecting":
      return <ProspectingAgentView />;
    case "library":
      return <AssetLibraryView />;
    default:
      return null;
  }
}

export default function App() {
  const [view, setView] = useState<ViewKey>("compose");
  const { state } = useProduction();

  // Whenever a storyboard first appears, jump the user to the board.
  useEffect(() => {
    if (state.production.storyboard && view === "compose" && !state.planning) {
      setView("board");
    }
  }, [state.production.storyboard, state.planning, view]);

  if (!state.hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink text-bone font-sans">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brass border-t-transparent" />
          <span className="text-sm uppercase tracking-widest opacity-50">Initializing Atelier...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ink text-bone antialiased font-sans">
      <Sidebar view={view} onChangeView={setView} />
      <main className="flex-1 md:pl-[236px]" data-view={view}>
        <div className="mx-auto w-full max-w-[1280px]">
          <ViewHost
            view={view}
            onPlanned={() => setView("board")}
            onOpenCompose={() => setView("compose")}
          />
        </div>
      </main>
    </div>
  );
}
