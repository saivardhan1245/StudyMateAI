import React, { createContext, useContext, useState } from "react";
import { AppPage } from "../types";

export interface CardMeta {
  title: string;
  subtitle: string;
  badge?: string;
  color?: string;
  icon?: string;
}

export interface CardRect {
  top: number;
  left: number;
  width: number;
  height: number;
  meta?: CardMeta;
}

export type CardExpansionPhase = "idle" | "lifting" | "expanding" | "expanded" | "collapsing";

interface CardExpansionContextType {
  expandingCardId: AppPage | null;
  cardRect: CardRect | null;
  phase: CardExpansionPhase;
  sourceContext: "landing" | "workspace" | null;
  triggerCardExpansion: (
    id: AppPage,
    rect: DOMRect,
    meta?: CardMeta,
    source?: "landing" | "workspace"
  ) => void;
  triggerCardCollapse: () => void;
  clearCardExpansion: () => void;
}

const CardExpansionContext = createContext<CardExpansionContextType>({
  expandingCardId: null,
  cardRect: null,
  phase: "idle",
  sourceContext: null,
  triggerCardExpansion: () => {},
  triggerCardCollapse: () => {},
  clearCardExpansion: () => {},
});

export const useCardExpansion = () => useContext(CardExpansionContext);

export const CardExpansionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expandingCardId, setExpandingCardId] = useState<AppPage | null>(null);
  const [cardRect, setCardRect] = useState<CardRect | null>(null);
  const [phase, setPhase] = useState<CardExpansionPhase>("idle");
  const [sourceContext, setSourceContext] = useState<"landing" | "workspace" | null>(null);

  const triggerCardExpansion = (
    id: AppPage,
    rect: DOMRect,
    meta?: CardMeta,
    source: "landing" | "workspace" = "landing"
  ) => {
    setCardRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      meta,
    });
    setExpandingCardId(id);
    setSourceContext(source);
    setPhase("expanding");
  };

  const triggerCardCollapse = () => {
    setPhase("collapsing");
  };

  const clearCardExpansion = () => {
    setExpandingCardId(null);
    setCardRect(null);
    setPhase("idle");
    setSourceContext(null);
  };

  return (
    <CardExpansionContext.Provider
      value={{
        expandingCardId,
        cardRect,
        phase,
        sourceContext,
        triggerCardExpansion,
        triggerCardCollapse,
        clearCardExpansion,
      }}
    >
      {children}
    </CardExpansionContext.Provider>
  );
};
