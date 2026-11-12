"use client";

import { createContext, useContext } from "react";

// The one way other components talk to the AI guide panel. The provider lives in the [lang] layout.
export type GuidePanelApi = {
  // open the panel without sending anything
  open: () => void;
  // open the panel and send this question as a new message
  ask: (question: string) => void;
};

const noop: GuidePanelApi = { open: () => {}, ask: () => {} };

export const GuidePanelContext = createContext<GuidePanelApi>(noop);

export const useGuidePanel = () => useContext(GuidePanelContext);
